import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * @swagger
 * /api/v1/courses/{courseId}:
 *   get:
 *     summary: Retrieve a single course detail
 *     description: Returns the full document for a specific course by its Firestore ID.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID (e.g. CS3500)
 *     responses:
 *       200:
 *         description: Course data
 *       404:
 *         description: Course not found
 */
/** @fileoverview GET /api/v1/courses/[courseId] — Public endpoint for fetching a single course by ID. No authentication required. */

/**
 * Fetches a single course document from Firestore by its URL-decoded courseId.
 *
 * @param request - Incoming Next.js Request object
 * @param context - Route context with params (courseId)
 * @returns NextResponse — 200 on success, 400 if courseId is missing, 404 if not found, 500 on error
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await context.params;

        if (!courseId) {
            return NextResponse.json({
                error: { code: "BAD_REQUEST", message: "courseId parameter is required" }
            }, { status: 400 });
        }

        // Decode the URI component to handle cases like 'CS%205002' -> 'CS 5002'
        const decodedId = decodeURIComponent(courseId);
        // Normalize to removing all spaces and dashes, converting to uppercase (e.g., 'cs 5002' -> 'CS5002')
        const normalizedId = decodedId.replace(/[\\s\\-]+/g, '').toUpperCase();

        const courseDoc = await adminDb.collection("courses").doc(normalizedId).get();

        if (!courseDoc.exists) {
            return NextResponse.json({
                error: { code: "NOT_FOUND", message: `Course ${decodedId} not found.` }
            }, { status: 404 });
        }

        return NextResponse.json({ data: courseDoc.data() }, { status: 200 });

    } catch (error: unknown) {
        console.error(`API /courses/[courseId] error:`, error);
        return NextResponse.json({
            error: { code: "SERVER_ERROR", message: "Failed to fetch course details." }
        }, { status: 500 });
    }
}
