import { EventAttributes, createEvents } from 'ics';
import { CalendarEvent } from '@/hooks/useCalendarEvents';

const DAY_OFFSETS: Record<string, number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
};

/**
 * Parses a 24-hour time string "HH:MM" into [hours, minutes].
 */
const parseTime = (timeStr: string): [number, number] | null => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return [hours, minutes];
};

/**
 * Generates an ICS file content string containing all occurrences of the given calendar events.
 */
export function generateICSFile(events: CalendarEvent[], semesterStartDate: Date, weekCount: number): string | null {
    if (!events || events.length === 0) return null;

    const exportEvents: EventAttributes[] = [];

    // Normalize semester start to midnight to avoid timezone shifting issues during day additions
    const baseStart = new Date(
        semesterStartDate.getFullYear(),
        semesterStartDate.getMonth(),
        semesterStartDate.getDate()
    );

    const baseDayOfWeek = baseStart.getDay();

    for (const event of events) {
        // Skip events without required fields
        if (!event.days || event.days.length === 0) continue;

        const startTime = parseTime(event.startTime);
        const endTime = parseTime(event.endTime);

        if (!startTime || !endTime) continue;

        for (const day of event.days) {
            const targetDayOffset = DAY_OFFSETS[day];
            if (targetDayOffset === undefined) continue;

            // Calculate the first occurrence of this day of the week on or after semesterStart
            // For example, if semester starts on a Tuesday (day 2), and we want a Monday (day 1),
            // the offset should wrap around to the next week (+6 days).
            let daysUntilFirstOccurrence = targetDayOffset - baseDayOfWeek;
            if (daysUntilFirstOccurrence < 0) {
                daysUntilFirstOccurrence += 7;
            }

            // Generate occurrences for each week
            for (let week = 0; week < weekCount; week++) {
                const occurrenceDate = new Date(baseStart);
                occurrenceDate.setDate(baseStart.getDate() + daysUntilFirstOccurrence + (week * 7));

                const y = occurrenceDate.getFullYear();
                const m = occurrenceDate.getMonth() + 1; // ics uses 1-indexed months
                const d = occurrenceDate.getDate();

                const exportEvent: EventAttributes = {
                    start: [y, m, d, startTime[0], startTime[1]],
                    end: [y, m, d, endTime[0], endTime[1]],
                    title: event.title,
                };

                if (event.location) {
                    exportEvent.location = event.location;
                }

                exportEvents.push(exportEvent);
            }
        }
    }

    if (exportEvents.length === 0) return null;

    const { error, value } = createEvents(exportEvents);

    if (error) {
        console.error('Error generating ICS file:', error);
        return null;
    }

    return value || null;
}

/**
 * Triggers a browser download of the given string content as a file.
 */
export function downloadICSFile(content: string, filename: string): void {
    if (typeof window === 'undefined') return;

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
