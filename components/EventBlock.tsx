import React from 'react';
import { CalendarEvent } from '@/hooks/useCalendarEvents';

interface EventBlockProps {
    event: CalendarEvent;
    onEdit: (event: CalendarEvent) => void;
    overlapIndex: number; // 0 for no overlap, 1 for 2nd block, etc.
    totalOverlap: number; // Total number of blocks overlapping this timeframe
}

export default function EventBlock({ event, onEdit, overlapIndex, totalOverlap }: EventBlockProps) {
    // Time format: "HH:mm" (24h). Day starts at 7:00 (7 AM)
    const START_HOUR = 7;
    const END_HOUR = 22; // 10 PM
    const TOTAL_HOURS = END_HOUR - START_HOUR;

    const parseTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours + minutes / 60;
    };

    const start = parseTime(event.startTime);
    const end = parseTime(event.endTime);

    // If event is totally out of bounds, hide it or clamp it. Clamping to bounds:
    const effectiveStart = Math.max(START_HOUR, start);
    const effectiveEnd = Math.min(END_HOUR, end);

    if (effectiveStart >= effectiveEnd) return null; // Outside display area

    const topPercentage = ((effectiveStart - START_HOUR) / TOTAL_HOURS) * 100;
    const heightPercentage = ((effectiveEnd - effectiveStart) / TOTAL_HOURS) * 100;

    // Handle horizontal overlapping visually
    const widthPercentage = 100 / totalOverlap;
    const leftPercentage = overlapIndex * widthPercentage;

    const bgColor = event.color || '#4f46e5'; // default indigo-600

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`Edit ${event.title}`}
            className="absolute rounded-md p-1 shadow-sm border border-white/20 overflow-hidden cursor-pointer hover:brightness-110 transition-all text-white text-xs leading-tight z-10"
            style={{
                top: `${topPercentage}%`,
                height: `${heightPercentage}%`,
                left: `${leftPercentage}%`,
                width: `${widthPercentage}%`,
                backgroundColor: bgColor,
            }}
            onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    onEdit(event);
                }
            }}
        >
            <div className="font-semibold truncate">{event.title}</div>
            <div className="truncate opacity-90">{event.startTime} - {event.endTime}</div>
            {event.location && <div className="truncate opacity-75">{event.location}</div>}
        </div>
    );
}
