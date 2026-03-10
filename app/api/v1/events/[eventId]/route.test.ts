import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DELETE, PUT } from './route';
import { verifyAuth } from '@/lib/api-helpers';

vi.mock('firebase-admin/firestore', () => ({
    FieldValue: { serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP') },
}));

const { eventDocGet, eventDocDelete, eventDocUpdate } = vi.hoisted(() => ({
    eventDocGet: vi.fn(),
    eventDocDelete: vi.fn(),
    eventDocUpdate: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => {
    const eventDocRef = {
        get: eventDocGet,
        delete: eventDocDelete,
        update: eventDocUpdate,
    };
    const eventsRef = { doc: vi.fn(() => eventDocRef) };
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

const ctx = { params: Promise.resolve({ eventId: 'ev1' }) };
const makeReq = (method: string, body?: object) =>
    new Request(`http://localhost/api/v1/events/ev1`, {
        method,
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

describe('/api/v1/events/[eventId]', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('DELETE', () => {
        it('returns 401 when unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });
            const res = await DELETE(makeReq('DELETE'), ctx) as any;
            expect(res.status).toBe(401);
        });

        it('returns 404 when event does not exist', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            eventDocGet.mockResolvedValueOnce({ exists: false });
            const res = await DELETE(makeReq('DELETE'), ctx) as any;
            expect(res.status).toBe(404);
        });

        it('deletes event successfully', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            eventDocGet.mockResolvedValueOnce({ exists: true });
            eventDocDelete.mockResolvedValueOnce(undefined);
            const res = await DELETE(makeReq('DELETE'), ctx) as any;
            expect(res.status).toBe(200);
            expect(res.data).toEqual({ success: true });
        });

        it('returns 500 on Firestore error', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            eventDocGet.mockRejectedValueOnce(new Error('DB error'));
            const res = await DELETE(makeReq('DELETE'), ctx) as any;
            expect(res.status).toBe(500);
        });
    });

    describe('PUT', () => {
        it('returns 401 when unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });
            const res = await PUT(makeReq('PUT', { title: 'T', startTime: 's', endTime: 'e' }), ctx) as any;
            expect(res.status).toBe(401);
        });

        it('returns 400 when required fields are missing', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await PUT(makeReq('PUT', { title: 'Class' }), ctx) as any;
            expect(res.status).toBe(400);
        });

        it('returns 404 when event does not exist', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            eventDocGet.mockResolvedValueOnce({ exists: false });
            const res = await PUT(makeReq('PUT', { title: 'T', startTime: 's', endTime: 'e' }), ctx) as any;
            expect(res.status).toBe(404);
        });

        it('updates event successfully with defaults', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            eventDocGet.mockResolvedValueOnce({ exists: true });
            eventDocUpdate.mockResolvedValueOnce(undefined);
            const res = await PUT(makeReq('PUT', { title: 'Class', startTime: '09:00', endTime: '10:00' }), ctx) as any;
            expect(res.status).toBe(200);
            expect(res.data).toMatchObject({ id: 'ev1', title: 'Class', color: 'blue', location: '' });
        });

        it('updates event with provided color and location', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            eventDocGet.mockResolvedValueOnce({ exists: true });
            eventDocUpdate.mockResolvedValueOnce(undefined);
            const res = await PUT(makeReq('PUT', {
                title: 'Club', startTime: '14:00', endTime: '15:00', color: 'red', location: 'SL'
            }), ctx) as any;
            expect(res.status).toBe(200);
            expect(res.data).toMatchObject({ color: 'red', location: 'SL' });
        });

        it('returns 500 on Firestore error', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            eventDocGet.mockRejectedValueOnce(new Error('DB error'));
            const res = await PUT(makeReq('PUT', { title: 'T', startTime: 's', endTime: 'e' }), ctx) as any;
            expect(res.status).toBe(500);
        });
    });
});
