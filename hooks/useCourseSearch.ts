import { useState, useEffect } from "react";

export interface CourseData {
    id: string;
    subject: string;
    number: string;
    name: string;
    description: string;
    creditHours: number;
    prereqs: string[];
    coreqs: string[];
}

export function useCourseSearch() {
    const [query, setQuery] = useState("");
    const [subject, setSubject] = useState("");
    const [courses, setCourses] = useState<CourseData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);

            try {
                const searchParams = new URLSearchParams();
                if (query) searchParams.append("q", query);
                if (subject) searchParams.append("subject", subject);

                const res = await fetch(`/api/v1/courses?${searchParams.toString()}`);

                if (!res.ok) {
                    throw new Error("Failed to fetch courses");
                }

                const json = await res.json();
                if (json.error) {
                    throw new Error(json.error.message);
                }

                setCourses(json.data || []);
            } catch (err: any) {
                setError(err.message || "An unknown error occurred.");
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchCourses, 300); // 300ms debounce
        return () => clearTimeout(timeoutId);

    }, [query, subject]);

    return {
        query,
        setQuery,
        subject,
        setSubject,
        courses,
        loading,
        error
    };
}
