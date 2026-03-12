/**
 * @fileoverview Hook for searching and filtering pre-scraped NEU courses.
 *
 * Fetches from GET /api/v1/courses with a 300ms debounce on query changes.
 * All filtering (subject, course level range) is handled server-side.
 * Client components should not call Firestore directly — this hook is the
 * correct abstraction.
 */

import { useState, useEffect } from "react";

/** A single section offering of a course (CRN, meeting times, professor, etc.). */
export interface ClassSection {
    crn: string;
    seats: string;
    meetingTimes: string;
    rooms: string;
    professor: string;
    campus: string;
}

/** Full course data as stored in Firestore and returned by /api/v1/courses. */
export interface CourseData {
    id: string;
    subject: string;
    number: string;
    name: string;
    description: string;
    creditHours: number;
    prereqs: string[];
    coreqs: string[];
    sections?: ClassSection[];
}

/**
 * Manages course search state and fetches matching courses from the API.
 * Debounces query/filter changes by 300ms to avoid excessive API calls.
 *
 * @returns Search state (query, subject, level range, courses, loading, error)
 *          and setter functions for each filter field
 */
export function useCourseSearch() {
    const [query, setQuery] = useState("");
    const [subject, setSubject] = useState("");
    const [minLevel, setMinLevel] = useState("");
    const [maxLevel, setMaxLevel] = useState("");
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
                if (minLevel) searchParams.append("minLevel", minLevel);
                if (maxLevel) searchParams.append("maxLevel", maxLevel);

                const res = await fetch(`/api/v1/courses?${searchParams.toString()}`);

                if (!res.ok) {
                    throw new Error("Failed to fetch courses");
                }

                const json = await res.json();
                if (json.error) {
                    throw new Error(json.error.message);
                }

                setCourses(json.data || []);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchCourses, 300); // 300ms debounce
        return () => clearTimeout(timeoutId);

    }, [query, subject, minLevel, maxLevel]);

    return {
        query,
        setQuery,
        subject,
        setSubject,
        minLevel,
        setMinLevel,
        maxLevel,
        setMaxLevel,
        courses,
        loading,
        error
    };
}
