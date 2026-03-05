'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlanDetails } from '@/hooks/usePlanDetails';
import { useRouter, useParams } from 'next/navigation';
import CourseMiniCard from '@/components/CourseMiniCard';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import AddSemesterModal from '@/components/AddSemesterModal';
import QuickAddModal from '@/components/QuickAddModal';
import { TrashIcon, PlusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';
import { fetchCourseCached } from '@/hooks/useSingleCourse';
import { CourseAssignment } from '@/hooks/usePlanDetails';

function SemesterCreditPill({ courses }: { courses: (string | CourseAssignment)[] }) {
    const [credits, setCredits] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchCredits = async () => {
            setLoading(true);
            let total = 0;
            const courseIds = courses.map(c => typeof c === 'string' ? c : c.courseId);

            if (courseIds.length === 0) {
                if (mounted) { setCredits(0); setLoading(false); }
                return;
            }

            try {
                const responses = await Promise.all(
                    courseIds.map(id => fetchCourseCached(id).catch(() => null))
                );

                for (const data of responses) {
                    if (data?.creditHours) {
                        const chr = Number(data.creditHours);
                        if (!isNaN(chr)) total += chr;
                    }
                }

                if (mounted) {
                    setCredits(total);
                    setLoading(false);
                }
            } catch (error) {
                if (mounted) setLoading(false);
            }
        };

        fetchCredits();
        return () => { mounted = false; };
    }, [courses]);

    if (loading) {
        return <span className="text-xs font-semibold text-gray-500 bg-gray-200/80 px-2 py-0.5 rounded-full animate-pulse w-10 h-5 inline-block"></span>;
    }

    return (
        <span className="text-xs font-semibold text-gray-500 bg-gray-200/80 px-2 py-0.5 rounded-full">
            {credits} {credits === 1 ? 'credit' : 'credits'}
        </span>
    );
}

export default function PlanDetailsPage() {
    const { user, loading: authLoading } = useAuth();
    const params = useParams();
    const planId = typeof params?.planId === 'string' ? params.planId : null;

    const {
        plan,
        loading: planLoading,
        error,
        deleteSemester,
        reorderSemesters,
        moveCourseBetweenSemesters,
        removeCourseFromSemester
    } = usePlanDetails(planId);

    const router = useRouter();

    const [isAddSemesterOpen, setIsAddSemesterOpen] = useState(false);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [isBrowser, setIsBrowser] = useState(false);

    useEffect(() => {
        setIsBrowser(true);
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const allPlanCourses = useMemo(() => {
        if (!plan) return [];
        return plan.semesters.flatMap(sem =>
            sem.courses.map(c => ({
                courseId: typeof c === 'string' ? c : c.courseId,
                semesterOrder: sem.order
            }))
        );
    }, [plan]);

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const { source, destination, type } = result;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        if (type === 'semester') {
            await reorderSemesters(result.draggableId, destination.index);
            return;
        }

        if (type === 'course') {
            await moveCourseBetweenSemesters(
                source.droppableId,
                destination.droppableId,
                source.index,
                destination.index
            );
            return;
        }
    };

    if (authLoading || planLoading || !isBrowser) {
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
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-full mx-auto p-4 sm:p-6 lg:p-8">
                <div className="md:flex md:items-center md:justify-between mb-8 max-w-7xl mx-auto">
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
                    <div className="mt-4 flex flex-wrap gap-3 md:mt-0 md:ml-4">
                        <button
                            onClick={() => setIsQuickAddOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            <MagnifyingGlassPlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Quick Add
                        </button>
                        <button
                            onClick={() => setIsAddSemesterOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                            Add Semester
                        </button>
                    </div>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="board" type="semester" direction="horizontal">
                        {(provided) => (
                            <div
                                className="flex overflow-x-auto items-start gap-6 pb-8 min-h-[60vh] scroll-container max-w-7xl mx-auto"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {plan.semesters.length === 0 ? (
                                    <div className="text-center bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 w-full max-w-2xl mx-auto">
                                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No semesters defined</h3>
                                        <p className="mt-1 text-sm text-gray-500 mb-4">Get started by creating your first semester.</p>
                                        <button
                                            onClick={() => setIsAddSemesterOpen(true)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                            Create Semester
                                        </button>
                                    </div>
                                ) : (
                                    plan.semesters.map((semester, index) => (
                                        <Draggable key={semester.id} draggableId={semester.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`w-80 shrink-0 bg-gray-100 rounded-xl p-3 flex flex-col border shadow-sm transition-colors ${snapshot.isDragging ? 'border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-500/20' : 'border-gray-200'}`}
                                                >
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        className="flex justify-between items-center mb-4 px-1 cursor-grab active:cursor-grabbing group pt-1"
                                                    >
                                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide truncate pr-2">
                                                            {semester.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <SemesterCreditPill courses={semester.courses} />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm(`Are you sure you want to delete ${semester.name}? All contained courses will be removed from your plan.`)) {
                                                                        deleteSemester(semester.id).catch(err => alert(err.message));
                                                                    }
                                                                }}
                                                                className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                                title="Delete Semester"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <Droppable droppableId={semester.id} type="course">
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                                className={`flex flex-col gap-3 min-h-[150px] rounded-lg transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-indigo-50 outline-dashed outline-2 outline-indigo-300 outline-offset-[-2px] p-2 -m-2' : ''}`}
                                                            >
                                                                {semester.courses.length === 0 ? (
                                                                    <div className="h-full flex items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                                                                        <p className="text-gray-400 text-sm italic">No courses added</p>
                                                                    </div>
                                                                ) : (
                                                                    semester.courses.map((courseItem, idx) => {
                                                                        const cid = typeof courseItem === 'string' ? courseItem : courseItem.courseId;
                                                                        const crn = typeof courseItem === 'string' ? undefined : courseItem.crn;
                                                                        const draggableCourseId = `${semester.id}-${cid}-${idx}`;

                                                                        return (
                                                                            <Draggable key={draggableCourseId} draggableId={draggableCourseId} index={idx}>
                                                                                {(provided, snapshot) => (
                                                                                    <div
                                                                                        ref={provided.innerRef}
                                                                                        {...provided.draggableProps}
                                                                                        {...provided.dragHandleProps}
                                                                                        className={`rounded-lg transition-transform ${snapshot.isDragging ? 'ring-2 ring-indigo-500 shadow-xl opacity-90 rotate-2' : ''}`}
                                                                                    >
                                                                                        <CourseMiniCard
                                                                                            courseId={cid}
                                                                                            crn={crn}
                                                                                            allPlanCourses={allPlanCourses}
                                                                                            currentSemesterOrder={semester.order}
                                                                                            onRemove={() => {
                                                                                                if (confirm(`Remove ${cid} from ${semester.name}?`)) {
                                                                                                    removeCourseFromSemester(semester.id, cid)
                                                                                                        .catch(err => alert(err.message));
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </Draggable>
                                                                        );
                                                                    })
                                                                )}
                                                                {provided.placeholder}
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))
                                )}
                                {provided.placeholder}
                                {/* Right Edge Scroll Spacer */}
                                {plan.semesters.length > 0 && <div className="w-2 sm:w-4 lg:w-6 shrink-0" aria-hidden="true" />}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                {/* Modals */}
                <AddSemesterModal
                    planId={planId}
                    isOpen={isAddSemesterOpen}
                    onClose={() => setIsAddSemesterOpen(false)}
                />

                <QuickAddModal
                    planId={planId}
                    isOpen={isQuickAddOpen}
                    onClose={() => setIsQuickAddOpen(false)}
                />
            </div>
        </div>
    );
}
