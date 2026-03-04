'use client';

import React, { useState } from 'react';
import { useEvents, EventItem } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import * as ics from 'ics';
import { useRouter } from 'next/navigation';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

export default function CalendarPage() {
    const { user, loading: authLoading } = useAuth();
    const { events, loading: eventsLoading, addEvent, deleteEvent } = useEvents();
    const router = useRouter();

    const [isAdding, setIsAdding] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', day: 'Monday', startTime: '10:00', endTime: '11:00', location: '', color: 'blue' });

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
        const dayMap: Record<string, number> = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
        const now = new Date();
        const nextDay = new Date(now);
        nextDay.setDate(now.getDate() + (dayMap[newEvent.day] + 7 - now.getDay()) % 7);

        const [startH, startM] = newEvent.startTime.split(':').map(Number);
        const [endH, endM] = newEvent.endTime.split(':').map(Number);

        const startTime = new Date(nextDay);
        startTime.setHours(startH, startM, 0, 0);

        const endTime = new Date(nextDay);
        endTime.setHours(endH, endM, 0, 0);

        try {
            await addEvent({
                title: newEvent.title,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                location: newEvent.location,
                color: newEvent.color
            });
            setIsAdding(false);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const getEventStyle = (event: EventItem) => {
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        const dayIdx = start.getDay() === 0 ? 6 : start.getDay() - 1; // Mon = 0
        const startHour = start.getHours() + (start.getMinutes() / 60);
        const endHour = end.getHours() + (end.getMinutes() / 60);

        const top = (startHour - 8) * 60; // 60px per hour
        const height = (endHour - startHour) * 60;

        return {
            gridColumn: dayIdx + 2,
            top: `${top}px`,
            height: `${height}px`,
            backgroundColor: event.color === 'blue' ? '#eff6ff' : event.color === 'red' ? '#fef2f2' : '#f0fdf4',
            borderLeft: `4px solid ${event.color === 'blue' ? '#3b82f6' : event.color === 'red' ? '#ef4444' : '#22c55e'}`,
            color: event.color === 'blue' ? '#1e3a8a' : event.color === 'red' ? '#991b1b' : '#166534',
        };
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        My Weekly Schedule
                    </h2>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4 gap-3">
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {isAdding ? 'Cancel Event' : 'Add Event'}
                    </button>
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
                    <h3 className="text-lg font-bold mb-4">New Course Schedule Block</h3>
                    <form onSubmit={handleAddSubmit} className="flex flex-wrap gap-4 items-end">
                        <div className="w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input required type="text" className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md py-1.5 px-3 border border-gray-300" placeholder="e.g. CS 3500" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
                        </div>
                        <div className="w-32">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                            <select className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md py-1.5 px-3 border border-gray-300" value={newEvent.day} onChange={e => setNewEvent({ ...newEvent, day: e.target.value })}>
                                {DAYS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="w-24">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                            <input required type="time" className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md py-1.5 px-3 border border-gray-300" value={newEvent.startTime} onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })} />
                        </div>
                        <div className="w-24">
                            <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                            <input required type="time" className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md py-1.5 px-3 border border-gray-300" value={newEvent.endTime} onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })} />
                        </div>
                        <div className="w-32">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color Theme</label>
                            <select className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md py-1.5 px-3 border border-gray-300" value={newEvent.color} onChange={e => setNewEvent({ ...newEvent, color: e.target.value })}>
                                <option value="blue">Blue</option>
                                <option value="red">Red</option>
                                <option value="green">Green</option>
                            </select>
                        </div>
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors">Save</button>
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
                            {HOURS.map(hour => (
                                <div key={hour} className="h-[60px] border-b border-gray-100 pr-2 pt-1 text-right text-xs font-medium text-gray-500">
                                    {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                                </div>
                            ))}
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
                            {!eventsLoading && events.map((event) => {
                                if (!event || !event.startTime || !event.endTime) return null;

                                const style = getEventStyle(event);
                                const leftPercentage = ((style.gridColumn - 2) / 7) * 100;
                                const widthPercentage = 100 / 7;

                                return (
                                    <div
                                        key={event.id}
                                        className="absolute rounded-md p-1.5 shadow-sm overflow-hidden text-xs pointer-events-auto group hover:z-10 transition-all opacity-95 hover:opacity-100"
                                        style={{
                                            ...style,
                                            left: `${leftPercentage}%`,
                                            width: `calc(${widthPercentage}% - 8px)`,
                                            marginLeft: '4px'
                                        }}
                                        title={`${event.title}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold truncate" style={{ color: style.color }}>{event.title}</span>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Delete event?')) deleteEvent(event.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-600 focus:opacity-100"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        {event.location && <div className="truncate mt-0.5 opacity-80" style={{ color: style.color }}>{event.location}</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
