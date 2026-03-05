import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddToCalendarButton } from './AddToCalendarButton';
import { fetchCourseCached } from '@/hooks/useSingleCourse';
import { useEvents } from '@/hooks/useEvents';

// Mock dependencies
vi.mock('@/hooks/useSingleCourse', () => ({
    fetchCourseCached: vi.fn(),
}));

vi.mock('@/hooks/useEvents', () => ({
    useEvents: vi.fn(),
}));

describe('AddToCalendarButton', () => {
    const mockAddEvent = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useEvents as any).mockReturnValue({
            addEvent: mockAddEvent,
        });
    });

    test('renders button with correct aria-label', () => {
        render(<AddToCalendarButton courseId="CS2500" crn="12345" courseName="CS2500" />);
        expect(screen.getByRole('button', { name: 'Add course schedule to calendar' })).toBeDefined();
    });

    test('shows error when section is not found', async () => {
        (fetchCourseCached as any).mockResolvedValue({ sections: [] });
        render(<AddToCalendarButton courseId="CS2500" crn="12345" courseName="CS2500" />);

        fireEvent.click(screen.getByRole('button', { name: 'Add course schedule to calendar' }));

        await waitFor(() => {
            expect(screen.getByText('Section not found')).toBeDefined();
        });
    });

    test('shows error when schedule cannot be parsed (TBA)', async () => {
        (fetchCourseCached as any).mockResolvedValue({
            sections: [{ crn: '12345', meetingTimes: 'TBA', rooms: 'Room 1' }],
        });
        render(<AddToCalendarButton courseId="CS2500" crn="12345" courseName="CS2500" />);

        fireEvent.click(screen.getByRole('button', { name: 'Add course schedule to calendar' }));

        await waitFor(() => {
            expect(screen.getByText('Cannot parse schedule')).toBeDefined();
        });
    });

    test('calls addEvent for each parsed day and shows success message', async () => {
        (fetchCourseCached as any).mockResolvedValue({
            sections: [{ crn: '12345', meetingTimes: 'MWF 10:30am - 11:35am', rooms: 'Ryder 101' }],
        });
        render(<AddToCalendarButton courseId="CS2500" crn="12345" courseName="CS2500" />);

        fireEvent.click(screen.getByRole('button', { name: 'Add course schedule to calendar' }));

        await waitFor(() => {
            expect(mockAddEvent).toHaveBeenCalledTimes(3);
        });

        expect(screen.getByText('Added to calendar!')).toBeDefined();
    });
});
