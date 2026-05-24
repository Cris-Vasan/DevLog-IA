'use strict';

function listSessions(db, projectId) {
  return db
    .prepare('SELECT * FROM sessions WHERE project_id = ? ORDER BY date DESC, created_at DESC')
    .all(projectId);
}

function getSession(db, id) {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) ?? null;
}

function createSession(db, projectId, { date, duration_minutes, description }) {
  const result = db
    .prepare(
      'INSERT INTO sessions (project_id, date, duration_minutes, description) VALUES (?, ?, ?, ?)'
    )
    .run(projectId, date, duration_minutes, description);
  return getSession(db, result.lastInsertRowid);
}

function updateSession(db, id, fields) {
  const current = getSession(db, id);
  if (!current) return null;

  const date = fields.date ?? current.date;
  const duration_minutes = fields.duration_minutes ?? current.duration_minutes;
  const description = fields.description ?? current.description;

  db.prepare(
    'UPDATE sessions SET date = ?, duration_minutes = ?, description = ? WHERE id = ?'
  ).run(date, duration_minutes, description, id);

  return getSession(db, id);
}

function deleteSession(db, id) {
  const result = db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
  return result.changes > 0;
}

module.exports = { listSessions, getSession, createSession, updateSession, deleteSession };
