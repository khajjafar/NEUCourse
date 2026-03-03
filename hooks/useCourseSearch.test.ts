import { renderHook, waitFor } from '@testing-library/react';
import { useCourseSearch } from './useCourseSearch';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useCourseSearch', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        global.fetch = vi.fn();
    });

    it('should initialize with default states', () => {
        const { result } = renderHook(() => useCourseSearch());
        expect(result.current.query).toBe('');
        expect(result.current.subject).toBe('');
        expect(result.current.courses).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should fetch and update courses data', async () => {
        const mockCourses = [{ id: 'CS1234', name: 'Test Course', subject: 'CS', number: '1234' }];

        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: mockCourses })
        });

        const { result } = renderHook(() => useCourseSearch());

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/v1/courses?');
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.courses).toEqual(mockCourses);
            expect(result.current.error).toBeNull();
        });
    });

    it('should handle API errors', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: { message: 'Failed to fetch courses' } })
        });

        const { result } = renderHook(() => useCourseSearch());

        await waitFor(() => {
            expect(result.current.error).toBe('Failed to fetch courses');
            expect(result.current.loading).toBe(false);
            expect(result.current.courses).toEqual([]);
        });
    });
});
