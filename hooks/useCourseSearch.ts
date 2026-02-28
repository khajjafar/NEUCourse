import { useState, useCallback, useEffect } from 'react';

export interface Course {
    id: string;
    name?: string;
    courseName?: string;
    number?: string;
    courseNumber?: string;
    subject?: string;
    credits?: number;
    creditHours?: number;
    description?: string;
    prereqs?: string[];
    coreqs?: string[];
}

export function useCourseSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [results, setResults] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCourses = useCallback(async (query: string, subject: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (query) params.append('q', query);
            if (subject) params.append('subject', subject);

            const res = await fetch(`/api/v1/courses?${params.toString()}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error?.message || 'Failed to fetch courses');
            }

            setResults(data.data || []);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchCourses(searchQuery, subjectFilter);
        }, 300); // 300ms debounce

        return () => clearTimeout(handler);
    }, [searchQuery, subjectFilter, fetchCourses]);

    return {
        searchQuery,
        setSearchQuery,
        subjectFilter,
        setSubjectFilter,
        results,
        isLoading,
        error,
    };
}
