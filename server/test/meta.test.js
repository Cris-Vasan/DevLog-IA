'use strict';

const request = require('supertest');
const { expect } = require('chai');
const createApp = require('../src/app');

const app = createApp();

describe('Meta API', () => {
  it('GET /api/meta/enums returns canonical enum lists', async () => {
    const res = await request(app).get('/api/meta/enums');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({
      priorities: ['low', 'medium', 'high'],
      categories: ['bug', 'feature', 'refactor', 'docs', 'setup', 'research'],
      statuses: ['pending', 'in_progress', 'done'],
    });
  });
});
