import { useMutation } from '@tanstack/react-query';
import { aiApi } from '../api/client';

export function useAIConvert() {
  return useMutation({
    mutationFn: (note) => aiApi.convert(note),
  });
}
