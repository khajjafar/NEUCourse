/**
 * @fileoverview Clickable course card for the course search/browse page. Renders course subject,
 * number, name, credit hours, prerequisites, and co-requisites. The entire card is a Next.js
 * Link to the course detail page.
 */

import React from "react";
import { CourseData } from "@/hooks/useCourseSearch";
import Link from 'next/link';

interface CourseCardProps {
    course: CourseData;
}

/**
 * Displays a course as a linked card with prereq/coreq badges.
 * @param props - Component props
 * @param props.course - The course data to display
 * @returns A Next.js Link wrapping the course card UI
 */
export default function CourseCard({ course }: CourseCardProps) {
    return (
        <Link href={`/courses/${course.id}`} className="block group h-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full">
                <div className="p-5">
                    <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                            {course.subject} {course.number}: {course.name}
                        </h3>
                        <span className="inline-flex items-center shrink-0 whitespace-nowrap rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            {course.creditHours} cr
                        </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                        {course.description}
                    </p>

                    {(course.prereqs.length > 0 || course.coreqs.length > 0) && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            {course.prereqs.length > 0 && (
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-orange-500">Prereqs:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {course.prereqs.map((pr) => (
                                            <span key={pr} className="text-sm text-orange-500">
                                                {pr}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {course.coreqs.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-blue-500">Coreqs:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {course.coreqs.map((cr) => (
                                            <span key={cr} className="text-sm text-blue-500">
                                                {cr}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
