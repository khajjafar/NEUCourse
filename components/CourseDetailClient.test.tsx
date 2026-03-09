import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CourseDetailClient from './CourseDetailClient';
import * as useSingleCourseHook from '@/hooks/useSingleCourse';
import { useRouter } from 'next/navigation';

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

vi.mock('./AddToPlanDropdown', () => ({
    default: () => <button>Add to Plan</button>
}));

describe('CourseDetailClient', () => {
    const mockBack = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
            back: mockBack,
        });
    });

    it('renders loading state correctly', () => {
        vi.spyOn(useSingleCourseHook, 'useSingleCourse').mockReturnValue({
            course: null,
            loading: true,
            error: null,
        });

        const { container } = render(<CourseDetailClient courseId="CS3500" />);
        // Checking if pulse animation exists assuming successful render
        expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('renders error state correctly', () => {
        vi.spyOn(useSingleCourseHook, 'useSingleCourse').mockReturnValue({
            course: null,
            loading: false,
            error: "Not Found",
        });

        render(<CourseDetailClient courseId="UNKNOWN" />);
        expect(screen.getByText("Not Found")).toBeInTheDocument();
        expect(screen.getByText("We couldn't find the requested course details.")).toBeInTheDocument();
    });

    it('renders course data correctly', () => {
        vi.spyOn(useSingleCourseHook, 'useSingleCourse').mockReturnValue({
            course: {
                id: 'CS3500',
                subject: 'CS',
                number: '3500',
                name: 'Object-Oriented Design',
                description: 'A test class',
                creditHours: 4,
                prereqs: ['CS2510'],
                coreqs: []
            },
            loading: false,
            error: null,
        });

        render(<CourseDetailClient courseId="CS3500" />);

        expect(screen.getByText("Object-Oriented Design")).toBeInTheDocument();
        expect(screen.getAllByText("CS 3500").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("4 Credits")).toBeInTheDocument();
        expect(screen.getByText("A test class")).toBeInTheDocument();
        expect(screen.getByText("CS 2510")).toBeInTheDocument();
        expect(screen.getAllByText("None required").length).toBe(1); // Should only be 1 for Coreqs
    });

    it('calls router.back when close button is clicked', () => {
        vi.spyOn(useSingleCourseHook, 'useSingleCourse').mockReturnValue({
            course: null,
            loading: true,
            error: null,
        });

        render(<CourseDetailClient courseId="CS3500" />);

        // Find the back button and click it
        const backButton = screen.getByRole('button', { name: /Go back/i });
        fireEvent.click(backButton);

        expect(mockBack).toHaveBeenCalledTimes(1);
    });
});
