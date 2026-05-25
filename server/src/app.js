const express = require('express');
const projectsRouter = require('./routes/projects');
const tasksRouter = require('./routes/tasks');
const sessionsRouter = require('./routes/sessions');
const { VALID_PRIORITIES, VALID_CATEGORIES, VALID_STATUSES } = require('./constants');

function createApp(db) {
  const app = express();

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/meta/enums', (req, res) => {
    res.json({ priorities: VALID_PRIORITIES, categories: VALID_CATEGORIES, statuses: VALID_STATUSES });
  });

  app.use('/api/projects', projectsRouter(db));
  app.use('/api', tasksRouter(db));
  app.use('/api', sessionsRouter(db));

  return app;
}

module.exports = createApp;
