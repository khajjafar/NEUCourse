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
 */
export function errorResponse(message: string, code: string = 'BAD_REQUEST', status: number = 400) {
    return NextResponse.json(
        { error: { code, message } },
        { status }
    );
}

/**
 * Standardized JSON structure for API success responses.
 */
export function successResponse(data: unknown, status: number = 200) {
    return NextResponse.json({ data }, { status });
}
