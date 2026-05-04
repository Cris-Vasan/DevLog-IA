'use strict';

const { assert } = require('chai');
const { createDb } = require('../src/db');

describe('Database initialization', () => {
  let db;

  beforeEach(() => {
    db = createDb(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('creates all four tables', () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all()
      .map((r) => r.name);

    assert.includeMembers(tables, ['projects', 'tasks', 'sessions', 'session_tasks']);
  });

  it('is idempotent — calling createDb again does not error', () => {
    const db2 = createDb(':memory:');
    db2.close();
  });

  it('rejects invalid task priority', () => {
    db.prepare("INSERT INTO projects (name) VALUES ('p')").run();
    assert.throws(() => {
      db.prepare(
        "INSERT INTO tasks (project_id, title, priority, category) VALUES (1, 't', 'critical', 'bug')"
      ).run();
    });
  });

  it('rejects invalid task category', () => {
    db.prepare("INSERT INTO projects (name) VALUES ('p')").run();
    assert.throws(() => {
      db.prepare(
        "INSERT INTO tasks (project_id, title, priority, category) VALUES (1, 't', 'high', 'unknown')"
      ).run();
    });
  });

  it('rejects invalid task status', () => {
    db.prepare("INSERT INTO projects (name) VALUES ('p')").run();
    assert.throws(() => {
      db.prepare(
        "INSERT INTO tasks (project_id, title, priority, category, status) VALUES (1, 't', 'high', 'bug', 'blocked')"
      ).run();
    });
  });

  it('cascades delete from project to tasks and sessions', () => {
    db.prepare("INSERT INTO projects (name) VALUES ('p')").run();
    db.prepare(
      "INSERT INTO tasks (project_id, title, priority, category) VALUES (1, 't', 'low', 'bug')"
    ).run();
    db.prepare(
      "INSERT INTO sessions (project_id, date, duration_minutes, description) VALUES (1, '2026-01-01', 60, 'work')"
    ).run();

    db.prepare('DELETE FROM projects WHERE id = 1').run();

    const tasks = db.prepare('SELECT * FROM tasks WHERE project_id = 1').all();
    const sessions = db.prepare('SELECT * FROM sessions WHERE project_id = 1').all();
    assert.lengthOf(tasks, 0);
    assert.lengthOf(sessions, 0);
  });
});
