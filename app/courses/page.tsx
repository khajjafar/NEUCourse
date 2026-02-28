'use client';

import React, { useState } from 'react';
import { useCourseSearch, Course } from '@/hooks/useCourseSearch';
import CourseCard from '@/components/CourseCard';
import CourseDetailModal from '@/components/CourseDetailModal';
import { Search, Filter, Loader2, BookX, AlertCircle } from 'lucide-react';

const COMMON_SUBJECTS = ['CS', 'DS', 'CY', 'MATH', 'PHYS', 'ENGW', 'ENGL', 'ACCT', 'FINA', 'MKTG'];

export default function CourseSearchPage() {
    const {
        searchQuery,
        setSearchQuery,
        subjectFilter,
        setSubjectFilter,
        results,
        isLoading,
        error,
    } = useCourseSearch();

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const handleCardClick = (course: Course) => {
        setSelectedCourse(course);
    };

    const closeDetail = () => {
        setSelectedCourse(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                        Course Catalog
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Search courses, check prerequisites, and start planning your path to graduation at Northeastern University.
                    </p>
                </div>

                {/* Search & Filter Controls */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow sm:text-sm"
                            placeholder="Search by course name, number, or keyword..."
                        />
                    </div>

                    <div className="relative min-w-[200px] w-full md:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none transition-shadow sm:text-sm"
                        >
                            <option value="">All Subjects</option>
                            {COMMON_SUBJECTS.map((subj) => (
                                <option key={subj} value={subj}>
                                    {subj}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 font-medium">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Grid / Loading State */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-red-500" />
                        <p className="font-medium text-gray-600">Searching courses...</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {results.map((course) => (
                            <CourseCard key={course.id} course={course} onClick={handleCardClick} />
                        ))}
                    </div>
                ) : (
                    !error && (
                        <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 border-dashed">
                            <BookX className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No courses found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                We couldn't find any courses matching "{searchQuery}". Try adjusting your search term or subject filter.
                            </p>
                        </div>
                    )
                )}
            </div>

            {selectedCourse && (
                <CourseDetailModal course={selectedCourse} onClose={closeDetail} />
            )}
        </div>
    );
}
