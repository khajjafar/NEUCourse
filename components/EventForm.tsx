import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '@/hooks/useCalendarEvents';

interface EventFormProps {
    initialData?: CalendarEvent | null;
    onSubmit: (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void> | void;
    onCancel: () => void;
    onDelete?: (id: string) => Promise<void> | void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PRESET_COLORS = [
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Gray', value: '#6b7280' },
];

export default function EventForm({ initialData, onSubmit, onCancel, onDelete }: EventFormProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [days, setDays] = useState<string[]>(initialData?.days || []);
    const [startTime, setStartTime] = useState(initialData?.startTime || '09:00');
    const [endTime, setEndTime] = useState(initialData?.endTime || '10:00');
    const [location, setLocation] = useState(initialData?.location || '');
    const [color, setColor] = useState(initialData?.color || PRESET_COLORS[0].value);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDays(initialData.days);
            setStartTime(initialData.startTime);
            setEndTime(initialData.endTime);
            setLocation(initialData.location || '');
            setColor(initialData.color || PRESET_COLORS[0].value);
        }
    }, [initialData]);

    const toggleDay = (day: string) => {
        setDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const validateTime = () => {
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        return end > start;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError('Title is required.');
            return;
        }

        if (days.length === 0) {
            setError('At least one day must be selected.');
            return;
        }

        if (!validateTime()) {
            setError('End time must be after start time.');
            return;
        }

        try {
            setLoading(true);
            await onSubmit({ title: title.trim(), days, startTime, endTime, location: location.trim(), color });
        } catch (err: any) {
            setError(err.message || 'Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData || !onDelete) return;
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                setLoading(true);
                await onDelete(initialData.id);
            } catch (err: any) {
                setError(err.message || 'Failed to delete event');
                setLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit Event' : 'Add Event'}</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="e.g. Object-Oriented Design"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS_OF_WEEK.map(day => (
                                    <label key={day} className="inline-flex items-center cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            aria-label={day}
                                            checked={days.includes(day)}
                                            onChange={() => toggleDay(day)}
                                        />
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${days.includes(day)
                                            ? 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-600 ring-offset-1'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}>
                                            {day.substring(0, 3)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                                <input
                                    id="startTime"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="mt-1 block w-full text-black rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                                <input
                                    id="endTime"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="mt-1 block w-full text-black rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location (Optional)</label>
                            <input
                                id="location"
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="mt-1 block w-full text-black rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="e.g. Richards Hall 101"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                            <div className="flex gap-2">
                                {PRESET_COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        aria-label={`Select color ${c.name}`}
                                        className={`w-8 h-8 rounded-full shadow-sm cursor-pointer transition-transform hover:scale-110 ${color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                                            }`}
                                        style={{ backgroundColor: c.value }}
                                        onClick={() => setColor(c.value)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-gray-200 mt-6">
                            {initialData && onDelete ? (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                                >
                                    Delete
                                </button>
                            ) : (
                                <div></div> // empty spacer
                            )}
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Saving...' : 'Save Event'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
