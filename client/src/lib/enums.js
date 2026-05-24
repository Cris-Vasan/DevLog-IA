export const PRIORITIES = ['low', 'medium', 'high'];
export const CATEGORIES = ['bug', 'feature', 'refactor', 'docs', 'setup', 'research'];
export const STATUSES = ['pending', 'in_progress', 'done'];

export const STATUS_LABELS = { pending: 'Pending', in_progress: 'In Progress', done: 'Done' };

export const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export const CATEGORY_COLORS = {
  bug: 'bg-red-50 text-red-600',
  feature: 'bg-blue-50 text-blue-600',
  refactor: 'bg-purple-50 text-purple-600',
  docs: 'bg-green-50 text-green-600',
  setup: 'bg-slate-50 text-slate-600',
  research: 'bg-orange-50 text-orange-600',
};
