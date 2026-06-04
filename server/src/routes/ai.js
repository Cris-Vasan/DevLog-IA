'use strict';

const { Router } = require('express');
const { convertNote } = require('../services/ai');

module.exports = function aiRouter(anthropicClient) {
  const router = Router();

  router.post('/ai/convert', async (req, res) => {
    const { note } = req.body;

    if (!note || !String(note).trim()) {
      return res.status(400).json({ error: 'note is required' });
    }

    if (!anthropicClient) {
      return res.status(503).json({ error: 'AI conversion is not configured' });
    }

    try {
      const task = await convertNote(anthropicClient, String(note).trim());
      res.json(task);
    } catch (err) {
      if (err.code === 'ANTHROPIC_UNAVAILABLE') {
        return res.status(502).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
