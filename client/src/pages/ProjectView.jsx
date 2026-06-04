import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useSessions, useCreateSession, useUpdateSession, useDeleteSession } from '../hooks/useSessions';
import { Button } from '@/components/ui/button';
import {
  PRIORITIES,
  CATEGORIES,
  STATUSES,
  STATUS_LABELS,
  PRIORITY_COLORS,
  CATEGORY_COLORS,
} from '../lib/enums';

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function TaskFilters({ filters, onChange }) {
  function set(key, value) {
    if (value === '') {
      const next = { ...filters };
      delete next[key];
      onChange(next);
    } else {
      onChange({ ...filters, [key]: value });
    }
  }

  const hasFilters = Object.keys(filters).length > 0;
  const selectClass =
    'border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white';
  const activeClass = 'border-slate-500 ring-1 ring-slate-400';

  return (
    <div className="flex gap-2 items-center flex-wrap mb-6">
      <span className="text-xs text-slate-500 font-medium mr-1">Filter:</span>
      <select
        className={`${selectClass} ${filters.status ? activeClass : ''}`}
        value={filters.status || ''}
        onChange={(e) => set('status', e.target.value)}
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      <select
        className={`${selectClass} ${filters.priority ? activeClass : ''}`}
        value={filters.priority || ''}
        onChange={(e) => set('priority', e.target.value)}
      >
        <option value="">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
        ))}
      </select>
      <select
        className={`${selectClass} ${filters.category ? activeClass : ''}`}
        value={filters.category || ''}
        onChange={(e) => set('category', e.target.value)}
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
        ))}
      </select>
      {hasFilters && (
        <button
          className="text-xs text-slate-500 hover:text-slate-800 underline ml-1"
          onClick={() => onChange({})}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function TaskForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [title, setTitle] = useState(initial.title || '');
  const [description, setDescription] = useState(initial.description || '');
  const [priority, setPriority] = useState(initial.priority || 'medium');
  const [category, setCategory] = useState(initial.category || 'feature');

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim() || undefined, priority, category });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        placeholder="Task title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
        placeholder="Description (optional)"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1">Priority</label>
          <select
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1">Category</label>
          <select
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !title.trim()}>
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

