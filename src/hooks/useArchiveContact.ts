import useSWRMutation from 'swr/mutation';
import { useContacts } from './useContacts';
import { useRouter } from 'next/navigation';

export function useArchiveContact() {
  const { mutate: mutateContacts } = useContacts();
  const router = useRouter();

  const { trigger, isMutating, error } = useSWRMutation(
    '/api/contacts',
    async (_key: string, { arg }: { arg: number }) => {
      const response = await fetch(`/api/contacts/${arg}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to archive contact');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        // Revalidate contacts list
        mutateContacts();
        // Redirect to contacts page
        router.push('/contacts');
      },
    }
  );

  return {
    archiveContact: trigger,
    isArchiving: isMutating,
    error,
  };
}

