import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import ExportCalendarButton from '@/components/ExportCalendarButton';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import * as icsExport from '@/lib/ics-export';

// Mock the dependencies
vi.mock('@/lib/ics-export', () => ({
    generateICSFile: vi.fn(),
    downloadICSFile: vi.fn(),
}));

describe('ExportCalendarButton', () => {
    const mockEvents: CalendarEvent[] = [
        {
            id: '1',
            title: 'Test Course',
            days: ['Monday'],
            startTime: '10:00',
            endTime: '11:00',
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('is disabled when events array is empty', () => {
        render(<ExportCalendarButton events={[]} />);

        const button = screen.getByRole('button', { name: /export calendar/i });
        expect(button).toBeDisabled();
    });

    it('is enabled when events exist', () => {
        render(<ExportCalendarButton events={mockEvents} />);

        const button = screen.getByRole('button', { name: /export calendar/i });
        expect(button).not.toBeDisabled();
    });

    it('shows configuration popover on click', async () => {
        render(<ExportCalendarButton events={mockEvents} />);

        const button = screen.getByRole('button', { name: /export calendar/i });
        fireEvent.click(button);

        expect(screen.getByText(/Export Settings/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Semester Start Date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Number of Weeks/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /confirm export/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('calls generate and download on confirm with filled forms', async () => {
        (icsExport.generateICSFile as Mock).mockReturnValue('BEGIN:VCALENDAR...END:VCALENDAR');

        render(<ExportCalendarButton events={mockEvents} />);

        // Open popover
        fireEvent.click(screen.getByRole('button', { name: /export calendar/i }));

        // Change week count
        const weekInput = screen.getByLabelText(/Number of Weeks/i);
        fireEvent.change(weekInput, { target: { value: '10' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /confirm export/i }));

        await waitFor(() => {
            expect(icsExport.generateICSFile).toHaveBeenCalledTimes(1);
            expect(icsExport.downloadICSFile).toHaveBeenCalledTimes(1);
        });

        const generateArgs = (icsExport.generateICSFile as Mock).mock.calls[0];
        expect(generateArgs[0]).toEqual(mockEvents);
        // Default start date logic tested effectively here (just checking type)
        expect(generateArgs[1]).toBeInstanceOf(Date);
        expect(generateArgs[2]).toBe(10); // Extracted weekCount

        expect(icsExport.downloadICSFile).toHaveBeenCalledWith('BEGIN:VCALENDAR...END:VCALENDAR', 'calendar-export.ics');

        // Ensure popover closes
        expect(screen.queryByText(/Export Settings/i)).not.toBeInTheDocument();
    });

    it('does not download if generateICSFile returns null', async () => {
        (icsExport.generateICSFile as Mock).mockReturnValue(null);
        // Mock window.alert to prevent jsdom not implemented error
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });

        render(<ExportCalendarButton events={mockEvents} />);
        fireEvent.click(screen.getByRole('button', { name: /export calendar/i }));
        fireEvent.click(screen.getByRole('button', { name: /confirm export/i }));

        await waitFor(() => {
            expect(icsExport.generateICSFile).toHaveBeenCalled();
            expect(icsExport.downloadICSFile).not.toHaveBeenCalled();
            expect(alertMock).toHaveBeenCalled();
        });

        // It might show an error or just close. Assume it just closes for now or handle appropriately.
        // Actually, in our code it doesn't close on error to let them retry or we didn't handle that explicitly. It closes before doing work.
        expect(screen.queryByText(/Export Settings/i)).not.toBeInTheDocument();

        alertMock.mockRestore();
    });

    it('cancels gracefully without doing anything', () => {
        render(<ExportCalendarButton events={mockEvents} />);
        fireEvent.click(screen.getByRole('button', { name: /export calendar/i }));

        // Click Cancel
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

        expect(icsExport.generateICSFile).not.toHaveBeenCalled();
        expect(screen.queryByText(/Export Settings/i)).not.toBeInTheDocument();
    });
});
