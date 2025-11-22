import useSWRMutation from 'swr/mutation';
import { Contact, CreateContactParams, UpdateContactParams } from '@/lib/models';
import { useContacts } from './useContacts';

export function useCreateContact() {
  const { mutate: mutateContacts } = useContacts();

  const { trigger, isMutating, error } = useSWRMutation(
    '/api/contacts/create',
    async (_key: string, { arg }: { arg: CreateContactParams }) => {
      const response = await fetch('/api/contacts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create contact');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        // Revalidate contacts list after creation
        mutateContacts();
      },
    }
  );

  return {
    createContact: trigger,
    isCreating: isMutating,
    error,
  };
}

export function useUpdateContact() {
  const { mutate: mutateContacts } = useContacts();

  const { trigger, isMutating, error } = useSWRMutation(
    '/api/contacts/update',
    async (_key: string, { arg }: { arg: { id: number; params: UpdateContactParams } }) => {
      const response = await fetch('/api/contacts/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: arg.id, params: arg.params }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update contact');
      }
      return response.json();
    },
    {
      onSuccess: (data: Contact) => {
        // Optimistically update the cache
        mutateContacts((contacts) => {
          if (!contacts) return contacts;
          return contacts.map((c) => (c.id === data.id ? data : c));
        }, false);
      },
    }
  );

  return {
    updateContact: trigger,
    isUpdating: isMutating,
    error,
  };
}

