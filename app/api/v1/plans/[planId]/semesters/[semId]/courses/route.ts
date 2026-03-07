import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, errorResponse, successResponse } from '@/lib/api-helpers';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * @swagger
 * /api/v1/plans/{planId}/semesters/{semId}/courses:
 *   post:
 *     summary: Add a course to a semester
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: CS3500
 *               crn:
 *                 type: string
 *                 example: "10243"
 *     responses:
 *       200:
 *         description: Course added successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Plan or Semester not found
 *       401:
 *         description: Unauthorized
 */
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ planId: string, semId: string }> }
) {
    const { user, error } = await verifyAuth(request);

    if (error || !user) {
        return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const { planId, semId } = await context.params;
        const body = await request.json();
        const { courseId, crn } = body;

        if (!courseId || typeof courseId !== 'string' || courseId.trim() === '') {
            return errorResponse('Valid courseId is required', 'INVALID_INPUT', 400);
        }

        const semesterRef = adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .doc(planId)
            .collection('semesters')
            .doc(semId);

        const coursePayload = crn
            ? { courseId: courseId.trim(), crn: String(crn).trim() }
            : { courseId: courseId.trim() }; // fallback

        // Update the semester document safely by appending the course object
        await semesterRef.update({
            courses: FieldValue.arrayUnion(coursePayload)
        });

        // Update the parent plan's updatedAt timestamp
        await adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .doc(planId)
            .update({ updatedAt: FieldValue.serverTimestamp() });

        return successResponse({ added: true, courseId: courseId.trim(), crn });
    } catch (err: any) {
        console.error('Error adding course to semester:', err);
        if (err.code === 5) { // GRPC NOT_FOUND equivalent in Firestore update()
            return errorResponse('Target Plan or Semester does not exist', 'NOT_FOUND', 404);
        }
        return errorResponse('Failed to add course', 'INTERNAL_SERVER_ERROR', 500);
    }
}
