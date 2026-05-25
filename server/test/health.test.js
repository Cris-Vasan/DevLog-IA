const request = require('supertest');
const { expect } = require('chai');
const createApp = require('../src/app');

const app = createApp();

describe('Health', () => {
  it('GET /api/health returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ status: 'ok' });
  });
});
