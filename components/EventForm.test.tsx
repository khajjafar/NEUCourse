import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventForm from '@/components/EventForm';

describe('EventForm', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form with default values correctly', () => {
        render(<EventForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        expect(screen.getByLabelText(/Event Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Start Time/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/End Time/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Monday/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Friday/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Save Event/i })).toBeInTheDocument();
    });

    it('shows validation error when title is missing on submit', () => {
        render(<EventForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        fireEvent.click(screen.getByRole('button', { name: /Save Event/i }));

        expect(screen.getByText('Title is required.')).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows validation error when endTime is before startTime', () => {
        render(<EventForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        // Fill basic required fields
        fireEvent.change(screen.getByLabelText(/Event Title/i), { target: { value: 'Test Event' } });
        fireEvent.click(screen.getByLabelText(/Monday/i));

        // Set invalid times
        fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '14:00' } });
        fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '13:00' } });

        fireEvent.click(screen.getByRole('button', { name: /Save Event/i }));

        expect(screen.getByText('End time must be after start time.')).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit with correct data when validation passes', () => {
        render(<EventForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        fireEvent.change(screen.getByLabelText(/Event Title/i), { target: { value: 'Math Class' } });
        fireEvent.click(screen.getByLabelText(/Monday/i));
        fireEvent.click(screen.getByLabelText(/Wednesday/i));
        fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '09:00' } });
        fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '10:30' } });

        fireEvent.click(screen.getByRole('button', { name: /Save Event/i }));

        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Math Class',
            days: ['Monday', 'Wednesday'],
            startTime: '09:00',
            endTime: '10:30'
        }));
    });

    it('pre-populates with initialData and handles editing accurately', () => {
        const initialData = {
            id: 'evt1',
            title: 'Existing Event',
            days: ['Tuesday', 'Thursday'],
            startTime: '10:00',
            endTime: '11:00',
            location: 'Room 101'
        };

        render(<EventForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} initialData={initialData} />);

        expect(screen.getByLabelText(/Event Title/i)).toHaveValue('Existing Event');
        expect(screen.getByLabelText(/Start Time/i)).toHaveValue('10:00');
        expect(screen.getByLabelText(/Location/i)).toHaveValue('Room 101');

        // Tuesday should be checked, Monday shouldn't
        expect(screen.getByLabelText(/Tuesday/i)).toBeChecked();
        expect(screen.getByLabelText(/Monday/i)).not.toBeChecked();

        // Update the title and submit
        fireEvent.change(screen.getByLabelText(/Event Title/i), { target: { value: 'Updated Event' } });
        fireEvent.click(screen.getByRole('button', { name: /Save Event/i }));

        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Updated Event',
            days: ['Tuesday', 'Thursday'],
            startTime: '10:00',
            endTime: '11:00',
            location: 'Room 101'
        }));
    });
});
