'use strict';

const { Router } = require('express');
const { getProject } = require('../services/projects');
const { listSessions, createSession, updateSession, deleteSession } = require('../services/sessions');

module.exports = function sessionsRouter(db) {
  const router = Router();

  // GET /api/projects/:id/sessions
  router.get('/projects/:id/sessions', (req, res) => {
    const project = getProject(db, req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(listSessions(db, project.id));
  });

  // POST /api/projects/:id/sessions
  router.post('/projects/:id/sessions', (req, res) => {
    const project = getProject(db, req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const { date, duration_minutes, description } = req.body;

    if (!date || !String(date).trim()) return res.status(400).json({ error: 'date is required' });
    if (duration_minutes === undefined || duration_minutes === null)
      return res.status(400).json({ error: 'duration_minutes is required' });
    if (!description || !String(description).trim())
      return res.status(400).json({ error: 'description is required' });
    if (typeof duration_minutes !== 'number' || duration_minutes <= 0)
      return res.status(400).json({ error: 'duration_minutes must be a positive number' });

    res.status(201).json(
      createSession(db, project.id, {
        date: String(date).trim(),
        duration_minutes,
        description: String(description).trim(),
      })
    );
  });

  // PUT /api/sessions/:id
  router.put('/sessions/:id', (req, res) => {
    const { duration_minutes } = req.body;

    if (duration_minutes !== undefined && (typeof duration_minutes !== 'number' || duration_minutes <= 0)) {
      return res.status(400).json({ error: 'duration_minutes must be a positive number' });
    }

    const session = updateSession(db, req.params.id, req.body);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  });

  // DELETE /api/sessions/:id
  router.delete('/sessions/:id', (req, res) => {
    const deleted = deleteSession(db, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Session not found' });
    res.status(204).send();
  });

  return router;
};
