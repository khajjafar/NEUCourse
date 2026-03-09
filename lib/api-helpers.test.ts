import { verifyAuth, errorResponse, successResponse } from './api-helpers';
import { adminAuth } from './firebase-admin';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('./firebase-admin', () => ({
    adminAuth: { verifyIdToken: vi.fn() },
    adminDb: {},
}));

describe('api-helpers', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('verifyAuth', () => {
        it('returns error when Authorization header is missing', async () => {
            const req = new Request('http://localhost/api/test');
            const result = await verifyAuth(req);
            expect(result.user).toBeNull();
            expect(result.error).toBe('Unauthorized: Missing or invalid token');
        });

        it('returns error when Authorization header does not start with Bearer', async () => {
            const req = new Request('http://localhost/api/test', {
                headers: { Authorization: 'Basic abc123' },
            });
            const result = await verifyAuth(req);
            expect(result.user).toBeNull();
            expect(result.error).toBe('Unauthorized: Missing or invalid token');
        });

        it('returns error when token verification fails', async () => {
            vi.mocked(adminAuth.verifyIdToken).mockRejectedValueOnce(new Error('invalid token'));
            const req = new Request('http://localhost/api/test', {
                headers: { Authorization: 'Bearer bad-token' },
            });
            const result = await verifyAuth(req);
            expect(result.user).toBeNull();
            expect(result.error).toBe('Unauthorized: Invalid token');
        });

        it('returns decoded user when token is valid', async () => {
            const mockUser = { uid: 'user123', email: 'test@neu.edu' };
            vi.mocked(adminAuth.verifyIdToken).mockResolvedValueOnce(mockUser as any);
            const req = new Request('http://localhost/api/test', {
                headers: { Authorization: 'Bearer valid-token' },
            });
            const result = await verifyAuth(req);
            expect(result.user).toEqual(mockUser);
            expect(result.error).toBeNull();
        });
    });

    describe('errorResponse', () => {
        it('returns 400 with default code BAD_REQUEST', async () => {
            const res = errorResponse('Something went wrong');
            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body).toEqual({ error: { code: 'BAD_REQUEST', message: 'Something went wrong' } });
        });

        it('uses custom code and status', async () => {
            const res = errorResponse('Not found', 'NOT_FOUND', 404);
            expect(res.status).toBe(404);
            const body = await res.json();
            expect(body.error.code).toBe('NOT_FOUND');
            expect(body.error.message).toBe('Not found');
        });

        it('uses 401 status for UNAUTHORIZED', async () => {
            const res = errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
            expect(res.status).toBe(401);
        });
    });

    describe('successResponse', () => {
        it('returns 200 with data wrapped in data key', async () => {
            const res = successResponse({ id: 'abc' });
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body).toEqual({ data: { id: 'abc' } });
        });

        it('uses custom status code', async () => {
            const res = successResponse({ id: 'new' }, 201);
            expect(res.status).toBe(201);
        });

        it('handles null/empty data', async () => {
            const res = successResponse(null);
            const body = await res.json();
            expect(body).toEqual({ data: null });
        });
    });
});
