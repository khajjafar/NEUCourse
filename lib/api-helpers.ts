import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './firebase-admin';

export function successResponse(data: unknown, status = 200) {
    return NextResponse.json({ data }, { status });
}

export function errorResponse(code: string, message: string, status = 400) {
    return NextResponse.json({ error: { code, message } }, { status });
}

export async function verifyAuth(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { error: errorResponse('UNAUTHORIZED', 'Missing or invalid token', 401) };
    }

    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return { uid: decodedToken.uid };
    } catch (error) {
        return { error: errorResponse('UNAUTHORIZED', 'Invalid or expired token', 401) };
    }
}
