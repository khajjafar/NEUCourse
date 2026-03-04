import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlanDetails } from '@/hooks/usePlanDetails';

interface QuickAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    planId: string;
}

export default function QuickAddModal({ isOpen, onClose, planId }: QuickAddModalProps) {
    const { user } = useAuth();
    const { plan, addCourseToSemester } = usePlanDetails(planId);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
    const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);

    // Close on escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Search effect
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/v1/courses?search=${encodeURIComponent(query)}&limit=5`);
                const data = await res.json();
                if (data.data) {
                    setResults(data.data.courses || []);
                }
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    const handleAdd = async () => {
        if (!selectedCourse || !selectedSemesterId) return;
        setIsAdding(true);
        try {
            await addCourseToSemester(selectedSemesterId, selectedCourse.id);
            onClose();
            // Reset state
            setQuery('');
            setSelectedCourse(null);
            setSelectedSemesterId('');
        } catch (err: any) {
            alert(err.message || 'Failed to add course');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 p-4 sm:p-0">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3 shrink-0">
                    <h3 className="text-xl font-bold text-gray-900">
                        Quick Add Course
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-4">
                    {!selectedCourse ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search Course (Name or ID)</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 border"
                                    placeholder="e.g., CS 2500 or Fundamentals"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {isSearching && (
                                <div className="text-sm text-gray-500 py-4 text-center">Searching...</div>
                            )}

                            {!isSearching && results.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase">Results</h4>
                                    {results.map((course) => (
                                        <button
                                            key={course.id}
                                            onClick={() => setSelectedCourse(course)}
                                            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition flex justify-between items-center"
                                        >
                                            <div>
                                                <div className="font-bold text-gray-900">{course.id}</div>
                                                <div className="text-sm text-gray-600 line-clamp-1">{course.name}</div>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!isSearching && query.length >= 2 && results.length === 0 && (
                                <div className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                    No courses found for "{query}".
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 relative">
                                <button
                                    onClick={() => setSelectedCourse(null)}
                                    className="absolute top-2 right-2 text-indigo-400 hover:text-indigo-600 p-1"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <h4 className="font-bold text-indigo-900">{selectedCourse.id}</h4>
                                <p className="text-sm text-indigo-700 mt-1">{selectedCourse.name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Semester</label>
                                {plan?.semesters && plan.semesters.length > 0 ? (
                                    <div className="space-y-2">
                                        {plan.semesters.map((sem) => {
                                            const isAdded = sem.courses.some(c => typeof c === 'string' ? c === selectedCourse.id : c.courseId === selectedCourse.id);
                                            return (
                                                <button
                                                    key={sem.id}
                                                    onClick={() => setSelectedSemesterId(sem.id)}
                                                    disabled={isAdded}
                                                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition ${isAdded
                                                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                            : selectedSemesterId === sem.id
                                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                                                                : 'border-gray-300 text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span>{sem.name}</span>
                                                        {isAdded && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Already Added</span>}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 p-3 rounded-lg">
                                        You must create a semester first before adding courses quickly.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {selectedCourse && (
                    <div className="pt-4 border-t border-gray-100 mt-2 shrink-0 flex justify-end gap-3">
                        <button
                            onClick={() => setSelectedCourse(null)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={!selectedSemesterId || isAdding}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition flex items-center justify-center min-w-[100px]"
                        >
                            {isAdding ? 'Adding...' : 'Add Course'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
