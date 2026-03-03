import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: Retrieve courses matching a search query
 *     description: Returns a list of all publicly available NEU courses parsed into Firestore. Can search by name or subset.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by course ID, name, or subject.
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Exact match filter for Department/Subject.
 *     responses:
 *       200:
 *         description: List of matched courses
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const q = searchParams.get("q")?.toLowerCase() || "";
        const subject = searchParams.get("subject")?.toUpperCase() || "";

        const coursesRef = adminDb.collection("courses");
        const snapshot = await coursesRef.get();

        const courses: any[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();

            // Applying memory level filters 
            let matchesSubject = true;
            if (subject) {
                matchesSubject = data.subject === subject;
            }

            let matchesQuery = true;
            if (q) {
                const searchableString = `${data.subject || ''} ${data.number || ''} ${data.name || ''} ${data.id || ''}`.toLowerCase();
                matchesQuery = searchableString.includes(q);
            }

            if (matchesSubject && matchesQuery) {
                courses.push(data);
            }
        });

        return NextResponse.json({ data: courses }, { status: 200 });

    } catch (error: any) {
        console.error("API /courses error:", error);
        return NextResponse.json({
            error: { code: "SERVER_ERROR", message: "Failed to fetch course data." }
        }, { status: 500 });
    }
}
