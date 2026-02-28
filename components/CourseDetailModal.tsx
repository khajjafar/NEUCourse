import React from 'react';
import { Course } from '@/hooks/useCourseSearch';
import { BookOpen, X, Calendar, AlertCircle } from 'lucide-react';

interface CourseDetailModalProps {
    course: Course;
    onClose: () => void;
}

export default function CourseDetailModal({ course, onClose }: CourseDetailModalProps) {
    const displayTitle = course.name || course.courseName || 'Unknown Course';
    const displayNumber = course.number || course.courseNumber || '0000';
    const displaySubject = course.subject || 'SUBJ';
    const displayCredits = course.credits || course.creditHours || 4;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col pt-2 animate-in slide-in-from-bottom-4 duration-300">

                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-100">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-md">
                                {displaySubject} {displayNumber}
                            </span>
                            <span className="text-gray-500 text-sm flex items-center font-medium">
                                <BookOpen className="w-4 h-4 mr-1.5 text-gray-400" />
                                {displayCredits} credits
                            </span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mt-1 leading-tight">{displayTitle}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                    {/* Description */}
                    <section className="mb-8">
                        <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-3">Description</h3>
                        <p className="text-gray-700 leading-relaxed">
                            {course.description || 'No detailed description available for this course. Please consult the university catalog for more information.'}
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Prerequisites */}
                        <section className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1.5 text-amber-500" />
                                Prerequisites
                            </h3>
                            {course.prereqs && course.prereqs.length > 0 ? (
                                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                    {course.prereqs.map((prereq, index) => (
                                        <li key={index} className="font-medium hover:text-red-700 cursor-pointer transition-colors inline-block mr-3">
                                            {prereq}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 italic">None required</p>
                            )}
                        </section>

                        {/* Co-requisites */}
                        <section className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                                <Calendar className="w-4 h-4 mr-1.5 text-blue-500" />
                                Co-requisites
                            </h3>
                            {course.coreqs && course.coreqs.length > 0 ? (
                                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                    {course.coreqs.map((coreq, index) => (
                                        <li key={index} className="font-medium hover:text-red-700 cursor-pointer transition-colors inline-block mr-3">
                                            {coreq}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 italic">None required</p>
                            )}
                        </section>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors focus:ring-4 focus:ring-gray-100 outline-none"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
