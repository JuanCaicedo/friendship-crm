import useSWR from 'swr';
import { Recommendation } from '@/lib/models';

const RECOMMENDATIONS_KEY = '/api/recommendations';

async function fetchRecommendations(): Promise<Recommendation[]> {
  const response = await fetch(RECOMMENDATIONS_KEY);
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  return response.json();
}

export function useRecommendations(excludeContactIds?: number[]) {
  const { data, error, isLoading, mutate } = useSWR<Recommendation[]>(
    RECOMMENDATIONS_KEY,
    fetchRecommendations,
    {
      revalidateOnMount: true,
    }
  );

  const refresh = async () => {
    if (excludeContactIds && excludeContactIds.length > 0) {
      const response = await fetch(RECOMMENDATIONS_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excludeContactIds }),
      });
      if (!response.ok) {
        throw new Error('Failed to refresh recommendations');
      }
      const recommendations = await response.json();
      mutate(recommendations, false); // Update cache without revalidation
    } else {
      await mutate(); // Revalidate
    }
  };

  return {
    recommendations: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh,
    mutate,
  };
}

