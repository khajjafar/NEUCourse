import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, errorResponse, successResponse } from '@/lib/api-helpers';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * @swagger
 * /api/v1/plans/{planId}/semesters/{semId}:
 *   delete:
 *     summary: Delete a specific semester from the degree plan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *       - in: path
 *         name: semId
 *         required: true
 *   patch:
 *     summary: Update semester attributes directly (order, name, array of courses) usually via drag and drop contexts
 *     security:
 *       - bearerAuth: []
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ planId: string, semId: string }> }
) {
    const { user, error } = await verifyAuth(request);
    if (error || !user) return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);

    try {
        const { planId, semId } = await context.params;
        const semesterRef = adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .doc(planId)
            .collection('semesters')
            .doc(semId);

        await semesterRef.delete();

        // Update the parent plan's updatedAt timestamp
        await adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .doc(planId)
            .update({ updatedAt: FieldValue.serverTimestamp() });

        return successResponse({ deleted: true, semId });
    } catch (err: any) {
        console.error('Failed to delete semester:', err);
        return errorResponse('Failed to delete semester', 'INTERNAL_SERVER_ERROR', 500);
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ planId: string, semId: string }> }
) {
    const { user, error } = await verifyAuth(request);
    if (error || !user) return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);

    try {
        const { planId, semId } = await context.params;
        const body = await request.json();
        const { order, courses, name } = body;

        const updateData: any = {};
        if (order !== undefined) updateData.order = order;
        if (name !== undefined) updateData.name = name;
        if (courses !== undefined) updateData.courses = courses; // direct array overwrite explicitly targeting index bindings via mutation

        if (Object.keys(updateData).length === 0) {
            return errorResponse('No update data provided', 'INVALID_INPUT', 400);
        }

        const semesterRef = adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .doc(planId)
            .collection('semesters')
            .doc(semId);

        await semesterRef.update(updateData);

        // Update the parent plan's updatedAt timestamp
        await adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .doc(planId)
            .update({ updatedAt: FieldValue.serverTimestamp() });

        return successResponse({ updated: true, semId });
    } catch (err: any) {
        if (err.code === 5) {
            return errorResponse('Target Plan or Semester does not exist', 'NOT_FOUND', 404);
        }
        return errorResponse('Failed to update semester', 'INTERNAL_SERVER_ERROR', 500);
    }
}
