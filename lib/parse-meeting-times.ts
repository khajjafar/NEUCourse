export function parseMeetingTime(meetingTimeStr: string): { days: string[], startTime: string, endTime: string } | null {
    if (!meetingTimeStr || meetingTimeStr.trim().length === 0 || meetingTimeStr.toUpperCase() === 'TBA') {
        return null;
    }

    // Format usually looks like "MWF 10:30am - 11:35am" or "TR 1:35pm - 3:15pm"
    // Handle split by space. Let's find the time part and the days part.
    // Days normally appear first. 
    // Wait, let's use a regex to be more robust.
    // Expected pattern: [Days] [StartTime] - [EndTime]
    // Example: "MWF 10:30am - 11:35am", "TR 1:35pm - 3:15pm", "M 9:00am - 10:00am"

    const regex = /^([MTWRFSU]+)\s+(\d{1,2}:\d{2}(?:am|pm)?)\s*-\s*(\d{1,2}:\d{2}(?:am|pm)?)$/i;
    const match = meetingTimeStr.trim().match(regex);

    if (!match) {
        return null;
    }

    const [, daysStr, startStr, endStr] = match;

    const daysMap: Record<string, string> = {
        'M': 'Monday',
        'T': 'Tuesday',
        'W': 'Wednesday',
        'R': 'Thursday',
        'F': 'Friday',
        'S': 'Saturday',
        'U': 'Sunday'
    };

    const parsedDays: string[] = [];
    for (const char of daysStr.toUpperCase()) {
        if (daysMap[char]) {
            parsedDays.push(daysMap[char]);
        }
    }

    if (parsedDays.length === 0) {
        return null; // invalid days
    }

    const parseTime = (timeStr: string): string => {
        // e.g. "10:30am", "1:35pm", "12:00pm"
        // Sometimes it could be just "10:30" if am/pm is omitted, but usually it has it.
        const tMatch = timeStr.toLowerCase().match(/^(\d{1,2}):(\d{2})(am|pm)?$/);
        if (!tMatch) return "00:00"; // Fallback, though regex should guarantee form

        let hours = parseInt(tMatch[1], 10);
        const mins = tMatch[2];
        const period = tMatch[3]; // 'am' or 'pm' or undefined

        if (period === 'pm' && hours < 12) {
            hours += 12;
        } else if (period === 'am' && hours === 12) {
            hours = 0;
        }

        const formattedHours = hours.toString().padStart(2, '0');
        return `${formattedHours}:${mins}`;
    };

    const startTime = parseTime(startStr);
    const endTime = parseTime(endStr);

    return {
        days: parsedDays,
        startTime,
        endTime
    };
}
