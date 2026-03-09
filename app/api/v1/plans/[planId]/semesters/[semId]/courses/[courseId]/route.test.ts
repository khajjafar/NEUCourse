import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DELETE } from './route';
import { verifyAuth } from '@/lib/api-helpers';
import { NextRequest } from 'next/server';

vi.mock('firebase-admin/firestore', () => ({
    FieldValue: { serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP') },
}));

const { semDocGet, semUpdate, planUpdate } = vi.hoisted(() => ({
    semDocGet: vi.fn(),
    semUpdate: vi.fn(),
    planUpdate: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => {
    const semDocRef = { get: semDocGet, update: semUpdate };
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

const ctx = { params: Promise.resolve({ planId: 'plan1', semId: 'sem1', courseId: 'CS3500' }) };
const makeReq = () =>
    new NextRequest('http://localhost/api/v1/plans/plan1/semesters/sem1/courses/CS3500', {
        method: 'DELETE',
    });

describe('/api/v1/plans/[planId]/semesters/[semId]/courses/[courseId]', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('DELETE', () => {
        it('returns 401 when unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });
            const res = await DELETE(makeReq(), ctx) as any;
            expect(res.status).toBe(401);
        });

        it('returns 404 when semester does not exist', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            semDocGet.mockResolvedValueOnce({ exists: false });
            const res = await DELETE(makeReq(), ctx) as any;
            expect(res.status).toBe(404);
        });

        it('removes a course stored as a string', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            semDocGet.mockResolvedValueOnce({
                exists: true,
                data: () => ({ courses: ['CS3500', 'CS2500'] }),
            });
            semUpdate.mockResolvedValueOnce(undefined);
            planUpdate.mockResolvedValueOnce(undefined);
            const res = await DELETE(makeReq(), ctx) as any;
            expect(res.status).toBe(200);
            expect(res.data).toEqual({ removed: true, courseId: 'CS3500' });
        });

        it('removes a course stored as an object with courseId', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            semDocGet.mockResolvedValueOnce({
                exists: true,
                data: () => ({ courses: [{ courseId: 'CS3500', crn: '12345' }, { courseId: 'CS2500' }] }),
            });
            semUpdate.mockResolvedValueOnce(undefined);
            planUpdate.mockResolvedValueOnce(undefined);
            const res = await DELETE(makeReq(), ctx) as any;
            expect(res.status).toBe(200);
        });

        it('handles empty courses array', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            semDocGet.mockResolvedValueOnce({
                exists: true,
                data: () => ({ courses: [] }),
            });
            semUpdate.mockResolvedValueOnce(undefined);
            planUpdate.mockResolvedValueOnce(undefined);
            const res = await DELETE(makeReq(), ctx) as any;
            expect(res.status).toBe(200);
        });

        it('returns 404 when GRPC NOT_FOUND error (code 5)', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            semDocGet.mockRejectedValueOnce(Object.assign(new Error('NOT_FOUND'), { code: 5 }));
            const res = await DELETE(makeReq(), ctx) as any;
            expect(res.status).toBe(404);
        });

        it('returns 500 on unexpected error', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            semDocGet.mockRejectedValueOnce(new Error('Unexpected'));
            const res = await DELETE(makeReq(), ctx) as any;
            expect(res.status).toBe(500);
        });
    });
});
