import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

vi.mock('firebase-admin/firestore', () => ({}));

const { courseDocGet } = vi.hoisted(() => ({
    courseDocGet: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => ({
    adminDb: {
        collection: vi.fn(() => ({
            doc: vi.fn(() => ({ get: courseDocGet })),
        })),
    },
}));

const makeReq = (courseId: string) =>
    new NextRequest(`http://localhost/api/v1/courses/${courseId}`);

const makeCtx = (courseId: string) => ({
    params: Promise.resolve({ courseId }),
});

describe('/api/v1/courses/[courseId]', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 404 when course does not exist', async () => {
        courseDocGet.mockResolvedValueOnce({ exists: false });
        const res = await GET(makeReq('CS9999'), makeCtx('CS9999'));
        expect(res.status).toBe(404);
        const body = await res.json();
        expect(body.error.code).toBe('NOT_FOUND');
    });

    it('returns course data when found', async () => {
        const courseData = { id: 'CS3500', name: 'OOD', subject: 'CS', number: 3500 };
        courseDocGet.mockResolvedValueOnce({ exists: true, data: () => courseData });
        const res = await GET(makeReq('CS3500'), makeCtx('CS3500'));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.data).toEqual(courseData);
    });

    it('normalizes courseId (decodes URI and uppercases)', async () => {
        const courseData = { id: 'CS3500', name: 'OOD' };
        courseDocGet.mockResolvedValueOnce({ exists: true, data: () => courseData });
        // cs%203500 → CS3500 after decoding and normalizing
        const res = await GET(makeReq('cs%203500'), makeCtx('cs%203500'));
        expect(res.status).toBe(200);
    });

    it('returns 500 on Firestore error', async () => {
        courseDocGet.mockRejectedValueOnce(new Error('DB error'));
        const res = await GET(makeReq('CS3500'), makeCtx('CS3500'));
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error.code).toBe('SERVER_ERROR');
    });
});
