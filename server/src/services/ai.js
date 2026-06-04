'use strict';

const { VALID_PRIORITIES, VALID_CATEGORIES } = require('../constants');

const PROMPT = `You are a task extraction assistant. Given a free-form developer note, extract a structured task.

Return ONLY a JSON object with these exact fields:
- title: string (concise task title, max 100 chars)
- description: string (expanded description of what needs to be done)
- priority: one of "low", "medium", "high"
- category: one of "bug", "feature", "refactor", "docs", "setup", "research"

Return only the JSON object, no markdown, no explanation.`;

function _parseResponse(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const err = new Error(`AI returned unparseable JSON: ${text.slice(0, 200)}`);
    err.code = 'AI_MALFORMED';
    throw err;
  }

  if (!parsed.title || typeof parsed.title !== 'string') {
    const err = new Error('AI response missing required field: title');
    err.code = 'AI_MALFORMED';
    throw err;
  }
  if (!VALID_PRIORITIES.includes(parsed.priority)) {
    const err = new Error(`AI returned invalid priority: ${parsed.priority}`);
    err.code = 'AI_MALFORMED';
    throw err;
  }
  if (!VALID_CATEGORIES.includes(parsed.category)) {
    const err = new Error(`AI returned invalid category: ${parsed.category}`);
    err.code = 'AI_MALFORMED';
    throw err;
  }

  return {
    title: parsed.title,
    description: parsed.description ?? null,
    priority: parsed.priority,
    category: parsed.category,
  };
}

async function convertNote(client, note) {
  let response;
  try {
    response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [
        { role: 'user', content: `${PROMPT}\n\nNote: ${note}` },
      ],
    });
  } catch (err) {
    const wrapped = new Error(`Anthropic API unavailable: ${err.message}`);
    wrapped.code = 'ANTHROPIC_UNAVAILABLE';
    throw wrapped;
  }

  const text = response.content[0].text;
  return _parseResponse(text);
}

module.exports = { convertNote };
