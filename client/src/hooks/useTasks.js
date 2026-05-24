import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/client';

function taskKey(projectId) {
  return ['tasks', String(projectId)];
}

export function useTasks(projectId, filters) {
  return useQuery({
    queryKey: [...taskKey(projectId), filters],
    queryFn: () => tasksApi.list(projectId, filters),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => tasksApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKey(projectId) });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => tasksApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKey(projectId) });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => tasksApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKey(projectId) });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
