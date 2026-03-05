import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CourseMiniCard from './CourseMiniCard';
import { useSingleCourse } from '@/hooks/useSingleCourse';

// Mock useSingleCourse
vi.mock('@/hooks/useSingleCourse', () => ({
    useSingleCourse: vi.fn(),
}));

// Mock @/lib/firebase
vi.mock('@/lib/firebase', () => ({
    auth: {},
    db: {},
}));

describe('CourseMiniCard', () => {
    const mockCourse = {
        id: 'CS3500',
        subject: 'CS',
        number: '3500',
        name: 'Object-Oriented Design',
        creditHours: 4,
        prereqs: ['CS1800', 'CS2500'],
        coreqs: ['CS2501'],
    };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('shows missing prereq badge when one prereq is missing', () => {
        vi.mocked(useSingleCourse).mockReturnValue({
            course: mockCourse as any,
            loading: false,
            error: null,
        });

        render(
            <CourseMiniCard
                courseId="CS3500"
                currentSemesterOrder={3}
                allPlanCourses={[
                    { courseId: 'CS2500', semesterOrder: 1 } // CS1800 is missing
                ]}
            />
        );

        const prereqBadge = screen.getByText('Prereq needed: CS1800');
        expect(prereqBadge).toBeInTheDocument();
    });

    it('shows missing prereq badge when multiple prereqs are missing', () => {
        vi.mocked(useSingleCourse).mockReturnValue({
            course: mockCourse as any,
            loading: false,
            error: null,
        });

        render(
            <CourseMiniCard
                courseId="CS3500"
                currentSemesterOrder={3}
                allPlanCourses={[]} // Both missing
            />
        );

        const prereqBadge = screen.getByText('Prereq needed: CS1800, CS2500');
        expect(prereqBadge).toBeInTheDocument();
        expect(prereqBadge).toHaveAttribute('aria-label', 'Missing prerequisites: CS1800, CS2500');
    });

    it('shows no prereq badge when all prereqs are satisfied', () => {
        vi.mocked(useSingleCourse).mockReturnValue({
            course: mockCourse as any,
            loading: false,
            error: null,
        });

        render(
            <CourseMiniCard
                courseId="CS3500"
                currentSemesterOrder={3}
                allPlanCourses={[
                    { courseId: 'CS1800', semesterOrder: 1 },
                    { courseId: 'CS2500', semesterOrder: 2 },
                ]}
            />
        );

        expect(screen.queryByText(/Prereq needed/)).not.toBeInTheDocument();
    });

    it('shows missing coreq badge when coreq is missing', () => {
        vi.mocked(useSingleCourse).mockReturnValue({
            course: mockCourse as any,
            loading: false,
            error: null,
        });

        render(
            <CourseMiniCard
                courseId="CS3500"
                currentSemesterOrder={3}
                allPlanCourses={[
                    { courseId: 'CS1800', semesterOrder: 1 },
                    { courseId: 'CS2500', semesterOrder: 2 },
                    // CS2501 coreq missing
                ]}
            />
        );

        const coreqBadge = screen.getByText('Coreq needed: CS2501');
        expect(coreqBadge).toBeInTheDocument();
    });

    it('shows no warning badges when course has no prereqs/coreqs', () => {
        vi.mocked(useSingleCourse).mockReturnValue({
            course: {
                ...mockCourse,
                prereqs: [],
                coreqs: [],
            } as any,
            loading: false,
            error: null,
        });

        render(
            <CourseMiniCard
                courseId="CS3500"
                currentSemesterOrder={3}
                allPlanCourses={[]}
            />
        );

        expect(screen.queryByText(/Prereq needed/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Coreq needed/)).not.toBeInTheDocument();
    });

    it('badge has correct aria-label', () => {
        vi.mocked(useSingleCourse).mockReturnValue({
            course: mockCourse as any,
            loading: false,
            error: null,
        });

        render(
            <CourseMiniCard
                courseId="CS3500"
                currentSemesterOrder={3}
                allPlanCourses={[
                    { courseId: 'CS2500', semesterOrder: 2 } // CS1800 is missing
                ]}
            />
        );

        const prereqBadge = screen.getByText('Prereq needed: CS1800');
        expect(prereqBadge).toHaveAttribute('aria-label', 'Missing prerequisites: CS1800');
    });
});
