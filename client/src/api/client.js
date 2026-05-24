const BASE_URL = import.meta.env.VITE_API_URL || '';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const projectsApi = {
  list: () => apiFetch('/api/projects'),
  get: (id) => apiFetch(`/api/projects/${id}`),
  create: (data) => apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    apiFetch(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/api/projects/${id}`, { method: 'DELETE' }),
};

export const tasksApi = {
  list: (projectId, filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    ).toString();
    return apiFetch(`/api/projects/${projectId}/tasks${params ? `?${params}` : ''}`);
  },
  create: (projectId, data) =>
    apiFetch(`/api/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    apiFetch(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/api/tasks/${id}`, { method: 'DELETE' }),
};
