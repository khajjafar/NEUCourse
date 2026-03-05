import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Plan } from './usePlans';

export interface CourseAssignment {
    courseId: string;
    crn?: string;
}

export interface Semester {
    id: string;
    name: string;
    order: number;
    courses: (string | CourseAssignment)[]; // List of course IDs or objects
}

export interface DetailedPlan extends Plan {
    semesters: Semester[];
}

export function usePlanDetails(planId: string | null) {
    const { user, loading: authLoading } = useAuth();
    const [plan, setPlan] = useState<DetailedPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlanDetails = useCallback(async () => {
        if (!user || !planId) {
            setPlan(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const token = await user.getIdToken();
            const response = await fetch(`/api/v1/plans/${planId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error?.message || 'Failed to fetch plan details');
            }

            const data = await response.json();
            setPlan(data.data as DetailedPlan);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [user, planId]);

    useEffect(() => {
        if (!authLoading) {
            fetchPlanDetails();
        }
    }, [authLoading, fetchPlanDetails]);

    const addSemester = async (name: string, order: number) => {
        if (!user || !planId) throw new Error("Missing authentication or Plan ID.");
        const token = await user.getIdToken();
        const response = await fetch(`/api/v1/plans/${planId}/semesters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name, order })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error?.message || 'Failed to create semester');
        }

        await fetchPlanDetails();
    };

    const addCourseToSemester = async (semId: string, courseId: string, crn?: string) => {
        if (!user || !planId) throw new Error("Missing authentication or Plan ID.");

        // Optimistic UI update
        setPlan(prevPlan => {
            if (!prevPlan) return prevPlan;
            const updatedSemesters = prevPlan.semesters.map(sem => {
                if (sem.id === semId) {
                    const exists = sem.courses.some(c => typeof c === 'string' ? c === courseId : c.courseId === courseId);
                    if (!exists) {
                        const newPayload = crn ? { courseId, crn } : { courseId };
                        return { ...sem, courses: [...sem.courses, newPayload] };
                    }
                }
                return sem;
            });
            return { ...prevPlan, semesters: updatedSemesters };
        });

        const token = await user.getIdToken();
        const response = await fetch(`/api/v1/plans/${planId}/semesters/${semId}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ courseId, crn })
        });

        if (!response.ok) {
            // Revert on failure
            await fetchPlanDetails();
            const data = await response.json();
            throw new Error(data.error?.message || 'Failed to add course');
        }

        await fetchPlanDetails();
    };

    const removeCourseFromSemester = async (semId: string, courseId: string) => {
        if (!user || !planId) throw new Error("Missing authentication or Plan ID.");

        // Optimistic UI update
        setPlan(prevPlan => {
            if (!prevPlan) return prevPlan;
            const updatedSemesters = prevPlan.semesters.map(sem => {
                if (sem.id === semId) {
                    return { ...sem, courses: sem.courses.filter(c => typeof c === 'string' ? c !== courseId : c.courseId !== courseId) };
                }
                return sem;
            });
            return { ...prevPlan, semesters: updatedSemesters };
        });

        const token = await user.getIdToken();
        const response = await fetch(`/api/v1/plans/${planId}/semesters/${semId}/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // Revert on failure
            await fetchPlanDetails();
            const data = await response.json();
            throw new Error(data.error?.message || 'Failed to remove course');
        }
    };

    const deleteSemester = async (semId: string) => {
        if (!user || !planId) throw new Error("Missing authentication or Plan ID.");

        let previousSemesters: Semester[] = [];

        setPlan(prevPlan => {
            if (!prevPlan) return prevPlan;
            previousSemesters = prevPlan.semesters;
            const updatedSemesters = prevPlan.semesters.filter(sem => sem.id !== semId);
            return { ...prevPlan, semesters: updatedSemesters };
        });

        const token = await user.getIdToken();
        const response = await fetch(`/api/v1/plans/${planId}/semesters/${semId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            setPlan(prevPlan => prevPlan ? { ...prevPlan, semesters: previousSemesters } : prevPlan);
            const data = await response.json();
            throw new Error(data.error?.message || 'Failed to delete semester');
        }
    };

    const reorderSemesters = async (semId: string, destinationIndex: number) => {
        if (!user || !planId || !plan) throw new Error("Missing authentication or Plan ID.");

        const semestersCopy = [...plan.semesters].sort((a, b) => a.order - b.order);
        const sourceIndex = semestersCopy.findIndex(s => s.id === semId);
        if (sourceIndex === -1 || sourceIndex === destinationIndex) return;

        const [movedSem] = semestersCopy.splice(sourceIndex, 1);
        semestersCopy.splice(destinationIndex, 0, movedSem);

        const updatedSemesters = semestersCopy.map((sem, index) => ({ ...sem, order: index + 1 }));

        setPlan(prev => prev ? { ...prev, semesters: updatedSemesters } : prev);

        const token = await user.getIdToken();
        try {
            await Promise.all(updatedSemesters.map(sem =>
                fetch(`/api/v1/plans/${planId}/semesters/${sem.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ order: sem.order })
                })
            ));
        } catch (error) {
            console.error('Failed to reorder semesters:', error);
            await fetchPlanDetails();
        }
    };

    const moveCourseBetweenSemesters = async (sourceSemId: string, destSemId: string, sourceIndex: number, destinationIndex: number) => {
        if (!user || !planId || !plan) throw new Error("Missing authentication");

        const token = await user.getIdToken();

        const newSems = [...plan.semesters];
        const srcIdx = newSems.findIndex(s => s.id === sourceSemId);
        const dstIdx = newSems.findIndex(s => s.id === destSemId);

        if (srcIdx === -1 || dstIdx === -1) return;

        const srcCourses = [...newSems[srcIdx].courses];
        const [targetCourse] = srcCourses.splice(sourceIndex, 1);
        newSems[srcIdx] = { ...newSems[srcIdx], courses: srcCourses };

        const dstCourses = sourceSemId === destSemId ? srcCourses : [...newSems[dstIdx].courses];
        dstCourses.splice(destinationIndex, 0, targetCourse);

        newSems[dstIdx] = { ...newSems[dstIdx], courses: dstCourses };

        // Optimistic update
        setPlan({ ...plan, semesters: newSems });

        try {
            if (sourceSemId === destSemId) {
                await fetch(`/api/v1/plans/${planId}/semesters/${sourceSemId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ courses: srcCourses })
                });
            } else {
                await Promise.all([
                    fetch(`/api/v1/plans/${planId}/semesters/${sourceSemId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ courses: srcCourses })
                    }),
                    fetch(`/api/v1/plans/${planId}/semesters/${destSemId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ courses: dstCourses })
                    })
                ]);
            }
        } catch (error) {
            console.error('Failed to move course:', error);
            await fetchPlanDetails();
        }
    };

    return {
        plan,
        loading: loading || authLoading,
        error,
        addSemester,
        deleteSemester,
        reorderSemesters,
        moveCourseBetweenSemesters,
        addCourseToSemester,
        removeCourseFromSemester
    };
}
