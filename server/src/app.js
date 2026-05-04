const express = require('express');
const projectsRouter = require('./routes/projects');

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/projects', projectsRouter);

module.exports = app;
