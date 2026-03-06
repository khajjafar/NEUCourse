import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from './page';
import * as useAuthHook from '@/hooks/useAuth';
import * as usePlansHook from '@/hooks/usePlans';
import * as useEventsHook from '@/hooks/useEvents';
import { addDays, subDays } from 'date-fns';

// Mock Firebase
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
}));
vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
}));
vi.mock('@/lib/firebase', () => ({
    auth: {},
    db: {}
}));

// Mock the Link component from next/link
vi.mock('next/link', () => ({
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock AuthGuard to just return children
vi.mock('@/components/AuthGuard', () => ({
    AuthGuard: ({ children }: any) => <>{children}</>,
}));

describe('DashboardPage', () => {
    const mockUseAuth = vi.spyOn(useAuthHook, 'useAuth');
    const mockUsePlans = vi.spyOn(usePlansHook, 'usePlans');
    const mockUseEvents = vi.spyOn(useEventsHook, 'useEvents');

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseAuth.mockReturnValue({
            user: { email: 'student@neu.edu', uid: '123' } as any,
            loading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
        });
    });

    it('renders loading states correctly', () => {
        mockUsePlans.mockReturnValue({ plans: [], loading: true, error: null, createPlan: vi.fn(), deletePlan: vi.fn(), renamePlan: vi.fn() as any });
        mockUseEvents.mockReturnValue({ events: [], loading: true, error: null, addEvent: vi.fn() as any, updateEvent: vi.fn() as any, deleteEvent: vi.fn(), refreshEvents: vi.fn() });

        const { container } = render(<DashboardPage />);
        expect(screen.getByText('student@neu.edu')).toBeInTheDocument();

        // Find skeleton loaders by testing the DOM
        const skeletonLoaders = container.querySelectorAll('.animate-pulse');
        expect(skeletonLoaders.length).toBeGreaterThan(0);
    });

    it('renders empty states when no data is available', () => {
        mockUsePlans.mockReturnValue({ plans: [], loading: false, error: null, createPlan: vi.fn(), deletePlan: vi.fn(), renamePlan: vi.fn() as any });
        mockUseEvents.mockReturnValue({ events: [], loading: false, error: null, addEvent: vi.fn() as any, updateEvent: vi.fn() as any, deleteEvent: vi.fn(), refreshEvents: vi.fn() });

        render(<DashboardPage />);
        expect(screen.getByText('No active plans.')).toBeInTheDocument();
        expect(screen.getByText('No scheduled events.')).toBeInTheDocument();
    });

    it('displays plans and correctly formats timestamps', () => {
        const now = new Date();
        const updatedDate = subDays(now, 2);

        const mockPlans = [
            { id: '1', name: 'Software Engineering', semesterCount: 4, createdAt: { seconds: updatedDate.getTime() / 1000, nanoseconds: 0 } },
            { id: '2', name: 'Computer Science', semesterCount: 8, updatedAt: { seconds: updatedDate.getTime() / 1000, nanoseconds: 0 } },
        ];

        mockUsePlans.mockReturnValue({ plans: mockPlans, loading: false, error: null, createPlan: vi.fn(), deletePlan: vi.fn(), renamePlan: vi.fn() as any });
        mockUseEvents.mockReturnValue({ events: [], loading: false, error: null, addEvent: vi.fn() as any, updateEvent: vi.fn() as any, deleteEvent: vi.fn(), refreshEvents: vi.fn() });

        render(<DashboardPage />);

        expect(screen.getByText('Software Engineering')).toBeInTheDocument();
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
        expect(screen.getByText('4 Semesters')).toBeInTheDocument();
        expect(screen.getByText('8 Semesters')).toBeInTheDocument();

        // Check for relative time strings
        const updatedTexts = screen.getAllByText(/Updated.*days ago/);
        expect(updatedTexts.length).toBe(2);
    });

    it('filters and displays upcoming calendar events correctly', () => {
        const now = new Date();
        const pastEvent = subDays(now, 1);
        const soonEvent = addDays(now, 2);
        const farFutureEvent = addDays(now, 10);

        const mockEvents = [
            { id: '1', title: 'Past Event', startTime: pastEvent.toISOString(), endTime: pastEvent.toISOString() },
            { id: '2', title: 'Next Week Event', startTime: soonEvent.toISOString(), endTime: soonEvent.toISOString(), color: 'blue' },
            { id: '3', title: 'Far Future Event', startTime: farFutureEvent.toISOString(), endTime: farFutureEvent.toISOString() },
        ];

        mockUsePlans.mockReturnValue({ plans: [], loading: false, error: null, createPlan: vi.fn(), deletePlan: vi.fn(), renamePlan: vi.fn() as any });
        mockUseEvents.mockReturnValue({ events: mockEvents, loading: false, error: null, addEvent: vi.fn() as any, updateEvent: vi.fn() as any, deleteEvent: vi.fn(), refreshEvents: vi.fn() });

        render(<DashboardPage />);

        // Should ignore past events and far future events
        expect(screen.queryByText('Past Event')).not.toBeInTheDocument();
        expect(screen.queryByText('Far Future Event')).not.toBeInTheDocument();

        // Should show the event that is 2 days from now
        expect(screen.getByText('Next Week Event')).toBeInTheDocument();
    });
});
