import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, errorResponse, successResponse } from '@/lib/api-helpers';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * @swagger
 * /api/v1/plans/{planId}/semesters/{semId}/courses/{courseId}:
 *   delete:
 *     summary: Remove a course from a semester
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: semId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course removed successfully
 *       404:
 *         description: Plan or Semester not found
 *       401:
 *         description: Unauthorized
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ planId: string, semId: string, courseId: string }> }
) {
    const { user, error } = await verifyAuth(request);

    if (error || !user) {
        return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const { planId, semId, courseId } = await context.params;

        const semesterRef = adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .doc(planId)
            .collection('semesters')
            .doc(semId);

        const semesterDoc = await semesterRef.get();
        if (!semesterDoc.exists) {
            return errorResponse('Target Plan or Semester does not exist', 'NOT_FOUND', 404);
        }

        const currentCourses = semesterDoc.data()?.courses || [];

        // Filter out the specific courseId, resolving both old format strings and new format objects safely
        const updatedCourses = currentCourses.filter((courseItem: string | { courseId: string; crn?: string }) => {
            if (typeof courseItem === 'string') {
                return courseItem !== courseId.trim();
            } else if (typeof courseItem === 'object' && courseItem !== null) {
                return courseItem.courseId !== courseId.trim();
            }
            return true;
        });

        await semesterRef.update({
            courses: updatedCourses
        });

        // Update the parent plan's updatedAt timestamp
        await adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .doc(planId)
            .update({ updatedAt: FieldValue.serverTimestamp() });

        return successResponse({ removed: true, courseId: courseId.trim() });
    } catch (err: unknown) {
        console.error('Error removing course from semester:', err);
        if ((err as { code?: number }).code === 5) { // GRPC NOT_FOUND equivalent in Firestore update()
            return errorResponse('Target Plan or Semester does not exist', 'NOT_FOUND', 404);
        }
        return errorResponse('Failed to remove course', 'INTERNAL_SERVER_ERROR', 500);
    }
}
