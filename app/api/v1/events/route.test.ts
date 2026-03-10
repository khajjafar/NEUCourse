import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { verifyAuth } from '@/lib/api-helpers';

vi.mock('firebase-admin/firestore', () => ({
    FieldValue: { serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP') },
}));

const { eventsGet, eventAdd, savedDocGet } = vi.hoisted(() => ({
    eventsGet: vi.fn(),
    eventAdd: vi.fn(),
    savedDocGet: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => {
    const eventsRef = {
        orderBy: vi.fn().mockReturnThis(),
        get: eventsGet,
        add: eventAdd,
    };
    const userDocRef = { collection: vi.fn(() => eventsRef) };
    return {
        adminDb: { collection: vi.fn(() => ({ doc: vi.fn(() => userDocRef) })) },
    };
});

vi.mock('@/lib/api-helpers', () => ({
    verifyAuth: vi.fn(),
    successResponse: vi.fn((data, status = 200) => ({ status, data })),
    errorResponse: vi.fn((msg, code, status = 400) => ({ status, error: { message: msg, code } })),
}));

describe('/api/v1/events', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('GET', () => {
        it('returns 401 when unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });
            const res = await GET(new Request('http://localhost/api/v1/events')) as any;
            expect(res.status).toBe(401);
        });

        it('returns list of events', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            eventsGet.mockResolvedValueOnce({
                docs: [
                    { id: 'e1', data: () => ({ title: 'CS Lecture', startTime: '09:00' }) },
                ],
            });
            const res = await GET(new Request('http://localhost/api/v1/events')) as any;
            expect(res.status).toBe(200);
            expect(res.data).toHaveLength(1);
            expect(res.data[0]).toMatchObject({ id: 'e1', title: 'CS Lecture' });
        });

        it('returns 500 on Firestore error', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            eventsGet.mockRejectedValueOnce(new Error('DB error'));
            const res = await GET(new Request('http://localhost/api/v1/events')) as any;
            expect(res.status).toBe(500);
        });
    });

    describe('POST', () => {
        it('returns 401 when unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });
            const res = await POST(new Request('http://localhost/api/v1/events', {
                method: 'POST',
                body: JSON.stringify({ title: 'Class', startTime: '9', endTime: '10' }),
            })) as any;
            expect(res.status).toBe(401);
        });

        it('returns 400 when required fields are missing', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await POST(new Request('http://localhost/api/v1/events', {
                method: 'POST',
                body: JSON.stringify({ title: 'Class' }),
            })) as any;
            expect(res.status).toBe(400);
        });

        it('returns 400 when title is missing', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await POST(new Request('http://localhost/api/v1/events', {
                method: 'POST',
                body: JSON.stringify({ startTime: '09:00', endTime: '10:00' }),
            })) as any;
            expect(res.status).toBe(400);
        });

        it('creates event with default color and location', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const newDocRef = { id: 'ev1', get: savedDocGet };
            eventAdd.mockResolvedValueOnce(newDocRef);
            savedDocGet.mockResolvedValueOnce({
                data: () => ({ title: 'Class', startTime: '09:00', endTime: '10:00', color: 'blue', location: '' }),
            });
            const res = await POST(new Request('http://localhost/api/v1/events', {
                method: 'POST',
                body: JSON.stringify({ title: 'Class', startTime: '09:00', endTime: '10:00' }),
            })) as any;
            expect(res.status).toBe(201);
            expect(res.data).toMatchObject({ id: 'ev1' });
        });

        it('creates event with provided color and location', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const newDocRef = { id: 'ev2', get: savedDocGet };
            eventAdd.mockResolvedValueOnce(newDocRef);
            savedDocGet.mockResolvedValueOnce({
                data: () => ({ title: 'Club', startTime: '14:00', endTime: '15:00', color: 'green', location: 'WVH' }),
            });
            const res = await POST(new Request('http://localhost/api/v1/events', {
                method: 'POST',
                body: JSON.stringify({ title: 'Club', startTime: '14:00', endTime: '15:00', color: 'green', location: 'WVH' }),
            })) as any;
            expect(res.status).toBe(201);
        });

        it('returns 500 on Firestore error', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            eventAdd.mockRejectedValueOnce(new Error('DB error'));
            const res = await POST(new Request('http://localhost/api/v1/events', {
                method: 'POST',
                body: JSON.stringify({ title: 'Class', startTime: '09:00', endTime: '10:00' }),
            })) as any;
            expect(res.status).toBe(500);
        });
    });
});
