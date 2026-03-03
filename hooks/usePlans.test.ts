import { renderHook, waitFor, act } from '@testing-library/react';
import { usePlans } from './usePlans';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as useAuthHook from '@/hooks/useAuth';

vi.mock('@/lib/firebase', () => ({
    auth: {},
    db: {}
}));

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('usePlans Hook', () => {
    const mockGetIdToken = vi.fn().mockResolvedValue('fake-jwt-token');

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return empty plans when user is not authenticated', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: null,
            loading: false,
            error: null
        } as any);

        const { result } = renderHook(() => usePlans());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.plans).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it('should fetch and return plans when user is authenticated', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'user123', getIdToken: mockGetIdToken },
            loading: false,
            error: null
        } as any);

        const mockPlans = [{ id: 'plan1', name: 'Computer Science' }];

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: mockPlans })
        });

        const { result } = renderHook(() => usePlans());

        expect(result.current.loading).toBe(true); // Initial state

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(mockGetIdToken).toHaveBeenCalled();
        expect(mockFetch).toHaveBeenCalledWith('/api/v1/plans', expect.objectContaining({
            headers: { Authorization: 'Bearer fake-jwt-token' }
        }));
        expect(result.current.plans).toEqual(mockPlans);
        expect(result.current.error).toBeNull();
    });

    it('should handle API errors during fetch', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'user123', getIdToken: mockGetIdToken },
            loading: false,
            error: null
        } as any);

        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: { message: 'Database failure' } })
        });

        const { result } = renderHook(() => usePlans());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.plans).toEqual([]);
        expect(result.current.error).toBe('Database failure');
    });

    it('should successfully create a new plan and refetch', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'user123', getIdToken: mockGetIdToken },
            loading: false,
            error: null
        } as any);

        // Initial fetch mock
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: [] })
        });

        const { result } = renderHook(() => usePlans());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Create mock
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { id: 'plan1', name: 'New Plan' } })
        });

        // Refetch mock trigger
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: [{ id: 'plan1', name: 'New Plan' }] })
        });

        await act(async () => {
            await result.current.createPlan('New Plan');
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/plans', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ name: 'New Plan' })
        }));

        expect(result.current.plans).toEqual([{ id: 'plan1', name: 'New Plan' }]);
    });

    it('should successfully delete a plan and update UI optimistically', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'user123', getIdToken: mockGetIdToken },
            loading: false,
            error: null
        } as any);

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: [{ id: 'plan1', name: 'To Delete' }] })
        });

        const { result } = renderHook(() => usePlans());
        await waitFor(() => expect(result.current.plans).toHaveLength(1));

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { deleted: true } })
        });

        await act(async () => {
            await result.current.deletePlan('plan1');
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/plans/plan1', expect.objectContaining({
            method: 'DELETE'
        }));

        expect(result.current.plans).toHaveLength(0);
    });
});
