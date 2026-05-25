'use strict';

const { expect } = require('chai');
const { createDb } = require('../../src/db');
const { createProject } = require('../../src/services/projects');
const {
  listSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
} = require('../../src/services/sessions');

function makeTask(db, projectId, title = 'Task') {
  return db
    .prepare("INSERT INTO tasks (project_id, title, priority, category) VALUES (?, ?, 'low', 'bug')")
    .run(projectId, title).lastInsertRowid;
}

describe('sessions service', () => {
  let db;
  let projectId;

  beforeEach(() => {
    db = createDb(':memory:');
    projectId = createProject(db, { name: 'Test Project' }).id;
  });

  afterEach(() => {
    db.close();
  });

  function makeSession(overrides = {}) {
    return createSession(db, projectId, {
      date: '2026-05-24',
      duration_minutes: 60,
      description: 'Did some work',
      ...overrides,
    });
  }

  // ── listSessions ──────────────────────────────────────────────────────────

  it('listSessions returns [] for a project with no sessions', () => {
    expect(listSessions(db, projectId)).to.deep.equal([]);
  });

  it('listSessions returns all sessions for the project', () => {
    makeSession({ description: 'Session A' });
    makeSession({ description: 'Session B' });
    const results = listSessions(db, projectId);
    expect(results).to.have.lengthOf(2);
    expect(results.map((s) => s.description)).to.include.members(['Session A', 'Session B']);
  });

  it('listSessions does not return sessions from other projects', () => {
    const other = createProject(db, { name: 'Other' }).id;
    makeSession({ description: 'Mine' });
    createSession(db, other, { date: '2026-05-24', duration_minutes: 30, description: 'Theirs' });
    const results = listSessions(db, projectId);
    expect(results).to.have.lengthOf(1);
    expect(results[0].description).to.equal('Mine');
  });

  it('listSessions orders by date descending', () => {
    makeSession({ date: '2026-05-20', description: 'Older' });
    makeSession({ date: '2026-05-24', description: 'Newer' });
    const results = listSessions(db, projectId);
    expect(results[0].description).to.equal('Newer');
    expect(results[1].description).to.equal('Older');
  });

  // ── createSession ─────────────────────────────────────────────────────────

  it('createSession returns a session with id and project_id', () => {
    const session = makeSession();
    expect(session.id).to.be.a('number');
    expect(session.project_id).to.equal(projectId);
  });

  it('createSession stores date, duration_minutes, and description', () => {
    const session = makeSession({
      date: '2026-05-01',
      duration_minutes: 90,
      description: 'Long session',
    });
    expect(session).to.include({
      date: '2026-05-01',
      duration_minutes: 90,
      description: 'Long session',
    });
  });

  // ── getSession ────────────────────────────────────────────────────────────

  it('getSession returns null for non-existent id', () => {
    expect(getSession(db, 99999)).to.be.null;
  });

  it('getSession returns the session by id', () => {
    const session = makeSession({ description: 'Find me' });
    const found = getSession(db, session.id);
    expect(found.description).to.equal('Find me');
    expect(found.id).to.equal(session.id);
  });

  // ── updateSession ─────────────────────────────────────────────────────────

  it('updateSession returns null for non-existent id', () => {
    expect(updateSession(db, 99999, { description: 'X' })).to.be.null;
  });

  it('updateSession changes date', () => {
    const session = makeSession({ date: '2026-05-01' });
    const updated = updateSession(db, session.id, { date: '2026-05-10' });
    expect(updated.date).to.equal('2026-05-10');
  });

  it('updateSession changes duration_minutes', () => {
    const session = makeSession({ duration_minutes: 30 });
    const updated = updateSession(db, session.id, { duration_minutes: 120 });
    expect(updated.duration_minutes).to.equal(120);
  });

  it('updateSession changes description', () => {
    const session = makeSession({ description: 'Old' });
    const updated = updateSession(db, session.id, { description: 'New' });
    expect(updated.description).to.equal('New');
  });

  it('updateSession preserves existing fields when not specified', () => {
    const session = makeSession({ date: '2026-05-01', duration_minutes: 45, description: 'Keep' });
    const updated = updateSession(db, session.id, { description: 'Changed' });
    expect(updated.date).to.equal('2026-05-01');
    expect(updated.duration_minutes).to.equal(45);
  });

  // ── deleteSession ─────────────────────────────────────────────────────────

  it('deleteSession returns true on success', () => {
    const session = makeSession();
    expect(deleteSession(db, session.id)).to.be.true;
    expect(getSession(db, session.id)).to.be.null;
  });

  it('deleteSession returns false for non-existent id', () => {
    expect(deleteSession(db, 99999)).to.be.false;
  });

  it('deleteSession removes session_tasks join rows', () => {
    const task = db
      .prepare("INSERT INTO tasks (project_id, title, priority, category) VALUES (?, 'T', 'low', 'bug')")
      .run(projectId);
    const session = makeSession();
    db.prepare('INSERT INTO session_tasks (session_id, task_id) VALUES (?, ?)').run(
      session.id,
      task.lastInsertRowid
    );
    deleteSession(db, session.id);
    const rows = db.prepare('SELECT * FROM session_tasks WHERE session_id = ?').all(session.id);
    expect(rows).to.have.lengthOf(0);
  });

  // ── task associations ─────────────────────────────────────────────────────

  it('getSession returns task_ids: [] when no tasks are associated', () => {
    const session = makeSession();
    const found = getSession(db, session.id);
    expect(found.task_ids).to.deep.equal([]);
  });

  it('getSession returns task_ids populated from session_tasks', () => {
    const t1 = makeTask(db, projectId, 'A');
    const t2 = makeTask(db, projectId, 'B');
    const session = makeSession();
    db.prepare('INSERT INTO session_tasks (session_id, task_id) VALUES (?, ?)').run(session.id, t1);
    db.prepare('INSERT INTO session_tasks (session_id, task_id) VALUES (?, ?)').run(session.id, t2);
    const found = getSession(db, session.id);
    expect(found.task_ids).to.have.members([t1, t2]);
  });

  it('listSessions includes task_ids on each session', () => {
    const t1 = makeTask(db, projectId, 'X');
    const s1 = makeSession({ description: 'With task' });
    const s2 = makeSession({ description: 'Without task' });
    db.prepare('INSERT INTO session_tasks (session_id, task_id) VALUES (?, ?)').run(s1.id, t1);
    const results = listSessions(db, projectId);
    const withTask = results.find((s) => s.id === s1.id);
    const without = results.find((s) => s.id === s2.id);
    expect(withTask.task_ids).to.deep.equal([t1]);
    expect(without.task_ids).to.deep.equal([]);
  });

  it('createSession with task_ids writes to session_tasks', () => {
    const t1 = makeTask(db, projectId, 'Alpha');
    const t2 = makeTask(db, projectId, 'Beta');
    const session = createSession(db, projectId, {
      date: '2026-05-24',
      duration_minutes: 60,
      description: 'With tasks',
      task_ids: [t1, t2],
    });
    expect(session.task_ids).to.have.members([t1, t2]);
  });

  it('createSession without task_ids returns task_ids: []', () => {
    const session = makeSession();
    expect(session.task_ids).to.deep.equal([]);
  });

  it('updateSession with task_ids replaces existing associations', () => {
    const t1 = makeTask(db, projectId, 'Old');
    const t2 = makeTask(db, projectId, 'New');
    const session = createSession(db, projectId, {
      date: '2026-05-24',
      duration_minutes: 30,
      description: 'Start',
      task_ids: [t1],
    });
    const updated = updateSession(db, session.id, { task_ids: [t2] });
    expect(updated.task_ids).to.deep.equal([t2]);
  });

  it('updateSession with empty task_ids clears all associations', () => {
    const t1 = makeTask(db, projectId, 'Clearable');
    const session = createSession(db, projectId, {
      date: '2026-05-24',
      duration_minutes: 30,
      description: 'Start',
      task_ids: [t1],
    });
    const updated = updateSession(db, session.id, { task_ids: [] });
    expect(updated.task_ids).to.deep.equal([]);
  });

  it('updateSession without task_ids preserves existing associations', () => {
    const t1 = makeTask(db, projectId, 'Keep me');
    const session = createSession(db, projectId, {
      date: '2026-05-24',
      duration_minutes: 30,
      description: 'Start',
      task_ids: [t1],
    });
    const updated = updateSession(db, session.id, { description: 'Changed' });
    expect(updated.task_ids).to.deep.equal([t1]);
  });

  it('deleting a task removes its session_tasks row without deleting the session', () => {
    const t1 = makeTask(db, projectId, 'Temporary');
    const session = createSession(db, projectId, {
      date: '2026-05-24',
      duration_minutes: 30,
      description: 'Has task',
      task_ids: [t1],
    });
    db.prepare('DELETE FROM tasks WHERE id = ?').run(t1);
    const found = getSession(db, session.id);
    expect(found).to.not.be.null;
    expect(found.task_ids).to.deep.equal([]);
  });
});
