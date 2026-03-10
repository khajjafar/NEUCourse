import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GET, DELETE, PUT, PATCH } from './route';
import { verifyAuth } from '@/lib/api-helpers';
import { NextRequest } from 'next/server';

vi.mock('firebase-admin/firestore', () => ({
    FieldValue: { serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP') },
}));

const { planDocGet, planDocDelete, planDocUpdate, semQueryGet } = vi.hoisted(() => ({
    planDocGet: vi.fn(),
    planDocDelete: vi.fn(),
    planDocUpdate: vi.fn(),
    semQueryGet: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => {
    const semQueryRef = { orderBy: vi.fn().mockReturnThis(), get: semQueryGet };
    const planDocRef = {
        get: planDocGet,
        delete: planDocDelete,
        update: planDocUpdate,
        collection: vi.fn(() => semQueryRef),
    };
    const plansColRef = { doc: vi.fn(() => planDocRef) };
    const userDocRef = { collection: vi.fn(() => plansColRef) };
    return {
        adminDb: { collection: vi.fn(() => ({ doc: vi.fn(() => userDocRef) })) },
    };
});

vi.mock('@/lib/api-helpers', () => ({
    verifyAuth: vi.fn(),
    successResponse: vi.fn((data, status = 200) => ({ status, data })),
    errorResponse: vi.fn((msg, code, status = 400) => ({ status, error: { message: msg, code } })),
}));

const makeReq = (method = 'GET', body?: object) =>
    new NextRequest('http://localhost/api/v1/plans/plan1', {
        method,
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

const ctx = { params: Promise.resolve({ planId: 'plan1' }) };

describe('/api/v1/plans/[planId]', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('GET', () => {
        it('returns 401 when unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });
            const res = await GET(makeReq(), ctx) as any;
            expect(res.status).toBe(401);
        });

        it('returns 404 when plan does not exist', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            planDocGet.mockResolvedValueOnce({ exists: false });
            const res = await GET(makeReq(), ctx) as any;
            expect(res.status).toBe(404);
        });

        it('returns plan with semesters', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            planDocGet.mockResolvedValueOnce({ exists: true, id: 'plan1', data: () => ({ name: 'CS Plan' }) });
            semQueryGet.mockResolvedValueOnce({
                docs: [{ id: 's1', data: () => ({ name: 'Fall 2026', order: 1 }) }],
            });
            const res = await GET(makeReq(), ctx) as any;
            expect(res.status).toBe(200);
            expect(res.data).toMatchObject({ name: 'CS Plan', semesters: [{ id: 's1' }] });
        });

        it('returns 500 on Firestore error', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            planDocGet.mockRejectedValueOnce(new Error('DB error'));
            const res = await GET(makeReq(), ctx) as any;
            expect(res.status).toBe(500);
        });
    });

    describe('DELETE', () => {
        it('returns 401 when unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });
            const res = await DELETE(makeReq('DELETE'), ctx) as any;
            expect(res.status).toBe(401);
        });

        it('deletes plan successfully', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            planDocDelete.mockResolvedValueOnce(undefined);
            const res = await DELETE(makeReq('DELETE'), ctx) as any;
            expect(res.status).toBe(200);
            expect(res.data).toEqual({ deleted: true });
        });

        it('returns 500 on Firestore error', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            planDocDelete.mockRejectedValueOnce(new Error('DB error'));
            const res = await DELETE(makeReq('DELETE'), ctx) as any;
            expect(res.status).toBe(500);
        });
    });

    describe('PUT', () => {
        it('returns 401 when unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });
            const res = await PUT(makeReq('PUT', { name: 'New Name' }), ctx) as any;
            expect(res.status).toBe(401);
        });

        it('returns 400 when name is missing', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await PUT(makeReq('PUT', {}), ctx) as any;
            expect(res.status).toBe(400);
        });

        it('returns 400 when name is whitespace only', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await PUT(makeReq('PUT', { name: '   ' }), ctx) as any;
            expect(res.status).toBe(400);
        });

        it('returns 404 when plan does not exist', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            planDocGet.mockResolvedValueOnce({ exists: false });
            const res = await PUT(makeReq('PUT', { name: 'New Name' }), ctx) as any;
            expect(res.status).toBe(404);
        });

        it('renames plan successfully', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            planDocGet.mockResolvedValueOnce({ exists: true });
            planDocUpdate.mockResolvedValueOnce(undefined);
            const res = await PUT(makeReq('PUT', { name: 'Updated Plan' }), ctx) as any;
            expect(res.status).toBe(200);
            expect(res.data).toMatchObject({ id: 'plan1', name: 'Updated Plan' });
        });

        it('returns 500 on Firestore error', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            planDocGet.mockRejectedValueOnce(new Error('DB error'));
            const res = await PUT(makeReq('PUT', { name: 'Plan' }), ctx) as any;
            expect(res.status).toBe(500);
        });
    });

    describe('PATCH', () => {
        it('returns 401 when unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });
            const res = await PATCH(makeReq('PATCH', { name: 'Name' }), ctx) as any;
            expect(res.status).toBe(401);
        });

        it('returns 400 when body is empty', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await PATCH(makeReq('PATCH', {}), ctx) as any;
            expect(res.status).toBe(400);
        });

        it('returns 400 when name is invalid', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await PATCH(makeReq('PATCH', { name: '' }), ctx) as any;
            expect(res.status).toBe(400);
        });

        it('returns 404 when plan does not exist', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            planDocGet.mockResolvedValueOnce({ exists: false });
            const res = await PATCH(makeReq('PATCH', { name: 'New' }), ctx) as any;
            expect(res.status).toBe(404);
        });

        it('patches plan successfully', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            planDocGet.mockResolvedValueOnce({ exists: true });
            planDocUpdate.mockResolvedValueOnce(undefined);
            const res = await PATCH(makeReq('PATCH', { name: 'Patched' }), ctx) as any;
            expect(res.status).toBe(200);
        });

        it('returns 500 on Firestore error', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            planDocGet.mockRejectedValueOnce(new Error('DB error'));
            const res = await PATCH(makeReq('PATCH', { name: 'Plan' }), ctx) as any;
            expect(res.status).toBe(500);
        });
    });
});
