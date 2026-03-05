'use client';

import React, { useState } from 'react';
import { useSingleCourse } from '@/hooks/useSingleCourse';
import Link from 'next/link';
import AddToCalendarButton from './AddToCalendarButton';

interface PlanCourseItemProps {
    courseId: string;
    onRemove?: () => void;
}

export default function PlanCourseItem({ courseId, onRemove }: PlanCourseItemProps) {
    const { course, loading, error } = useSingleCourse(courseId);
    const [isExpanded, setIsExpanded] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 shadow-sm">
                <span className="text-sm text-red-600">Failed to load course: {courseId}</span>
                {onRemove && (
                    <button onClick={onRemove} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                )}
            </div>
        );
    }

    const hasSections = course.sections && course.sections.length > 0;

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 transition-colors overflow-hidden">
            <div className="p-3 flex items-center justify-between group relative">
                <div className="flex-1 min-w-0 pr-4 flex items-center gap-3">
                    <Link href={`/courses/${course.id}`} className="hover:underline">
                        <div className="flex items-baseline space-x-2">
                            <span className="text-sm font-bold text-gray-900 truncate">{course.subject} {course.number}</span>
                            <span className="text-sm text-gray-500 truncate hidden sm:inline">{course.name}</span>
                        </div>
                    </Link>
                    {hasSections && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                        >
                            {isExpanded ? 'Hide Sections' : 'View Sections / Calendar'}
                        </button>
                    )}
                </div>

                <div className="flex items-center space-x-4 flex-shrink-0">
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {course.creditHours} CR
                    </span>

                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 text-sm font-medium focus:opacity-100"
                            aria-label={`Remove ${course.subject} ${course.number}`}
                        >
                            Remove
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && hasSections && (
                <div className="border-t border-gray-100 bg-gray-50 p-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Available Sections</h4>
                    <ul className="space-y-2">
                        {course.sections!.map((section, idx) => (
                            <li key={idx} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-200 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 flex-1 min-w-0 pr-4">
                                    <span className="font-medium text-gray-900 w-24">CRN: {section.crn}</span>
                                    <span className="text-gray-600 text-xs sm:text-sm truncate w-40">{section.meetingTimes}</span>
                                    <span className="text-gray-500 text-xs hidden md:inline truncate">{section.professor}</span>
                                </div>
                                <div className="flex-shrink-0 ml-2">
                                    <AddToCalendarButton
                                        courseId={`${course.subject} ${course.number}`}
                                        courseName={course.name}
                                        section={section}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
