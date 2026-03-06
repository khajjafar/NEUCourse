import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GraduationRequirement } from '@/hooks/usePlans';

export interface UserProfile {
    requirements?: GraduationRequirement[];
}

export function useUserProfile() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const token = await user.getIdToken();
            const response = await fetch('/api/v1/profile', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error?.message || 'Failed to fetch user profile');
            }

            const data = await response.json();
            setProfile(data.data || {});
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) {
            fetchProfile();
        }
    }, [authLoading, fetchProfile]);

    const updateRequirements = async (requirements: GraduationRequirement[]) => {
        if (!user) throw new Error("Must be logged in to update requirements.");

        // Optimistic UI update
        const previousProfile = profile;
        setProfile(prev => ({ ...prev, requirements }));

        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/v1/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ requirements })
            });

            if (!response.ok) {
                throw new Error('Failed to update requirements');
            }
        } catch (err) {
            console.error('Failed to update requirements:', err);
            // Revert on failure
            setProfile(previousProfile);
            throw err;
        }
    };

    return { profile, loading: loading || authLoading, error, updateRequirements };
}
