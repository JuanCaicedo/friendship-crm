import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Recommendation } from '@/lib/models';

// Mock fetch
global.fetch = jest.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>
    {children}
  </SWRConfig>
);

describe('useRecommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches recommendations successfully', async () => {
    const mockRecommendations: Recommendation[] = [
      {
        contactId: 1,
        contact: {
          id: 1,
          name: 'John Doe',
          birthday: null,
          profileNote: null,
          createdAt: 1000,
          archived: false,
          updatedAt: 1000,
        },
        reason: 'It\'s been a while since you last connected',
        priority: 1,
        healthStatus: 'red',
        isReminder: false,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecommendations,
    });

    const { result } = renderHook(() => useRecommendations(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.recommendations).toEqual(mockRecommendations);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('handles fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useRecommendations(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.recommendations).toEqual([]);
    expect(result.current.error).toBeDefined();
  });

  it('handles HTTP errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useRecommendations(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('returns empty array while loading', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useRecommendations(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.recommendations).toEqual([]);
  });

  it('refresh function revalidates data', async () => {
    const mockRecommendations: Recommendation[] = [];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRecommendations,
    });

    const { result } = renderHook(() => useRecommendations(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const initialCallCount = (global.fetch as jest.Mock).mock.calls.length;
    await result.current.refresh();
    
    // Should have made another fetch call
    expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(initialCallCount);
  });
});

