import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, successResponse, errorResponse } from '@/lib/api-helpers';

/**
 * DELETE /api/v1/events/[eventId]
 * Delete a specific event
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const authResult = await verifyAuth(request);
        if (authResult.error || !authResult.user) {
            return NextResponse.json(errorResponse('UNAUTHORIZED', 'Missing or invalid authorization token'), { status: 401 });
        }

        const { eventId } = await params;

        const eventRef = adminDb
            .collection('users')
            .doc(authResult.user.uid)
            .collection('events')
            .doc(eventId);

        const eventDoc = await eventRef.get();
        if (!eventDoc.exists) {
            return NextResponse.json(errorResponse('NOT_FOUND', 'Event not found'), { status: 404 });
        }

        await eventRef.delete();

        return NextResponse.json(successResponse({ success: true }));
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json(errorResponse('INTERNAL_SERVER_ERROR', 'Failed to delete event'), { status: 500 });
    }
}
