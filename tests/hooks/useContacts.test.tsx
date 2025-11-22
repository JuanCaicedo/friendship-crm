import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { useContacts, useContact } from '@/hooks/useContacts';
import { Contact } from '@/lib/models';

// Mock fetch
global.fetch = jest.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>
    {children}
  </SWRConfig>
);

describe('useContacts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches contacts successfully', async () => {
    const mockContacts: Contact[] = [
      {
        id: 1,
        name: 'John Doe',
        birthday: null,
        profileNote: null,
        createdAt: 1000,
        archived: false,
        updatedAt: 1000,
      },
      {
        id: 2,
        name: 'Jane Smith',
        birthday: '1990-05-15',
        profileNote: 'Loves hiking',
        createdAt: 2000,
        archived: false,
        updatedAt: 2000,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockContacts,
    });

    const { result } = renderHook(() => useContacts(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.contacts).toEqual(mockContacts);
    expect(result.current.isError).toBe(false);
  });

  it('handles fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useContacts(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.contacts).toEqual([]);
  });

  it('builds correct query string with options', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    renderHook(() => useContacts({ archived: false, tagId: 1, limit: 10 }), { wrapper });

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const url = calls[0][0];
      expect(url).toContain('archived=false');
      expect(url).toContain('tagId=1');
      expect(url).toContain('limit=10');
    });
  });
});

describe('useContact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches a single contact successfully', async () => {
    const mockContact: Contact = {
      id: 1,
      name: 'John Doe',
      birthday: null,
      profileNote: null,
      createdAt: 1000,
      archived: false,
      updatedAt: 1000,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockContact,
    });

    const { result } = renderHook(() => useContact(1), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.contact).toEqual(mockContact);
    expect(result.current.isError).toBe(false);
  });

  it('does not fetch when id is 0', () => {
    (global.fetch as jest.Mock).mockClear();

    renderHook(() => useContact(0), { wrapper });

    // Should not make any fetch calls
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useContact(1), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.contact).toBeNull();
  });
});

