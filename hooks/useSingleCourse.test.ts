import { renderHook, waitFor } from '@testing-library/react';
import { useSingleCourse, courseCache, inFlightPromises } from './useSingleCourse';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useSingleCourse', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        global.fetch = vi.fn();
        courseCache.clear();
        inFlightPromises.clear();
    });

    it('should initialize with default states and not fetch if courseId is null', () => {
        const { result } = renderHook(() => useSingleCourse(null));
        expect(result.current.course).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch and update course data successfully', async () => {
        const mockCourse = {
            id: 'CS3500',
            subject: 'CS',
            number: '3500',
            name: 'Object-Oriented Design',
            description: 'A test description',
            creditHours: 4,
            prereqs: ['CS2510'],
            coreqs: []
        };

        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: mockCourse }),
        });

        const { result } = renderHook(() => useSingleCourse('CS3500'));

        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.course).toEqual(mockCourse);
            expect(result.current.error).toBeNull();
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/v1/courses/CS3500');
    });

    it('should handle API missing 404 errors', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: false,
            status: 404,
        });

        const { result } = renderHook(() => useSingleCourse('UNKNOWN_ID'));

        await waitFor(() => {
            expect(result.current.error).toBe('Course UNKNOWN_ID not found.');
            expect(result.current.loading).toBe(false);
            expect(result.current.course).toBeNull();
        });
    });

    it('should handle generic API errors attached inside JSON payload', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ error: { message: "Internal Server Fault" } }),
        });

        const { result } = renderHook(() => useSingleCourse('CS3500'));

        await waitFor(() => {
            expect(result.current.error).toBe("Internal Server Fault");
            expect(result.current.loading).toBe(false);
            expect(result.current.course).toBeNull();
        });
    });

    it('returns cached course without fetching (cache hit)', async () => {
        const mockCourse = { id: 'CS2500', name: 'Fundamentals' } as any;
        courseCache.set('CS2500', mockCourse);

        const { result } = renderHook(() => useSingleCourse('CS2500'));

        await waitFor(() => {
            expect(result.current.course).toEqual(mockCourse);
            expect(result.current.loading).toBe(false);
        });

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deduplicates in-flight requests for the same courseId', async () => {
        const mockCourse = { id: 'CS3800', name: 'Theory of Computation' } as any;

        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            json: async () => ({ data: mockCourse }),
        });

        const { result: r1 } = renderHook(() => useSingleCourse('CS3800'));
        const { result: r2 } = renderHook(() => useSingleCourse('CS3800'));

        await waitFor(() => {
            expect(r1.current.course).toEqual(mockCourse);
            expect(r2.current.course).toEqual(mockCourse);
        });

        // Only one fetch should have happened despite two hooks
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('handles non-404 server error (5xx)', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        const { result } = renderHook(() => useSingleCourse('CS4410'));

        await waitFor(() => {
            expect(result.current.error).toBe('Failed to fetch course data.');
            expect(result.current.loading).toBe(false);
        });
    });

    it('handles error when thrown value is not an Error instance', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce('network failure string');

        const { result } = renderHook(() => useSingleCourse('CS4500'));

        await waitFor(() => {
            expect(result.current.error).toBe('An unknown error occurred.');
            expect(result.current.loading).toBe(false);
        });
    });
});
