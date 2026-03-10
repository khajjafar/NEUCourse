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

    it('should set error when fetchPlanDetails response is not ok', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: { message: 'Plan not found' } })
        });

        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Plan not found');
        expect(result.current.plan).toBeNull();
    });

    it('addSemester throws when response is not ok', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: 'p1', semesters: [] } }) });

        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.loading).toBe(false));

        mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: { message: 'Semester failed' } }) });

        await expect(
            act(async () => { await result.current.addSemester('Fail', 0); })
        ).rejects.toThrow('Semester failed');
    });

    it('addCourseToSemester throws and reverts when response is not ok', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = { id: 'p1', name: 'Plan', semesters: [{ id: 'sem1', name: 'Fall', courses: [] }] };

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });

        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Fail the POST, then refetch (revert) returns original
        mockFetch
            .mockResolvedValueOnce({ ok: false, json: async () => ({ error: { message: 'Add course failed' } }) })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });

        await expect(
            act(async () => { await result.current.addCourseToSemester('sem1', 'CS3500'); })
        ).rejects.toThrow('Add course failed');
    });

    it('addCourseToSemester adds course with CRN', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = { id: 'p1', name: 'Plan', semesters: [{ id: 'sem1', name: 'Fall', courses: [] }] };

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });

        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.loading).toBe(false));

        mockFetch
            .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { added: true } }) })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { ...initialMock, semesters: [{ id: 'sem1', name: 'Fall', courses: [{ courseId: 'CS3500', crn: '12345' }] }] } }) });

        await act(async () => {
            await result.current.addCourseToSemester('sem1', 'CS3500', '12345');
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/plans/p1/semesters/sem1/courses', expect.objectContaining({
            body: JSON.stringify({ courseId: 'CS3500', crn: '12345' })
        }));
    });

    it('removeCourseFromSemester throws and reverts when response is not ok', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = { id: 'p1', name: 'Plan', semesters: [{ id: 'sem1', name: 'Fall', courses: ['CS3500'] }] };

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });

        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.loading).toBe(false));

        mockFetch
            .mockResolvedValueOnce({ ok: false, json: async () => ({ error: { message: 'Remove failed' } }) })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });

        await expect(
            act(async () => { await result.current.removeCourseFromSemester('sem1', 'CS3500'); })
        ).rejects.toThrow('Remove failed');
    });

    it('deleteSemester throws and reverts when response is not ok', async () => {
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

        mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: { message: 'Delete sem failed' } }) });

        await expect(
            act(async () => { await result.current.deleteSemester('sem1'); })
        ).rejects.toThrow('Delete sem failed');
    });

    it('reorderSemesters does nothing when sourceIndex equals destinationIndex', async () => {
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

        await act(async () => {
            // sem1 is at index 0, moving to index 0 = no-op
            await result.current.reorderSemesters('sem1', 0);
        });

        // No PATCH calls should have happened
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('reorderSemesters does nothing when semester not found', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = {
            id: 'p1', name: 'Plan', semesters: [{ id: 'sem1', name: 'Fall', order: 1, courses: [] }]
        };

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });
        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.reorderSemesters('non-existent', 0);
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('moveCourseBetweenSemesters within same semester updates correctly', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = {
            id: 'p1', name: 'Plan', semesters: [
                { id: 'sem1', name: 'Fall', order: 1, courses: ['CS1000', 'CS2000', 'CS3000'] }
            ]
        };

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });
        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.plan?.semesters).toHaveLength(1));

        mockFetch.mockResolvedValue({ ok: true, json: async () => ({ data: { updated: true } }) });

        await act(async () => {
            // Move CS2000 (index 1) to index 0 within sem1
            await result.current.moveCourseBetweenSemesters('sem1', 'sem1', 1, 0);
        });

        // Only one PATCH (same semester)
        const patchCalls = mockFetch.mock.calls.filter((c: any[]) => c[1]?.method === 'PATCH');
        expect(patchCalls).toHaveLength(1);
    });

    it('updateCourseAssignment returns early if semester not found', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = { id: 'p1', name: 'Plan', semesters: [{ id: 'sem1', name: 'Fall', courses: [] }] };
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });
        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Call with non-existent semId
        await act(async () => {
            await result.current.updateCourseAssignment('nonexistent-sem', 'CS3500', { requirementId: 'req1' });
        });

        // No PATCH call should have happened
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('updateCourseAssignment throws when response is not ok', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = {
            id: 'p1', name: 'Plan', semesters: [
                { id: 'sem1', name: 'Fall', courses: [{ courseId: 'CS3500' }] }
            ]
        };

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });
        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.loading).toBe(false));

        mockFetch
            .mockResolvedValueOnce({ ok: false, json: async () => ({ error: { message: 'Update assignment failed' } }) })
            .mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });

        await expect(
            act(async () => { await result.current.updateCourseAssignment('sem1', 'CS3500', { requirementId: 'req1' }); })
        ).rejects.toThrow('Update assignment failed');
    });

    it('reorderSemesters refetches plan when fetch fails (catch block)', async () => {
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

        // Make PATCH fail to trigger catch block, then refetch succeeds
        mockFetch
            .mockRejectedValueOnce(new Error('PATCH failed'))
            .mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });

        await act(async () => {
            await result.current.reorderSemesters('sem1', 1);
        });

        // After catch, plan is refetched (1 initial + 2 PATCHes + 1 refetch = 4)
        expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('moveCourseBetweenSemesters refetches when fetch fails (catch block)', async () => {
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

        // Fail the PATCH, then refetch succeeds
        mockFetch
            .mockRejectedValueOnce(new Error('Network failed'))
            .mockRejectedValueOnce(new Error('Network failed'))
            .mockResolvedValueOnce({ ok: true, json: async () => ({ data: initialMock }) });

        await act(async () => {
            await result.current.moveCourseBetweenSemesters('sem1', 'sem2', 0, 0);
        });

        // fetchPlanDetails was called on catch
        expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('should update a course assignment optimistically', async () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { uid: 'u1', getIdToken: mockGetIdToken }, loading: false, error: null
        } as any);

        const initialMock = {
            id: 'p1', name: 'Plan', semesters: [
                { id: 'sem1', name: 'Fall', courses: ['CS3500', { courseId: 'CS2510' }] }
            ]
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: initialMock })
        });

        const { result } = renderHook(() => usePlanDetails('p1'));
        await waitFor(() => expect(result.current.plan?.semesters[0].courses).toHaveLength(2));

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { updated: true } })
        });

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { updated: true } })
        });

        await act(async () => {
            await result.current.updateCourseAssignment('sem1', 'CS3500', { requirementId: 'req1' });
        });
        await act(async () => {
            await result.current.updateCourseAssignment('sem1', 'CS2510', { requirementId: 'req2', crn: '12345' });
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/v1/plans/p1/semesters/sem1', expect.objectContaining({
            method: 'PATCH'
        }));

        const finalCourses = result.current.plan?.semesters[0].courses as any[];
        expect(finalCourses[0]).toEqual(expect.objectContaining({ courseId: 'CS3500', requirementId: 'req1' }));
        expect(finalCourses[1]).toEqual(expect.objectContaining({ courseId: 'CS2510', requirementId: 'req2', crn: '12345' }));
    });

});
