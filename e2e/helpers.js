const API = 'http://localhost:3002/api';

export async function resetDb(request) {
  const res = await request.get(`${API}/projects`);
  const projects = await res.json();
  for (const p of projects) {
    await request.delete(`${API}/projects/${p.id}`);
  }
}

export async function createProject(request, name, description = '') {
  const res = await request.post(`${API}/projects`, {
    data: { name, description },
  });
  return res.json();
}

export async function createTask(request, projectId, data) {
  const res = await request.post(`${API}/projects/${projectId}/tasks`, {
    data,
  });
  return res.json();
}

export async function createSession(request, projectId, data) {
  const res = await request.post(`${API}/projects/${projectId}/sessions`, {
    data,
  });
  return res.json();
}
