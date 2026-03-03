import { useState, useEffect } from "react";
import { CourseData } from "./useCourseSearch";

export function useSingleCourse(courseId: string | null) {
    const [course, setCourse] = useState<CourseData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!courseId) {
            setCourse(null);
            setLoading(false);
            setError(null);
            return;
        }

        const fetchCourse = async () => {
            setLoading(true);
            setError(null);

            try {
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

                setCourse(json.data);
            } catch (err: any) {
                setError(err.message || "An unknown error occurred.");
                setCourse(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    return {
        course,
        loading,
        error
    };
}
