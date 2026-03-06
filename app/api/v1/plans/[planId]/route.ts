import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, errorResponse, successResponse } from '@/lib/api-helpers';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/v1/plans/{planId}:
 *   get:
 *     summary: Get a specific degree plan and its semesters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan object with semesters array
 *       404:
 *         description: Plan not found
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ planId: string }> }
) {
    const { user, error } = await verifyAuth(request);

    if (error || !user) {
        return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const { planId } = await context.params;

        const planRef = adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .doc(planId);

        const planDoc = await planRef.get();

        if (!planDoc.exists) {
            return errorResponse(`Plan ${planId} not found.`, 'NOT_FOUND', 404);
        }

        // Fetch subcollections safely
        const semestersSnapshot = await planRef.collection('semesters').orderBy('order', 'asc').get();
        const semesters = semestersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return successResponse({
            id: planDoc.id,
            ...planDoc.data(),
            semesters
        });

    } catch (err) {
        console.error('Error fetching plan details:', err);
        return errorResponse('Failed to fetch degree plan details', 'INTERNAL_SERVER_ERROR', 500);
    }
}

/**
 * @swagger
 * /api/v1/plans/{planId}:
 *   delete:
 *     summary: Delete a specific degree plan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan deleted
 *       404:
 *         description: Plan not found
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ planId: string }> }
) {
    const { user, error } = await verifyAuth(request);

    if (error || !user) {
        return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const { planId } = await context.params;

        const planRef = adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .doc(planId);

        // Firestore does not natively cascade deletes of subcollections via the Client SDK. 
        // We can do it on the Admin SDK carefully or rely on it leaving orphaned docs.
        // For our scope, wiping the parent document is enough to hide it logically.
        await planRef.delete();

        return successResponse({ deleted: true });
    } catch (err) {
        console.error('Error deleting plan:', err);
        return errorResponse('Failed to delete degree plan', 'INTERNAL_SERVER_ERROR', 500);
    }
}

/**
 * @swagger
 * /api/v1/plans/{planId}:
 *   put:
 *     summary: Rename a specific degree plan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plan renamed successfully
 *       400:
 *         description: Missing or invalid name
 *       404:
 *         description: Plan not found
 */
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ planId: string }> }
) {
    const { user, error } = await verifyAuth(request);

    if (error || !user) {
        return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const { planId } = await context.params;
        const body = await request.json().catch(() => ({}));

        if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
            return errorResponse('Valid plan name is required', 'BAD_REQUEST', 400);
        }

        const newName = body.name.trim();

        const planRef = adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .doc(planId);

        const planDoc = await planRef.get();

        if (!planDoc.exists) {
            return errorResponse(`Plan ${planId} not found.`, 'NOT_FOUND', 404);
        }

        await planRef.update({
            name: newName,
            updatedAt: FieldValue.serverTimestamp()
        });

        return successResponse({ id: planId, name: newName });
    } catch (err) {
        console.error('Error renaming plan:', err);
        return errorResponse('Failed to rename degree plan', 'INTERNAL_SERVER_ERROR', 500);
    }
}

/**
 * @swagger
 * /api/v1/plans/{planId}:
 *   patch:
 *     summary: Update a specific degree plan (partial update)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Plan not found
 */
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ planId: string }> }
) {
    const { user, error } = await verifyAuth(request);

    if (error || !user) {
        return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const { planId } = await context.params;
        const body = await request.json().catch(() => ({}));

        if (Object.keys(body).length === 0) {
            return errorResponse('Request body is empty', 'BAD_REQUEST', 400);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
            updatedAt: FieldValue.serverTimestamp()
        };

        if (body.name !== undefined) {
            if (typeof body.name !== 'string' || body.name.trim() === '') {
                return errorResponse('Valid plan name is required', 'BAD_REQUEST', 400);
            }
            updateData.name = body.name.trim();
        }



        const planRef = adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .doc(planId);

        const planDoc = await planRef.get();

        if (!planDoc.exists) {
            return errorResponse(`Plan ${planId} not found.`, 'NOT_FOUND', 404);
        }

        await planRef.update(updateData);

        return successResponse({ id: planId, ...updateData });
    } catch (err) {
        console.error('Error updating plan:', err);
        return errorResponse('Failed to update degree plan', 'INTERNAL_SERVER_ERROR', 500);
    }
}

