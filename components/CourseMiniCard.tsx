'use client';

import React from 'react';
import { useSingleCourse } from '@/hooks/useSingleCourse';
import Link from 'next/link';
import { GraduationRequirement } from '@/hooks/usePlans';

interface CourseMiniCardProps {
    courseId: string;
    crn?: string;
    onRemove?: () => void;
    allPlanCourses?: { courseId: string, semesterOrder: number }[];
    currentSemesterOrder?: number;
    requirements?: GraduationRequirement[];
    currentRequirementId?: string;
    onUpdateAssignment?: (requirementId?: string) => void;
}

export default function CourseMiniCard({ courseId, crn, onRemove, allPlanCourses, currentSemesterOrder, requirements, currentRequirementId, onUpdateAssignment }: CourseMiniCardProps) {
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

    const missingPrereqs: string[] = course && allPlanCourses && currentSemesterOrder ?
        course.prereqs.filter(pr => !allPlanCourses.some(c => c.courseId === pr && c.semesterOrder < currentSemesterOrder)) : [];

    const missingCoreqs: string[] = course && allPlanCourses && currentSemesterOrder ?
        course.coreqs.filter(cr => !allPlanCourses.some(c => c.courseId === cr && c.semesterOrder <= currentSemesterOrder)) : [];

    return (
        <div className="group relative flex flex-col p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <Link href={`/courses/${course.id}`} className="flex-1 min-w-0 pr-4">
                    <div className="flex items-baseline space-x-2">
                        <span className="text-sm font-bold text-gray-900">{course.subject} {course.number}</span>
                        <span className="text-sm text-gray-500 truncate">{course.name}</span>
                    </div>
                </Link>

                <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                        {course.creditHours} cr
                    </span>

                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 text-sm font-medium focus:opacity-100"
                            aria-label={`Remove ${course.subject} ${course.number}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-end mt-1">
                <div className="flex flex-col gap-1 items-start">
                    {missingPrereqs.length > 0 && (
                        <span
                            className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded shadow-sm"
                            aria-label={`Missing prerequisites: ${missingPrereqs.join(", ")}`}
                            title={`Prereq needed: ${missingPrereqs.join(", ")}`}
                        >
                            Prereq needed: {missingPrereqs.join(", ")}
                        </span>
                    )}
                    {missingCoreqs.length > 0 && (
                        <span
                            className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded shadow-sm"
                            aria-label={`Missing corequisites: ${missingCoreqs.join(", ")}`}
                            title={`Coreq needed: ${missingCoreqs.join(", ")}`}
                        >
                            Coreq needed: {missingCoreqs.join(", ")}
                        </span>
                    )}
                </div>
                {crn && (
                    <span className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                        Sec: {crn}
                    </span>
                )}
            </div>

            {requirements && requirements.length > 0 && onUpdateAssignment && (
                <div
                    className="mt-2 pt-2 border-t border-gray-100"
                    onPointerDown={e => e.stopPropagation()}
                    onMouseDown={e => e.stopPropagation()}
                >
                    <select
                        value={currentRequirementId || ''}
                        onChange={(e) => onUpdateAssignment(e.target.value || undefined)}
                        className="block w-full text-xs py-1 px-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-700 cursor-pointer hover:bg-white transition-colors"
                        title="Assign to requirement"
                    >
                        <option value="">None</option>
                        {requirements.map(req => (
                            <option key={req.id} value={req.id}>{req.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
