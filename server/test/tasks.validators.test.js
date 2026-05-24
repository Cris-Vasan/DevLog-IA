'use strict';

const { expect } = require('chai');
const { validateTaskCreate, validateTaskUpdate } = require('../src/services/tasks');

describe('validateTaskCreate', () => {
  it('returns null for valid fields', () => {
    expect(validateTaskCreate({ title: 'Fix bug', priority: 'high', category: 'bug' })).to.be.null;
  });

  it('returns error when title is missing', () => {
    const r = validateTaskCreate({ priority: 'low', category: 'bug' });
    expect(r).to.have.property('error').that.includes('title');
  });

  it('returns error when title is blank', () => {
    const r = validateTaskCreate({ title: '   ', priority: 'low', category: 'bug' });
    expect(r).to.have.property('error').that.includes('title');
  });

  it('returns error when priority is missing', () => {
    const r = validateTaskCreate({ title: 'X', category: 'bug' });
    expect(r).to.have.property('error').that.includes('priority');
  });

  it('returns error when category is missing', () => {
    const r = validateTaskCreate({ title: 'X', priority: 'low' });
    expect(r).to.have.property('error').that.includes('category');
  });

  it('returns error for invalid priority', () => {
    const r = validateTaskCreate({ title: 'X', priority: 'urgent', category: 'bug' });
    expect(r).to.have.property('error').that.includes('priority');
  });

  it('returns error for invalid category', () => {
    const r = validateTaskCreate({ title: 'X', priority: 'low', category: 'chore' });
    expect(r).to.have.property('error').that.includes('category');
  });
});

describe('validateTaskUpdate', () => {
  it('returns null for empty update', () => {
    expect(validateTaskUpdate({})).to.be.null;
  });

  it('returns null for valid partial update', () => {
    expect(validateTaskUpdate({ status: 'done' })).to.be.null;
    expect(validateTaskUpdate({ priority: 'high' })).to.be.null;
    expect(validateTaskUpdate({ category: 'feature' })).to.be.null;
  });

  it('returns null for fully valid update', () => {
    expect(validateTaskUpdate({ priority: 'low', category: 'docs', status: 'in_progress' })).to.be.null;
  });

  it('returns error for invalid priority', () => {
    const r = validateTaskUpdate({ priority: 'critical' });
    expect(r).to.have.property('error').that.includes('priority');
  });

  it('returns error for invalid category', () => {
    const r = validateTaskUpdate({ category: 'test' });
    expect(r).to.have.property('error').that.includes('category');
  });

  it('returns error for invalid status', () => {
    const r = validateTaskUpdate({ status: 'blocked' });
    expect(r).to.have.property('error').that.includes('status');
  });
});
