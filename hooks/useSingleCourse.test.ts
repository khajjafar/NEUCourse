import { renderHook, waitFor } from '@testing-library/react';
import { useSingleCourse } from './useSingleCourse';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useSingleCourse', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        global.fetch = vi.fn();
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
});
