'use client';

import React, { useState, useMemo } from 'react';
import { useEvents, EventItem } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import * as ics from 'ics';
import { useRouter } from 'next/navigation';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function CalendarPage() {
    const { user, loading: authLoading } = useAuth();
    const { events, loading: eventsLoading, addEvent, updateEvent, deleteEvent } = useEvents();
    const router = useRouter();

    const [isAdding, setIsAdding] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    // Default to today's date in local time
    const todayStr = new Date().toLocaleDateString('en-CA'); // Gets YYYY-MM-DD correctly in local timezone

    const [newEvent, setNewEvent] = useState({
        title: '',
        date: todayStr,
        startTime: '10:00',
        endTime: '11:00',
        location: '',
        color: 'blue'
    });

    const handleEditEvent = (event: EventItem) => {
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        const dateStr = start.toLocaleDateString('en-CA');
        const startTimeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
        const endTimeStr = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

        setNewEvent({
            title: event.title,
            date: dateStr,
            startTime: startTimeStr,
            endTime: endTimeStr,
            location: event.location || '',
            color: event.color || 'blue'
        });
        setEditingEventId(event.id);
        setIsAdding(true);
    };

    const handleCancelForm = () => {
        setIsAdding(false);
        setEditingEventId(null);
        setNewEvent({ title: '', date: todayStr, startTime: '10:00', endTime: '11:00', location: '', color: 'blue' });
    };

    const processedEvents = useMemo(() => {
        if (!events || !Array.isArray(events)) return [];

        // Guard against corrupted database entries missing required fields
        const validEvents = events.filter(e => e && e.startTime && e.endTime);

        const enriched = validEvents.map(e => ({ ...e, startObj: new Date(e.startTime), endObj: new Date(e.endTime) }));
        enriched.sort((a, b) => a.startObj.getTime() - b.startObj.getTime());

        const finalEvents: (typeof enriched[0] & { overlapIndex: number; overlapTotal: number })[] = [];

        // Group events by day
        const eventsByDay: Record<string, typeof enriched> = {};
        for (const e of enriched) {
            const dayKey = e.startObj.toDateString(); // Use toDateString for local date comparison
            if (!eventsByDay[dayKey]) eventsByDay[dayKey] = [];
            eventsByDay[dayKey].push(e);
        }

        // Process each day for overlaps
        for (const dayKey in eventsByDay) {
            const dayEvents = eventsByDay[dayKey];
            const columns: typeof dayEvents[] = []; // Each column holds non-overlapping events

            for (const e of dayEvents) {
                let placed = false;
                // Try to place event in an existing column
                for (let i = 0; i < columns.length; i++) {
                    const col = columns[i];
                    // Check if event 'e' overlaps with any event in 'col'
                    const overlapsWithColumn = col.some(existingEvent =>
                        (e.startObj < existingEvent.endObj && e.endObj > existingEvent.startObj)
                    );

                    if (!overlapsWithColumn) {
                        col.push(e);
                        placed = true;
                        break;
                    }
                }
                // If it couldn't be placed, create a new column
                if (!placed) {
                    columns.push([e]);
                }
            }

            // Assign overlap properties to events
            for (let i = 0; i < columns.length; i++) {
                for (const e of columns[i]) {
                    finalEvents.push({ ...e, overlapIndex: i, overlapTotal: columns.length });
                }
            }
        }

        return finalEvents;
    }, [events]);

    if (authLoading || (!user && !authLoading)) {
        if (!authLoading && !user) router.push('/login');
        return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Calendar...</div>;
    }

    const handleExport = () => {
        if (events.length === 0) return alert('No events to export');

        const icsEvents: ics.EventAttributes[] = events.map(e => {
            const start = new Date(e.startTime);
            const end = new Date(e.endTime);
            return {
                title: e.title,
                start: [start.getFullYear(), start.getMonth() + 1, start.getDate(), start.getHours(), start.getMinutes()],
                end: [end.getFullYear(), end.getMonth() + 1, end.getDate(), end.getHours(), end.getMinutes()],
                location: e.location || '',
            };
        });

        const { error, value } = ics.createEvents(icsEvents);
        if (error || !value) {
            console.error(error);
            return alert('Failed to generate calendar file');
        }

        const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'neucourse-schedule.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const [year, month, day] = newEvent.date.split('-').map(Number);
        const [startH, startM] = newEvent.startTime.split(':').map(Number);
        const [endH, endM] = newEvent.endTime.split(':').map(Number);

        // Store dates in absolute local time using standard constructor
        const startTime = new Date(year, month - 1, day, startH, startM);
        const endTime = new Date(year, month - 1, day, endH, endM);

        try {
            if (editingEventId) {
                await updateEvent(editingEventId, {
                    title: newEvent.title,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    location: newEvent.location,
                    color: newEvent.color
                });
            } else {
                await addEvent({
                    title: newEvent.title,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    location: newEvent.location,
                    color: newEvent.color
                });
            }
            handleCancelForm();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            alert(message);
        }
    };

    const getEventStyle = (event: typeof processedEvents[0]) => {
        const start = event.startObj;
        const end = event.endObj;
        const dayIdx = start.getDay() === 0 ? 6 : start.getDay() - 1; // Mon = 0, Sun = 6
        const startHour = start.getHours() + (start.getMinutes() / 60);
        const endHour = end.getHours() + (end.getMinutes() / 60);

        const top = startHour * 60; // 60px per hour
        const height = (endHour - startHour) * 60;

        let bg = '#eff6ff', border = '#3b82f6', text = '#1e3a8a';
        if (event.color === 'red') { bg = '#fef2f2'; border = '#ef4444'; text = '#991b1b'; }
        else if (event.color === 'green') { bg = '#f0fdf4'; border = '#22c55e'; text = '#166534'; }
        else if (event.color === 'purple') { bg = '#faf5ff'; border = '#a855f7'; text = '#6b21a8'; }
        else if (event.color === 'pink') { bg = '#fdf2f8'; border = '#ec4899'; text = '#9d174d'; }
        else if (event.color === 'orange') { bg = '#fff7ed'; border = '#f97316'; text = '#c2410c'; }

        return {
            gridColumn: dayIdx + 2,
            top: `${top}px`,
            height: `${height}px`,
            backgroundColor: bg,
            borderLeft: `4px solid ${event.overlapTotal > 1 ? '#f97316' : border}`, // subtle orange left border if overlapping
            color: text,
        };
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="md:flex md:items-center md:justify-between mb-6">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            My Weekly Schedule
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4 gap-3">
                        {isAdding ? (
                            <button
                                onClick={handleCancelForm}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Add Event
                            </button>
                        )}
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Export .ics
                        </button>
                    </div>
                </div>

                {isAdding && (
                    <div className="bg-white p-4 shadow rounded-lg mb-6 border border-gray-200">
                        <h3 className="text-lg font-bold mb-4">{editingEventId ? 'Edit Event' : 'Add Event'}</h3>
                        <form onSubmit={handleAddSubmit} className="flex flex-wrap gap-4 items-end">
                            <div className="w-48">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input required type="text" className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md py-1.5 px-3 border border-gray-300" placeholder="e.g. CS 3500" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
                            </div>
                            <div className="w-40">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input required type="date" className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md py-1.5 px-3 border border-gray-300" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
                            </div>
                            <div className="w-24">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                                <input required type="time" className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md py-1.5 px-3 border border-gray-300" value={newEvent.startTime} onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })} />
                            </div>
                            <div className="w-24">
                                <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                                <input required type="time" className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md py-1.5 px-3 border border-gray-300" value={newEvent.endTime} onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })} />
                            </div>
                            <div className="w-40">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input type="text" className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md py-1.5 px-3 border border-gray-300" placeholder="e.g. ISEC 102" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} />
                            </div>
                            <div className="w-32">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color Theme</label>
                                <select className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md py-1.5 px-3 border border-gray-300" value={newEvent.color} onChange={e => setNewEvent({ ...newEvent, color: e.target.value })}>
                                    <option value="blue">Blue</option>
                                    <option value="red">Red</option>
                                    <option value="green">Green</option>
                                    <option value="purple">Purple</option>
                                    <option value="pink">Pink</option>
                                    <option value="orange">Orange</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors">
                                    {editingEventId ? 'Update Event' : 'Save'}
                                </button>
                                <button type="button" onClick={handleCancelForm} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm font-medium transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 flex flex-col">
                    <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-200 bg-gray-50">
                        <div className="p-3"></div>
                        {DAYS.map(day => (
                            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-900 border-l border-gray-200">
                                {day.substring(0, 3)}
                            </div>
                        ))}
                    </div>

                    <div className="relative overflow-y-auto" style={{ height: '600px' }}>
                        <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr]">
                            <div className="flex flex-col">
                                {HOURS.map(hour => {
                                    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                                    const ampm = hour >= 12 ? 'PM' : 'AM';
                                    return (
                                        <div key={hour} className="h-[60px] border-b border-gray-100 pr-2 pt-1 text-right text-xs font-medium text-gray-500">
                                            {displayHour} {ampm}
                                        </div>
                                    );
                                })}
                            </div>
                            {DAYS.map(day => (
                                <div key={`col-${day}`} className="border-l border-gray-100 relative">
                                    {HOURS.map(hour => (
                                        <div key={`cell-${day}-${hour}`} className="h-[60px] border-b border-gray-100"></div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="absolute top-0 left-0 right-0 grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] pointer-events-none">
                            <div className="col-start-2 col-end-9 relative pl-0.5 pr-0.5">
                                {!eventsLoading && processedEvents.map((event) => {
                                    if (!event || !event.startTime || !event.endTime) return null;

                                    const style = getEventStyle(event);

                                    // Calculate precise horizontal layout based on overlap
                                    const baseColWidth = 100 / 7;
                                    const overlapWidth = baseColWidth / event.overlapTotal;
                                    const leftPercentage = ((style.gridColumn - 2) * baseColWidth) + (overlapWidth * event.overlapIndex);

                                    return (
                                        <div
                                            key={event.id}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleEditEvent(event); }}
                                            className={`absolute rounded-md p-1.5 shadow-sm overflow-hidden text-xs pointer-events-auto group hover:z-10 transition-all opacity-95 hover:opacity-100 cursor-pointer ${event.overlapTotal > 1 ? 'ring-1 ring-orange-500/20' : ''}`}
                                            style={{
                                                ...style,
                                                left: `${leftPercentage}%`,
                                                width: `calc(${overlapWidth}% - 8px)`,
                                                marginLeft: '4px'
                                            }}
                                            title={event.title}
                                            onClick={() => handleEditEvent(event)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold truncate" style={{ color: style.color }}>{event.title}</span>
                                                <button
                                                    aria-label="Delete event"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm('Delete event?')) deleteEvent(event.id).catch(err => {
                                                            alert(err instanceof Error ? err.message : 'Unknown error');
                                                        });
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-600 focus:opacity-100 bg-white/50 rounded-full w-5 h-5 flex items-center justify-center shrink-0"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            {event.location && <div className="truncate mt-0.5 opacity-80" style={{ color: style.color }}>{event.location}</div>}
                                            {event.overlapTotal > 1 && (
                                                <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-orange-400 opacity-50" title="Overlapping event" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
