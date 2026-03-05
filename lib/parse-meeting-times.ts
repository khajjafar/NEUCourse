const DAY_MAP: Record<string, string> = {
    M: 'Monday',
    T: 'Tuesday',
    W: 'Wednesday',
    R: 'Thursday',
    F: 'Friday',
    S: 'Saturday',
    U: 'Sunday',
};

function convertTime12to24(time12h: string): string {
    // Remove spaces before am/pm
    const cleaned = time12h.replace(/\s+/g, '').toLowerCase();
    const match = cleaned.match(/^(\d{1,2}):(\d{2})(am|pm)$/);
    if (!match) return time12h;

    let [_, hoursStr, minutes, modifier] = match;
    let hours = parseInt(hoursStr, 10);

    if (hours === 12) {
        hours = modifier === 'am' ? 0 : 12;
    } else if (modifier === 'pm') {
        hours += 12;
    }

    const hours24 = hours.toString().padStart(2, '0');
    return `${hours24}:${minutes}`;
}

export function parseMeetingTime(meetingTimeStr: string): { days: string[], startTime: string, endTime: string } | null {
    if (!meetingTimeStr || meetingTimeStr.trim() === 'TBA') {
        return null;
    }

    // Normalize: replace en-dash/em-dash with hyphen, collapse whitespace
    const normalized = meetingTimeStr
        .trim()
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/\s+/g, ' ');

    // Regex to match:
    // 1: days (M, T, W, R, F, S, U with optional spaces)
    // 2: start time (1:35 pm or 1:35pm)
    // 3: end time (2:40 pm or 2:40pm)
    const match = normalized.match(/^([MTWRFSU\s]+?)\s+(\d{1,2}:\d{2}\s*[aApP]\s*[mM])\s*-\s*(\d{1,2}:\d{2}\s*[aApP]\s*[mM])$/);

    // Try relaxed regex if strict one doesn't match
    let daysStr, startTime12, endTime12;

    if (match) {
        daysStr = match[1].replace(/\s+/g, ''); // remove internal spaces in days
        startTime12 = match[2];
        endTime12 = match[3];
    } else {
        // maybe no space between days and time?
        const tightMatch = normalized.match(/^([MTWRFSU]+)(\d{1,2}:\d{2}\s*[aApP]\s*[mM])\s*-\s*(\d{1,2}:\d{2}\s*[aApP]\s*[mM])$/);
        if (!tightMatch) return null;
        daysStr = tightMatch[1];
        startTime12 = tightMatch[2];
        endTime12 = tightMatch[3];
    }

    const days = daysStr.split('').map(char => DAY_MAP[char.toUpperCase()]).filter(Boolean);
    if (days.length === 0) return null;

    const startTime = convertTime12to24(startTime12);
    const endTime = convertTime12to24(endTime12);

    return { days, startTime, endTime };
}
