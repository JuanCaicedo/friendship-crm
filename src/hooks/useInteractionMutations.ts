import useSWRMutation from 'swr/mutation';
import { LogInteractionParams, Interaction } from '@/lib/models';
import { useContacts } from './useContacts';

export function useLogInteraction() {
  const { mutate: mutateContacts } = useContacts();

  const { trigger, isMutating, error } = useSWRMutation(
    '/api/interactions/create',
    async (_key: string, { arg }: { arg: LogInteractionParams }) => {
      const response = await fetch('/api/interactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log interaction');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        // Revalidate contacts to update health scores
        mutateContacts();
      },
    }
  );

  return {
    logInteraction: trigger,
    isLogging: isMutating,
    error,
  };
}

