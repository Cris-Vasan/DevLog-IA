'use strict';

const { expect } = require('chai');
const { convertNote } = require('../../src/services/ai');

function makeClient(response) {
  return {
    messages: {
      create: async () => ({
        content: [{ type: 'text', text: response }],
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

describe('ai service', () => {
  const validPayload = {
    title: 'Fix auth token expiry',
    description: 'Handle expired tokens gracefully',
    priority: 'high',
    category: 'bug',
  };

  // ── convertNote — happy path ──────────────────────────────────────────────

  it('returns { title, description, priority, category } from valid AI response', async () => {
    const client = makeClient(JSON.stringify(validPayload));
    const result = await convertNote(client, 'auth endpoint fails when token expires');
    expect(result).to.deep.equal(validPayload);
  });

  it('strips extra fields from AI response', async () => {
    const withExtra = { ...validPayload, extra: 'ignored', status: 'pending' };
    const client = makeClient(JSON.stringify(withExtra));
    const result = await convertNote(client, 'some note');
    expect(result).to.not.have.property('extra');
    expect(result).to.not.have.property('status');
    expect(result).to.have.all.keys('title', 'description', 'priority', 'category');
  });

  it('handles AI response wrapped in markdown code block', async () => {
    const wrapped = `\`\`\`json\n${JSON.stringify(validPayload)}\n\`\`\``;
    const client = makeClient(wrapped);
    const result = await convertNote(client, 'some note');
    expect(result).to.deep.equal(validPayload);
  });

  // ── convertNote — error handling ─────────────────────────────────────────

  it('throws with code ANTHROPIC_UNAVAILABLE when client throws a network-like error', async () => {
    const networkErr = Object.assign(new Error('Connection refused'), { status: 503 });
    const client = makeErrorClient(networkErr);
    try {
      await convertNote(client, 'some note');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err.code).to.equal('ANTHROPIC_UNAVAILABLE');
    }
  });

  it('throws with code AI_MALFORMED when response is not valid JSON', async () => {
    const client = makeClient('This is not JSON at all');
    try {
      await convertNote(client, 'some note');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err.code).to.equal('AI_MALFORMED');
    }
  });

  it('throws with code AI_MALFORMED when priority is not a valid enum value', async () => {
    const bad = { ...validPayload, priority: 'urgent' };
    const client = makeClient(JSON.stringify(bad));
    try {
      await convertNote(client, 'some note');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err.code).to.equal('AI_MALFORMED');
    }
  });

  it('throws with code AI_MALFORMED when category is not a valid enum value', async () => {
    const bad = { ...validPayload, category: 'chore' };
    const client = makeClient(JSON.stringify(bad));
    try {
      await convertNote(client, 'some note');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err.code).to.equal('AI_MALFORMED');
    }
  });

  it('throws with code AI_MALFORMED when required field title is missing', async () => {
    const { title: _t, ...noTitle } = validPayload;
    const client = makeClient(JSON.stringify(noTitle));
    try {
      await convertNote(client, 'some note');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err.code).to.equal('AI_MALFORMED');
    }
  });
});
