'use client';

/**
 * @fileoverview Progress bar visualization for graduation requirements in the degree plan view.
 * Computes completion percentage by counting CourseAssignments that have a requirementId set.
 */

import React, { useMemo } from 'react';
import { GraduationRequirement } from '@/hooks/usePlans';
import { Semester } from '@/hooks/usePlanDetails';

interface RequirementProgressBarsProps {
    requirements?: GraduationRequirement[];
    semesters?: Semester[];
}

/**
 * Renders a grid of labeled progress bars showing how many courses have been assigned to each
 * graduation requirement.
 * @param props - Component props
 * @param props.requirements - The graduation requirements to display progress for
 * @param props.semesters - All semesters in the plan, used to count assigned courses per requirement
 * @returns A grid of progress bars, or null if there are no requirements
 */
export default function RequirementProgressBars({ requirements, semesters }: RequirementProgressBarsProps) {
    const progressData = useMemo(() => {
        if (!requirements || requirements.length === 0) return [];

        const counts: Record<string, number> = {};

        // Initialize counts
        requirements.forEach(req => {
            counts[req.id] = 0;
        });

        // Tally up assigned courses
        if (semesters) {
            semesters.forEach(sem => {
                sem.courses.forEach(courseItem => {
                    if (typeof courseItem !== 'string' && courseItem.requirementId) {
                        if (counts[courseItem.requirementId] !== undefined) {
                            counts[courseItem.requirementId] += 1;
                        }
                    }
                });
            });
        }

        return requirements.map(req => ({
            ...req,
            currentCount: counts[req.id] || 0
        }));
    }, [requirements, semesters]);

    if (!progressData || progressData.length === 0) return null;

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 max-w-7xl mx-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
                Requirements Progress
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressData.map(req => {
                    const percentage = Math.min(100, Math.round((req.currentCount / req.count) * 100)) || 0;
                    const isComplete = req.currentCount >= req.count;

                    return (
                        <div key={req.id} className="flex flex-col">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-700 truncate pr-2">
                                    {req.name}
                                </span>
                                <span className={`text-xs font-semibold ${isComplete ? 'text-green-600' : 'text-gray-500'}`}>
                                    {req.currentCount} / {req.count}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${percentage}%` }}
                                    title={`${percentage}% Complete`}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
