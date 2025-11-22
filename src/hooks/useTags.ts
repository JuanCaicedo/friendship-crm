import useSWR from 'swr';
import { Tag } from '@/lib/models';

async function fetchTags(): Promise<Tag[]> {
  const response = await fetch('/api/tags');
  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }
  return response.json();
}

export function useTags() {
  const { data, error, isLoading, mutate } = useSWR<Tag[]>('/api/tags', fetchTags);

  return {
    tags: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

