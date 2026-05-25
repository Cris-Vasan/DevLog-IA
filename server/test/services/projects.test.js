'use strict';

const { expect } = require('chai');
const { createDb } = require('../../src/db');
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../../src/services/projects');

describe('projects service', () => {
  let db;

  beforeEach(() => {
    db = createDb(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  // ── listProjects ──────────────────────────────────────────────────────────

  it('listProjects returns [] when no projects exist', () => {
    expect(listProjects(db)).to.deep.equal([]);
  });

  it('listProjects returns all projects with task_count', () => {
    createProject(db, { name: 'Alpha' });
    createProject(db, { name: 'Beta' });
    const results = listProjects(db);
    expect(results).to.have.lengthOf(2);
    expect(results.map((p) => p.name)).to.include.members(['Alpha', 'Beta']);
    expect(results[0]).to.have.property('task_count');
  });

  it('listProjects task_count reflects actual task count', () => {
    const project = createProject(db, { name: 'With tasks' });
    db.prepare(
      "INSERT INTO tasks (project_id, title, priority, category) VALUES (?, 'T1', 'low', 'bug')"
    ).run(project.id);
    db.prepare(
      "INSERT INTO tasks (project_id, title, priority, category) VALUES (?, 'T2', 'high', 'feature')"
    ).run(project.id);
    const [result] = listProjects(db);
    expect(result.task_count).to.equal(2);
  });

  // ── getProject ────────────────────────────────────────────────────────────

  it('getProject returns null for non-existent id', () => {
    expect(getProject(db, 99999)).to.be.null;
  });

  it('getProject returns the project by id', () => {
    const created = createProject(db, { name: 'My Project', description: 'Desc' });
    const found = getProject(db, created.id);
    expect(found).to.include({ name: 'My Project', description: 'Desc' });
    expect(found.id).to.equal(created.id);
  });

  // ── createProject ─────────────────────────────────────────────────────────

  it('createProject returns an object with id and timestamps', () => {
    const project = createProject(db, { name: 'New Project' });
    expect(project.id).to.be.a('number');
    expect(project.name).to.equal('New Project');
    expect(project.created_at).to.be.a('string');
    expect(project.updated_at).to.be.a('string');
  });

  it('createProject stores description when provided', () => {
    const project = createProject(db, { name: 'P', description: 'Some desc' });
    expect(project.description).to.equal('Some desc');
  });

  it('createProject description defaults to null when omitted', () => {
    const project = createProject(db, { name: 'P' });
    expect(project.description).to.be.null;
  });

  // ── updateProject ─────────────────────────────────────────────────────────

  it('updateProject returns null for non-existent id', () => {
    expect(updateProject(db, 99999, { name: 'X' })).to.be.null;
  });

  it('updateProject changes name', () => {
    const project = createProject(db, { name: 'Old' });
    const updated = updateProject(db, project.id, { name: 'New' });
    expect(updated.name).to.equal('New');
  });

  it('updateProject changes description', () => {
    const project = createProject(db, { name: 'P', description: 'Old desc' });
    const updated = updateProject(db, project.id, { description: 'New desc' });
    expect(updated.description).to.equal('New desc');
  });

  it('updateProject preserves existing fields when not specified', () => {
    const project = createProject(db, { name: 'Keep me', description: 'Keep this too' });
    const updated = updateProject(db, project.id, { name: 'Changed' });
    expect(updated.description).to.equal('Keep this too');
  });

  it('updateProject can set description to null', () => {
    const project = createProject(db, { name: 'P', description: 'Had one' });
    const updated = updateProject(db, project.id, { description: null });
    expect(updated.description).to.be.null;
  });

  // ── deleteProject ─────────────────────────────────────────────────────────

  it('deleteProject returns true on success', () => {
    const project = createProject(db, { name: 'Gone' });
    expect(deleteProject(db, project.id)).to.be.true;
    expect(getProject(db, project.id)).to.be.null;
  });

  it('deleteProject returns false for non-existent id', () => {
    expect(deleteProject(db, 99999)).to.be.false;
  });

  it('deleteProject cascades to tasks', () => {
    const project = createProject(db, { name: 'P' });
    db.prepare(
      "INSERT INTO tasks (project_id, title, priority, category) VALUES (?, 'T', 'low', 'bug')"
    ).run(project.id);
    deleteProject(db, project.id);
    const tasks = db.prepare('SELECT * FROM tasks WHERE project_id = ?').all(project.id);
    expect(tasks).to.have.lengthOf(0);
  });
});
