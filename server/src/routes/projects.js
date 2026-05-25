'use strict';

const { Router } = require('express');
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../services/projects');

module.exports = function projectsRouter(db) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json(listProjects(db));
  });

  router.post('/', (req, res) => {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    res.status(201).json(createProject(db, { name: name.trim(), description }));
  });

  router.get('/:id', (req, res) => {
    const project = getProject(db, req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  });

  router.put('/:id', (req, res) => {
    const project = updateProject(db, req.params.id, req.body);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  });

  router.delete('/:id', (req, res) => {
    const deleted = deleteProject(db, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Project not found' });
    res.status(204).send();
  });

  return router;
};
