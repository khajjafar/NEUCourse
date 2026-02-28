import React from 'react';
import { Course } from '@/hooks/useCourseSearch';
import { BookOpen } from 'lucide-react';

interface CourseCardProps {
    course: Course;
    onClick: (course: Course) => void;
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
    const displayTitle = course.name || course.courseName || 'Unknown Course';
    const displayNumber = course.number || course.courseNumber || '0000';
    const displaySubject = course.subject || 'SUBJ';
    const displayCredits = course.credits || course.creditHours || 4;

    return (
        <div
            onClick={() => onClick(course)}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {displaySubject} {displayNumber}
                    </span>
                    <span className="text-gray-500 text-sm flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {displayCredits} credits
                    </span>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{displayTitle}</h3>

            <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow">
                {course.description || 'No description available for this course.'}
            </p>

            {(course.prereqs && course.prereqs.length > 0) && (
                <div className="mt-auto pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">
                        Prerequisites: <span className="text-gray-700">{course.prereqs.join(', ')}</span>
                    </p>
                </div>
            )}
        </div>
    );
}
