import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse } from '@/lib/api-helpers';

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: Get all NEU courses.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by course number, name, or subject
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter exactly by subject code
 *     responses:
 *       200:
 *         description: List of matched courses
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q')?.toLowerCase() || '';
        const subject = searchParams.get('subject')?.toUpperCase() || '';

        let query: FirebaseFirestore.Query = adminDb.collection('courses');

        if (subject) {
            query = query.where('subject', '==', subject);
        }

        const snapshot = await query.get();
        let courses = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as any[];

        if (q) {
            courses = courses.filter((course) => {
                const nameMatch = course.name?.toLowerCase().includes(q) || course.courseName?.toLowerCase().includes(q);
                const codeMatch = course.number?.toLowerCase().includes(q) || course.courseNumber?.toLowerCase().includes(q);
                const subjectMatch = course.subject?.toLowerCase().includes(q);
                return nameMatch || codeMatch || subjectMatch;
            });
        }

        return successResponse(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch courses', 500);
    }
}
