import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AddScheduleToCalendarModal from './AddScheduleToCalendarModal';
import { fetchCourseCached } from '@/hooks/useSingleCourse';

// Mock dependencies
vi.mock('@/hooks/useSingleCourse', () => ({
    fetchCourseCached: vi.fn(),
}));

// Mock the AddToCalendarButton since we are only testing the modal
vi.mock('./AddToCalendarButton', () => ({
    AddToCalendarButton: vi.fn(({ courseId, crn }) => (
        <button data-testid={`add-btn-${courseId}-${crn}`}>Add {courseId} CRN {crn}</button>
    )),
}));

describe('AddScheduleToCalendarModal', () => {
    const mockSemesters = [
        {
            id: 'sem1',
            name: 'Fall 2026',
            order: 0,
            courses: [
                'CS2500', // String course (no CRN)
                { courseId: 'CS2510', crn: '12345' }, // Course with pre-selected CRN
                'NOSECTIONS', // Course that will have no sections
            ],
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock responses for fetchCourseCached
        (fetchCourseCached as any).mockImplementation((courseId: string) => {
            if (courseId === 'CS2500') {
                return Promise.resolve({
                    id: 'CS2500',
                    name: 'Fundies 1',
                    sections: [
                        { crn: '10001', meetingTimes: 'MWF 10:00am - 11:00am' },
                        { crn: '10002', meetingTimes: 'TR 1:00pm - 2:40pm' },
                    ]
                });
            }
            if (courseId === 'CS2510') {
                return Promise.resolve({
                    id: 'CS2510',
                    name: 'Fundies 2',
                    sections: [
                        { crn: '12345', meetingTimes: 'MWF 2:00pm - 3:00pm' },
                    ]
                });
            }
            if (courseId === 'NOSECTIONS') {
                return Promise.resolve({
                    id: 'NOSECTIONS',
                    name: 'Empty Course',
                    sections: []
                });
            }
            return Promise.resolve({ id: courseId, name: courseId, sections: [] });
        });
    });

    test('renders nothing when not open', () => {
        const { container } = render(
            <AddScheduleToCalendarModal isOpen={false} onClose={vi.fn()} semesters={mockSemesters} />
        );
        expect(container.firstChild).toBeNull();
    });

    test('shows all courses for selected semester with or without CRNs', async () => {
        render(<AddScheduleToCalendarModal isOpen={true} onClose={vi.fn()} semesters={mockSemesters} />);

        // Select the semester
        fireEvent.change(screen.getByLabelText('Select Semester'), { target: { value: 'sem1' } });

        // Wait for courses to load and render
        await waitFor(() => {
            expect(screen.getByText('CS2500')).toBeDefined();
            expect(screen.getByText('CS2510')).toBeDefined();
            expect(screen.getByText('NOSECTIONS')).toBeDefined();
        });
    });

    test('shows section dropdown when course has sections', async () => {
        render(<AddScheduleToCalendarModal isOpen={true} onClose={vi.fn()} semesters={mockSemesters} />);

        // Select the semester
        fireEvent.change(screen.getByLabelText('Select Semester'), { target: { value: 'sem1' } });

        await waitFor(() => {
            // Check if dropdown exists with the correct options
            const cs2500Select = screen.getByRole('combobox', { name: 'Select section for CS2500' });
            expect(cs2500Select).toBeDefined();

            // Should contain the default option plus the 2 sections
            expect(cs2500Select.children.length).toBe(3);
            expect(screen.getByText('CRN 10001 - MWF 10:00am - 11:00am')).toBeDefined();
        });
    });

    test('shows "No sections available" message when course has no sections', async () => {
        render(<AddScheduleToCalendarModal isOpen={true} onClose={vi.fn()} semesters={mockSemesters} />);

        fireEvent.change(screen.getByLabelText('Select Semester'), { target: { value: 'sem1' } });

        await waitFor(() => {
            expect(screen.getByText('No sections available')).toBeDefined();
        });
    });

    test('Add to Calendar button appears only when a section is selected', async () => {
        render(<AddScheduleToCalendarModal isOpen={true} onClose={vi.fn()} semesters={mockSemesters} />);

        fireEvent.change(screen.getByLabelText('Select Semester'), { target: { value: 'sem1' } });

        await waitFor(() => {
            // CS2510 has a pre-selected CRN of 12345 so button should appear
            expect(screen.getByTestId('add-btn-CS2510-12345')).toBeDefined();

            // CS2500 has NO pre-selected CRN, so button should NOT be there yet
            expect(screen.queryByTestId(/add-btn-CS2500/)).toBeNull();
        });

        // Now select a section for CS2500
        const cs2500Select = screen.getByRole('combobox', { name: 'Select section for CS2500' });
        fireEvent.change(cs2500Select, { target: { value: '10002' } });

        // Wait for rerender and verify button appeared
        await waitFor(() => {
            expect(screen.getByTestId('add-btn-CS2500-10002')).toBeDefined();
        });
    });
});
