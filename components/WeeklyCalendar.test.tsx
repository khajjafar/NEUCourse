import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WeeklyCalendar from '@/components/WeeklyCalendar';

describe('WeeklyCalendar', () => {
    const mockOnEditEvent = vi.fn();
    const MOCK_EVENTS = [
        {
            id: '1',
            title: 'Linear Algebra',
            days: ['Monday', 'Wednesday'],
            startTime: '09:00',
            endTime: '10:30',
            color: '#ef4444'
        },
        {
            id: '2',
            title: 'Physics',
            days: ['Monday'],
            startTime: '10:00',
            endTime: '11:30',
            color: '#3b82f6'
        }
    ];

    it('renders the calendar grid with correct days', () => {
        render(<WeeklyCalendar events={[]} onEditEvent={mockOnEditEvent} />);

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach(day => {
            expect(screen.getByText(day)).toBeInTheDocument();
        });

        // Check for an arbitrary time entry
        expect(screen.getByText('8 AM')).toBeInTheDocument();
        expect(screen.getByText('12 PM')).toBeInTheDocument();
    });

    it('renders events in the correct slots', () => {
        const { container } = render(<WeeklyCalendar events={MOCK_EVENTS} onEditEvent={mockOnEditEvent} />);

        // LA appears twice
        const laEvents = screen.getAllByText('Linear Algebra');
        expect(laEvents).toHaveLength(2);

        // Physics appears once
        expect(screen.getByText('Physics')).toBeInTheDocument();

        // Assert overlap visual styles if possible or just standard presence
        // (Visual offset testing is tricky with RTL, but we verify they render)
        const eventBlocks = container.querySelectorAll('.absolute');

        // 2 LA + 1 Physics = 3 blocks
        // It might be more depending on how blocks are rendered but at least 3 event content blocks
        expect(eventBlocks.length).toBeGreaterThanOrEqual(3);
    });

    it('clicking an event calls onEditEvent', () => {
        render(<WeeklyCalendar events={MOCK_EVENTS} onEditEvent={mockOnEditEvent} />);

        const firstLaEvent = screen.getAllByText('Linear Algebra')[0];
        // Note: EventBlock wrapper makes it clickable.
        firstLaEvent.click();

        expect(mockOnEditEvent).toHaveBeenCalledWith(expect.objectContaining({
            id: '1',
            title: 'Linear Algebra'
        }));
    });
});
