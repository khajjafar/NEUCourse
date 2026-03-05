import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAuth, errorResponse, successResponse } from '@/lib/api-helpers';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: Get all calendar events for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's calendar events
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: Request) {
    const { user, error } = await verifyAuth(request);

    if (error || !user) {
        return errorResponse(error || 'Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const eventsSnapshot = await adminDb
            .collection('users')
            .doc(user.uid)
            .collection('events')
            .orderBy('createdAt', 'desc')
            .get();

        const events = eventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return successResponse(events);
    } catch (err) {
        console.error('Error fetching calendar events:', err);
        return errorResponse('Failed to fetch calendar events', 'INTERNAL_SERVER_ERROR', 500);
    }
}

/**
 * @swagger
 * /api/v1/events:
 *   post:
 *     summary: Create a new calendar event
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               days:
 *                 type: array
 *                 items:
 *                   type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               location:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid input parameters
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
        const { title, type, date, startDate, endDate, days, startTime, endTime, location, color } = body;

        // Validation
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return errorResponse('Event title is required', 'INVALID_INPUT', 400);
        }

        if (type === 'single') {
            if (!date) return errorResponse('Single events require a date', 'INVALID_INPUT', 400);
        } else if (type === 'recurring' || !type) {
            if (!Array.isArray(days) || days.length === 0) {
                return errorResponse('Recurring events require at least one day selected', 'INVALID_INPUT', 400);
            }
        }

        if (!startTime || !endTime) {
            return errorResponse('Start time and end time are required', 'INVALID_INPUT', 400);
        }

        // Validate time format and bounds
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
            return errorResponse('End time must be strictly after start time, and times must be valid HH:mm', 'INVALID_INPUT', 400);
        }

        const eventData = {
            title: title.trim(),
            type: type || 'recurring',
            days: type === 'single' ? [] : (days || []),
            date: type === 'single' ? date : null,
            startDate: type === 'recurring' ? (startDate || null) : null,
            endDate: type === 'recurring' ? (endDate || null) : null,
            startTime,
            endTime,
            location: location?.trim() || '',
            color: color?.trim() || '#4f46e5',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        const eventRef = await adminDb
            .collection('users')
            .doc(user.uid)
            .collection('events')
            .add(eventData);

        return successResponse({ id: eventRef.id, ...eventData }, 201);
    } catch (err) {
        console.error('Error creating calendar event:', err);
        return errorResponse('Failed to create calendar event', 'INTERNAL_SERVER_ERROR', 500);
    }
}
