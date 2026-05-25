'use strict';

const request = require('supertest');
const { expect } = require('chai');
const { createDb } = require('../src/db');
const createApp = require('../src/app');

describe('Projects API', () => {
  let db;
  let app;

  before(() => {
    db = createDb(':memory:');
    app = createApp(db);
  });

  after(() => {
    db.close();
  });

  afterEach(() => {
    db.prepare('DELETE FROM projects').run();
  });

  // ── helpers ──────────────────────────────────────────────────────────────

  function createProject(name = 'Test Project', description = 'A description') {
    return request(app).post('/api/projects').send({ name, description });
  }

  // ── list ─────────────────────────────────────────────────────────────────

  it('GET /api/projects returns an empty array when there are no projects', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal([]);
  });

  it('GET /api/projects returns all projects', async () => {
    await createProject('Alpha');
    await createProject('Beta');
    const res = await request(app).get('/api/projects');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.lengthOf(2);
    expect(res.body.map((p) => p.name)).to.include.members(['Alpha', 'Beta']);
  });

  // ── create ────────────────────────────────────────────────────────────────

  it('POST /api/projects creates a project and returns 201', async () => {
    const res = await createProject('My Project', 'My description');
    expect(res.status).to.equal(201);
    expect(res.body).to.include({ name: 'My Project', description: 'My description' });
    expect(res.body.id).to.be.a('number');
  });

  it('POST /api/projects with no name returns 400', async () => {
    const res = await request(app).post('/api/projects').send({ description: 'no name' });
    expect(res.status).to.equal(400);
  });

  it('POST /api/projects with empty name returns 400', async () => {
    const res = await request(app).post('/api/projects').send({ name: '  ' });
    expect(res.status).to.equal(400);
  });

  // ── get by id ─────────────────────────────────────────────────────────────

  it('GET /api/projects/:id returns the project', async () => {
    const created = await createProject('Solo');
    const res = await request(app).get(`/api/projects/${created.body.id}`);
    expect(res.status).to.equal(200);
    expect(res.body.name).to.equal('Solo');
  });

  it('GET /api/projects/:id returns 404 for non-existent project', async () => {
    const res = await request(app).get('/api/projects/99999');
    expect(res.status).to.equal(404);
  });

  // ── update ────────────────────────────────────────────────────────────────

  it('PUT /api/projects/:id updates name and description', async () => {
    const created = await createProject('Old Name', 'Old desc');
    const res = await request(app)
      .put(`/api/projects/${created.body.id}`)
      .send({ name: 'New Name', description: 'New desc' });
    expect(res.status).to.equal(200);
    expect(res.body).to.include({ name: 'New Name', description: 'New desc' });
  });

  it('PUT /api/projects/:id returns 404 for non-existent project', async () => {
    const res = await request(app)
      .put('/api/projects/99999')
      .send({ name: 'X' });
    expect(res.status).to.equal(404);
  });

  // ── delete ────────────────────────────────────────────────────────────────

  it('DELETE /api/projects/:id deletes the project and returns 204', async () => {
    const created = await createProject('To Delete');
    const res = await request(app).delete(`/api/projects/${created.body.id}`);
    expect(res.status).to.equal(204);

    const check = await request(app).get(`/api/projects/${created.body.id}`);
    expect(check.status).to.equal(404);
  });

  it('DELETE /api/projects/:id returns 404 for non-existent project', async () => {
    const res = await request(app).delete('/api/projects/99999');
    expect(res.status).to.equal(404);
  });
});
