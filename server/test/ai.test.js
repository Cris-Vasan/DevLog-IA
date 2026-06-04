'use strict';

const request = require('supertest');
const { expect } = require('chai');
const { createDb } = require('../src/db');
const createApp = require('../src/app');

function makeClient(response) {
  return {
    messages: {
      create: async () => ({
        content: [{ type: 'text', text: JSON.stringify(response) }],
      }),
    },
  };
}

function makeErrorClient(err) {
  return {
    messages: {
      create: async () => { throw err; },
    },
  };
}

describe('AI convert API', () => {
  let db;
  let app;

  const validTask = {
    title: 'Fix auth token expiry',
    description: 'Handle expired tokens gracefully',
    priority: 'high',
    category: 'bug',
  };

  before(() => {
    db = createDb(':memory:');
    app = createApp(db, makeClient(validTask));
  });

  after(() => {
    db.close();
  });

  // ── POST /api/ai/convert ──────────────────────────────────────────────────

  it('returns 200 with { title, description, priority, category } on valid note', async () => {
    const res = await request(app)
      .post('/api/ai/convert')
      .send({ note: 'auth endpoint fails when token expires' });
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal(validTask);
  });

  it('returns 400 when note is missing', async () => {
    const res = await request(app).post('/api/ai/convert').send({});
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error');
  });

  it('returns 400 when note is empty string', async () => {
    const res = await request(app).post('/api/ai/convert').send({ note: '   ' });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error');
  });

  it('returns 502 when Anthropic API is unavailable', async () => {
    const networkErr = Object.assign(new Error('timeout'), { status: 503 });
    const appWithBrokenClient = createApp(db, makeErrorClient(networkErr));
    const res = await request(appWithBrokenClient)
      .post('/api/ai/convert')
      .send({ note: 'some note' });
    expect(res.status).to.equal(502);
    expect(res.body).to.have.property('error');
  });

  it('returns 500 when AI returns malformed output', async () => {
    const malformedClient = {
      messages: {
        create: async () => ({ content: [{ type: 'text', text: 'not json at all' }] }),
      },
    };
    const appWithMalformed = createApp(db, malformedClient);
    const res = await request(appWithMalformed)
      .post('/api/ai/convert')
      .send({ note: 'some note' });
    expect(res.status).to.equal(500);
    expect(res.body).to.have.property('error');
  });
});
