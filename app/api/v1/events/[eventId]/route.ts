import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, successResponse, errorResponse } from '@/lib/api-helpers';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * @swagger
 * /api/v1/events/{eventId}:
 *   delete:
 *     summary: Delete a specific event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const authResult = await verifyAuth(request);
        if (authResult.error || !authResult.user) {
            return errorResponse('Missing or invalid authorization token', 'UNAUTHORIZED', 401);
        }

        const { eventId } = await params;

        const eventRef = adminDb
            .collection('users')
            .doc(authResult.user.uid)
            .collection('events')
            .doc(eventId);

        const eventDoc = await eventRef.get();
        if (!eventDoc.exists) {
            return errorResponse('Event not found', 'NOT_FOUND', 404);
        }

        await eventRef.delete();

        return successResponse({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting event:', error);
        return errorResponse('Failed to delete event', 'INTERNAL_SERVER_ERROR', 500);
    }
}

/**
 * @swagger
 * /api/v1/events/{eventId}:
 *   put:
 *     summary: Update a specific event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Event not found
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const authResult = await verifyAuth(request);
        if (authResult.error || !authResult.user) {
            return errorResponse('Missing or invalid authorization token', 'UNAUTHORIZED', 401);
        }

        const { eventId } = await params;
        const body = await request.json();

        if (!body.title || !body.startTime || !body.endTime) {
            return errorResponse('Missing required fields: title, startTime, endTime', 'BAD_REQUEST', 400);
        }

        const eventRef = adminDb
            .collection('users')
            .doc(authResult.user.uid)
            .collection('events')
            .doc(eventId);

        const eventDoc = await eventRef.get();
        if (!eventDoc.exists) {
            return errorResponse('Event not found', 'NOT_FOUND', 404);
        }

        const updateData = {
            title: body.title,
            startTime: body.startTime,
            endTime: body.endTime,
            location: body.location || '',
            color: body.color || 'blue',
            updatedAt: FieldValue.serverTimestamp(),
        };

        await eventRef.update(updateData);

        return successResponse({ id: eventId, ...updateData });
    } catch (error: unknown) {
        console.error('Error updating event:', error);
        return errorResponse('Failed to update event', 'INTERNAL_SERVER_ERROR', 500);
    }
}
