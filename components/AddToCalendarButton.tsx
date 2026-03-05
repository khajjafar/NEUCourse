'use client';

import React, { useState } from 'react';
import EventForm from './EventForm';
import { useCalendarEvents, CalendarEvent } from '@/hooks/useCalendarEvents';
import { parseMeetingTime } from '@/lib/parse-meeting-times';

interface ClassSection {
    crn: string;
    seats: string;
    meetingTimes: string;
    rooms: string;
    professor: string;
    campus: string;
}

interface AddToCalendarButtonProps {
    courseId: string;
    courseName: string;
    section: ClassSection;
}

export default function AddToCalendarButton({ courseId, courseName, section }: AddToCalendarButtonProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { createEvent } = useCalendarEvents();
    const parsedTime = parseMeetingTime(section.meetingTimes);

    // If we can't parse it (e.g., TBA), disable the button or handle it
    const isParseable = parsedTime !== null;

    const initialEventData: CalendarEvent | null = isParseable ? {
        id: '', // Temporary empty string, will be omitted in createEvent
        title: `${courseId}`, // Requirement says "{subject} {number}" which is passed in as courseId like "CS 2500"
        type: 'recurring',
        days: parsedTime!.days,
        startTime: parsedTime!.startTime,
        endTime: parsedTime!.endTime,
        location: section.rooms || '',
        color: '#4f46e5', // INDIGO-600
    } : null;

    const handleSubmit = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            await createEvent(eventData);
            setIsFormOpen(false);
            alert(`Added ${courseId} to your calendar!`);
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Failed to add event');
        }
    };

    return (
        <>
            <button
                type="button"
                className="inline-flex items-center justify-center p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setIsFormOpen(true)}
                disabled={!isParseable}
                title={isParseable ? "Add to Calendar" : "Time TBA - Cannot add to calendar"}
                aria-label="Add course section to calendar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                </svg>
            </button>

            {isFormOpen && initialEventData && (
                <EventForm
                    initialData={initialEventData}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}
        </>
    );
}
