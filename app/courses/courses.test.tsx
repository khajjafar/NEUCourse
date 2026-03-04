import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CoursesPage from './page';
import * as useCourseSearchHook from '@/hooks/useCourseSearch';

// Mock the Link component from next/link
vi.mock('next/link', () => ({
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('CoursesPage', () => {
    const mockUseCourseSearch = vi.spyOn(useCourseSearchHook, 'useCourseSearch');

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state correctly', () => {
        mockUseCourseSearch.mockReturnValue({
            query: '',
            setQuery: vi.fn(),
            subject: '',
            setSubject: vi.fn(),
            courses: [],
            loading: true,
            error: null
        });

        render(<CoursesPage />);
        expect(screen.getByText('Loading courses...')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /Search courses/i })).toBeInTheDocument();
    });

    it('renders empty state when no courses are found', () => {
        mockUseCourseSearch.mockReturnValue({
            query: 'XYZ999',
            setQuery: vi.fn(),
            subject: '',
            setSubject: vi.fn(),
            courses: [],
            loading: false,
            error: null
        });

        render(<CoursesPage />);
        expect(screen.getByText('No courses found.')).toBeInTheDocument();
        // Displays inputs correctly maintaining state
        expect(screen.getByDisplayValue('XYZ999')).toBeInTheDocument();
    });

    it('renders list of courses', () => {
        const mockCourses = [
            { id: 'CS3500', subject: 'CS', number: '3500', name: 'Object-Oriented Design', description: 'OOD Description', creditHours: 4, prereqs: ['CS2510'], coreqs: [] },
            { id: 'MATH1341', subject: 'MATH', number: '1341', name: 'Calculus 1', description: 'Math Description', creditHours: 4, prereqs: [], coreqs: [] }
        ];

        mockUseCourseSearch.mockReturnValue({
            query: '',
            setQuery: vi.fn(),
            subject: '',
            setSubject: vi.fn(),
            courses: mockCourses,
            loading: false,
            error: null
        });

        render(<CoursesPage />);

        // Assert header exists
        expect(screen.getByText('Browse Courses')).toBeInTheDocument();

        // Assert items exist via text
        expect(screen.getByText('CS 3500: Object-Oriented Design')).toBeInTheDocument();
        expect(screen.getByText('OOD Description')).toBeInTheDocument();
        expect(screen.getByText('CS2510')).toBeInTheDocument(); // prerq tag

        expect(screen.getByText('MATH 1341: Calculus 1')).toBeInTheDocument();
        expect(screen.getByText('Showing 2 results')).toBeInTheDocument();
    });

    it('allows searching and filtering input visually updating state', async () => {
        const setQueryMock = vi.fn();
        const setSubjectMock = vi.fn();

        mockUseCourseSearch.mockReturnValue({
            query: '',
            setQuery: setQueryMock,
            subject: '',
            setSubject: setSubjectMock,
            courses: [],
            loading: false,
            error: null
        });

        render(<CoursesPage />);

        const searchInput = screen.getByRole('textbox', { name: /Search courses/i });
        const subjectSelect = screen.getByRole('combobox', { name: /Filter by Subject/i });

        await userEvent.type(searchInput, 'Data');
        expect(setQueryMock).toHaveBeenCalled();

        await userEvent.selectOptions(subjectSelect, 'CS');
        expect(setSubjectMock).toHaveBeenCalledWith('CS');
    });
});
