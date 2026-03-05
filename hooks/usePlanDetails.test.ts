import { renderHook, waitFor, act } from '@testing-library/react';
import { usePlanDetails } from './usePlanDetails';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as useAuthHook from '@/hooks/useAuth';

vi.mock('@/lib/firebase', () => ({
    auth: {},
    db: {}
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('usePlanDetails Hook', () => {
    const mockGetIdToken = vi.fn().mockResolvedValue('fake-token');

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return minimal state if planId is missing or unauthenticated', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: null, loading: false, error: null
        } as any);

        const { result } = renderHook(() => usePlanDetails(null));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.plan).toBeNull();
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fetch and return detailed plan successfully', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const detailedMock = {
            id: 'p1', name: 'My Plan', semesters: [
                { id: 's1', name: 'Fall', order: 1, courses: ['CS1000'] }
            ]
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: detailedMock })
        });

        const { result } = renderHook(() => usePlanDetails('p1'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/plans/p1', expect.anything());
        expect(result.current.plan).toEqual(detailedMock);
    });

    it('should add a semester and refetch', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        mockFetch
            .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: 'p1', semesters: [] } }) }) // Initial fetch
            .mockResolvedValueOnce({ ok: true, json: async () => ({ data: {} }) }) // Post response
            .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: 'p1', semesters: [{ id: 's1' }] } }) }); // Refetch

        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.addSemester('Spring', 1);
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/plans/p1/semesters', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ name: 'Spring', order: 1 })
        }));
    });

    it('should add a course to a semester optimistically', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = {
            id: 'p1', name: 'Plan', semesters: [
                { id: 'sem1', name: 'Fall', courses: [] }
            ]
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: initialMock })
        });

        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.plan?.semesters[0].courses).toHaveLength(0));

        // Mock successful POST
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { added: true } })
        });

        await act(async () => {
            await result.current.addCourseToSemester('sem1', 'CS2510');
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/plans/p1/semesters/sem1/courses', expect.objectContaining({
            method: 'POST'
        }));

        // Optimistic UI checks out
        expect(result.current.plan?.semesters[0].courses).toEqual(
            expect.arrayContaining([expect.objectContaining({ courseId: 'CS2510' })])
        );
    });

    it('should remove a course from a semester optimistically', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = {
            id: 'p1', name: 'Plan', semesters: [
                { id: 'sem1', name: 'Fall', courses: ['CS3500'] }
            ]
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: initialMock })
        });

        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.plan?.semesters[0].courses).toContain('CS3500'));

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { removed: true } })
        });

        await act(async () => {
            await result.current.removeCourseFromSemester('sem1', 'CS3500');
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/plans/p1/semesters/sem1/courses/CS3500', expect.objectContaining({
            method: 'DELETE'
        }));

        // Optimistic UI should reflect deletion
        const isRemoved = !result.current.plan?.semesters[0].courses.some((c: any) => typeof c === 'string' ? c === 'CS3500' : c.courseId === 'CS3500');
        expect(isRemoved).toBe(true);
    });
    it('should delete a semester optimistically', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = {
            id: 'p1', name: 'Plan', semesters: [
                { id: 'sem1', name: 'Fall', courses: [] },
                { id: 'sem2', name: 'Spring', courses: [] }
            ]
        };

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });
        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.plan?.semesters).toHaveLength(2));

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { deleted: true } }) });
        await act(async () => {
            await result.current.deleteSemester('sem1');
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/plans/p1/semesters/sem1', expect.objectContaining({ method: 'DELETE' }));
        expect(result.current.plan?.semesters).toHaveLength(1);
        expect(result.current.plan?.semesters[0].id).toBe('sem2');
    });

    it('should reorder semesters optimistically', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = {
            id: 'p1', name: 'Plan', semesters: [
                { id: 'sem1', name: 'Fall', order: 1, courses: [] },
                { id: 'sem2', name: 'Spring', order: 2, courses: [] }
            ]
        };

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });
        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.plan?.semesters).toHaveLength(2));

        mockFetch.mockResolvedValue({ ok: true, json: async () => ({ data: { updated: true } }) });

        await act(async () => {
            await result.current.reorderSemesters('sem1', 1); // Move sem1 to index 1 (second place)
        });

        expect(result.current.plan?.semesters[0].id).toBe('sem2');
        expect(result.current.plan?.semesters[1].id).toBe('sem1');
        expect(result.current.plan?.semesters[0].order).toBe(1);
        expect(result.current.plan?.semesters[1].order).toBe(2);
    });

    it('should move a course between semesters optimistically', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = {
            id: 'p1', name: 'Plan', semesters: [
                { id: 'sem1', name: 'Fall', order: 1, courses: ['CS1000', 'CS2000'] },
                { id: 'sem2', name: 'Spring', order: 2, courses: [] }
            ]
        };

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });
        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.plan?.semesters).toHaveLength(2));

        mockFetch.mockResolvedValue({ ok: true, json: async () => ({ data: { updated: true } }) });

        await act(async () => {
            // Move 'CS2000' (index 1) from 'sem1' to 'sem2' at index 0
            await result.current.moveCourseBetweenSemesters('sem1', 'sem2', 1, 0);
        });

        expect(mockFetch).toHaveBeenCalledTimes(3); // 1 initial + 2 PATCH (both sems)

        expect(result.current.plan?.semesters[0].id).toBe('sem1');
        expect(result.current.plan?.semesters[0].courses).toEqual(['CS1000']);

        expect(result.current.plan?.semesters[1].id).toBe('sem2');
        expect(result.current.plan?.semesters[1].courses).toEqual(['CS2000']);
    });
});