function Badge({ className, children }) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${className}`}>
      {children}
    </span>
  );
}

function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
  const nextStatus = STATUSES[(STATUSES.indexOf(task.status) + 1) % STATUSES.length];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col gap-2 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-slate-900 text-sm leading-snug flex-1">{task.title}</h3>
        <div className="flex gap-1 shrink-0">
          <Button size="sm" variant="outline" onClick={() => onEdit(task)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(task)}>Delete</Button>
        </div>
      </div>
      {task.description && (
        <p className="text-slate-500 text-xs line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center gap-2 flex-wrap mt-1">
        <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
        <Badge className={CATEGORY_COLORS[task.category]}>{task.category}</Badge>
        <button
          className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
          onClick={() => onStatusChange(task, nextStatus)}
          title={`Advance to ${STATUS_LABELS[nextStatus]}`}
        >
          {STATUS_LABELS[task.status]} →
        </button>
      </div>
    </div>
  );
}

function SessionForm({ initial = {}, tasks = [], onSubmit, onCancel, loading }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(initial.date || today);
  const [duration, setDuration] = useState(initial.duration_minutes || 60);
  const [description, setDescription] = useState(initial.description || '');
  const [selectedTaskIds, setSelectedTaskIds] = useState(initial.task_ids || []);

  function toggleTask(id) {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!date || !description.trim() || !duration) return;
    onSubmit({
      date,
      duration_minutes: Number(duration),
      description: description.trim(),
      task_ids: selectedTaskIds,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1">Date *</label>
          <input
            type="date"
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="w-36">
          <label className="block text-xs text-slate-500 mb-1">Duration (min) *</label>
          <input
            type="number"
            min="1"
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>
      </div>
      <textarea
        className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
        placeholder="What did you work on? *"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      {tasks.length > 0 && (
        <div>
          <label className="block text-xs text-slate-500 mb-1">Related tasks</label>
          <div className="border border-slate-200 rounded divide-y divide-slate-100 max-h-40 overflow-y-auto">
            {tasks.map((task) => (
              <label
                key={task.id}
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selectedTaskIds.includes(task.id)}
                  onChange={() => toggleTask(task.id)}
                  className="accent-slate-700"
                />
                <span className="text-slate-700 truncate">{task.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !date || !description.trim() || !duration}>
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

function SessionCard({ session, tasks = [], onEdit, onDelete }) {
  const mins = session.duration_minutes;
  const duration = mins >= 60
    ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`.trim()
    : `${mins}m`;

  const linkedTasks = (session.task_ids || [])
    .map((id) => tasks.find((t) => t.id === id))
    .filter(Boolean);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col gap-1 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-medium text-slate-700">{session.date}</span>
          <span className="text-slate-300">·</span>
          <span>{duration}</span>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button size="sm" variant="outline" onClick={() => onEdit(session)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(session)}>Delete</Button>
        </div>
      </div>
      <p className="text-slate-600 text-sm">{session.description}</p>
      {linkedTasks.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {linkedTasks.map((task) => (
            <span
              key={task.id}
              className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
            >
              {task.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectView() {
  const { id } = useParams();
  const { data: project, isLoading: loadingProject, isError: projectError } = useProject(id);

  const [filters, setFilters] = useState({});
  const activeFilters = Object.keys(filters).length > 0 ? filters : undefined;

  const { data: tasks = [], isLoading: loadingTasks } = useTasks(id, activeFilters);
  const createTask = useCreateTask(id);
  const updateTask = useUpdateTask(id);
  const deleteTask = useDeleteTask(id);

  const { data: sessions = [], isLoading: loadingSessions } = useSessions(id);
  const createSession = useCreateSession(id);
  const updateSession = useUpdateSession(id);
  const deleteSession = useDeleteSession(id);

  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const [showCreateSession, setShowCreateSession] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [deletingSession, setDeletingSession] = useState(null);

  if (loadingProject) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>;
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Project not found.{' '}
        <Link to="/" className="underline ml-1">Back to dashboard</Link>
      </div>
    );
  }

  function handleCreate(data) {
    createTask.mutate(data, { onSuccess: () => setShowCreate(false) });
  }

  function handleEdit(data) {
    updateTask.mutate({ id: editingTask.id, ...data }, { onSuccess: () => setEditingTask(null) });
  }

  function handleStatusChange(task, newStatus) {
    updateTask.mutate({ id: task.id, status: newStatus });
  }

  function handleDelete() {
    deleteTask.mutate(deletingTask.id, { onSuccess: () => setDeletingTask(null) });
  }

  function handleCreateSession(data) {
    createSession.mutate(data, { onSuccess: () => setShowCreateSession(false) });
  }

  function handleEditSession(data) {
    updateSession.mutate({ id: editingSession.id, ...data }, { onSuccess: () => setEditingSession(null) });
  }

  function handleDeleteSession() {
    deleteSession.mutate(deletingSession.id, { onSuccess: () => setDeletingSession(null) });
  }

  const hasFilters = !!activeFilters;

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="text-slate-500 text-sm hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <div className="flex items-start justify-between mt-2 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
            {project.description && (
              <p className="text-slate-500 mt-1">{project.description}</p>
            )}
          </div>
          <Button onClick={() => setShowCreate(true)}>New Task</Button>
        </div>

        <TaskFilters filters={filters} onChange={setFilters} />

        {loadingTasks ? (
          <p className="text-slate-400 text-center py-12">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <p className="text-slate-400 text-center py-12">
            {hasFilters
              ? 'No tasks match the active filters.'
              : 'No tasks yet. Create one to get started.'}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-3">
            {STATUSES.map((status) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    {STATUS_LABELS[status]}
                  </h2>
                  <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                    {tasksByStatus[status].length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {tasksByStatus[status].length === 0 ? (
                    <p className="text-slate-300 text-xs text-center py-4">—</p>
                  ) : (
                    tasksByStatus[status].map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onEdit={setEditingTask}
                        onDelete={setDeletingTask}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Sessions section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Work Sessions</h2>
            <Button variant="outline" onClick={() => setShowCreateSession(true)}>Log Session</Button>
          </div>
          {loadingSessions ? (
            <p className="text-slate-400 text-center py-8">Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No sessions logged yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  tasks={tasks}
                  onEdit={setEditingSession}
                  onDelete={setDeletingSession}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <Modal title="New Task" onClose={() => setShowCreate(false)}>
          <TaskForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            loading={createTask.isPending}
          />
        </Modal>
      )}

      {editingTask && (
        <Modal title="Edit Task" onClose={() => setEditingTask(null)}>
          <TaskForm
            initial={editingTask}
            onSubmit={handleEdit}
            onCancel={() => setEditingTask(null)}
            loading={updateTask.isPending}
          />
        </Modal>
      )}

      {deletingTask && (
        <Modal title="Delete Task" onClose={() => setDeletingTask(null)}>
          <p className="text-slate-600 mb-6">
            Delete <strong>{deletingTask.title}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeletingTask(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
            >
              {deleteTask.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </Modal>
      )}

      {showCreateSession && (
        <Modal title="Log Session" onClose={() => setShowCreateSession(false)}>
          <SessionForm
            tasks={tasks}
            onSubmit={handleCreateSession}
            onCancel={() => setShowCreateSession(false)}
            loading={createSession.isPending}
          />
        </Modal>
      )}

      {editingSession && (
        <Modal title="Edit Session" onClose={() => setEditingSession(null)}>
          <SessionForm
            initial={editingSession}
            tasks={tasks}
            onSubmit={handleEditSession}
            onCancel={() => setEditingSession(null)}
            loading={updateSession.isPending}
          />
        </Modal>
      )}

      {deletingSession && (
        <Modal title="Delete Session" onClose={() => setDeletingSession(null)}>
          <p className="text-slate-600 mb-6">
            Delete session from <strong>{deletingSession.date}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeletingSession(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSession}
              disabled={deleteSession.isPending}
            >
              {deleteSession.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
