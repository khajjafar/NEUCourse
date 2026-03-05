import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddToCalendarButton from './AddToCalendarButton';

const mockCreateEvent = vi.fn();

// Mock useCalendarEvents hook
vi.mock('@/hooks/useCalendarEvents', () => ({
    useCalendarEvents: () => ({
        createEvent: mockCreateEvent,
    })
}));

// Mock window.alert to prevent tests from pausing
const originalAlert = window.alert;
beforeEach(() => {
    window.alert = vi.fn();
    mockCreateEvent.mockClear();
});

describe('AddToCalendarButton', () => {
    const mockSection = {
        crn: '12345',
        seats: '40',
        meetingTimes: 'MWF 10:30am - 11:35am',
        rooms: 'Ryder Hall 123',
        professor: 'John Doe',
        campus: 'Boston'
    };

    it('renders the button and shows the form on click', async () => {
        render(
            <AddToCalendarButton
                courseId="CS 2500"
                courseName="Fundamentals of Computer Science 1"
                section={mockSection}
            />
        );

        const button = screen.getByRole('button', { name: "Add course section to calendar" });
        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();

        // form should not be visible yet
        expect(screen.queryByText('Add Event')).not.toBeInTheDocument();

        // Click the button
        fireEvent.click(button);

        // Form opens, we should check if title is pre-filled
        await waitFor(() => {
            expect(screen.getByDisplayValue('CS 2500')).toBeInTheDocument();
        });

        // Test form submission
        const saveButton = screen.getByRole('button', { name: 'Save Event' });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockCreateEvent).toHaveBeenCalledWith(expect.objectContaining({
                title: 'CS 2500',
                days: ['Monday', 'Wednesday', 'Friday'],
                startTime: '10:30',
                endTime: '11:35',
                location: 'Ryder Hall 123',
                color: '#4f46e5'
            }));
            expect(window.alert).toHaveBeenCalledWith('Added CS 2500 to your calendar!');
        });
    });

    it('disables the button for TBA times', () => {
        render(
            <AddToCalendarButton
                courseId="CS 2500"
                courseName="Fundamentals of CS"
                section={{ ...mockSection, meetingTimes: 'TBA' }}
            />
        );

        const button = screen.getByRole('button', { name: "Add course section to calendar" });
        expect(button).toBeDisabled();
    });
});
