import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { generateICSFile } from '@/lib/ics-export';
import * as ics from 'ics';
import { CalendarEvent } from '@/hooks/useCalendarEvents';

// Mock the ics module
vi.mock('ics', () => ({
    createEvents: vi.fn(),
}));

describe('ics-export utility', () => {
    const mockEvents: CalendarEvent[] = [
        {
            id: '1',
            title: 'Test Class',
            days: ['Monday'],
            startTime: '10:30',
            endTime: '11:35',
            location: 'Room 101',
        },
        {
            id: '2',
            title: 'MWF Class',
            days: ['Monday', 'Wednesday', 'Friday'],
            startTime: '13:00',
            endTime: '14:00',
        },
        {
            id: '3',
            title: 'Invalid Time Class',
            days: ['Tuesday'],
            startTime: 'invalid',
            endTime: '15:00',
        }
    ];

    const semesterStart = new Date('2024-09-02T00:00:00Z'); // A Monday

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('generates single event on one day correctly', () => {
        (ics.createEvents as Mock).mockReturnValue({ value: 'BEGIN:VCALENDAR\\n...' });

        const result = generateICSFile([mockEvents[0]], semesterStart, 1);

        expect(result).not.toBeNull();
        expect(ics.createEvents).toHaveBeenCalledTimes(1);

        const callArgs = (ics.createEvents as Mock).mock.calls[0][0];
        expect(callArgs).toHaveLength(1);

        const event = callArgs[0];
        expect(event.title).toBe('Test Class');
        expect(event.location).toBe('Room 101');
        // 2024-09-02 is Monday
        expect(event.start).toEqual([2024, 9, 2, 10, 30]);
        // Note: 11:35 -> duration or end? We'll parse to array format: [year, month, day, hour, minute]
        expect(event.end).toEqual([2024, 9, 2, 11, 35]);
    });

    it('MWF event produces 3 events per week', () => {
        (ics.createEvents as Mock).mockReturnValue({ value: 'BEGIN:VCALENDAR\\n...' });

        // 2 weeks of MWF = 6 events
        generateICSFile([mockEvents[1]], semesterStart, 2);

        expect(ics.createEvents).toHaveBeenCalledTimes(1);
        const callArgs = (ics.createEvents as Mock).mock.calls[0][0];
        expect(callArgs).toHaveLength(6);

        // Check days mapping implicitly through the dates generated
        // Mon = 09-02, Wed = 09-04, Fri = 09-06
        // Mon = 09-09, Wed = 09-11, Fri = 09-13
        // Order in array: all Mondays, then all Wednesdays, then all Fridays
        const expectedStarts = [
            [2024, 9, 2, 13, 0],   // Mon W1
            [2024, 9, 9, 13, 0],   // Mon W2
            [2024, 9, 4, 13, 0],   // Wed W1
            [2024, 9, 11, 13, 0],  // Wed W2
            [2024, 9, 6, 13, 0],   // Fri W1
            [2024, 9, 13, 13, 0],  // Fri W2
        ];

        expectedStarts.forEach((start, index) => {
            expect(callArgs[index].start).toEqual(start);
        });
    });

    it('handles events with no location', () => {
        (ics.createEvents as Mock).mockReturnValue({ value: 'BEGIN:VCALENDAR\\n...' });

        generateICSFile([mockEvents[1]], semesterStart, 1);

        const callArgs = (ics.createEvents as Mock).mock.calls[0][0];
        expect(callArgs[0].location).toBeUndefined();
    });

    it('returns null on createEvents error', () => {
        (ics.createEvents as Mock).mockReturnValue({ error: new Error('Mock error') });

        const result = generateICSFile([mockEvents[0]], semesterStart, 1);
        expect(result).toBeNull();
    });

    it('parses 24h time correctly (13:30 -> hour 13, minute 30)', () => {
        (ics.createEvents as Mock).mockReturnValue({ value: 'BEGIN:VCALENDAR\\n...' });

        const pmEvent: CalendarEvent = {
            id: 'x',
            title: 'PM',
            days: ['Monday'],
            startTime: '13:30',
            endTime: '15:45',
        };

        generateICSFile([pmEvent], semesterStart, 1);
        const callArgs = (ics.createEvents as Mock).mock.calls[0][0];

        expect(callArgs[0].start.slice(3)).toEqual([13, 30]); // [hour, min]
        expect(callArgs[0].end.slice(3)).toEqual([15, 45]);
    });

    it('ignores events with invalid days or skips invalid mapping', () => {
        (ics.createEvents as Mock).mockReturnValue({ value: 'BEGIN:VCALENDAR\\n...' });

        const weirdEvent: CalendarEvent = {
            id: 'z',
            title: 'Weird',
            days: ['Funday'], // Invalid
            startTime: '10:00',
            endTime: '11:00',
        };

        const result = generateICSFile([weirdEvent], semesterStart, 1);
        expect(result).toBeNull();
        expect(ics.createEvents).not.toHaveBeenCalled();
    });

    it('handles invalid time structures gracefully', () => {
        (ics.createEvents as Mock).mockReturnValue({ value: 'BEGIN:VCALENDAR\\n...' });

        const result = generateICSFile([mockEvents[2]], semesterStart, 1); // Mock 2 has invalid startTime
        expect(result).toBeNull();
        expect(ics.createEvents).not.toHaveBeenCalled();
    });
});
