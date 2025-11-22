import useSWR from 'swr';
import { HealthScore } from '@/lib/models';

export function useHealth(contactId: number) {
  const { data, error, isLoading } = useSWR<HealthScore>(
    contactId ? `/api/health/${contactId}` : null,
    async (key: string) => {
      const response = await fetch(key);
      if (!response.ok) {
        throw new Error('Failed to fetch health');
      }
      return response.json();
    }
  );

  return {
    health: data || null,
    isLoading,
    isError: !!error,
    error,
  };
}

