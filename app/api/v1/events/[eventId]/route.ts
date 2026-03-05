import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, errorResponse, successResponse } from '@/lib/api-helpers';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * @swagger
 * /api/v1/events/{eventId}:
 *   put:
 *     summary: Update an existing calendar event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
export async function PUT(
    request: Request,
    context: { params: Promise<{ eventId: string }> }
) {
    const { user, error } = await verifyAuth(request);

    if (error || !user) {
        return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const { eventId } = await context.params;
        const body = await request.json();

        if (!eventId) {
            return errorResponse('Event ID is required', 'INVALID_INPUT', 400);
        }

        const updates: any = {};

        if (body.title && typeof body.title === 'string' && body.title.trim() !== '') {
            updates.title = body.title.trim();
        }
        if (Array.isArray(body.days) && body.days.length > 0) {
            updates.days = body.days;
        }
        if (body.startTime || body.endTime) {
            // Need both to validate easily if submitting partial time, but UI submits full block anyway
            const st = body.startTime || undefined;
            const et = body.endTime || undefined;
            if (st && et) {
                const start = new Date(`1970-01-01T${st}:00`);
                const end = new Date(`1970-01-01T${et}:00`);
                if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
                    updates.startTime = st;
                    updates.endTime = et;
                } else {
                    return errorResponse('End time must be strictly after start time', 'INVALID_INPUT', 400);
                }
            } else if (st || et) {
                return errorResponse('Must provide both startTime and endTime to update times', 'INVALID_INPUT', 400);
            }
        }

        if (typeof body.location === 'string') updates.location = body.location.trim();
        if (typeof body.color === 'string') updates.color = body.color.trim();

        if (Object.keys(updates).length === 0) {
            return errorResponse('No fields to update', 'INVALID_INPUT', 400);
        }

        updates.updatedAt = FieldValue.serverTimestamp();

        const eventRef = adminDb
            .collection('users')
            .doc(user.uid)
            .collection('events')
            .doc(eventId);

        const doc = await eventRef.get();
        if (!doc.exists) {
            return errorResponse('Event not found', 'NOT_FOUND', 404);
        }

        await eventRef.update(updates);

        return successResponse({ id: eventId, ...updates }, 200);
    } catch (err) {
        console.error('Error updating event:', err);
        return errorResponse('Failed to update event', 'INTERNAL_SERVER_ERROR', 500);
    }
}

/**
 * @swagger
 * /api/v1/events/{eventId}:
 *   delete:
 *     summary: Delete a calendar event
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
export async function DELETE(
    request: Request,
    context: { params: Promise<{ eventId: string }> }
) {
    const { user, error } = await verifyAuth(request);

    if (error || !user) {
        return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const { eventId } = await context.params;

        if (!eventId) {
            return errorResponse('Event ID is required', 'INVALID_INPUT', 400);
        }

        const eventRef = adminDb
            .collection('users')
            .doc(user.uid)
            .collection('events')
            .doc(eventId);

        const doc = await eventRef.get();
        if (!doc.exists) {
            return errorResponse('Event not found', 'NOT_FOUND', 404);
        }

        await eventRef.delete();

        return successResponse({ id: eventId, deleted: true }, 200);
    } catch (err) {
        console.error('Error deleting event:', err);
        return errorResponse('Failed to delete event', 'INTERNAL_SERVER_ERROR', 500);
    }
}
