import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('firebase-admin/firestore', () => ({}));

const { coursesGet } = vi.hoisted(() => ({
    coursesGet: vi.fn(),
}));

vi.mock('@/lib/firebase-admin', () => ({
    adminDb: {
        collection: vi.fn(() => ({ get: coursesGet })),
    },
}));

const TEST_COURSES = [
    { id: 'CS3500', subject: 'CS', number: 3500, name: 'Object-Oriented Design' },
    { id: 'CS2500', subject: 'CS', number: 2500, name: 'Fundamentals of Computer Science 1' },
    { id: 'MATH1341', subject: 'MATH', number: 1341, name: 'Calculus 1 for Science' },
];

describe('/api/v1/courses', () => {
    // Use dynamic import to get a fresh module (with empty cache) for each describe block
    let GET: typeof import('./route').GET;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();
        vi.doMock('@/lib/firebase-admin', () => ({
            adminDb: { collection: vi.fn(() => ({ get: coursesGet })) },
        }));
        const mod = await import('./route');
        GET = mod.GET;
    });

    afterEach(() => {
        vi.resetModules();
    });

    const makeReq = (query = '') =>
        new NextRequest(`http://localhost/api/v1/courses${query ? `?${query}` : ''}`);

    it('fetches from Firestore (cache miss) and returns all courses', async () => {
        coursesGet.mockResolvedValueOnce({
            forEach: (fn: (doc: { data: () => object }) => void) =>
                TEST_COURSES.forEach(c => fn({ data: () => c })),
        });
        const res = await GET(makeReq());
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.data).toHaveLength(3);
    });

    it('returns 500 on Firestore error', async () => {
        coursesGet.mockRejectedValueOnce(new Error('Firestore error'));
        const res = await GET(makeReq());
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error.code).toBe('SERVER_ERROR');
    });

    it('filters by subject', async () => {
        coursesGet.mockResolvedValueOnce({
            forEach: (fn: (doc: { data: () => object }) => void) =>
                TEST_COURSES.forEach(c => fn({ data: () => c })),
        });
        const res = await GET(makeReq('subject=CS'));
        const body = await res.json();
        expect(body.data.every((c: { subject: string }) => c.subject === 'CS')).toBe(true);
        expect(body.data).toHaveLength(2);
    });

    it('filters by minLevel', async () => {
        coursesGet.mockResolvedValueOnce({
            forEach: (fn: (doc: { data: () => object }) => void) =>
                TEST_COURSES.forEach(c => fn({ data: () => c })),
        });
        const res = await GET(makeReq('minLevel=3000'));
        const body = await res.json();
        expect(body.data.every((c: { number: number }) => c.number >= 3000)).toBe(true);
    });

    it('filters by maxLevel', async () => {
        coursesGet.mockResolvedValueOnce({
            forEach: (fn: (doc: { data: () => object }) => void) =>
                TEST_COURSES.forEach(c => fn({ data: () => c })),
        });
        const res = await GET(makeReq('maxLevel=2999'));
        const body = await res.json();
        expect(body.data.every((c: { number: number }) => c.number <= 2999)).toBe(true);
    });

    it('filters by minLevel and maxLevel range', async () => {
        coursesGet.mockResolvedValueOnce({
            forEach: (fn: (doc: { data: () => object }) => void) =>
                TEST_COURSES.forEach(c => fn({ data: () => c })),
        });
        const res = await GET(makeReq('minLevel=2000&maxLevel=3000'));
        const body = await res.json();
        expect(body.data.every((c: { number: number }) => c.number >= 2000 && c.number <= 3000)).toBe(true);
    });

    it('matches by numeric query (course number prefix)', async () => {
        coursesGet.mockResolvedValueOnce({
            forEach: (fn: (doc: { data: () => object }) => void) =>
                TEST_COURSES.forEach(c => fn({ data: () => c })),
        });
        const res = await GET(makeReq('q=2500'));
        const body = await res.json();
        expect(body.data.some((c: { id: string }) => c.id === 'CS2500')).toBe(true);
    });

    it('matches by text query (word boundary)', async () => {
        coursesGet.mockResolvedValueOnce({
            forEach: (fn: (doc: { data: () => object }) => void) =>
                TEST_COURSES.forEach(c => fn({ data: () => c })),
        });
        const res = await GET(makeReq('q=Object-Oriented'));
        const body = await res.json();
        expect(body.data.some((c: { id: string }) => c.id === 'CS3500')).toBe(true);
    });

    it('matches by exact course ID (e.g. cs3500)', async () => {
        coursesGet.mockResolvedValueOnce({
            forEach: (fn: (doc: { data: () => object }) => void) =>
                TEST_COURSES.forEach(c => fn({ data: () => c })),
        });
        const res = await GET(makeReq('q=cs3500'));
        const body = await res.json();
        expect(body.data.some((c: { id: string }) => c.id === 'CS3500')).toBe(true);
    });

    it('returns empty array when no courses match', async () => {
        coursesGet.mockResolvedValueOnce({
            forEach: (fn: (doc: { data: () => object }) => void) =>
                TEST_COURSES.forEach(c => fn({ data: () => c })),
        });
        const res = await GET(makeReq('q=ZZZNOTEXIST'));
        const body = await res.json();
        expect(body.data).toEqual([]);
    });
});
