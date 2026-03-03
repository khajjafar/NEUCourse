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

        const courseDoc = await adminDb.collection("courses").doc(courseId).get();

        if (!courseDoc.exists) {
            return NextResponse.json({
                error: { code: "NOT_FOUND", message: `Course ${courseId} not found.` }
            }, { status: 404 });
        }

        return NextResponse.json({ data: courseDoc.data() }, { status: 200 });

    } catch (error: any) {
        console.error(`API /courses/[courseId] error:`, error);
        return NextResponse.json({
            error: { code: "SERVER_ERROR", message: "Failed to fetch course details." }
        }, { status: 500 });
    }
}
