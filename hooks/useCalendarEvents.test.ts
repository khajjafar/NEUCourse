import { renderHook, waitFor, act } from '@testing-library/react';
import { useCalendarEvents } from './useCalendarEvents';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as useAuthHook from '@/hooks/useAuth';

vi.mock('@/lib/firebase', () => ({
    auth: {},
    db: {}
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useCalendarEvents Hook', () => {
    const mockGetIdToken = vi.fn().mockResolvedValue('fake-jwt-token');

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return empty events when user is not authenticated', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: null,
            loading: false,
            error: null
        } as any);

        const { result } = renderHook(() => useCalendarEvents());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.events).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it('should fetch and return events when user is authenticated', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'user123', getIdToken: mockGetIdToken },
            loading: false,
            error: null
        } as any);

        const mockEvents = [{ id: 'evt1', title: 'Math', days: ['Monday'], startTime: '09:00', endTime: '10:00' }];

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: mockEvents })
        });

        const { result } = renderHook(() => useCalendarEvents());

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(mockGetIdToken).toHaveBeenCalled();
        expect(mockFetch).toHaveBeenCalledWith('/api/v1/events', expect.objectContaining({
            headers: { Authorization: 'Bearer fake-jwt-token' }
        }));
        expect(result.current.events).toEqual(mockEvents);
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

        const { result } = renderHook(() => useCalendarEvents());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.events).toEqual([]);
        expect(result.current.error).toBe('Database failure');
    });

    it('should create an event and refetch', async () => {
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

        const { result } = renderHook(() => useCalendarEvents());
        await waitFor(() => expect(result.current.loading).toBe(false));

        const newEventData = { title: 'CS3500', days: ['Tuesday', 'Friday'], startTime: '13:30', endTime: '15:10' };

        // Create mock
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { id: 'evt1', ...newEventData } })
        });

        // Refetch mock trigger
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: [{ id: 'evt1', ...newEventData }] })
        });

        await act(async () => {
            await result.current.createEvent(newEventData);
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/events', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(newEventData)
        }));

        expect(result.current.events).toHaveLength(1);
        expect(result.current.events[0].title).toBe('CS3500');
    });

    it('should update an event and refetch', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'user123', getIdToken: mockGetIdToken },
            loading: false,
            error: null
        } as any);

        const initialEvents = [{ id: 'evt1', title: 'CS3500', days: ['Tuesday'], startTime: '13:30', endTime: '15:10' }];

        // Initial fetch mock
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: initialEvents })
        });

        const { result } = renderHook(() => useCalendarEvents());
        await waitFor(() => expect(result.current.loading).toBe(false));

        const updateData = { title: 'CS3500 Updated', days: ['Tuesday', 'Friday'], startTime: '13:30', endTime: '15:10' };

        // Update mock
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { id: 'evt1', ...updateData } })
        });

        // Refetch mock trigger
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: [{ id: 'evt1', ...updateData }] })
        });

        await act(async () => {
            await result.current.updateEvent('evt1', updateData);
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/events/evt1', expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updateData)
        }));

        expect(result.current.events).toHaveLength(1);
        expect(result.current.events[0].title).toBe('CS3500 Updated');
    });

    it('should delete an event and update UI optimistically', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'user123', getIdToken: mockGetIdToken },
            loading: false,
            error: null
        } as any);

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: [{ id: 'evt1', title: 'To Delete', days: ['Monday'], startTime: '09:00', endTime: '10:00' }] })
        });

        const { result } = renderHook(() => useCalendarEvents());
        await waitFor(() => expect(result.current.events).toHaveLength(1));

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { deleted: true } })
        });

        await act(async () => {
            await result.current.deleteEvent('evt1');
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/events/evt1', expect.objectContaining({
            method: 'DELETE'
        }));

        expect(result.current.events).toHaveLength(0);
    });
});
