'use strict';

const { Router } = require('express');
const { getProject } = require('../services/projects');
const {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../services/tasks');
const { VALID_PRIORITIES, VALID_CATEGORIES, VALID_STATUSES } = require('../constants');

const router = Router();

// GET /api/projects/:id/tasks
router.get('/projects/:id/tasks', (req, res) => {
  const db = req.app.get('db');
  const project = getProject(db, req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { status, priority, category } = req.query;
  const tasks = listTasks(db, project.id, { status, priority, category });
  res.json(tasks);
});

// POST /api/projects/:id/tasks
router.post('/projects/:id/tasks', (req, res) => {
  const db = req.app.get('db');
  const project = getProject(db, req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { title, description, priority, category } = req.body;

  if (!title || !title.trim()) return res.status(400).json({ error: 'title is required' });
  if (!priority) return res.status(400).json({ error: 'priority is required' });
  if (!category) return res.status(400).json({ error: 'category is required' });
  if (!VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  const task = createTask(db, project.id, { title: title.trim(), description, priority, category });
  res.status(201).json(task);
});

// PUT /api/tasks/:id
router.put('/tasks/:id', (req, res) => {
  const db = req.app.get('db');
  const { priority, category, status } = req.body;

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
  }
  if (category && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const task = updateTask(db, req.params.id, req.body);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// DELETE /api/tasks/:id
router.delete('/tasks/:id', (req, res) => {
  const db = req.app.get('db');
  const deleted = deleteTask(db, req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Task not found' });
  res.status(204).send();
});

module.exports = router;
