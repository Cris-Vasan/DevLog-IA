'use strict';

const request = require('supertest');
const { expect } = require('chai');
const { createDb } = require('../src/db');
const app = require('../src/app');

describe('Tasks API', () => {
  let db;
  let projectId;

  before(() => {
    db = createDb(':memory:');
    app.set('db', db);
  });

  after(() => {
    db.close();
  });

  beforeEach(() => {
    const result = db
      .prepare('INSERT INTO projects (name) VALUES (?)')
      .run('Test Project');
    projectId = result.lastInsertRowid;
  });

  afterEach(() => {
    db.prepare('DELETE FROM projects').run();
  });

  function createTask(pid = projectId, fields = {}) {
    return request(app)
      .post(`/api/projects/${pid}/tasks`)
      .send({
        title: 'Fix bug',
        priority: 'medium',
        category: 'bug',
        ...fields,
      });
  }

  // ── list ──────────────────────────────────────────────────────────────────

  it('GET /api/projects/:id/tasks returns [] for a project with no tasks', async () => {
    const res = await request(app).get(`/api/projects/${projectId}/tasks`);
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([]);
  });

  it('GET /api/projects/:id/tasks returns 404 for non-existent project', async () => {
    const res = await request(app).get('/api/projects/99999/tasks');
    expect(res.status).to.equal(404);
  });

  it('GET /api/projects/:id/tasks returns all tasks for the project', async () => {
    await createTask(projectId, { title: 'Task A' });
    await createTask(projectId, { title: 'Task B' });
    const res = await request(app).get(`/api/projects/${projectId}/tasks`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.lengthOf(2);
    expect(res.body.map((t) => t.title)).to.include.members(['Task A', 'Task B']);
  });

  it('GET /api/projects/:id/tasks does not return tasks from other projects', async () => {
    const other = db.prepare('INSERT INTO projects (name) VALUES (?)').run('Other').lastInsertRowid;
    await createTask(projectId, { title: 'Mine' });
    await createTask(other, { title: 'Theirs' });
    const res = await request(app).get(`/api/projects/${projectId}/tasks`);
    expect(res.body).to.have.lengthOf(1);
    expect(res.body[0].title).to.equal('Mine');
  });

  // ── filters ───────────────────────────────────────────────────────────────

  it('GET ?status= returns only matching tasks', async () => {
    await createTask(projectId, { title: 'Pending task' });
    const created = await createTask(projectId, { title: 'Done task' });
    db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run('done', created.body.id);

    const res = await request(app).get(`/api/projects/${projectId}/tasks?status=done`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.lengthOf(1);
    expect(res.body[0].title).to.equal('Done task');
  });

  it('GET ?priority= returns only matching tasks', async () => {
    await createTask(projectId, { title: 'Low task', priority: 'low' });
    await createTask(projectId, { title: 'High task', priority: 'high' });

    const res = await request(app).get(`/api/projects/${projectId}/tasks?priority=high`);
    expect(res.body).to.have.lengthOf(1);
    expect(res.body[0].title).to.equal('High task');
  });

  it('GET ?category= returns only matching tasks', async () => {
    await createTask(projectId, { title: 'Bug task', category: 'bug' });
    await createTask(projectId, { title: 'Feature task', category: 'feature' });

    const res = await request(app).get(`/api/projects/${projectId}/tasks?category=feature`);
    expect(res.body).to.have.lengthOf(1);
    expect(res.body[0].title).to.equal('Feature task');
  });

  // ── create ────────────────────────────────────────────────────────────────

  it('POST /api/projects/:id/tasks creates a task and returns 201', async () => {
    const res = await createTask(projectId, {
      title: 'New task',
      description: 'Some details',
      priority: 'high',
      category: 'feature',
    });
    expect(res.status).to.equal(201);
    expect(res.body).to.include({ title: 'New task', priority: 'high', category: 'feature', status: 'pending' });
    expect(res.body.id).to.be.a('number');
  });

  it('POST /api/projects/:id/tasks returns 404 for non-existent project', async () => {
    const res = await createTask(99999);
    expect(res.status).to.equal(404);
  });

  it('POST without title returns 400', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ priority: 'low', category: 'bug' });
    expect(res.status).to.equal(400);
  });

  it('POST without priority returns 400', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'X', category: 'bug' });
    expect(res.status).to.equal(400);
  });

  it('POST without category returns 400', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'X', priority: 'low' });
    expect(res.status).to.equal(400);
  });

  it('POST with invalid priority returns 400', async () => {
    const res = await createTask(projectId, { priority: 'urgent' });
    expect(res.status).to.equal(400);
  });

  it('POST with invalid category returns 400', async () => {
    const res = await createTask(projectId, { category: 'chore' });
    expect(res.status).to.equal(400);
  });

  // ── update ────────────────────────────────────────────────────────────────

  it('PUT /api/tasks/:id updates fields and returns the task', async () => {
    const created = await createTask();
    const res = await request(app)
      .put(`/api/tasks/${created.body.id}`)
      .send({ title: 'Updated', status: 'in_progress' });
    expect(res.status).to.equal(200);
    expect(res.body).to.include({ title: 'Updated', status: 'in_progress' });
  });

  it('PUT /api/tasks/:id returns 404 for non-existent task', async () => {
    const res = await request(app).put('/api/tasks/99999').send({ title: 'X' });
    expect(res.status).to.equal(404);
  });

  it('PUT with invalid status returns 400', async () => {
    const created = await createTask();
    const res = await request(app)
      .put(`/api/tasks/${created.body.id}`)
      .send({ status: 'blocked' });
    expect(res.status).to.equal(400);
  });

  // ── delete ────────────────────────────────────────────────────────────────

  it('DELETE /api/tasks/:id deletes and returns 204', async () => {
    const created = await createTask();
    const res = await request(app).delete(`/api/tasks/${created.body.id}`);
    expect(res.status).to.equal(204);
  });

  it('DELETE /api/tasks/:id returns 404 for non-existent task', async () => {
    const res = await request(app).delete('/api/tasks/99999');
    expect(res.status).to.equal(404);
  });
});
