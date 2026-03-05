'use client';

import React from 'react';
import { useSingleCourse } from '@/hooks/useSingleCourse';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface Semester {
    id: string;
    name: string;
    order: number;
    courses: string[];
}

interface PrereqWarningProps {
    courseId: string;
    semester: Semester;
    allSemesters: Semester[];
}

export default function PrereqWarning({ courseId, semester, allSemesters }: PrereqWarningProps) {
    const { course, loading } = useSingleCourse(courseId);

    if (loading || !course) {
        return null;
    }

    const missingPrereqs: string[] = [];
    const missingCoreqs: string[] = [];

    // Collect courses from eariler semesters
    const earlierSemesters = allSemesters.filter(s => s.order < semester.order);
    const earlierCourses = new Set<string>();
    earlierSemesters.forEach(s => s.courses.forEach(c => earlierCourses.add(c)));

    // Check prerequisites
    if (course.prereqs && course.prereqs.length > 0) {
        course.prereqs.forEach(prereq => {
            if (!earlierCourses.has(prereq)) {
                missingPrereqs.push(prereq);
            }
        });
    }

    // Check co-requisites (must be in the same semester)
    const currentSemesterCourses = new Set(semester.courses);
    if (course.coreqs && course.coreqs.length > 0) {
        course.coreqs.forEach(coreq => {
            if (!currentSemesterCourses.has(coreq) && courseId !== coreq) { // Ensure course doesn't block on itself
                missingCoreqs.push(coreq);
            }
        });
    }

    if (missingPrereqs.length === 0 && missingCoreqs.length === 0) {
        return null;
    }

    return (
        <div
            className="mt-2 space-y-1"
            aria-label={`Requirements missing for ${courseId}`}
            role="alert"
        >
            {missingPrereqs.map(prereqId => (
                <div key={`prereq-${prereqId}`} className="flex items-start p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                    <ExclamationCircleIcon className="w-5 h-5 text-amber-500 mr-1.5 flex-shrink-0" />
                    <span>
                        Missing prerequisite: <span className="font-semibold">{prereqId}</span> (not found in earlier semesters)
                    </span>
                </div>
            ))}

            {missingCoreqs.map(coreqId => (
                <div key={`coreq-${coreqId}`} className="flex items-start p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                    <ExclamationCircleIcon className="w-5 h-5 text-amber-500 mr-1.5 flex-shrink-0" />
                    <span>
                        Missing co-requisite: <span className="font-semibold">{coreqId}</span> (not found in this semester)
                    </span>
                </div>
            ))}
        </div>
    );
}
