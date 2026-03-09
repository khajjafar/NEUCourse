import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, errorResponse, successResponse } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Get profile data for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: Request) {
    const { user, error } = await verifyAuth(request);

    if (error || !user) {
        return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const userDocRef = adminDb.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get();
        if (!userDoc.exists) {
            return successResponse({});
        }

        return successResponse(userDoc.data());
    } catch (err) {
        console.error('Error fetching user profile:', err);
        return errorResponse('Failed to fetch user profile', 'INTERNAL_SERVER_ERROR', 500);
    }
}

/**
 * @swagger
 * /api/v1/profile:
 *   patch:
 *     summary: Update profile data for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     count:
 *                       type: number
 *     responses:
 *       200:
 *         description: User profile updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export async function PATCH(request: Request) {
    const { user, error } = await verifyAuth(request);

    if (error || !user) {
        return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const body = await request.json();
        const { requirements } = body;

        const updateData: Record<string, unknown> = {};
        if (requirements !== undefined) {
            if (!Array.isArray(requirements)) {
                return errorResponse('Requirements must be an array', 'INVALID_INPUT', 400);
            }
            updateData.requirements = requirements;
        }

        const userDocRef = adminDb.collection('users').doc(user.uid);
        await userDocRef.set(updateData, { merge: true });

        return successResponse({ updated: true });
    } catch (err) {
        console.error('Error updating user profile:', err);
        return errorResponse('Failed to update user profile', 'INTERNAL_SERVER_ERROR', 500);
    }
}
