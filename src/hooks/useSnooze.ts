import useSWRMutation from 'swr/mutation';
import { Snooze } from '@/lib/models';
import { useRecommendations } from './useRecommendations';

export function useSnooze() {
  const { refresh } = useRecommendations();

  const { trigger, isMutating, error } = useSWRMutation(
    '/api/snoozes',
    async (_key: string, { arg }: { arg: { contactId: number; days: number } }) => {
      const response = await fetch('/api/snoozes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to snooze recommendation');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        // Refresh recommendations after snoozing
        refresh();
      },
    }
  );

  return {
    snooze: trigger,
    isSnoozing: isMutating,
    error,
  };
}

