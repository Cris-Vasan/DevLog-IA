'use strict';

function listProjects(db) {
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
}

function getProject(db, id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) ?? null;
}

function createProject(db, { name, description = null }) {
  const result = db
    .prepare('INSERT INTO projects (name, description) VALUES (?, ?)')
    .run(name, description);
  return getProject(db, result.lastInsertRowid);
}

function updateProject(db, id, fields) {
  const current = getProject(db, id);
  if (!current) return null;

  const name = fields.name ?? current.name;
  const description = fields.description !== undefined ? fields.description : current.description;

  db.prepare(
    'UPDATE projects SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(name, description, id);

  return getProject(db, id);
}

function deleteProject(db, id) {
  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return result.changes > 0;
}

module.exports = { listProjects, getProject, createProject, updateProject, deleteProject };
