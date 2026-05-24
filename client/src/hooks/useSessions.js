import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '../api/client';

function sessionKey(projectId) {
  return ['sessions', String(projectId)];
}

export function useSessions(projectId) {
  return useQuery({
    queryKey: sessionKey(projectId),
    queryFn: () => sessionsApi.list(projectId),
    enabled: !!projectId,
  });
}

export function useCreateSession(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => sessionsApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKey(projectId) });
    },
  });
}

export function useUpdateSession(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => sessionsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKey(projectId) });
    },
  });
}

export function useDeleteSession(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => sessionsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionKey(projectId) });
    },
  });
}
