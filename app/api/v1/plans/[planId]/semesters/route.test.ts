import { vi, describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { verifyAuth } from '@/lib/api-helpers';
import { NextRequest } from 'next/server';

vi.mock('firebase-admin/firestore', () => ({
    FieldValue: { serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP') },
}));

const { semAdd, planUpdate } = vi.hoisted(() => ({
    semAdd: vi.fn(),
    planUpdate: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => {
    const semRef = { add: semAdd };
    const planDocRef = {
        collection: vi.fn(() => semRef),
        update: planUpdate,
    };
    const plansRef = { doc: vi.fn(() => planDocRef) };
    const userDocRef = { collection: vi.fn(() => plansRef) };
    return {
        adminDb: { collection: vi.fn(() => ({ doc: vi.fn(() => userDocRef) })) },
    };
});

vi.mock('@/lib/api-helpers', () => ({
    verifyAuth: vi.fn(),
    successResponse: vi.fn((data, status = 200) => ({ status, data })),
    errorResponse: vi.fn((msg, code, status = 400) => ({ status, error: { message: msg, code } })),
}));

const ctx = { params: Promise.resolve({ planId: 'plan1' }) };
const makeReq = (body: object) =>
    new NextRequest('http://localhost/api/v1/plans/plan1/semesters', {
        method: 'POST',
        body: JSON.stringify(body),
    });

describe('/api/v1/plans/[planId]/semesters', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('POST', () => {
        it('returns 401 when unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });
            const res = await POST(makeReq({ name: 'Fall 2026' }), ctx) as any;
            expect(res.status).toBe(401);
        });

        it('returns 400 when name is missing', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await POST(makeReq({}), ctx) as any;
            expect(res.status).toBe(400);
        });

        it('returns 400 when name is whitespace only', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await POST(makeReq({ name: '   ' }), ctx) as any;
            expect(res.status).toBe(400);
        });

        it('returns 400 when name is not a string', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await POST(makeReq({ name: 123 }), ctx) as any;
            expect(res.status).toBe(400);
        });

        it('creates semester with default order=0 when order not provided', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            semAdd.mockResolvedValueOnce({ id: 'sem1' });
            planUpdate.mockResolvedValueOnce(undefined);
            const res = await POST(makeReq({ name: 'Fall 2026' }), ctx) as any;
            expect(res.status).toBe(201);
            expect(res.data).toMatchObject({ id: 'sem1', name: 'Fall 2026', order: 0, courses: [] });
        });

        it('creates semester with provided order', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            semAdd.mockResolvedValueOnce({ id: 'sem2' });
            planUpdate.mockResolvedValueOnce(undefined);
            const res = await POST(makeReq({ name: 'Spring 2027', order: 2 }), ctx) as any;
            expect(res.status).toBe(201);
            expect(res.data.order).toBe(2);
        });

        it('returns 500 on Firestore error', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            semAdd.mockRejectedValueOnce(new Error('DB error'));
            const res = await POST(makeReq({ name: 'Fall 2026' }), ctx) as any;
            expect(res.status).toBe(500);
        });
    });
});
