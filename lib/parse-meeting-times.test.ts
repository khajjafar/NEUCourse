import { describe, test, expect } from 'vitest';
import { parseMeetingTime } from './parse-meeting-times';

describe('parseMeetingTime', () => {
    test('parses MWF with space', () => {
        expect(parseMeetingTime('MWF 10:30am - 11:35am')).toEqual([{
            days: ['Monday', 'Wednesday', 'Friday'],
            startTime: '10:30',
            endTime: '11:35',
        }]);
    });

    test('parses TR', () => {
        expect(parseMeetingTime('TR 1:35pm - 3:15pm')).toEqual([{
            days: ['Tuesday', 'Thursday'],
            startTime: '13:35',
            endTime: '15:15',
        }]);
    });

    test('parses space before am/pm and spaced days', () => {
        expect(parseMeetingTime('M W R 1:35 pm - 2:40 pm')).toEqual([{
            days: ['Monday', 'Wednesday', 'Thursday'],
            startTime: '13:35',
            endTime: '14:40',
        }]);
    });

    test('parses no space between days and time', () => {
        expect(parseMeetingTime('MWF9:00am - 10:50am')).toEqual([{
            days: ['Monday', 'Wednesday', 'Friday'],
            startTime: '09:00',
            endTime: '10:50',
        }]);
    });

    test('parses single day', () => {
        expect(parseMeetingTime('M 9:00am - 10:00am')).toEqual([{
            days: ['Monday'],
            startTime: '09:00',
            endTime: '10:00',
        }]);
    });

    test('handles 12:00pm noon correctly', () => {
        expect(parseMeetingTime('M 12:00pm - 1:00pm')).toEqual([{
            days: ['Monday'],
            startTime: '12:00',
            endTime: '13:00',
        }]);
    });

    test('handles 12:30am correctly', () => {
        expect(parseMeetingTime('T 12:30am - 2:00am')).toEqual([{
            days: ['Tuesday'],
            startTime: '00:30',
            endTime: '02:00',
        }]);
    });

    test('returns null for TBA', () => {
        expect(parseMeetingTime('TBA')).toBeNull();
    });

    test('returns null for empty string', () => {
        expect(parseMeetingTime('')).toBeNull();
    });

    test('returns null for invalid format', () => {
        expect(parseMeetingTime('Invalid String')).toBeNull();
    });
});
