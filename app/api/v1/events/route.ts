import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, successResponse, errorResponse } from '@/lib/api-helpers';
import { FieldValue } from 'firebase-admin/firestore';

/** @fileoverview GET and POST /api/v1/events — Authenticated endpoints for listing and creating the user's calendar events. verifyAuth() is called before any Firestore operation. */

/**
 * Returns all calendar events for the authenticated user, ordered by startTime.
 *
 * @param request - Incoming Next.js Request object
 * @returns NextResponse — 200 with events array on success, 401 if unauthenticated, 500 on error
 */
export async function GET(request: Request) {
    try {
        const authResult = await verifyAuth(request);
        if (authResult.error || !authResult.user) {
            return errorResponse('Missing or invalid authorization token', 'UNAUTHORIZED', 401);
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

        return successResponse(events);
    } catch (error: unknown) {
        console.error('Error fetching events:', error);
        return errorResponse('Failed to fetch events', 'INTERNAL_SERVER_ERROR', 500);
    }
}

/**
 * Creates a new calendar event. Requires { title, startTime, endTime } in the request body.
 *
 * @param request - Incoming Next.js Request object
 * @returns NextResponse — 201 on success, 400 if required fields are missing, 401 if unauthenticated, 500 on error
 */
export async function POST(request: Request) {
    try {
        const authResult = await verifyAuth(request);
        if (authResult.error || !authResult.user) {
            return errorResponse('Missing or invalid authorization token', 'UNAUTHORIZED', 401);
        }

        const body = await request.json();
        const { title, startTime, endTime, location, color } = body;

        if (!title || !startTime || !endTime) {
            return errorResponse('Missing required fields', 'BAD_REQUEST', 400);
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

        const savedDoc = await docRef.get();

        return successResponse({ id: docRef.id, ...savedDoc.data() }, 201);
    } catch (error: unknown) {
        console.error('Error creating event:', error);
        return errorResponse('Failed to create event', 'INTERNAL_SERVER_ERROR', 500);
    }
}
