import { useParams, Link } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';

export default function ProjectView() {
  const { id } = useParams();
  const { data: project, isLoading, isError } = useProject(id);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>;
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Project not found.{' '}
        <Link to="/" className="underline ml-1">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-slate-500 text-sm hover:underline mb-4 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mt-2">{project.name}</h1>
        {project.description && (
          <p className="text-slate-500 mt-2">{project.description}</p>
        )}
        <p className="text-slate-400 text-sm mt-8">Tasks and sessions coming soon.</p>
      </div>
    </div>
  );
}
