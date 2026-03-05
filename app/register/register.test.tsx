import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from './page';
import { createUserWithEmailAndPassword } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: vi.fn(),
    getAuth: vi.fn(),
}));
vi.mock('@/lib/firebase', () => ({
    auth: {},
}));

describe('RegisterPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('validates password length before submitting', async () => {
        render(<RegisterPage />);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'student@neu.edu' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

        await waitFor(() => {
            expect(screen.getByText('Password must be at least 8 characters long.')).toBeInTheDocument();
            expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
        });
    });

    it('shows email in use error if firebase returns auth/email-already-in-use', async () => {
        vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
        render(<RegisterPage />);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'student@neu.edu' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'validpassword' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

        await waitFor(() => {
            expect(screen.getByText('This email is already registered. Please log in.')).toBeInTheDocument();
        });
    });

    it('successfully calls createUser on valid input', async () => {
        vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({} as any);
        render(<RegisterPage />);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'newstudent@neu.edu' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'strongpassword' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'newstudent@neu.edu', 'strongpassword');
        });
    });
});
