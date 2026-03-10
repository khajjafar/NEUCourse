import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { verifyAuth } from '@/lib/api-helpers';

vi.mock('firebase-admin/firestore', () => ({
    FieldValue: { serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP') },
}));

const { plansGet, semGet, planAdd } = vi.hoisted(() => ({
    plansGet: vi.fn(),
    semGet: vi.fn(),
    planAdd: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => {
    const semRef = { get: semGet };
    const planDocRef = { collection: vi.fn(() => semRef) };
    const plansRef = {
        orderBy: vi.fn().mockReturnThis(),
        get: plansGet,
        doc: vi.fn(() => planDocRef),
        add: planAdd,
    };
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

describe('/api/v1/plans', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('GET', () => {
        it('returns 401 when unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });
            const res = await GET(new Request('http://localhost/api/v1/plans')) as any;
            expect(res.status).toBe(401);
        });

        it('returns empty list when user has no plans', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            plansGet.mockResolvedValueOnce({ docs: [] });
            const res = await GET(new Request('http://localhost/api/v1/plans')) as any;
            expect(res.status).toBe(200);
            expect(res.data).toEqual([]);
        });

        it('returns plans with semesterCount', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            plansGet.mockResolvedValueOnce({
                docs: [{ id: 'p1', data: () => ({ name: 'Plan 1' }) }],
            });
            semGet.mockResolvedValueOnce({ size: 3 });
            const res = await GET(new Request('http://localhost/api/v1/plans')) as any;
            expect(res.status).toBe(200);
            expect(res.data[0]).toMatchObject({ id: 'p1', name: 'Plan 1', semesterCount: 3 });
        });

        it('returns 500 on Firestore error', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            plansGet.mockRejectedValueOnce(new Error('Firestore error'));
            const res = await GET(new Request('http://localhost/api/v1/plans')) as any;
            expect(res.status).toBe(500);
        });
    });

    describe('POST', () => {
        it('returns 401 when unauthenticated', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' });
            const res = await POST(new Request('http://localhost/api/v1/plans', {
                method: 'POST',
                body: JSON.stringify({ name: 'Plan' }),
            })) as any;
            expect(res.status).toBe(401);
        });

        it('returns 400 when name is missing', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await POST(new Request('http://localhost/api/v1/plans', {
                method: 'POST',
                body: JSON.stringify({}),
            })) as any;
            expect(res.status).toBe(400);
        });

        it('returns 400 when name is whitespace only', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await POST(new Request('http://localhost/api/v1/plans', {
                method: 'POST',
                body: JSON.stringify({ name: '   ' }),
            })) as any;
            expect(res.status).toBe(400);
        });

        it('returns 400 when name is not a string', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            const res = await POST(new Request('http://localhost/api/v1/plans', {
                method: 'POST',
                body: JSON.stringify({ name: 42 }),
            })) as any;
            expect(res.status).toBe(400);
        });

        it('creates plan successfully', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            planAdd.mockResolvedValueOnce({ id: 'new-plan-id' });
            const res = await POST(new Request('http://localhost/api/v1/plans', {
                method: 'POST',
                body: JSON.stringify({ name: 'My Degree Plan' }),
            })) as any;
            expect(res.status).toBe(201);
            expect(res.data).toMatchObject({ id: 'new-plan-id', name: 'My Degree Plan' });
        });

        it('returns 500 on Firestore error', async () => {
            vi.mocked(verifyAuth).mockResolvedValueOnce({ user: { uid: 'u1' } } as any);
            planAdd.mockRejectedValueOnce(new Error('DB error'));
            const res = await POST(new Request('http://localhost/api/v1/plans', {
                method: 'POST',
                body: JSON.stringify({ name: 'Plan' }),
            })) as any;
            expect(res.status).toBe(500);
        });
    });
});
