import { renderHook, waitFor, act } from '@testing-library/react';
import { useEvents } from './useEvents';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as useAuthHook from '@/hooks/useAuth';

vi.mock('@/lib/firebase', () => ({
    auth: {}
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useEvents Hook', () => {
    const mockGetIdToken = vi.fn().mockResolvedValue('mock-token');

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'user123', getIdToken: mockGetIdToken },
            loading: false,
            error: null
        } as unknown as ReturnType<typeof useAuthHook.useAuth>);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('addEvent calls POST with correct URL, body, and Authorization header', async () => {
        // Initial fetch mock
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: [] })
        });

        const { result } = renderHook(() => useEvents());
        await waitFor(() => expect(result.current.loading).toBe(false));

        const newEvent = { title: 'New Event', startTime: '10:00', endTime: '11:00', location: 'Here', color: 'blue' };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { id: 'evt1', ...newEvent } })
        });

        await act(async () => {
            await result.current.addEvent(newEvent);
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/events', expect.objectContaining({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer mock-token'
            },
            body: JSON.stringify(newEvent)
        }));

        expect(result.current.events).toEqual([{ id: 'evt1', ...newEvent }]);
    });

    it('updateEvent calls PUT with correct URL, body, and auth header', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: [{ id: 'evt1', title: 'Old Event' }] })
        });

        const { result } = renderHook(() => useEvents());
        await waitFor(() => expect(result.current.loading).toBe(false));

        const updateData = { title: 'Updated Event' };

        // Update mock
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { id: 'evt1', title: 'Updated Event' } })
        });

        // Refetch mock trigger by updateEvent calling fetchEvents again
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: [{ id: 'evt1', title: 'Updated Event' }] })
        });

        await act(async () => {
            await result.current.updateEvent('evt1', updateData);
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/events/evt1', expect.objectContaining({
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer mock-token'
            },
            body: JSON.stringify(updateData)
        }));

        expect(result.current.events).toEqual([{ id: 'evt1', title: 'Updated Event' }]);
    });

    it('deleteEvent calls DELETE with correct URL and auth header', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: [{ id: 'evt1', title: 'To Delete' }] })
        });

        const { result } = renderHook(() => useEvents());
        await waitFor(() => expect(result.current.events).toHaveLength(1));

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { success: true } })
        });

        await act(async () => {
            await result.current.deleteEvent('evt1');
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/events/evt1', expect.objectContaining({
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer mock-token'
            }
        }));

        expect(result.current.events).toHaveLength(0);
    });

    it('methods handle errors correctly', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: [] })
        });

        const { result } = renderHook(() => useEvents());
        await waitFor(() => expect(result.current.loading).toBe(false));

        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: { message: 'Failed to add event' } })
        });

        await expect(result.current.addEvent({ title: 'Fail' } as unknown as Parameters<ReturnType<typeof useEvents>['addEvent']>[0])).rejects.toThrow('Failed to add event');
    });
});
