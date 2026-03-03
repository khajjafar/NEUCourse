"use client";

import React from "react";
import { useCourseSearch } from "@/hooks/useCourseSearch";
import CourseCard from "@/components/CourseCard";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const SUBJECTS = [
    "ALL",
    "CS",
    "MATH",
    "BUSN",
    "ENGW",
    "PHYS",
    "BIOL",
    "CHEM"
];

export default function CoursesPage() {
    const {
        query, setQuery,
        subject, setSubject,
        courses, loading, error
    } = useCourseSearch();

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-500 hover:text-red-600 transition-colors">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Browse Courses</h1>
                    </div>
                    <Link href="/login" className="text-sm font-medium text-red-600 hover:text-red-700">
                        Sign In
                    </Link>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Bar & Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="search" className="sr-only">Search courses</label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Search by name, course number (e.g. CS 3500)..."
                            className="w-full rounded-lg border-gray-300 border px-4 py-2.5 bg-gray-50 hover:bg-white focus:bg-white transition-colors focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="sm:w-48">
                        <label htmlFor="subject" className="sr-only">Filter by Subject</label>
                        <select
                            id="subject"
                            className="w-full rounded-lg border-gray-300 border px-4 py-2.5 bg-gray-50 hover:bg-white focus:bg-white transition-colors focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value === "ALL" ? "" : e.target.value)}
                        >
                            {SUBJECTS.map(sub => (
                                <option key={sub} value={sub}>{sub === "ALL" ? "All Subjects" : sub}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Status & Results */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                        <p className="mt-4 text-gray-500 font-medium">Loading courses...</p>
                    </div>
                ) : courses.length === 0 && !error ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                        <p className="text-lg text-gray-900 font-semibold">No courses found.</p>
                        <p className="text-gray-500 mt-1">Try adjusting your search terms or subject filters.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="text-sm text-gray-500 font-medium mb-2">
                            Showing {courses.length} results
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courses.map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
