import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, successResponse, errorResponse } from '@/lib/api-helpers';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * GET /api/v1/events
 * Get all events for the authenticated user
 */
export async function GET(request: Request) {
    try {
        const authResult = await verifyAuth(request);
        if (authResult.error || !authResult.user) {
            return NextResponse.json(errorResponse('UNAUTHORIZED', 'Missing or invalid authorization token'), { status: 401 });
        }

        const eventsSnapshot = await adminDb
            .collection('users')
            .doc(authResult.user.uid)
            .collection('events')
            .orderBy('startTime', 'asc')
            .get();

        const events = eventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Ensure any Firestore Timestamps are strictly stripped if not safely returned
        }));

        return NextResponse.json(successResponse(events));
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json(errorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch events'), { status: 500 });
    }
}

/**
 * POST /api/v1/events
 * Create a new event
 */
export async function POST(request: Request) {
    try {
        const authResult = await verifyAuth(request);
        if (authResult.error || !authResult.user) {
            return NextResponse.json(errorResponse('UNAUTHORIZED', 'Missing or invalid authorization token'), { status: 401 });
        }

        const body = await request.json();
        const { title, startTime, endTime, location, color } = body;

        if (!title || !startTime || !endTime) {
            return NextResponse.json(errorResponse('BAD_REQUEST', 'Missing required fields'), { status: 400 });
        }

        const newEvent = {
            title,
            startTime,
            endTime,
            location: location || '',
            color: color || 'blue',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        const docRef = await adminDb
            .collection('users')
            .doc(authResult.user.uid)
            .collection('events')
            .add(newEvent);

        return NextResponse.json(successResponse({ id: docRef.id, ...newEvent }), { status: 201 });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json(errorResponse('INTERNAL_SERVER_ERROR', 'Failed to create event'), { status: 500 });
    }
}
