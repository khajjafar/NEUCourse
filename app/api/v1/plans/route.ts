import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, errorResponse, successResponse } from '@/lib/api-helpers';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * @swagger
 * /api/v1/plans:
 *   get:
 *     summary: Get all degree plans for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's degree plans
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: Request) {
    const { user, error } = await verifyAuth(request);

    if (error || !user) {
        return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const plansSnapshot = await adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .orderBy('createdAt', 'desc')
            .get();

        const plans = plansSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return successResponse(plans);
    } catch (err) {
        console.error('Error fetching plans:', err);
        return errorResponse('Failed to fetch degree plans', 'INTERNAL_SERVER_ERROR', 500);
    }
}

/**
 * @swagger
 * /api/v1/plans:
 *   post:
 *     summary: Create a new degree plan
 *     security:
 *       - bearerAuth: []
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
 *       201:
 *         description: Plan created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: Request) {
    const { user, error } = await verifyAuth(request);

    if (error || !user) {
        return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const body = await request.json();
        const { name } = body;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return errorResponse('Plan name is required', 'INVALID_INPUT', 400);
        }

        const planData = {
            name: name.trim(),
            createdAt: new Date(), // Specifically requested Timestamp mappings usually happen via admin.firestore.FieldValue.serverTimestamp(). We'll map gracefully.
        };

        // Let's use Firestore Server timestamps correctly based on rules
        const firestoreData = {
            ...planData,
            createdAt: FieldValue.serverTimestamp()
        };

        const planRef = await adminDb
            .collection('users')
            .doc(user.uid)
            .collection('plans')
            .add(firestoreData);

        return successResponse({ id: planRef.id, name: planData.name }, 201);
    } catch (err) {
        console.error('Error creating plan:', err);
        return errorResponse('Failed to create degree plan', 'INTERNAL_SERVER_ERROR', 500);
    }
}
