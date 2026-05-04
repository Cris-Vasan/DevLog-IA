import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { Button } from '@/components/ui/button';

function ProjectForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initial.name || '');
  const [description, setDescription] = useState(initial.description || '');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        placeholder="Project name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
        placeholder="Description (optional)"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

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

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading, isError } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  function handleCreate(data) {
    createProject.mutate(data, { onSuccess: () => setShowCreate(false) });
  }

  function handleEdit(data) {
    updateProject.mutate(
      { id: editingProject.id, ...data },
      { onSuccess: () => setEditingProject(null) }
    );
  }

  function handleDelete() {
    deleteProject.mutate(deletingProject.id, { onSuccess: () => setDeletingProject(null) });
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Failed to load projects.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">DevLog AI</h1>
          <Button onClick={() => setShowCreate(true)}>New Project</Button>
        </div>

        {projects.length === 0 ? (
          <p className="text-slate-400 text-center py-16">No projects yet. Create one to get started.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div>
                  <h2 className="font-semibold text-slate-900 text-lg leading-tight">{project.name}</h2>
                  {project.description && (
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">{project.description}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProject(project);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingProject(project);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <Modal title="New Project" onClose={() => setShowCreate(false)}>
          <ProjectForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            loading={createProject.isPending}
          />
        </Modal>
      )}

      {editingProject && (
        <Modal title="Edit Project" onClose={() => setEditingProject(null)}>
          <ProjectForm
            initial={editingProject}
            onSubmit={handleEdit}
            onCancel={() => setEditingProject(null)}
            loading={updateProject.isPending}
          />
        </Modal>
      )}

      {deletingProject && (
        <Modal title="Delete Project" onClose={() => setDeletingProject(null)}>
          <p className="text-slate-600 mb-6">
            Delete <strong>{deletingProject.name}</strong>? This will also delete all its tasks and
            sessions. This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeletingProject(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
