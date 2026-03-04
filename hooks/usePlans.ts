import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface Plan {
    id: string;
    name: string;
    createdAt?: any;
    semesters?: any[];
}

export function usePlans() {
    const { user, loading: authLoading } = useAuth();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlans = useCallback(async () => {
        if (!user) {
            setPlans([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const token = await user.getIdToken();
            const response = await fetch('/api/v1/plans', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error?.message || 'Failed to fetch plans');
            }

            const data = await response.json();
            setPlans(data.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) {
            fetchPlans();
        }
    }, [authLoading, fetchPlans]);

    const createPlan = async (name: string) => {
        if (!user) throw new Error("Must be logged in to create a plan.");
        const token = await user.getIdToken();
        const response = await fetch('/api/v1/plans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error?.message || 'Failed to create plan');
        }

        // Re-fetch to seamlessly update the UI
        await fetchPlans();
    };

    const deletePlan = async (planId: string) => {
        if (!user) throw new Error("Must be logged in to delete a plan.");
        const token = await user.getIdToken();
        const response = await fetch(`/api/v1/plans/${planId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error?.message || 'Failed to delete plan');
        }

        // Remove from local state to be fast without re-fetching
        setPlans(prev => prev.filter(p => p.id !== planId));
    };

    return { plans, loading: loading || authLoading, error, createPlan, deletePlan };
}
