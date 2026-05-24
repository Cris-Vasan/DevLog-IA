'use strict';

const { Router } = require('express');
const { getProject } = require('../services/projects');
const {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  validateTaskCreate,
  validateTaskUpdate,
} = require('../services/tasks');

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

  const createErr = validateTaskCreate({ title, priority, category });
  if (createErr) return res.status(400).json(createErr);

  const task = createTask(db, project.id, { title: title.trim(), description, priority, category });
  res.status(201).json(task);
});

// PUT /api/tasks/:id
router.put('/tasks/:id', (req, res) => {
  const db = req.app.get('db');

  const updateErr = validateTaskUpdate(req.body);
  if (updateErr) return res.status(400).json(updateErr);

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
