'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AddToCalendarButton } from './AddToCalendarButton';
import { fetchCourseCached } from '@/hooks/useSingleCourse';
import { CourseData } from '@/hooks/useCourseSearch';

export interface CalendarSemester {
    id: string;
    name: string;
    order: number;
    courses: (string | { courseId: string; crn?: string })[];
}

interface AddScheduleToCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    semesters: CalendarSemester[];
}

export default function AddScheduleToCalendarModal({
    isOpen,
    onClose,
    semesters,
}: AddScheduleToCalendarModalProps) {
    const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
    const [courseDetails, setCourseDetails] = useState<Map<string, CourseData>>(new Map());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSelectedSemesterId('');
            setCourseDetails(new Map());
        }
    }, [isOpen]);

    const selectedSemester = semesters.find(s => s.id === selectedSemesterId);

    // Only courses that have a specific section (CRN) selected in the plan
    const scheduledCourses = selectedSemester?.courses
        .map(c => typeof c === 'string' ? { courseId: c, crn: undefined } : { courseId: c.courseId, crn: c.crn })
        .filter((c): c is { courseId: string; crn: string } => c.crn !== undefined) || [];

    useEffect(() => {
        if (!selectedSemesterId || scheduledCourses.length === 0) {
            setCourseDetails(new Map());
            return;
        }

        let isMounted = true;
        setIsLoading(true);

        const fetchAllCourses = async () => {
            try {
                const uniqueCourseIds = Array.from(new Set(scheduledCourses.map(c => c.courseId)));
                const responses = await Promise.all(
                    uniqueCourseIds.map(id => fetchCourseCached(id).catch(() => null))
                );

                if (!isMounted) return;

                const newCourseMap = new Map<string, CourseData>();
                responses.forEach((data, index) => {
                    const id = uniqueCourseIds[index];
                    if (data) {
                        newCourseMap.set(id, data);
                    }
                });

                setCourseDetails(newCourseMap);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchAllCourses();

        return () => {
            isMounted = false;
        };
    }, [selectedSemesterId, scheduledCourses.length]); // Intentionally omitting full array to avoid loop

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div
                className="absolute inset-0 bg-gray-500/75 transition-opacity"
                aria-hidden="true"
                onClick={onClose}
            ></div>

                <div className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto sm:p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Add Schedule to Calendar
                            </h3>
                            <div className="mt-4">
                                <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700">
                                    Select Semester
                                </label>
                                <select
                                    id="semester-select"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    value={selectedSemesterId}
                                    onChange={(e) => setSelectedSemesterId(e.target.value)}
                                >
                                    <option value="" disabled>Select a semester...</option>
                                    {semesters.map((sem) => (
                                        <option key={sem.id} value={sem.id}>
                                            {sem.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedSemesterId && (
                                <div className="mt-6">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Courses with selected sections</h4>

                                    {isLoading ? (
                                        <div className="flex justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                        </div>
                                    ) : scheduledCourses.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">
                                            No courses in this semester have a specific section selected. Use Quick Add to add a course and pick a section.
                                        </p>
                                    ) : (
                                        <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
                                            {scheduledCourses.map((c, idx) => {
                                                const courseData = courseDetails.get(c.courseId);
                                                const section = courseData?.sections?.find(s => s.crn === c.crn);

                                                return (
                                                    <li key={`${c.courseId}-${idx}`} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{c.courseId}</p>
                                                            {courseData && <p className="text-xs text-gray-500 truncate">{courseData.name}</p>}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-gray-600">CRN {c.crn}</p>
                                                            <p className="text-xs text-gray-400">{section?.meetingTimes || 'Schedule TBA'}</p>
                                                        </div>

                                                        <div className="shrink-0">
                                                            <AddToCalendarButton
                                                                courseId={c.courseId}
                                                                crn={c.crn}
                                                                courseName={c.courseId}
                                                            />
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Done
                        </button>
                    </div>
                </div>
        </div>
    );
}
