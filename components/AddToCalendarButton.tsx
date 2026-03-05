'use client';

import { useState } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { fetchCourseCached } from '@/hooks/useSingleCourse';
import { useEvents } from '@/hooks/useEvents';
import { parseMeetingTime } from '@/lib/parse-meeting-times';
import { nextDay, setHours, setMinutes, getDay } from 'date-fns';

const DAY_TO_INDEX: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
};

function getNextDateForDayAndTime(dayName: string, time24h: string): Date {
    const [hours, minutes] = time24h.split(':').map(Number);
    const now = new Date();
    const dayIndex = DAY_TO_INDEX[dayName];

    const targetDate = getDay(now) === dayIndex ? now : nextDay(now, dayIndex);
    return setMinutes(setHours(targetDate, hours), minutes);
}

interface AddToCalendarButtonProps {
    courseId: string;
    crn: string;
    courseName: string;
}

export function AddToCalendarButton({ courseId, crn, courseName }: AddToCalendarButtonProps) {
    const { addEvent } = useEvents();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleClick = async () => {
        setIsLoading(true);
        setStatus('idle');
        setErrorMsg('');

        try {
            const course = await fetchCourseCached(courseId);
            const section = course?.sections?.find((sec: any) => sec.crn === crn);

            if (!section) {
                setStatus('error');
                setErrorMsg('Section not found');
                return;
            }

            const parsed = parseMeetingTime(section.meetingTimes);
            if (!parsed) {
                setStatus('error');
                setErrorMsg('Cannot parse schedule');
                return;
            }

            for (const day of parsed.days) {
                const start = getNextDateForDayAndTime(day, parsed.startTime).toISOString();
                const end = getNextDateForDayAndTime(day, parsed.endTime).toISOString();

                await addEvent({
                    title: courseName,
                    startTime: start,
                    endTime: end,
                    location: section.rooms || '',
                    color: 'blue',
                });
            }

            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
            }, 2000);
        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMsg('Failed to add events');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center space-x-2 mt-2">
            <button
                onClick={handleClick}
                disabled={isLoading || status === 'success'}
                aria-label="Add course schedule to calendar"
                className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors"
            >
                <CalendarIcon className="w-4 h-4" />
                <span>{isLoading ? 'Adding...' : 'Add to Calendar'}</span>
            </button>
            {status === 'success' && <span className="text-xs text-green-600 font-medium">Added to calendar!</span>}
            {status === 'error' && <span className="text-xs text-red-600 font-medium">{errorMsg}</span>}
        </div>
    );
}
