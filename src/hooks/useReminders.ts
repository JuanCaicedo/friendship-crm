import useSWR from 'swr';
import { Reminder, GetRemindersOptions } from '@/lib/models';

function getRemindersKey(options?: GetRemindersOptions): string {
  const params = new URLSearchParams();
  if (options?.contactId) params.set('contactId', String(options.contactId));
  if (options?.status) params.set('status', options.status);
  if (options?.dueBefore) params.set('dueBefore', String(options.dueBefore));
  if (options?.includePast !== undefined) params.set('includePast', String(options.includePast));
  return `/api/reminders?${params.toString()}`;
}

async function fetchReminders(key: string): Promise<Reminder[]> {
  const response = await fetch(key);
  if (!response.ok) {
    throw new Error('Failed to fetch reminders');
  }
  return response.json();
}

export function useReminders(options?: GetRemindersOptions) {
  const key = getRemindersKey(options);
  const { data, error, isLoading, mutate } = useSWR<Reminder[]>(key, fetchReminders);

  return {
    reminders: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

