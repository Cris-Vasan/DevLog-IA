'use strict';

function _getTaskIds(db, sessionId) {
  return db
    .prepare('SELECT task_id FROM session_tasks WHERE session_id = ?')
    .all(sessionId)
    .map((r) => r.task_id);
}

function listSessions(db, projectId) {
  const sessions = db
    .prepare('SELECT * FROM sessions WHERE project_id = ? ORDER BY date DESC, created_at DESC')
    .all(projectId);
  const stmt = db.prepare('SELECT task_id FROM session_tasks WHERE session_id = ?');
  return sessions.map((s) => ({ ...s, task_ids: stmt.all(s.id).map((r) => r.task_id) }));
}

function getSession(db, id) {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) ?? null;
  if (!session) return null;
  return { ...session, task_ids: _getTaskIds(db, id) };
}

function createSession(db, projectId, { date, duration_minutes, description, task_ids = [] }) {
  const result = db
    .prepare(
      'INSERT INTO sessions (project_id, date, duration_minutes, description) VALUES (?, ?, ?, ?)'
    )
    .run(projectId, date, duration_minutes, description);

  const sessionId = result.lastInsertRowid;

  if (task_ids.length > 0) {
    const ins = db.prepare('INSERT INTO session_tasks (session_id, task_id) VALUES (?, ?)');
    for (const taskId of task_ids) {
      ins.run(sessionId, taskId);
    }
  }

  return getSession(db, sessionId);
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

  if (fields.task_ids !== undefined) {
    db.prepare('DELETE FROM session_tasks WHERE session_id = ?').run(id);
    if (fields.task_ids.length > 0) {
      const ins = db.prepare('INSERT INTO session_tasks (session_id, task_id) VALUES (?, ?)');
      for (const taskId of fields.task_ids) {
        ins.run(id, taskId);
      }
    }
  }

  return getSession(db, id);
}

function deleteSession(db, id) {
  const result = db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
  return result.changes > 0;
}

module.exports = { listSessions, getSession, createSession, updateSession, deleteSession };
