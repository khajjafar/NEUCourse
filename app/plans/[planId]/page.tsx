'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlanDetails } from '@/hooks/usePlanDetails';
import { useRouter, useParams } from 'next/navigation';
import { useMemo } from 'react';
import CourseMiniCard from '@/components/CourseMiniCard';
import Link from 'next/link';
import QuickAddModal from '@/components/QuickAddModal';
import AddSemesterModal from '@/components/AddSemesterModal';
import { DndContext, DragEndEvent, DragStartEvent, useDroppable, DragOverlay } from '@dnd-kit/core';

function DroppableSemester({ semester, children }: { semester: any, children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({
        id: semester.id,
        data: { semesterId: semester.id }
    });
    return (
        <div
            ref={setNodeRef}
            className={`w-80 shrink-0 rounded-lg p-3 flex flex-col border shadow-sm transition-colors ${isOver ? 'bg-indigo-50/50 border-indigo-400 ring-2 ring-indigo-400' : 'bg-gray-100 border-gray-200'
                }`}
        >
            {children}
        </div>
    );
}

export default function PlanDetailsPage() {
    const { user, loading: authLoading } = useAuth();
    const params = useParams();
    const planId = typeof params?.planId === 'string' ? params.planId : null;

    const { plan, loading: planLoading, error, addSemester, removeCourseFromSemester, moveCourseBetweenSemesters } = usePlanDetails(planId);
    const router = useRouter();

    const [isCreatingSem, setIsCreatingSem] = useState(false);
    const [isAddSemesterModalOpen, setIsAddSemesterModalOpen] = useState(false);
    const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
    
    // Drag and Drop active item
    const [activeCourse, setActiveCourse] = useState<any>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleCreateSemester = async (name: string) => {
        try {
            setIsCreatingSem(true);
            const order = plan?.semesters ? plan.semesters.length + 1 : 1;
            await addSemester(name, order);
        } catch (err) {
            console.error('Failed to add semester:', err);
            alert('Failed to add semester.');
        } finally {
            setIsCreatingSem(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveCourse(active.data.current);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveCourse(null);
        
        const { active, over } = event;
        if (!over) return;

        const sourceSemId = active.data.current?.semesterId;
        const targetSemId = over.data.current?.semesterId;
        const courseId = active.data.current?.courseId;
        const crn = active.data.current?.crn;

        if (sourceSemId && targetSemId && courseId && sourceSemId !== targetSemId) {
            try {
                await moveCourseBetweenSemesters(sourceSemId, targetSemId, courseId, crn);
            } catch (err: any) {
                console.error("Failed to move course:", err);
                alert(err.message || 'Failed to move course.');
            }
        }
    };

    const allPlanCourses = useMemo(() => {
        if (!plan) return [];
        return plan.semesters.flatMap(sem =>
            sem.courses.map(c => ({
                courseId: typeof c === 'string' ? c : c.courseId,
                semesterOrder: sem.order
            }))
        );
    }, [plan]);

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
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        {plan.name}
                    </h2>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-3 md:mt-0 md:ml-4">
                    <button
                        onClick={() => setIsAddSemesterModalOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Add Semester
                    </button>
                    <button
                        onClick={() => setIsQuickAddModalOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Quick Add
                    </button>
                </div>
            </div>

            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex overflow-x-auto scrollbar-always-visible items-start gap-6 pb-8 min-h-[60vh]">
                    {/* Semester List Columns */}
                    {plan.semesters.length === 0 ? (
                        <div className="text-center bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 w-full max-w-2xl mx-auto">
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No semesters defined</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating your first semester to the right.</p>
                        </div>
                    ) : (
                        plan.semesters.map((semester) => (
                            <DroppableSemester key={semester.id} semester={semester}>
                                <div className="flex justify-between items-center mb-3 px-1">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                        {semester.name}
                                    </h3>
                                    <span className="text-xs font-medium text-gray-500">{semester.courses.length} courses</span>
                                </div>

                                <div className="flex flex-col gap-3 min-h-[100px]">
                                    {semester.courses.length === 0 ? (
                                        <p className="text-gray-400 text-sm italic py-4 text-center">No courses added</p>
                                    ) : (
                                        semester.courses.map((courseItem, idx) => {
                                            const cid = typeof courseItem === 'string' ? courseItem : courseItem.courseId;
                                            const crn = typeof courseItem === 'string' ? undefined : courseItem.crn;
                                            return (
                                                <CourseMiniCard
                                                    key={`${cid}-${idx}`}
                                                    courseId={cid}
                                                    crn={crn}
                                                    semesterId={semester.id}
                                                    allPlanCourses={allPlanCourses}
                                                    currentSemesterOrder={semester.order}
                                                    onRemove={() => {
                                                        removeCourseFromSemester(semester.id, cid)
                                                            .catch(err => alert(err.message));
                                                    }}
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            </DroppableSemester>
                        ))
                    )}

                    {/* Right Edge Scroll Spacer */}
                    <div className="w-2 sm:w-4 lg:w-6 shrink-0" aria-hidden="true" />
                </div>
                <DragOverlay>
                    {activeCourse ? (
                        <div className="opacity-80 scale-105 shadow-xl cursor-grabbing pointer-events-none">
                            <CourseMiniCard
                                courseId={activeCourse.courseId}
                                crn={activeCourse.crn}
                                allPlanCourses={allPlanCourses}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <AddSemesterModal
                isOpen={isAddSemesterModalOpen}
                onClose={() => setIsAddSemesterModalOpen(false)}
                onAdd={handleCreateSemester}
                isAdding={isCreatingSem}
            />
            {planId && (
                <QuickAddModal
                    isOpen={isQuickAddModalOpen}
                    onClose={() => setIsQuickAddModalOpen(false)}
                    planId={planId as string}
                />
            )}
        </div>
    );
}
