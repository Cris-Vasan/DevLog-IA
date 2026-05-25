'use strict';

const { getProject } = require('../services/projects');

module.exports = function requireProject(db) {
  return function (req, res, next) {
    const project = getProject(db, req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    req.project = project;
    next();
  };
};
