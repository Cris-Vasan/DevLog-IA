const express = require('express');
const projectsRouter = require('./routes/projects');
const tasksRouter = require('./routes/tasks');
const sessionsRouter = require('./routes/sessions');

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/projects', projectsRouter);
app.use('/api', tasksRouter);
app.use('/api', sessionsRouter);

module.exports = app;
