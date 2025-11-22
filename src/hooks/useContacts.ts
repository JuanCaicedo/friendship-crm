import useSWR from 'swr';
import { Contact, GetContactsOptions } from '@/lib/models';

function getContactsKey(options?: GetContactsOptions): string {
  const params = new URLSearchParams();
  if (options?.archived !== undefined) params.set('archived', String(options.archived));
  if (options?.tagId) params.set('tagId', String(options.tagId));
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));
  return `/api/contacts?${params.toString()}`;
}

async function fetchContacts(key: string): Promise<Contact[]> {
  const response = await fetch(key);
  if (!response.ok) {
    throw new Error('Failed to fetch contacts');
  }
  return response.json();
}

export function useContacts(options?: GetContactsOptions) {
  const key = getContactsKey(options);
  const { data, error, isLoading, mutate } = useSWR<Contact[]>(key, fetchContacts);

  return {
    contacts: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useContact(id: number) {
  const { data, error, isLoading, mutate } = useSWR<Contact | null>(
    id ? `/api/contacts/${id}` : null,
    async (key: string) => {
      const response = await fetch(key);
      if (!response.ok) {
        throw new Error('Failed to fetch contact');
      }
      return response.json();
    }
  );

  return {
    contact: data || null,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

