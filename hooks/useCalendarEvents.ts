import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface CalendarEvent {
    id: string;
    title: string;
    days: string[];
    startTime: string; // "HH:mm" in 24h
    endTime: string; // "HH:mm" in 24h
    location?: string;
    color?: string;
    createdAt?: any;
    updatedAt?: any;
}

export function useCalendarEvents() {
    const { user, loading: authLoading } = useAuth();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
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
            const response = await fetch('/api/v1/events', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error?.message || 'Failed to fetch events');
            }

            const data = await response.json();
            setEvents(data.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) {
            fetchEvents();
        }
    }, [authLoading, fetchEvents]);

    const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!user) throw new Error("Must be logged in to create an event.");
        const token = await user.getIdToken();
        const response = await fetch('/api/v1/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error?.message || 'Failed to create event');
        }

        await fetchEvents();
    };

    const updateEvent = async (eventId: string, eventData: Partial<Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>>) => {
        if (!user) throw new Error("Must be logged in to update an event.");
        const token = await user.getIdToken();
        const response = await fetch(`/api/v1/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error?.message || 'Failed to update event');
        }

        await fetchEvents();
    };

    const deleteEvent = async (eventId: string) => {
        if (!user) throw new Error("Must be logged in to delete an event.");
        const token = await user.getIdToken();
        const response = await fetch(`/api/v1/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error?.message || 'Failed to delete event');
        }

        setEvents(prev => prev.filter(e => e.id !== eventId));
    };

    return { events, loading: loading || authLoading, error, createEvent, updateEvent, deleteEvent, refetch: fetchEvents };
}
