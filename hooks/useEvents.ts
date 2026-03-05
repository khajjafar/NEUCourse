import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface EventItem {
    id: string;
    title: string;
    startTime: string; // ISO string
    endTime: string;
    location?: string;
    color?: string;
}

export function useEvents() {
    const { user, loading: authLoading } = useAuth();
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = useCallback(async () => {
        if (!user) {
            setEvents([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const token = await user.getIdToken();
            const res = await fetch('/api/v1/events', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch events');

            setEvents(data.data || []);
        } catch (err: any) {
            console.error('Events fetch error:', err);
            setError(err.message || 'Failed to fetch events');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) {
            fetchEvents();
        }
    }, [authLoading, fetchEvents]);

    const addEvent = async (eventData: Omit<EventItem, 'id'>) => {
        if (!user) throw new Error("Must be logged in to add an event");
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/v1/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Failed to add event');

            setEvents(prev => [...prev, data.data]);
            return data.data;
        } catch (err: any) {
            console.error('Failed to add event:', err);
            throw err;
        }
    };

    const deleteEvent = async (eventId: string) => {
        if (!user) throw new Error("Must be logged in to delete an event");
        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/v1/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Failed to delete event');

            setEvents(prev => prev.filter(e => e.id !== eventId));
        } catch (err: any) {
            console.error('Failed to delete event:', err);
            throw err;
        }
    };

    return { events, loading, error, addEvent, deleteEvent, refreshEvents: fetchEvents };
}
