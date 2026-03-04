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
        minLevel, setMinLevel,
        maxLevel, setMaxLevel,
        courses, loading, error
    } = useCourseSearch();

    return (
        <main className="min-h-screen bg-gray-50">
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
                    <div className="sm:w-48">
                        <label htmlFor="minLevel" className="sr-only">Min Level</label>
                        <select
                            id="minLevel"
                            className="w-full rounded-lg border-gray-300 border px-4 py-2.5 bg-gray-50 hover:bg-white focus:bg-white transition-colors focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            value={minLevel}
                            onChange={(e) => setMinLevel(e.target.value === "ALL" ? "" : e.target.value)}
                        >
                            <option value="ALL">Min Level</option>
                            <option value="1000">1000</option>
                            <option value="2000">2000</option>
                            <option value="3000">3000</option>
                            <option value="4000">4000</option>
                            <option value="5000">5000</option>
                            <option value="6000">6000</option>
                        </select>
                    </div>
                    <div className="sm:w-48">
                        <label htmlFor="maxLevel" className="sr-only">Max Level</label>
                        <select
                            id="maxLevel"
                            className="w-full rounded-lg border-gray-300 border px-4 py-2.5 bg-gray-50 hover:bg-white focus:bg-white transition-colors focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            value={maxLevel}
                            onChange={(e) => setMaxLevel(e.target.value === "ALL" ? "" : e.target.value)}
                        >
                            <option value="ALL">Max Level</option>
                            <option value="1999">1999</option>
                            <option value="2999">2999</option>
                            <option value="3999">3999</option>
                            <option value="4999">4999</option>
                            <option value="5999">5999</option>
                            <option value="6999">6999</option>
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
