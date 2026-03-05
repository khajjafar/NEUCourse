import { describe, it, expect } from 'vitest';
import { parseMeetingTime } from './parse-meeting-times';

describe('parseMeetingTime', () => {
    it('parses MWF morning times safely', () => {
        const result = parseMeetingTime('MWF 10:30am - 11:35am');
        expect(result).not.toBeNull();
        expect(result?.days).toEqual(['Monday', 'Wednesday', 'Friday']);
        expect(result?.startTime).toBe('10:30');
        expect(result?.endTime).toBe('11:35');
    });

    it('parses TR afternoon times correctly, including PM conversion', () => {
        const result = parseMeetingTime('TR 1:35pm - 3:15pm');
        expect(result).not.toBeNull();
        expect(result?.days).toEqual(['Tuesday', 'Thursday']);
        expect(result?.startTime).toBe('13:35');
        expect(result?.endTime).toBe('15:15');
    });

    it('parses single day correctly', () => {
        const result = parseMeetingTime('M 9:00am - 10:00am');
        expect(result).not.toBeNull();
        expect(result?.days).toEqual(['Monday']);
        expect(result?.startTime).toBe('09:00');
        expect(result?.endTime).toBe('10:00');
    });

    it('handles 12pm properly (noon)', () => {
        const result = parseMeetingTime('W 12:00pm - 1:00pm');
        expect(result).not.toBeNull();
        expect(result?.startTime).toBe('12:00');
        expect(result?.endTime).toBe('13:00');
    });

    it('handles 12am properly (midnight edge case)', () => {
        const result = parseMeetingTime('S 12:30am - 1:30am');
        expect(result).not.toBeNull();
        expect(result?.startTime).toBe('00:30');
        expect(result?.endTime).toBe('01:30');
    });

    it('returns null for TBA', () => {
        expect(parseMeetingTime('TBA')).toBeNull();
        expect(parseMeetingTime('tba')).toBeNull();
    });

    it('returns null for empty string', () => {
        expect(parseMeetingTime('')).toBeNull();
        expect(parseMeetingTime('   ')).toBeNull();
    });

    it('returns null for completely invalid format', () => {
        expect(parseMeetingTime('Hello World')).toBeNull();
        expect(parseMeetingTime('M 10-11')).toBeNull();
    });

    it('parses Sunday (U) and Saturday (S) correctly', () => {
        const result = parseMeetingTime('SU 9:00am - 10:00am');
        expect(result).not.toBeNull();
        expect(result?.days).toEqual(['Saturday', 'Sunday']);
        expect(result?.startTime).toBe('09:00');
        expect(result?.endTime).toBe('10:00');
    });
});
