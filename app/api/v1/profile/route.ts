import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, errorResponse, successResponse } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/** @fileoverview GET and PATCH /api/v1/profile — Authenticated endpoints for reading and updating the user's profile (currently: graduation requirements). */

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
/**
 * Returns the authenticated user's profile document from Firestore.
 *
 * @param request - Incoming Next.js Request object
 * @returns NextResponse — 200 with profile data on success, 401 if unauthenticated, 500 on error
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
/**
 * Updates the user's profile. Currently supports updating the requirements array.
 *
 * @param request - Incoming Next.js Request object
 * @returns NextResponse — 200 on success, 400 if requirements is not an array, 401 if unauthenticated, 500 on error
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
