import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { successResponse, errorResponse } from '@/lib/api-helpers';

/**
 * @swagger
 * /api/v1/courses/{courseId}:
 *   get:
 *     summary: Get detailed information for a specific course.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Firestore ID of the course
 *     responses:
 *       200:
 *         description: Course data
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await params;

        if (!courseId) {
            return errorResponse('BAD_REQUEST', 'Missing courseId parameter', 400);
        }

        const docRef = adminDb.collection('courses').doc(courseId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return errorResponse('NOT_FOUND', 'Course not found', 404);
        }

        return successResponse({
            id: docSnap.id,
            ...docSnap.data(),
        });
    } catch (error) {
        console.error('Error fetching course detail:', error);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch course detail', 500);
    }
}
