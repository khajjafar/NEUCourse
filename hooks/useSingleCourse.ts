import { useState, useEffect } from "react";
import { CourseData } from "./useCourseSearch";

export const courseCache = new Map<string, CourseData>();
export const inFlightPromises = new Map<string, Promise<CourseData>>();

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
