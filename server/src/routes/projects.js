'use strict';

const { Router } = require('express');
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../services/projects');

const router = Router();

router.get('/', (req, res) => {
  const projects = listProjects(req.app.get('db'));
  res.json(projects);
});

router.post('/', (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  const project = createProject(req.app.get('db'), { name: name.trim(), description });
  res.status(201).json(project);
});

router.get('/:id', (req, res) => {
  const project = getProject(req.app.get('db'), req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

router.put('/:id', (req, res) => {
  const project = updateProject(req.app.get('db'), req.params.id, req.body);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

router.delete('/:id', (req, res) => {
  const deleted = deleteProject(req.app.get('db'), req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Project not found' });
  res.status(204).send();
});

module.exports = router;
