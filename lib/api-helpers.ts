/**
 * @fileoverview Shared utilities for Next.js API route handlers.
 *
 * Provides JWT verification and standardized success/error response helpers.
 * Every authenticated route handler must call verifyAuth() before any
 * Firestore operation. Import this file only in /app/api/v1/ route handlers.
 */

import { adminAuth } from './firebase-admin';
import { NextResponse } from 'next/server';

/**
 * Extracts and verifies the Firebase JWT from the Authorization header.
 * @param request The incoming Next.js API Request
 * @returns Object containing the decoded user token or an error string
 */
export async function verifyAuth(request: Request) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: null, error: 'Unauthorized: Missing or invalid token' };
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return { user: decodedToken, error: null };
    } catch (error) {
        console.error('Error verifying auth token:', error);
        return { user: null, error: 'Unauthorized: Invalid token' };
    }
}

/**
 * Standardized JSON structure for API error responses.
 *
 * @param message - Human-readable description of the error
 * @param code - Machine-readable error code (default: "BAD_REQUEST")
 * @param status - HTTP status code (default: 400)
 * @returns NextResponse with shape `{ error: { code, message } }`
 */
export function errorResponse(message: string, code: string = 'BAD_REQUEST', status: number = 400) {
    return NextResponse.json(
        { error: { code, message } },
        { status }
    );
}

/**
 * Standardized JSON structure for API success responses.
 *
 * @param data - The payload to include under the `data` key
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with shape `{ data: ... }`
 */
export function successResponse(data: unknown, status: number = 200) {
    return NextResponse.json({ data }, { status });
}
