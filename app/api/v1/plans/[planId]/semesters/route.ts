import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, errorResponse, successResponse } from '@/lib/api-helpers';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * @swagger
 * /api/v1/plans/{planId}/semesters:
 *   post:
 *     summary: Create a new semester in a degree plan
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
 *                 example: Fall 2026
 *               order:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Semester created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ planId: string }> }
) {
    const { user, error } = await verifyAuth(request);

    if (error || !user) {
        return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const { planId } = await context.params;
        const body = await request.json();
        const { name, order } = body;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return errorResponse('Semester name is required', 'INVALID_INPUT', 400);
        }

        const semOrder = typeof order === 'number' ? order : 0;

        const semesterData = {
            name: name.trim(),
            order: semOrder,
            courses: [], // Initialize with an empty array of course IDs
            createdAt: FieldValue.serverTimestamp()
        };

        const semesterRef = await adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .doc(planId)
            .collection('semesters')
            .add(semesterData);

        // Update the parent plan's updatedAt timestamp
        await adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .doc(planId)
            .update({ updatedAt: FieldValue.serverTimestamp() });

        return successResponse({ id: semesterRef.id, name: semesterData.name, order: semesterData.order, courses: [] }, 201);
    } catch (err) {
        console.error('Error creating semester:', err);
        return errorResponse('Failed to create semester', 'INTERNAL_SERVER_ERROR', 500);
    }
}
