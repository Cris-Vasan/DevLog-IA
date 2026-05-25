'use strict';

const { expect } = require('chai');
const { createDb } = require('../../src/db');
const { createProject } = require('../../src/services/projects');
const {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require('../../src/services/tasks');

describe('tasks service', () => {
  let db;
  let projectId;

  beforeEach(() => {
    db = createDb(':memory:');
    projectId = createProject(db, { name: 'Test Project' }).id;
  });

  afterEach(() => {
    db.close();
  });

  function makeTask(overrides = {}) {
    return createTask(db, projectId, {
      title: 'Default task',
      priority: 'medium',
      category: 'bug',
      ...overrides,
    });
  }

  // ── listTasks ─────────────────────────────────────────────────────────────

  it('listTasks returns [] for a project with no tasks', () => {
    expect(listTasks(db, projectId)).to.deep.equal([]);
  });

  it('listTasks returns all tasks for the project', () => {
    makeTask({ title: 'Task A' });
    makeTask({ title: 'Task B' });
    const results = listTasks(db, projectId);
    expect(results).to.have.lengthOf(2);
    expect(results.map((t) => t.title)).to.include.members(['Task A', 'Task B']);
  });

  it('listTasks does not return tasks from other projects', () => {
    const other = createProject(db, { name: 'Other' }).id;
    makeTask({ title: 'Mine' });
    createTask(db, other, { title: 'Theirs', priority: 'low', category: 'bug' });
    const results = listTasks(db, projectId);
    expect(results).to.have.lengthOf(1);
    expect(results[0].title).to.equal('Mine');
  });

  it('listTasks filters by status', () => {
    const t = makeTask({ title: 'Pending' });
    const t2 = makeTask({ title: 'Done task' });
    updateTask(db, t2.id, { status: 'done' });
    const results = listTasks(db, projectId, { status: 'done' });
    expect(results).to.have.lengthOf(1);
    expect(results[0].title).to.equal('Done task');
    void t;
  });

  it('listTasks filters by priority', () => {
    makeTask({ title: 'Low', priority: 'low' });
    makeTask({ title: 'High', priority: 'high' });
    const results = listTasks(db, projectId, { priority: 'high' });
    expect(results).to.have.lengthOf(1);
    expect(results[0].title).to.equal('High');
  });

  it('listTasks filters by category', () => {
    makeTask({ title: 'Bug', category: 'bug' });
    makeTask({ title: 'Feature', category: 'feature' });
    const results = listTasks(db, projectId, { category: 'feature' });
    expect(results).to.have.lengthOf(1);
    expect(results[0].title).to.equal('Feature');
  });

  it('listTasks with multiple filters returns only matching tasks', () => {
    makeTask({ title: 'High bug', priority: 'high', category: 'bug' });
    makeTask({ title: 'High feature', priority: 'high', category: 'feature' });
    makeTask({ title: 'Low bug', priority: 'low', category: 'bug' });
    const results = listTasks(db, projectId, { priority: 'high', category: 'bug' });
    expect(results).to.have.lengthOf(1);
    expect(results[0].title).to.equal('High bug');
  });

  // ── createTask ────────────────────────────────────────────────────────────

  it('createTask returns a task with id and default status pending', () => {
    const task = makeTask();
    expect(task.id).to.be.a('number');
    expect(task.status).to.equal('pending');
    expect(task.project_id).to.equal(projectId);
  });

  it('createTask stores title, priority, and category', () => {
    const task = makeTask({ title: 'Fix login', priority: 'high', category: 'feature' });
    expect(task).to.include({ title: 'Fix login', priority: 'high', category: 'feature' });
  });

  it('createTask stores description when provided', () => {
    const task = makeTask({ description: 'Some detail' });
    expect(task.description).to.equal('Some detail');
  });

  it('createTask description defaults to null when omitted', () => {
    const task = makeTask();
    expect(task.description).to.be.null;
  });

  // ── getTask ───────────────────────────────────────────────────────────────

  it('getTask returns null for non-existent id', () => {
    expect(getTask(db, 99999)).to.be.null;
  });

  it('getTask returns the task by id', () => {
    const task = makeTask({ title: 'Find me' });
    const found = getTask(db, task.id);
    expect(found.title).to.equal('Find me');
    expect(found.id).to.equal(task.id);
  });

  // ── updateTask ────────────────────────────────────────────────────────────

  it('updateTask returns null for non-existent id', () => {
    expect(updateTask(db, 99999, { title: 'X' })).to.be.null;
  });

  it('updateTask changes title', () => {
    const task = makeTask({ title: 'Old title' });
    const updated = updateTask(db, task.id, { title: 'New title' });
    expect(updated.title).to.equal('New title');
  });

  it('updateTask changes status', () => {
    const task = makeTask();
    const updated = updateTask(db, task.id, { status: 'in_progress' });
    expect(updated.status).to.equal('in_progress');
  });

  it('updateTask changes priority', () => {
    const task = makeTask({ priority: 'low' });
    const updated = updateTask(db, task.id, { priority: 'high' });
    expect(updated.priority).to.equal('high');
  });

  it('updateTask changes category', () => {
    const task = makeTask({ category: 'bug' });
    const updated = updateTask(db, task.id, { category: 'refactor' });
    expect(updated.category).to.equal('refactor');
  });

  it('updateTask preserves existing fields when not specified', () => {
    const task = makeTask({ title: 'Keep me', priority: 'high', category: 'docs' });
    const updated = updateTask(db, task.id, { status: 'done' });
    expect(updated.title).to.equal('Keep me');
    expect(updated.priority).to.equal('high');
    expect(updated.category).to.equal('docs');
  });

  // ── deleteTask ────────────────────────────────────────────────────────────

  it('deleteTask returns true on success', () => {
    const task = makeTask();
    expect(deleteTask(db, task.id)).to.be.true;
    expect(getTask(db, task.id)).to.be.null;
  });

  it('deleteTask returns false for non-existent id', () => {
    expect(deleteTask(db, 99999)).to.be.false;
  });
});
