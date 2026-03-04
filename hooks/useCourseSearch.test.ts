import { renderHook, waitFor, act } from "@testing-library/react";
import { useCourseSearch } from "./useCourseSearch";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useCourseSearch hook", () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should fetch courses successfully with query, subject, and level parameters", async () => {
        const mockData = { data: [{ id: "CS5002", subject: "CS", number: "5002" }] };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        const { result } = renderHook(() => useCourseSearch());

        act(() => {
            result.current.setQuery("test query");
            result.current.setSubject("CS");
            result.current.setLevel("5000");
        });

        // Fast-forward debounce timeout
        await act(async () => {
            await new Promise(r => setTimeout(r, 350));
        });

        await waitFor(() => {
            expect(result.current.courses).toEqual(mockData.data);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);

            // Should properly format query params
            expect(mockFetch).toHaveBeenCalledWith(
                "/api/v1/courses?q=test+query&subject=CS&level=5000"
            );
        });
    });

    it("should handle API errors", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
        });

        const { result } = renderHook(() => useCourseSearch());

        await act(async () => {
            await new Promise(r => setTimeout(r, 350));
        });

        await waitFor(() => {
            expect(result.current.error).toBe("Failed to fetch courses");
            expect(result.current.courses).toEqual([]);
            expect(result.current.loading).toBe(false);
        });
    });
});
