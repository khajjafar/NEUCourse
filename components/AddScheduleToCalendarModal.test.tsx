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

    test('shows "No courses in this semester have a specific section selected" when no CRNs are selected', async () => {
        const semesterNoCrns = [{
            id: 'sem2',
            name: 'Spring 2027',
            order: 1,
            courses: ['CS2500', 'NOSECTIONS']
        }];
        render(<AddScheduleToCalendarModal isOpen={true} onClose={vi.fn()} semesters={semesterNoCrns} />);

        fireEvent.change(screen.getByLabelText('Select Semester'), { target: { value: 'sem2' } });

        await waitFor(() => {
            expect(screen.getByText(/No courses in this semester have a specific section selected/)).toBeDefined();
        });
    });

    test('shows ONLY courses with pre-selected sections', async () => {
        render(<AddScheduleToCalendarModal isOpen={true} onClose={vi.fn()} semesters={mockSemesters} />);

        // Select the semester
        fireEvent.change(screen.getByLabelText('Select Semester'), { target: { value: 'sem1' } });

        // Wait for courses to load and render
        await waitFor(() => {
            // CS2510 has a CRN, should be displayed
            expect(screen.getByText('CS2510')).toBeDefined();
            // CS2500 and NOSECTIONS do not have a CRN, should NOT be displayed
            expect(screen.queryByText('CS2500')).toBeNull();
            expect(screen.queryByText('NOSECTIONS')).toBeNull();
        });
    });

    test('Add to Calendar button appears for pre-selected sections', async () => {
        render(<AddScheduleToCalendarModal isOpen={true} onClose={vi.fn()} semesters={mockSemesters} />);

        fireEvent.change(screen.getByLabelText('Select Semester'), { target: { value: 'sem1' } });

        await waitFor(() => {
            // CS2510 has a pre-selected CRN of 12345 so button should appear
            expect(screen.getByTestId('add-btn-CS2510-12345')).toBeDefined();
        });
    });
});
