/**
 * @fileoverview Hook for managing the authenticated user's calendar events.
 *
 * Fetches events from GET /api/v1/events on mount and after mutations.
 * Provides addEvent, updateEvent, and deleteEvent for CRUD operations,
 * all of which include the Firebase JWT in the Authorization header.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

/** A single calendar event as stored in Firestore. */
export interface EventItem {
    id: string;
    title: string;
    startTime: string; // ISO string
    endTime: string;
    location?: string;
    color?: string;
}

/**
 * Provides calendar event state and CRUD operations for the authenticated user.
 *
 * @returns events array, loading/error state, addEvent, updateEvent, deleteEvent,
 *          and refreshEvents for manual refetch
 */
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
        } catch (err: unknown) {
            console.error('Events fetch error:', err);
            const message = err instanceof Error ? err.message : 'Failed to fetch events';
            setError(message);
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
        } catch (err: unknown) {
            console.error('Failed to add event:', err);
            throw err;
        }
    };

    const updateEvent = async (eventId: string, eventData: Partial<EventItem>) => {
        if (!user) throw new Error("Must be logged in to update an event");
        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/v1/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Failed to update event');

            await fetchEvents();
            return data.data;
        } catch (err: unknown) {
            console.error('Failed to update event:', err);
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
        } catch (err: unknown) {
            console.error('Failed to delete event:', err);
            throw err;
        }
    };

    return { events, loading, error, addEvent, updateEvent, deleteEvent, refreshEvents: fetchEvents };
}
