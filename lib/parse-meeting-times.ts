const DAY_MAP: Record<string, string> = {
    M: 'Monday',
    T: 'Tuesday',
    W: 'Wednesday',
    R: 'Thursday', // Backwards compatibility for MTWRF
    TH: 'Thursday', // New format support
    F: 'Friday',
    S: 'Saturday',
    U: 'Sunday',
};

function convertTime12to24(time12h: string): string {
    // Remove spaces before am/pm
    const cleaned = time12h.replace(/\s+/g, '').toLowerCase();
    const match = cleaned.match(/^(\d{1,2}):(\d{2})(am|pm)$/);
    if (!match) return time12h;

    const [, hoursStr, minutes, modifier] = match;
    let hours = parseInt(hoursStr, 10);

    if (hours === 12) {
        hours = modifier === 'am' ? 0 : 12;
    } else if (modifier === 'pm') {
        hours += 12;
    }

    const hours24 = hours.toString().padStart(2, '0');
    return `${hours24}:${minutes}`;
}

export interface ParsedMeetingTime {
    days: string[];
    startTime: string;
    endTime: string;
}

export function parseMeetingTime(meetingTimeStr: string): ParsedMeetingTime[] | null {
    if (!meetingTimeStr || meetingTimeStr.trim().toUpperCase() === 'TBA') {
        return null;
    }

    // Split by semicolons for multiple schedule segments (e.g. Lecture and Lab)
    const schedules = meetingTimeStr.split(';');
    const results: ParsedMeetingTime[] = [];

    for (const schedule of schedules) {
        // Normalize: replace en-dash/em-dash with hyphen, collapse whitespace
        const normalized = schedule
            .trim()
            .replace(/[\u2013\u2014]/g, '-')
            .replace(/\s+/g, ' ');

        // Regex to match:
        // 1: days (M, T, W, R, F, S, U, Th, comma-separated or space-separated or tight)
        // 2: start time (1:35 pm or 1:35pm)
        // 3: end time (2:40 pm or 2:40pm)
        const match = normalized.match(/^([^\d]+?)\s+(\d{1,2}:\d{2}\s*[aApP]\s*[mM])\s*-\s*(\d{1,2}:\d{2}\s*[aApP]\s*[mM])$/);

        // Try tight match without space between days and time
        const tightMatch = normalized.match(/^([^\d]+)(\d{1,2}:\d{2}\s*[aApP]\s*[mM])\s*-\s*(\d{1,2}:\d{2}\s*[aApP]\s*[mM])$/);

        let daysStr = '';
        let startTime12 = '';
        let endTime12 = '';

        if (match) {
            daysStr = match[1];
            startTime12 = match[2];
            endTime12 = match[3];
        } else if (tightMatch) {
            daysStr = tightMatch[1];
            startTime12 = tightMatch[2];
            endTime12 = tightMatch[3];
        } else {
            // Unparseable segment, skip to next
            continue;
        }

        // Parse days. They might be comma separated "M,W,Th", or tight "MTWRF"
        let days: string[] = [];

        if (daysStr.includes(',')) {
            days = daysStr.split(',')
                .map(d => d.trim().toUpperCase())
                .map(d => DAY_MAP[d])
                .filter(Boolean);
        } else {
            // Legacy tight parsing
            // Replace Th with R temporarily for character iteration
            const normalizedTightDays = daysStr.replace(/\s+/g, '').replace(/Th/g, 'R');
            days = normalizedTightDays.split('')
                .map(char => DAY_MAP[char.toUpperCase()])
                .filter(Boolean);
        }

        if (days.length === 0) continue;

        const startTime = convertTime12to24(startTime12);
        const endTime = convertTime12to24(endTime12);

        results.push({ days, startTime, endTime });
    }

    return results.length > 0 ? results : null;
}
