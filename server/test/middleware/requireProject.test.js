'use strict';

const { expect } = require('chai');
const { createDb } = require('../../src/db');
const requireProject = require('../../src/middleware/requireProject');

describe('requireProject middleware', () => {
  let db;
  let projectId;

  before(() => {
    db = createDb(':memory:');
  });

  after(() => {
    db.close();
  });

  beforeEach(() => {
    const result = db.prepare('INSERT INTO projects (name) VALUES (?)').run('Test Project');
    projectId = result.lastInsertRowid;
  });

  afterEach(() => {
    db.prepare('DELETE FROM projects').run();
  });

  function makeReqRes(id) {
    const req = { params: { id: String(id) } };
    const res = {
      _status: null,
      _body: null,
      status(code) { this._status = code; return this; },
      json(body) { this._body = body; return this; },
    };
    return { req, res };
  }

  it('calls next() and attaches req.project when project exists', () => {
    const { req, res } = makeReqRes(projectId);
    let called = false;
    requireProject(db)(req, res, () => { called = true; });
    expect(called).to.equal(true);
    expect(req.project).to.include({ id: projectId, name: 'Test Project' });
    expect(res._status).to.equal(null);
  });

  it('returns 404 and does not call next() when project does not exist', () => {
    const { req, res } = makeReqRes(99999);
    let called = false;
    requireProject(db)(req, res, () => { called = true; });
    expect(called).to.equal(false);
    expect(res._status).to.equal(404);
    expect(res._body).to.deep.equal({ error: 'Project not found' });
  });
});
