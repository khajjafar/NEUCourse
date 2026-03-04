'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlanDetails } from '@/hooks/usePlanDetails';
import { useRouter, useParams } from 'next/navigation';
import CourseMiniCard from '@/components/CourseMiniCard';
import PrereqWarning from '@/components/PrereqWarning';
import Link from 'next/link';

export default function PlanDetailsPage() {
    const { user, loading: authLoading } = useAuth();
    const params = useParams();
    const planId = typeof params?.planId === 'string' ? params.planId : null;

    const { plan, loading: planLoading, error, addSemester, removeCourseFromSemester } = usePlanDetails(planId);
    const router = useRouter();

    const [newSemesterName, setNewSemesterName] = useState('');
    const [isCreatingSem, setIsCreatingSem] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleAddSemester = async (e: FormEvent) => {
        e.preventDefault();
        if (!newSemesterName.trim()) return;

        try {
            setIsCreatingSem(true);
            // Default order is based on number of existing semesters
            const order = plan?.semesters ? plan.semesters.length + 1 : 1;
            await addSemester(newSemesterName, order);
            setNewSemesterName('');
        } catch (err) {
            console.error('Failed to add semester:', err);
            alert('Failed to add semester.');
        } finally {
            setIsCreatingSem(false);
        }
    };

    if (authLoading || planLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
                <div className="animate-pulse flex items-center space-x-4">
                    <div className="h-6 w-6 bg-indigo-500 rounded-full"></div>
                    <div className="text-lg font-medium text-gray-500">Loading plan...</div>
                </div>
            </div>
        );
    }

    if (error || !plan) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 text-center mt-12 bg-white shadow rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Plan Not Found</h2>
                <p className="text-gray-600 mb-6">{error || "We couldn't locate the degree plan you're looking for."}</p>
                <Link href="/plans" className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Back to Plans
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol role="list" className="flex items-center space-x-4 mb-2">
                            <li>
                                <div>
                                    <Link href="/plans" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                                        Plans
                                    </Link>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="ml-4 text-sm font-medium text-gray-900">{plan.name}</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                    <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
                        {plan.name}
                    </h2>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <Link
                        href="/courses"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Browse Courses to Add
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Semester List Column */}
                <div className="lg:col-span-2 space-y-6">
                    {plan.semesters.length === 0 ? (
                        <div className="text-center bg-white rounded-lg border-2 border-dashed border-gray-300 p-12">
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No semesters defined</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating your first semester to the right.</p>
                        </div>
                    ) : (
                        plan.semesters.map((semester) => (
                            <div key={semester.id} className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                                <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center border-b border-gray-200">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        {semester.name}
                                    </h3>
                                    <span className="text-sm text-gray-500">{semester.courses.length} courses</span>
                                </div>
                                <div className="px-4 py-5 sm:p-6 p-4">
                                    {semester.courses.length === 0 ? (
                                        <p className="text-gray-500 text-sm italic py-4 text-center">No courses added yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {semester.courses.map((courseId) => (
                                                <div key={courseId} className="flex flex-col">
                                                    <CourseMiniCard
                                                        courseId={courseId}
                                                        onRemove={() => {
                                                            removeCourseFromSemester(semester.id, courseId)
                                                                .catch(err => alert(err.message));
                                                        }}
                                                    />
                                                    <PrereqWarning
                                                        courseId={courseId}
                                                        semester={semester}
                                                        allSemesters={plan.semesters}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Create Semester Column */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow sm:rounded-lg border border-gray-200 sticky top-4">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                Add Semester
                            </h3>
                            <form onSubmit={handleAddSemester}>
                                <div className="w-full">
                                    <label htmlFor="semesterName" className="block text-sm font-medium text-gray-700">
                                        Semester Name
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="semesterName"
                                            id="semesterName"
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                            placeholder="E.g. Fall 2026"
                                            value={newSemesterName}
                                            onChange={(e) => setNewSemesterName(e.target.value)}
                                            disabled={isCreatingSem}
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isCreatingSem}
                                    className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {isCreatingSem ? 'Adding...' : 'Add Semester'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
