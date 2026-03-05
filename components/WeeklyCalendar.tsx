import React from 'react';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import EventBlock from './EventBlock';

interface WeeklyCalendarProps {
    events: CalendarEvent[];
    onEditEvent: (event: CalendarEvent) => void;
    baseDate?: Date;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const START_HOUR = 0;
const END_HOUR = 24;

export default function WeeklyCalendar({ events, onEditEvent, baseDate = new Date() }: WeeklyCalendarProps) {
    // Generate hours array [7, 8, 9, ... 21]
    const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);

    const formatHour = (hour: number) => {
        if (hour === 0 || hour === 24) return '12 AM';
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h = hour % 12 || 12;
        return `${h} ${ampm}`;
    };

    // Get Monday of the current week
    const getMonday = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    const monday = getMonday(baseDate);

    // Generate dates for the week
    const weekDates = DAYS_OF_WEEK.map((dayName, index) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + index);
        return {
            name: dayName,
            date: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
            dateObj: d
        };
    });

    // Calculate overlapping events to render them properly
    // Takes all events for a specific day, groups overlaps
    const getEventsForDay = (weekDateObj: Date, dayName: string) => {
        // We use local formatting to avoid timezone shift issues from ISOString
        const year = weekDateObj.getFullYear();
        const month = String(weekDateObj.getMonth() + 1).padStart(2, '0');
        const dStr = String(weekDateObj.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dStr}`;

        const dayEvents = events.filter(e => {
            // For backwards compatibility
            if (!e.type) {
                return e.days && e.days.includes(dayName);
            }

            if (e.type === 'single') {
                return e.date === dateStr;
            }

            if (e.type === 'recurring') {
                if (!e.days?.includes(dayName)) return false;
                if (e.startDate && dateStr < e.startDate) return false;
                if (e.endDate && dateStr > e.endDate) return false;
                return true;
            }

            return false;
        });

        // A very naive overlap detection: we just assign overlapIndex and totalOverlap 
        // by finding how many events overlap at the exact same start time, or just rendering side by side.
        // For simplicity, we find truly overlapping clustered groups.

        // Better yet, full overlap resolution:
        // We can just iterate through and check raw overlap count.
        const sorted = [...dayEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));

        return sorted.map((event, index, array) => {
            // Check overlaps with others
            const overlaps = array.filter(other => {
                if (other.id === event.id) return false;
                return (other.startTime < event.endTime && other.endTime > event.startTime);
            });

            // To simplify formatting we just use its position in the chronological list and total count of local clustered overlaps.
            // Using a simple index grouping if overlapping
            const overlapIndex = overlaps.filter(o => o.startTime < event.startTime || (o.startTime === event.startTime && o.id < event.id)).length;
            const totalOverlap = overlaps.length + 1; // Itself + overlaps

            return {
                event,
                overlapIndex,
                totalOverlap
            };
        });
    };

    return (
        <div className="flex flex-col h-[800px] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Header / Days */}
            <div className="flex border-b border-gray-200 text-gray-700 bg-gray-50 flex-none font-medium">
                <div className="w-16 flex-none border-r border-gray-200"></div> {/* Time axis corner */}
                <div className="flex flex-1">
                    {weekDates.map((day) => (
                        <div key={day.name} className="flex-1 text-center py-2 border-r border-gray-200 last:border-r-0">
                            <div>{day.name}</div>
                            <div className="text-sm font-normal text-gray-500">{day.date}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex flex-1 overflow-y-auto relative bg-white">
                {/* Time Axis */}
                <div className="w-16 flex-none border-r border-gray-200 text-xs text-gray-500 bg-white relative">
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            style={{ height: '60px' }} // fixed height per hour -> total (22-7)*60 = 900px scrollable
                            className="relative border-b border-transparent pr-2 text-right top-[-8px]"
                        >
                            {formatHour(hour)}
                        </div>
                    ))}
                </div>

                {/* Grid Content */}
                <div className="flex flex-1 relative" style={{ height: `${(END_HOUR - START_HOUR) * 60}px` }}>
                    {/* Background lines */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col">
                        {hours.map((hour) => (
                            <div key={hour} className="h-[60px] border-t border-gray-100 w-full" />
                        ))}
                    </div>

                    {/* Columns per day */}
                    <div className="absolute inset-0 flex">
                        {weekDates.map((day) => (
                            <div key={day.name} className="flex-1 border-r border-gray-100 last:border-r-0 relative">
                                {getEventsForDay(day.dateObj, day.name).map(({ event, overlapIndex, totalOverlap }) => (
                                    <EventBlock
                                        key={event.id}
                                        event={event}
                                        onEdit={onEditEvent}
                                        overlapIndex={overlapIndex}
                                        totalOverlap={totalOverlap}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
