'use strict';

const request = require('supertest');
const { expect } = require('chai');
const { createDb } = require('../src/db');
const app = require('../src/app');

describe('Sessions API', () => {
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

  function createSession(pid = projectId, fields = {}) {
    return request(app)
      .post(`/api/projects/${pid}/sessions`)
      .send({
        date: '2026-05-24',
        duration_minutes: 60,
        description: 'Worked on auth',
        ...fields,
      });
  }

  // ── list ──────────────────────────────────────────────────────────────────

  it('GET /api/projects/:id/sessions returns [] for a project with no sessions', async () => {
    const res = await request(app).get(`/api/projects/${projectId}/sessions`);
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([]);
  });

  it('GET /api/projects/:id/sessions returns 404 for non-existent project', async () => {
    const res = await request(app).get('/api/projects/99999/sessions');
    expect(res.status).to.equal(404);
  });

  it('GET /api/projects/:id/sessions returns sessions most recent first', async () => {
    await createSession(projectId, { date: '2026-01-01', description: 'Old' });
    await createSession(projectId, { date: '2026-05-24', description: 'New' });
    const res = await request(app).get(`/api/projects/${projectId}/sessions`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.lengthOf(2);
    expect(res.body[0].date).to.equal('2026-05-24');
    expect(res.body[1].date).to.equal('2026-01-01');
  });

  it('GET /api/projects/:id/sessions does not return sessions from other projects', async () => {
    const other = db.prepare('INSERT INTO projects (name) VALUES (?)').run('Other').lastInsertRowid;
    await createSession(projectId, { description: 'Mine' });
    await createSession(other, { description: 'Theirs' });
    const res = await request(app).get(`/api/projects/${projectId}/sessions`);
    expect(res.body).to.have.lengthOf(1);
    expect(res.body[0].description).to.equal('Mine');
  });

  // ── create ────────────────────────────────────────────────────────────────

  it('POST /api/projects/:id/sessions creates a session and returns 201', async () => {
    const res = await createSession(projectId, {
      date: '2026-05-24',
      duration_minutes: 90,
      description: 'Implemented sessions',
    });
    expect(res.status).to.equal(201);
    expect(res.body).to.include({
      date: '2026-05-24',
      duration_minutes: 90,
      description: 'Implemented sessions',
    });
    expect(res.body.id).to.be.a('number');
    expect(res.body.project_id).to.equal(projectId);
  });

  it('POST /api/projects/:id/sessions returns 404 for non-existent project', async () => {
    const res = await createSession(99999);
    expect(res.status).to.equal(404);
  });

  it('POST without date returns 400', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/sessions`)
      .send({ duration_minutes: 60, description: 'Test' });
    expect(res.status).to.equal(400);
  });

  it('POST without duration_minutes returns 400', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/sessions`)
      .send({ date: '2026-05-24', description: 'Test' });
    expect(res.status).to.equal(400);
  });

  it('POST without description returns 400', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/sessions`)
      .send({ date: '2026-05-24', duration_minutes: 60 });
    expect(res.status).to.equal(400);
  });

  it('POST with non-positive duration_minutes returns 400', async () => {
    const res = await createSession(projectId, { duration_minutes: 0 });
    expect(res.status).to.equal(400);
  });

  // ── update ────────────────────────────────────────────────────────────────

  it('PUT /api/sessions/:id updates fields and returns the session', async () => {
    const created = await createSession();
    const res = await request(app)
      .put(`/api/sessions/${created.body.id}`)
      .send({ description: 'Updated description', duration_minutes: 120 });
    expect(res.status).to.equal(200);
    expect(res.body).to.include({ description: 'Updated description', duration_minutes: 120 });
  });

  it('PUT /api/sessions/:id returns 404 for non-existent session', async () => {
    const res = await request(app).put('/api/sessions/99999').send({ description: 'X' });
    expect(res.status).to.equal(404);
  });

  it('PUT with non-positive duration_minutes returns 400', async () => {
    const created = await createSession();
    const res = await request(app)
      .put(`/api/sessions/${created.body.id}`)
      .send({ duration_minutes: -5 });
    expect(res.status).to.equal(400);
  });

  // ── delete ────────────────────────────────────────────────────────────────

  it('DELETE /api/sessions/:id deletes and returns 204', async () => {
    const created = await createSession();
    const res = await request(app).delete(`/api/sessions/${created.body.id}`);
    expect(res.status).to.equal(204);
  });

  it('DELETE /api/sessions/:id returns 404 for non-existent session', async () => {
    const res = await request(app).delete('/api/sessions/99999');
    expect(res.status).to.equal(404);
  });
});
