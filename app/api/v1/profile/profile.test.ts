import { GET, PATCH } from './route';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth } from '@/lib/api-helpers';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/firebase-admin', () => {
    const mockRef = {
        get: vi.fn(),
        set: vi.fn()
    };
    return {
        adminDb: {
            collection: vi.fn(() => ({
                doc: vi.fn(() => mockRef)
            }))
        }
    };
});

vi.mock('@/lib/api-helpers', () => ({
    verifyAuth: vi.fn(),
    successResponse: vi.fn((data, status = 200) => ({ status, data })),
    errorResponse: vi.fn((msg, code, status) => ({ status, error: { message: msg, code } }))
}));

describe('/api/v1/profile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET', () => {
        it('should return 401 if unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });

            const req = new Request('http://localhost:3000/api/v1/profile');
            const res = await GET(req);

            expect(res.status).toBe(401);
        });

        it('should return profile data if authenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const mockData = { requirements: [{ id: '1', name: 'Elec', count: 4 }] };

            const mockGet = adminDb.collection('users').doc('u1').get as any;
            mockGet.mockResolvedValueOnce({ exists: true, data: () => mockData });

            const req = new Request('http://localhost:3000/api/v1/profile');
            const res = await GET(req) as any;

            expect(res.status).toBe(200);
            expect(res.data).toEqual(mockData);
        });
    });

    describe('PATCH', () => {
        it('should return 401 if unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });

            const req = new Request('http://localhost:3000/api/v1/profile', {
                method: 'PATCH',
                body: JSON.stringify({})
            });

            const res = await PATCH(req);
            expect(res.status).toBe(401);
        });

        it('should return 400 if requirements is not an array', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);

            const req = new Request('http://localhost:3000/api/v1/profile', {
                method: 'PATCH',
                body: JSON.stringify({ requirements: 'not-an-array' })
            });

            const res = await PATCH(req) as any;
            expect(res.status).toBe(400);
        });

        it('should update requirements successfully', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);

            const req = new Request('http://localhost:3000/api/v1/profile', {
                method: 'PATCH',
                body: JSON.stringify({ requirements: [{ id: '1', name: 'Elec', count: 4 }] })
            });

            const mockSet = adminDb.collection('users').doc('u1').set as any;
            mockSet.mockResolvedValueOnce({});

            const res = await PATCH(req) as any;
            expect(res.status).toBe(200);
            expect(mockSet).toHaveBeenCalledWith({ requirements: [{ id: '1', name: 'Elec', count: 4 }] }, { merge: true });
        });

        it('should update with empty object when requirements is undefined', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);

            const req = new Request('http://localhost:3000/api/v1/profile', {
                method: 'PATCH',
                body: JSON.stringify({})
            });

            const mockSet = adminDb.collection('users').doc('u1').set as any;
            mockSet.mockResolvedValueOnce({});

            const res = await PATCH(req) as any;
            expect(res.status).toBe(200);
            expect(mockSet).toHaveBeenCalledWith({}, { merge: true });
        });

        it('should return 500 if Firestore set throws', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);

            const req = new Request('http://localhost:3000/api/v1/profile', {
                method: 'PATCH',
                body: JSON.stringify({ requirements: [] })
            });

            const mockSet = adminDb.collection('users').doc('u1').set as any;
            mockSet.mockRejectedValueOnce(new Error('Firestore error'));

            const res = await PATCH(req) as any;
            expect(res.status).toBe(500);
        });
    });

    describe('GET additional branches', () => {
        it('should return empty object if user doc does not exist', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);

            const mockGet = adminDb.collection('users').doc('u1').get as any;
            mockGet.mockResolvedValueOnce({ exists: false });

            const req = new Request('http://localhost:3000/api/v1/profile');
            const res = await GET(req) as any;

            expect(res.status).toBe(200);
            expect(res.data).toEqual({});
        });

        it('should return 500 if Firestore get throws', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);

            const mockGet = adminDb.collection('users').doc('u1').get as any;
            mockGet.mockRejectedValueOnce(new Error('Firestore error'));

            const req = new Request('http://localhost:3000/api/v1/profile');
            const res = await GET(req) as any;

            expect(res.status).toBe(500);
        });
    });
});
