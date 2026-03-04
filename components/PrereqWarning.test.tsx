import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PrereqWarning from './PrereqWarning';
import { useSingleCourse } from '@/hooks/useSingleCourse';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
    auth: {},
    db: {}
}));

// Mock useSingleCourse hook
vi.mock('@/hooks/useSingleCourse', () => ({
    useSingleCourse: vi.fn()
}));

const mockSemesters = [
    { id: 'sem1', name: 'Fall 2025', order: 1, courses: ['CS1800'] },
    { id: 'sem2', name: 'Spring 2026', order: 2, courses: ['CS2500', 'CS2501'] }
];

describe('PrereqWarning', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when loading', () => {
        (useSingleCourse as any).mockReturnValue({
            course: null,
            loading: true,
            error: null
        });

        const { container } = render(
            <PrereqWarning
                courseId="CS2500"
                semester={mockSemesters[1]}
                allSemesters={mockSemesters}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('shows no warnings when prerequisites and corequisites are met', () => {
        (useSingleCourse as any).mockReturnValue({
            course: {
                id: 'CS2500',
                prereqs: ['CS1800'],
                coreqs: ['CS2501']
            },
            loading: false,
            error: null
        });

        const { container } = render(
            <PrereqWarning
                courseId="CS2500"
                semester={mockSemesters[1]}
                allSemesters={mockSemesters}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('shows prerequisite warning when prerequisite is missing from earlier semesters', () => {
        (useSingleCourse as any).mockReturnValue({
            course: {
                id: 'CS2500',
                prereqs: ['CS1800'],
                coreqs: []
            },
            loading: false,
            error: null
        });

        // Test with a semester setup where CS1800 is NOT in an earlier semester
        const unmetSemesters = [
            { id: 'sem1', name: 'Fall 2025', order: 1, courses: [] },
            { id: 'sem2', name: 'Spring 2026', order: 2, courses: ['CS2500'] }
        ];

        render(
            <PrereqWarning
                courseId="CS2500"
                semester={unmetSemesters[1]}
                allSemesters={unmetSemesters}
            />
        );

        expect(screen.getByText((content, element) => {
            const hasText = (node: Element) => node.textContent === 'Missing prerequisite: CS1800 (not found in earlier semesters)';
            const eleHasText = hasText(element as Element);
            const childrenDontHaveText = Array.from(element?.children || []).every(child => !hasText(child));
            return eleHasText && childrenDontHaveText;
        })).toBeDefined();
    });

    it('shows corequisite warning when corequisite is missing from the current semester', () => {
        (useSingleCourse as any).mockReturnValue({
            course: {
                id: 'CS2500',
                prereqs: [],
                coreqs: ['CS2501']
            },
            loading: false,
            error: null
        });

        const unmetSemesters = [
            { id: 'sem2', name: 'Spring 2026', order: 2, courses: ['CS2500'] }
        ];

        render(
            <PrereqWarning
                courseId="CS2500"
                semester={unmetSemesters[0]}
                allSemesters={unmetSemesters}
            />
        );

        expect(screen.getByText((content, element) => {
            const hasText = (node: Element) => node.textContent === 'Missing co-requisite: CS2501 (not found in this semester)';
            const eleHasText = hasText(element as Element);
            const childrenDontHaveText = Array.from(element?.children || []).every(child => !hasText(child));
            return eleHasText && childrenDontHaveText;
        })).toBeDefined();
    });

    it('shows multiple warnings when multiple prerequisites/corequisites are missing', () => {
        (useSingleCourse as any).mockReturnValue({
            course: {
                id: 'CS2500',
                prereqs: ['CS1800', 'MATH101'],
                coreqs: ['CS2501', 'LAB101']
            },
            loading: false,
            error: null
        });

        const unmetSemesters = [
            { id: 'sem2', name: 'Spring 2026', order: 2, courses: ['CS2500'] }
        ];

        render(
            <PrereqWarning
                courseId="CS2500"
                semester={unmetSemesters[0]}
                allSemesters={unmetSemesters}
            />
        );

        expect(screen.getByText((content, element) => {
            const hasText = (node: Element) => node.textContent === 'Missing prerequisite: CS1800 (not found in earlier semesters)';
            const eleHasText = hasText(element as Element);
            const childrenDontHaveText = Array.from(element?.children || []).every(child => !hasText(child));
            return eleHasText && childrenDontHaveText;
        })).toBeDefined();

        expect(screen.getByText((content, element) => {
            const hasText = (node: Element) => node.textContent === 'Missing prerequisite: MATH101 (not found in earlier semesters)';
            const eleHasText = hasText(element as Element);
            const childrenDontHaveText = Array.from(element?.children || []).every(child => !hasText(child));
            return eleHasText && childrenDontHaveText;
        })).toBeDefined();

        expect(screen.getByText((content, element) => {
            const hasText = (node: Element) => node.textContent === 'Missing co-requisite: CS2501 (not found in this semester)';
            const eleHasText = hasText(element as Element);
            const childrenDontHaveText = Array.from(element?.children || []).every(child => !hasText(child));
            return eleHasText && childrenDontHaveText;
        })).toBeDefined();

        expect(screen.getByText((content, element) => {
            const hasText = (node: Element) => node.textContent === 'Missing co-requisite: LAB101 (not found in this semester)';
            const eleHasText = hasText(element as Element);
            const childrenDontHaveText = Array.from(element?.children || []).every(child => !hasText(child));
            return eleHasText && childrenDontHaveText;
        })).toBeDefined();
    });

    it('shows no warnings when prerequisite and corequisite arrays are empty', () => {
        (useSingleCourse as any).mockReturnValue({
            course: {
                id: 'CS2500',
                prereqs: [],
                coreqs: []
            },
            loading: false,
            error: null
        });

        const { container } = render(
            <PrereqWarning
                courseId="CS2500"
                semester={mockSemesters[1]}
                allSemesters={mockSemesters}
            />
        );

        expect(container.firstChild).toBeNull();
    });
});
