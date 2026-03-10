import { vi, describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { verifyAuth } from '@/lib/api-helpers';
import { NextRequest } from 'next/server';

vi.mock('firebase-admin/firestore', () => ({
    FieldValue: {
        serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
        arrayUnion: vi.fn((...args: unknown[]) => args),
    },
}));

const { semUpdate, planUpdate } = vi.hoisted(() => ({
    semUpdate: vi.fn(),
    planUpdate: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => {
    const semDocRef = { update: semUpdate };
    const semsRef = { doc: vi.fn(() => semDocRef) };
    const planDocRef = {
        collection: vi.fn(() => semsRef),
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

const ctx = { params: Promise.resolve({ planId: 'plan1', semId: 'sem1' }) };
const makeReq = (body: object) =>
    new NextRequest('http://localhost/api/v1/plans/plan1/semesters/sem1/courses', {
        method: 'POST',
        body: JSON.stringify(body),
    });

describe('/api/v1/plans/[planId]/semesters/[semId]/courses', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('POST', () => {
        it('returns 401 when unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });
            const res = await POST(makeReq({ courseId: 'CS3500' }), ctx) as any;
            expect(res.status).toBe(401);
        });

        it('returns 400 when courseId is missing', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await POST(makeReq({}), ctx) as any;
            expect(res.status).toBe(400);
        });

        it('returns 400 when courseId is empty string', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await POST(makeReq({ courseId: '   ' }), ctx) as any;
            expect(res.status).toBe(400);
        });

        it('returns 400 when courseId is not a string', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await POST(makeReq({ courseId: 42 }), ctx) as any;
            expect(res.status).toBe(400);
        });

        it('adds course without CRN', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            semUpdate.mockResolvedValueOnce(undefined);
            planUpdate.mockResolvedValueOnce(undefined);
            const res = await POST(makeReq({ courseId: 'CS3500' }), ctx) as any;
            expect(res.status).toBe(200);
            expect(res.data).toMatchObject({ added: true, courseId: 'CS3500' });
        });

        it('adds course with CRN', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            semUpdate.mockResolvedValueOnce(undefined);
            planUpdate.mockResolvedValueOnce(undefined);
            const res = await POST(makeReq({ courseId: 'CS3500', crn: '12345' }), ctx) as any;
            expect(res.status).toBe(200);
            expect(res.data).toMatchObject({ added: true, courseId: 'CS3500', crn: '12345' });
        });

        it('returns 404 when semester not found (GRPC code 5)', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const err = Object.assign(new Error('NOT_FOUND'), { code: 5 });
            semUpdate.mockRejectedValueOnce(err);
            const res = await POST(makeReq({ courseId: 'CS3500' }), ctx) as any;
            expect(res.status).toBe(404);
        });

        it('returns 500 on unexpected Firestore error', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            semUpdate.mockRejectedValueOnce(new Error('Unknown error'));
            const res = await POST(makeReq({ courseId: 'CS3500' }), ctx) as any;
            expect(res.status).toBe(500);
        });
    });
});
