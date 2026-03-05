'use client';

import React, { useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import EventForm from '@/components/EventForm';
import ExportCalendarButton from '@/components/ExportCalendarButton';
import { useCalendarEvents, CalendarEvent } from '@/hooks/useCalendarEvents';

export default function CalendarPage() {
    const { events, loading, error, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const handleAddClick = () => {
        setEditingEvent(null);
        setIsFormOpen(true);
    };

    const handleEditEvent = (event: CalendarEvent) => {
        setEditingEvent(event);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingEvent(null);
    };

    const handleFormSubmit = async (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingEvent) {
            await updateEvent(editingEvent.id, data);
        } else {
            await createEvent(data);
        }
        handleCloseForm();
    };

    const handleFormDelete = async (id: string) => {
        await deleteEvent(id);
        handleCloseForm();
    };

    if (loading) {
        return (
            <AuthGuard>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            </AuthGuard>
        );
    }

    if (error) {
        return (
            <AuthGuard>
                <div className="p-8 text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Calendar</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Weekly Calendar</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage your weekly classes and activities.
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <ExportCalendarButton events={events} />
                        <button
                            onClick={handleAddClick}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Event
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={goToPreviousWeek}
                            className="p-2 border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                            aria-label="Previous Week"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <button
                            onClick={goToToday}
                            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={goToNextWeek}
                            className="p-2 border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                            aria-label="Next Week"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>

                <WeeklyCalendar events={events} onEditEvent={handleEditEvent} baseDate={currentDate} />

                {isFormOpen && (
                    <EventForm
                        initialData={editingEvent}
                        onSubmit={handleFormSubmit}
                        onCancel={handleCloseForm}
                        onDelete={editingEvent ? handleFormDelete : undefined}
                    />
                )}
            </div>
        </AuthGuard>
    );
}
