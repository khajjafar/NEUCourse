import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth, AuthProvider } from './useAuth';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Mock Firebase
vi.mock('firebase/auth', () => {
    return {
        onAuthStateChanged: vi.fn(),
        signOut: vi.fn(),
        getAuth: vi.fn(),
    };
});
vi.mock('../lib/firebase', () => ({
    auth: {},
}));

describe('useAuth hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('provides initial loading state', () => {
        // onAuthStateChanged returns a mock unsubscribe function
        vi.mocked(onAuthStateChanged).mockImplementationOnce((auth, callback) => {
            // Don't call the callback immediately to simulate loading
            return vi.fn();
        });

        const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
        expect(result.current.loading).toBe(true);
        expect(result.current.user).toBeNull();
    });

    it('updates state when user logs in', async () => {
        const mockUser = { uid: '123', email: 'test@example.com' };

        vi.mocked(onAuthStateChanged).mockImplementationOnce((auth, callback) => {
            // Simulate immediate auth change event
            callback(mockUser as any);
            return vi.fn();
        });

        const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockUser);
    });

    it('calls signOut correctly', async () => {
        vi.mocked(onAuthStateChanged).mockImplementationOnce((auth, callback) => {
            callback(null);
            return vi.fn();
        });
        vi.mocked(signOut).mockResolvedValueOnce();

        const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

        await act(async () => {
            await result.current.logout();
        });

        expect(signOut).toHaveBeenCalledTimes(1);
    });
});
