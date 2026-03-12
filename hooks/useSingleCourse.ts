/**
 * @fileoverview Hook and utilities for fetching a single course by ID with caching.
 *
 * The module-level cache (courseCache) persists across renders to avoid
 * redundant API calls. inFlightPromises deduplicates simultaneous requests
 * for the same courseId — critical when multiple components mount concurrently.
 */

import { useState, useEffect } from "react";
import { CourseData } from "./useCourseSearch";

/** Module-level cache mapping courseId → CourseData to persist across renders. */
export const courseCache = new Map<string, CourseData>();

/** Tracks in-flight fetch promises to prevent duplicate concurrent requests. */
export const inFlightPromises = new Map<string, Promise<CourseData>>();

/**
 * Fetches a course by ID, using the module-level cache and in-flight deduplication.
 *
 * @param courseId - The course identifier (e.g. "CS3500")
 * @returns Resolved CourseData from cache or API
 * @throws Error if the course is not found (404) or the API fails
 */
export async function fetchCourseCached(courseId: string): Promise<CourseData> {
    if (courseCache.has(courseId)) {
        return courseCache.get(courseId)!;
    }

    if (inFlightPromises.has(courseId)) {
        return inFlightPromises.get(courseId)!;
    }

    const promise = (async () => {
        const res = await fetch(`/api/v1/courses/${encodeURIComponent(courseId)}`);
        if (!res.ok) {
            if (res.status === 404) {
                throw new Error(`Course ${courseId} not found.`);
            }
            throw new Error("Failed to fetch course data.");
        }
        const json = await res.json();
        if (json.error) {
            throw new Error(json.error.message);
        }
        courseCache.set(courseId, json.data);
        return json.data;
    })().finally(() => {
        inFlightPromises.delete(courseId);
    });

    inFlightPromises.set(courseId, promise);
    return promise;
}

/**
 * React hook that fetches and returns a single course, using the module-level cache.
 * Initializes synchronously from cache if available to avoid a loading flash.
 *
 * @param courseId - The course identifier, or null to skip fetching
 * @returns course data (or null), loading boolean, and error string
 */
export function useSingleCourse(courseId: string | null) {
    const [course, setCourse] = useState<CourseData | null>(courseId ? courseCache.get(courseId) || null : null);
    const [loading, setLoading] = useState(courseId ? !courseCache.has(courseId) : false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!courseId) {
            setCourse(null);
            setLoading(false);
            setError(null);
            return;
        }

        let mounted = true;

        const loadCourse = async () => {
            if (!courseCache.has(courseId)) {
                setLoading(true);
            }
            setError(null);

            try {
                const data = await fetchCourseCached(courseId);
                if (mounted) {
                    setCourse(data);
                }
            } catch (err: unknown) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : "An unknown error occurred.");
                    setCourse(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadCourse();

        return () => {
            mounted = false;
        };
    }, [courseId]);

    return {
        course,
        loading,
        error
    };
}
