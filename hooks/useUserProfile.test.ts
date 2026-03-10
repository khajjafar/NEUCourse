import { renderHook, waitFor, act } from '@testing-library/react';
import { useUserProfile } from './useUserProfile';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as useAuthHook from '@/hooks/useAuth';

vi.mock('@/lib/firebase', () => ({
    auth: {},
    db: {}
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useUserProfile Hook', () => {
    const mockGetIdToken = vi.fn().mockResolvedValue('fake-token');

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return null profile if unauthenticated', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: null, loading: false, error: null
        } as any);

        const { result } = renderHook(() => useUserProfile());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.profile).toBeNull();
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fetch and return profile successfully', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const profileMock = {
            requirements: [{ id: 'req1', name: 'Electives', count: 4 }]
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: profileMock })
        });

        const { result } = renderHook(() => useUserProfile());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/profile', expect.anything());
        expect(result.current.profile).toEqual(profileMock);
    });

    it('should update requirements optimistically', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = { requirements: [] };

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });
        const { result } = renderHook(() => useUserProfile());
        await waitFor(() => expect(result.current.profile).not.toBeNull());

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { updated: true } }) });

        const newRequirements = [{ id: 'req2', name: 'GenEds', count: 2 }];

        await act(async () => {
            await result.current.updateRequirements(newRequirements);
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/profile', expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ requirements: newRequirements })
        }));

        expect(result.current.profile?.requirements).toEqual(newRequirements);
    });

    it('sets error when fetchProfile response is not ok', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: { message: 'Profile fetch failed' } })
        });

        const { result } = renderHook(() => useUserProfile());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Profile fetch failed');
        expect(result.current.profile).toBeNull();
    });

    it('sets error with Unknown error when thrown value is not an Error', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        mockFetch.mockRejectedValueOnce('network failure');

        const { result } = renderHook(() => useUserProfile());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Unknown error');
    });

    it('fetchProfile sets profile to {} when data.data is null', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: null })
        });

        const { result } = renderHook(() => useUserProfile());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.profile).toEqual({});
    });

    it('updateRequirements throws when user is null', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: null, loading: false, error: null
        } as any);

        const { result } = renderHook(() => useUserProfile());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await expect(result.current.updateRequirements([])).rejects.toThrow('Must be logged in');
    });

    it('updateRequirements reverts and throws when response is not ok', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = { requirements: [{ id: 'req1', name: 'Electives', count: 4 }] };
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });

        const { result } = renderHook(() => useUserProfile());
        await waitFor(() => expect(result.current.profile).not.toBeNull());

        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: { message: 'Update failed' } })
        });

        await expect(
            act(async () => { await result.current.updateRequirements([]); })
        ).rejects.toThrow('Failed to update requirements');

        // Verify revert — profile should be back to original
        expect(result.current.profile?.requirements).toEqual(initialMock.requirements);
    });
});
