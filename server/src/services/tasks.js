'use strict';

const { VALID_PRIORITIES, VALID_CATEGORIES, VALID_STATUSES } = require('../constants');

function listTasks(db, projectId, filters = {}) {
  let sql = 'SELECT * FROM tasks WHERE project_id = ?';
  const params = [projectId];

  if (filters.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.priority) {
    sql += ' AND priority = ?';
    params.push(filters.priority);
  }
  if (filters.category) {
    sql += ' AND category = ?';
    params.push(filters.category);
  }

  sql += ' ORDER BY created_at DESC';
  return db.prepare(sql).all(...params);
}

function getTask(db, id) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) ?? null;
}

function createTask(db, projectId, { title, description = null, priority, category }) {
  const result = db
    .prepare(
      'INSERT INTO tasks (project_id, title, description, priority, category) VALUES (?, ?, ?, ?, ?)'
    )
    .run(projectId, title, description, priority, category);
  return getTask(db, result.lastInsertRowid);
}

function updateTask(db, id, fields) {
  const current = getTask(db, id);
  if (!current) return null;

  const title = fields.title ?? current.title;
  const description = fields.description !== undefined ? fields.description : current.description;
  const priority = fields.priority ?? current.priority;
  const category = fields.category ?? current.category;
  const status = fields.status ?? current.status;

  db.prepare(
    'UPDATE tasks SET title = ?, description = ?, priority = ?, category = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(title, description, priority, category, status, id);

  return getTask(db, id);
}

function deleteTask(db, id) {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}

function validateTaskCreate({ title, priority, category } = {}) {
  if (!title || !String(title).trim()) return { error: 'title is required' };
  if (!priority) return { error: 'priority is required' };
  if (!category) return { error: 'category is required' };
  if (!VALID_PRIORITIES.includes(priority)) {
    return { error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` };
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return { error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` };
  }
  return null;
}

function validateTaskUpdate({ priority, category, status } = {}) {
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return { error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` };
  }
  if (category && !VALID_CATEGORIES.includes(category)) {
    return { error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` };
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return { error: `status must be one of: ${VALID_STATUSES.join(', ')}` };
  }
  return null;
}

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  validateTaskCreate,
  validateTaskUpdate,
};
