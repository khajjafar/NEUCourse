import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Plan } from './usePlans';

export interface Semester {
    id: string;
    name: string;
    order: number;
    courses: string[]; // List of course IDs
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
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error?.message || 'Failed to fetch plan details');
            }

            const data = await response.json();
            setPlan(data.data as DetailedPlan);
        } catch (err: any) {
            setError(err.message);
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

    const addCourseToSemester = async (semId: string, courseId: string) => {
        if (!user || !planId) throw new Error("Missing authentication or Plan ID.");

        // Optimistic UI update
        setPlan(prevPlan => {
            if (!prevPlan) return prevPlan;
            const updatedSemesters = prevPlan.semesters.map(sem => {
                if (sem.id === semId && !sem.courses.includes(courseId)) {
                    return { ...sem, courses: [...sem.courses, courseId] };
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
            body: JSON.stringify({ courseId })
        });

        if (!response.ok) {
            // Revert on failure
            await fetchPlanDetails();
            const data = await response.json();
            throw new Error(data.error?.message || 'Failed to add course');
        }
    };

    const removeCourseFromSemester = async (semId: string, courseId: string) => {
        if (!user || !planId) throw new Error("Missing authentication or Plan ID.");

        // Optimistic UI update
        setPlan(prevPlan => {
            if (!prevPlan) return prevPlan;
            const updatedSemesters = prevPlan.semesters.map(sem => {
                if (sem.id === semId) {
                    return { ...sem, courses: sem.courses.filter(id => id !== courseId) };
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

    return {
        plan,
        loading: loading || authLoading,
        error,
        addSemester,
        addCourseToSemester,
        removeCourseFromSemester
    };
}
