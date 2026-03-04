'use client';

import React from 'react';
import { useSingleCourse } from '@/hooks/useSingleCourse';
import Link from 'next/link';

interface CourseMiniCardProps {
    courseId: string;
    crn?: string;
    onRemove?: () => void;
}

export default function CourseMiniCard({ courseId, crn, onRemove }: CourseMiniCardProps) {
    const { course, loading, error } = useSingleCourse(courseId);

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

    return (
        <div className="group relative flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
            <Link href={`/courses/${course.id}`} className="flex-1 min-w-0 pr-4">
                <div className="flex items-baseline space-x-2">
                    <span className="text-sm font-bold text-gray-900">{course.subject} {course.number}</span>
                    <span className="text-sm text-gray-500 truncate">{course.name}</span>
                </div>
            </Link>

            <div className="flex items-center space-x-4 flex-shrink-0">
                {crn && (
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded shadow-sm">
                        Sec: {crn}
                    </span>
                )}
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
    );
}
