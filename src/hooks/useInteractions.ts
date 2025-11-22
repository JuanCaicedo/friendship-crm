import useSWR from 'swr';
import { Interaction, GetInteractionsOptions } from '@/lib/models';

function getInteractionsKey(options?: GetInteractionsOptions): string {
  const params = new URLSearchParams();
  if (options?.contactId) params.set('contactId', String(options.contactId));
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));
  if (options?.orderBy) params.set('orderBy', options.orderBy);
  if (options?.order) params.set('order', options.order);
  return `/api/interactions?${params.toString()}`;
}

async function fetchInteractions(key: string): Promise<Interaction[]> {
  const response = await fetch(key);
  if (!response.ok) {
    throw new Error('Failed to fetch interactions');
  }
  return response.json();
}

export function useInteractions(options?: GetInteractionsOptions) {
  const key = getInteractionsKey(options);
  const { data, error, isLoading, mutate } = useSWR<Interaction[]>(key, fetchInteractions);

  return {
    interactions: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

