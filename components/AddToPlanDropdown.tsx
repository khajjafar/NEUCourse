'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlans } from '@/hooks/usePlans';
import { usePlanDetails } from '@/hooks/usePlanDetails';
import { PlusIcon } from '@heroicons/react/24/outline';

interface AddToPlanDropdownProps {
    courseId: string;
    crn?: string;
}

export default function AddToPlanDropdown({ courseId, crn }: AddToPlanDropdownProps) {
    const { user } = useAuth();
    const { plans, loading: plansLoading } = usePlans();

    const [isOpen, setIsOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // We only fetch the detailed plan if one is selected in the list
    const { plan: detailedPlan, loading: detailsLoading, addCourseToSemester } = usePlanDetails(selectedPlanId);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('#add-to-plan-dropdown')) {
                setIsOpen(false);
                setSelectedPlanId(null);
                setSuccessMessage(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null; // Don't show to unauthenticated users

    const handleSelectSemester = async (semId: string, semName: string) => {
        try {
            setIsAdding(true);
            await addCourseToSemester(semId, courseId, crn);
            setSuccessMessage(`Added to ${semName}`);
            setTimeout(() => {
                setIsOpen(false);
                setSuccessMessage(null);
                setSelectedPlanId(null);
            }, 2000);
        } catch (err: any) {
            alert(err.message || 'Failed to add course');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div id="add-to-plan-dropdown" className="relative inline-block text-left">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5 rounded-md" aria-hidden="true" />
                Add to Plan
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="p-2 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block px-2 py-1">
                            {selectedPlanId ? 'Select Semester' : 'Select Plan'}
                        </span>
                    </div>

                    <div className="py-1 max-h-60 overflow-y-auto">
                        {successMessage ? (
                            <div className="px-4 py-3 text-sm text-green-700 font-medium text-center bg-green-50">
                                {successMessage}
                            </div>
                        ) : isAdding || plansLoading || detailsLoading ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center animate-pulse">
                                Loading...
                            </div>
                        ) : !selectedPlanId ? (
                            plans.length > 0 ? (
                                plans.map(plan => (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlanId(plan.id)}
                                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    >
                                        {plan.name}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                    No plans created yet.
                                </div>
                            )
                        ) : (
                            <div>
                                <button
                                    onClick={() => setSelectedPlanId(null)}
                                    className="w-full text-left block px-4 py-2 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                                >
                                    ← Back to Plans
                                </button>
                                {detailedPlan?.semesters && detailedPlan.semesters.length > 0 ? (
                                    detailedPlan.semesters.map(sem => {
                                        const isAdded = sem.courses.some(c => typeof c === 'string' ? c === courseId : c.courseId === courseId);
                                        return (
                                            <button
                                                key={sem.id}
                                                onClick={() => handleSelectSemester(sem.id, sem.name)}
                                                disabled={isAdded}
                                                className={`w-full text-left block px-4 py-2 text-sm ${isAdded ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                                            >
                                                {sem.name} {isAdded && '(Added)'}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                        No semesters in this plan.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
