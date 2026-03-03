import React from "react";
import { CourseData } from "@/hooks/useCourseSearch";

interface CourseCardProps {
    course: CourseData;
}

export default function CourseCard({ course }: CourseCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {course.subject} {course.number}: {course.name}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                        {course.creditHours} Credits
                    </span>
                </div>

                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {course.description}
                </p>

                {(course.prereqs.length > 0 || course.coreqs.length > 0) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        {course.prereqs.length > 0 && (
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Prereqs:</span>
                                <div className="flex flex-wrap gap-1">
                                    {course.prereqs.map((pr) => (
                                        <span key={pr} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                            {pr}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {course.coreqs.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coreqs:</span>
                                <div className="flex flex-wrap gap-1">
                                    {course.coreqs.map((cr) => (
                                        <span key={cr} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
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
    );
}
