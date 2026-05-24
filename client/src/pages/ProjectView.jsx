import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { Button } from '@/components/ui/button';

const PRIORITIES = ['low', 'medium', 'high'];
const CATEGORIES = ['bug', 'feature', 'refactor', 'docs', 'setup', 'research'];
const STATUSES = ['pending', 'in_progress', 'done'];

const STATUS_LABELS = { pending: 'Pending', in_progress: 'In Progress', done: 'Done' };
const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};
const CATEGORY_COLORS = {
  bug: 'bg-red-50 text-red-600',
  feature: 'bg-blue-50 text-blue-600',
  refactor: 'bg-purple-50 text-purple-600',
  docs: 'bg-green-50 text-green-600',
  setup: 'bg-slate-50 text-slate-600',
  research: 'bg-orange-50 text-orange-600',
};

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

export default function ProjectView() {
  const { id } = useParams();
  const { data: project, isLoading: loadingProject, isError: projectError } = useProject(id);
  const { data: tasks = [], isLoading: loadingTasks } = useTasks(id);
  const createTask = useCreateTask(id);
  const updateTask = useUpdateTask(id);
  const deleteTask = useDeleteTask(id);

  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

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

        {loadingTasks ? (
          <p className="text-slate-400 text-center py-12">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <p className="text-slate-400 text-center py-12">No tasks yet. Create one to get started.</p>
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
    </div>
  );
}
