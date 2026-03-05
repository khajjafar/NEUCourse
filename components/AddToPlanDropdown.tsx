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

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setSelectedPlanId(null);
                setSuccessMessage(null);
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
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
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5 rounded-md" aria-hidden="true" />
                Add to Plan
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
                    <div
                        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                        onClick={() => {
                            setIsOpen(false);
                            setSelectedPlanId(null);
                            setSuccessMessage(null);
                        }}
                    />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                            <h3 className="text-lg font-bold text-gray-900">
                                {selectedPlanId ? 'Select Semester' : 'Select Plan'}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setSelectedPlanId(null);
                                    setSuccessMessage(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="py-2 max-h-[60vh] overflow-y-auto">
                            {successMessage ? (
                                <div className="p-4 rounded-lg bg-green-50 text-green-700 font-medium text-center border border-green-200 flex flex-col items-center gap-2">
                                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {successMessage}
                                </div>
                            ) : isAdding || plansLoading || detailsLoading ? (
                                <div className="p-8 text-sm text-gray-500 flex flex-col items-center justify-center gap-3">
                                    <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Please wait...</span>
                                </div>
                            ) : !selectedPlanId ? (
                                <div className="flex flex-col gap-2">
                                    {plans.length > 0 ? (
                                        plans.map(plan => (
                                            <button
                                                key={plan.id}
                                                onClick={() => setSelectedPlanId(plan.id)}
                                                className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition"
                                            >
                                                {plan.name}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 rounded-lg bg-gray-50 text-gray-500 text-center border border-gray-200 italic">
                                            No plans created yet.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => setSelectedPlanId(null)}
                                        className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors mb-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back to Plans
                                    </button>
                                    {detailedPlan?.semesters && detailedPlan.semesters.length > 0 ? (
                                        detailedPlan.semesters.map(sem => {
                                            const isAdded = sem.courses.some(c => typeof c === 'string' ? c === courseId : c.courseId === courseId);
                                            return (
                                                <button
                                                    key={sem.id}
                                                    onClick={() => handleSelectSemester(sem.id, sem.name)}
                                                    disabled={isAdded}
                                                    className={`w-full text-left flex justify-between items-center px-4 py-3 rounded-lg border text-sm font-medium transition ${isAdded ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' : 'border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700'}`}
                                                >
                                                    {sem.name}
                                                    {isAdded && (
                                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Added</span>
                                                    )}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="p-4 rounded-lg bg-gray-50 text-gray-500 text-center border border-gray-200 italic">
                                            No semesters in this plan.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
