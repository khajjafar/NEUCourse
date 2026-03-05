'use client';

import React, { useState, useEffect } from 'react';
import { useCourseSearch, CourseData } from '@/hooks/useCourseSearch';
import { useSingleCourse } from '@/hooks/useSingleCourse';
import { usePlanDetails } from '@/hooks/usePlanDetails';
import { MagnifyingGlassIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface QuickAddModalProps {
    planId: string | null;
    isOpen: boolean;
    onClose: () => void;
    addCourseToSemester: (semId: string, courseId: string, crn?: string) => Promise<void>;
    semesters: Array<{ id: string; name: string; order: number; courses: (string | { courseId: string; crn?: string })[] }>;
}

export default function QuickAddModal({ planId, isOpen, onClose, addCourseToSemester, semesters }: QuickAddModalProps) {
    const { query, setQuery, courses, loading: searchLoading, error: searchError } = useCourseSearch();
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    // Reset state when closing / opening
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedCourseId(null);
        }
    }, [isOpen, setQuery]);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 shrink-0">
                    <h3 className="text-xl font-bold text-gray-900">Quick Add Course</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 border-b border-gray-100 shrink-0 bg-gray-50">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, course number (e.g. CS 3500)..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                    {searchLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : searchError ? (
                        <div className="text-red-500 text-center py-4 bg-red-50 rounded-lg border border-red-200">{searchError}</div>
                    ) : courses.length === 0 ? (
                        <div className="text-gray-500 text-center py-10 italic">
                            {query ? "No courses found matching your search." : "Start typing to search for courses."}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {courses.map(course => (
                                <CourseResultRow
                                    key={course.id}
                                    course={course}
                                    isExpanded={selectedCourseId === course.id}
                                    onToggle={() => setSelectedCourseId(selectedCourseId === course.id ? null : course.id)}
                                    planId={planId}
                                    addCourseToSemester={addCourseToSemester}
                                    semesters={semesters}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CourseResultRow({ course, isExpanded, onToggle, planId, addCourseToSemester, semesters }: { course: CourseData; isExpanded: boolean; onToggle: () => void; planId: string | null; addCourseToSemester: (semId: string, courseId: string, crn?: string) => Promise<void>; semesters: Array<{ id: string; name: string; order: number; courses: (string | { courseId: string; crn?: string })[] }>; }) {
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <button
                className="w-full px-4 py-3 flex justify-between items-center text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                onClick={onToggle}
            >
                <div>
                    <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {course.subject} {course.number}: {course.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 font-medium">{course.creditHours} Credits</div>
                </div>
                <div className="text-gray-400 shrink-0 ml-4">
                    {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </div>
            </button>

            {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 animate-in slide-in-from-top-2 duration-300 ease-in-out">
                    <CourseDetailsSection courseId={course.id} addCourseToSemester={addCourseToSemester} semesters={semesters} />
                </div>
            )}
        </div>
    );
}

function CourseDetailsSection({ courseId, addCourseToSemester, semesters }: { courseId: string; addCourseToSemester: (semId: string, courseId: string, crn?: string) => Promise<void>; semesters: Array<{ id: string; name: string; order: number; courses: (string | { courseId: string; crn?: string })[] }>; }) {
    const { course, loading, error } = useSingleCourse(courseId);

    // local state for inline semester selection
    const [selectedCrn, setSelectedCrn] = useState<string | null>(null);
    const [addingToSemId, setAddingToSemId] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleAdd = async (crn: string, semId: string) => {
        try {
            setAddingToSemId(semId);
            await addCourseToSemester(semId, courseId, crn);
            setSuccessMsg(`Successfully added section ${crn}!`);
            setTimeout(() => {
                setSuccessMsg(null);
                setSelectedCrn(null);
            }, 2500);
        } catch (err: any) {
            alert(err.message || "Failed to add section.");
        } finally {
            setAddingToSemId(null);
        }
    };

    if (loading) return <div className="text-gray-500 text-sm py-4 flex items-center justify-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div> Loading sections...</div>;
    if (error || !course) return <div className="text-red-500 text-sm py-2 px-3 bg-red-50 rounded border border-red-100">Failed to load course details.</div>;
    if (!course.sections || course.sections.length === 0) return <div className="text-gray-500 text-sm py-3 italic bg-white rounded border border-gray-200 px-4 text-center">No sections available for {courseId}.</div>;

    return (
        <div className="flex flex-col gap-3">
            {successMsg && (
                <div className="bg-green-50 text-green-700 px-3 py-2 rounded text-sm font-medium border border-green-200 border-dashed mb-1 text-center animate-in fade-in zoom-in duration-300">
                    {successMsg}
                </div>
            )}

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">Available Sections</div>

            <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {course.sections.map((sec: any) => {
                    const isAdded = semesters.some(sem => sem.courses.some(c => typeof c === 'string' ? c === courseId : (c.courseId === courseId && c.crn === sec.crn)));

                    return (
                        <div key={sec.crn} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-sm flex-1">
                                <div className="font-semibold text-gray-900">
                                    CRN: {sec.crn}
                                </div>
                                <div className="text-indigo-600 font-mono text-xs mt-1.5 bg-indigo-50 px-2 py-0.5 rounded inline-block border border-indigo-100">
                                    {sec.meetingTimes}
                                </div>
                                <div className="text-gray-500 text-xs mt-1.5 flex items-center gap-2">
                                    <span>👨‍🏫 {sec.professor || "TBA"}</span>
                                    <span>📍 {sec.location || "TBA"}</span>
                                    <span>🪑 {sec.seatsAvailable} / {sec.seatsCapacity} seats</span>
                                </div>
                            </div>

                            {selectedCrn === sec.crn ? (
                                <div className="flex flex-col gap-2 w-full sm:w-auto min-w-[200px] animate-in slide-in-from-right-2 duration-200">
                                    <select
                                        className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white"
                                        onChange={(e) => {
                                            if (e.target.value) handleAdd(sec.crn, e.target.value);
                                        }}
                                        disabled={!!addingToSemId}
                                        value=""
                                    >
                                        <option value="" disabled>Select Semester to Add</option>
                                        {semesters.length > 0 ? (
                                            semesters.map(sem => (
                                                <option key={sem.id} value={sem.id}>{sem.name}</option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No semesters available</option>
                                        )}
                                    </select>
                                    <button
                                        onClick={() => setSelectedCrn(null)}
                                        className="text-xs text-gray-400 hover:text-gray-700 transition-colors text-right"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSelectedCrn(sec.crn)}
                                    disabled={isAdded}
                                    className={`shrink-0 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${isAdded
                                        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
                                        }`}
                                >
                                    {isAdded ? 'Added' : 'Add to Plan'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
