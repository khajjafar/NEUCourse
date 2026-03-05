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
    { name: 'Red', value: '#dc2626' },
    { name: 'Dark Red', value: '#991b1b' },
    { name: 'Black', value: '#171717' },
    { name: 'Charcoal', value: '#3f3f46' },
    { name: 'Gray', value: '#6b7280' },
    { name: 'Light Gray', value: '#9ca3af' },
    { name: 'Slate', value: '#334155' },
    { name: 'Dark Slate', value: '#0f172a' },
];

export default function EventForm({ initialData, onSubmit, onCancel, onDelete }: EventFormProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [type, setType] = useState<'single' | 'recurring'>(initialData?.type || 'recurring');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(initialData?.startDate || '');
    const [endDate, setEndDate] = useState(initialData?.endDate || '');
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
            setType(initialData.type || 'recurring');
            if (initialData.date) setDate(initialData.date);
            if (initialData.startDate) setStartDate(initialData.startDate);
            if (initialData.endDate) setEndDate(initialData.endDate);
            setDays(initialData.days || []);
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

        if (type === 'recurring' && days.length === 0) {
            setError('At least one day must be selected for recurring events.');
            return;
        }

        if (type === 'single' && !date) {
            setError('A valid date must be provided for a single event.');
            return;
        }

        if (type === 'recurring' && startDate && endDate) {
            if (new Date(endDate) < new Date(startDate)) {
                setError('End Date cannot be before Start Date.');
                return;
            }
        }

        if (!validateTime()) {
            setError('End time must be after start time.');
            return;
        }

        try {
            setLoading(true);
            await onSubmit({
                title: title.trim(),
                type,
                date: type === 'single' ? date : undefined,
                startDate: (type === 'recurring' && startDate) ? startDate : undefined,
                endDate: (type === 'recurring' && endDate) ? endDate : undefined,
                days: type === 'recurring' ? days : [],
                startTime,
                endTime,
                location: location.trim(),
                color
            });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save event');
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
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to delete event');
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
                                className="mt-1 block w-full rounded-md border text-black border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                placeholder="e.g. Object-Oriented Design"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                            <div className="flex gap-4">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="radio" className="form-radio text-red-600 focus:ring-red-500" name="type" checked={type === 'single'} onChange={() => setType('single')} />
                                    <span className="ml-2">Single Event</span>
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="radio" className="form-radio text-red-600 focus:ring-red-500" name="type" checked={type === 'recurring'} onChange={() => setType('recurring')} />
                                    <span className="ml-2">Recurring Event</span>
                                </label>
                            </div>
                        </div>

                        {type === 'single' ? (
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                                <input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="mt-1 block w-full text-black rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    required
                                />
                            </div>
                        ) : (
                            <>
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
                                                    ? 'bg-red-100 text-red-800 ring-2 ring-red-600 ring-offset-1'
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
                                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date (Optional)</label>
                                        <input
                                            id="startDate"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="mt-1 block w-full text-black rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                                        <input
                                            id="endDate"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="mt-1 block w-full text-black rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

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
                                    className="mt-1 block w-full text-black rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
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
