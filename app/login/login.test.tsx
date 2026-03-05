import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './page';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: vi.fn(),
    getAuth: vi.fn(),
}));
vi.mock('@/lib/firebase', () => ({
    auth: {},
}));

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form properly', () => {
        render(<LoginPage />);
        expect(screen.getByText('Plan your degree. Own your schedule.')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('calls signInWithEmailAndPassword on form submit', async () => {
        vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({} as any);
        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'student@neu.edu' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'student@neu.edu', 'password123');
        });
    });

    it('shows generic error message on failure', async () => {
        vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(new Error('auth/invalid-credential'));
        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'student@neu.edu' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

        await waitFor(() => {
            expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
        });
    });
});
