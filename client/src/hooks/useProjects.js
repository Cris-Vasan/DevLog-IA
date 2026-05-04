import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/client';

const QUERY_KEY = ['projects'];

export function useProjects() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: projectsApi.list });
}

export function useProject(id) {
  return useQuery({ queryKey: [...QUERY_KEY, id], queryFn: () => projectsApi.get(id) });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => projectsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
