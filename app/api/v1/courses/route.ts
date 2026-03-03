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
// Module-level cache to prevent re-fetching all 2800+ courses from Firestore on every keystroke
let cachedCourses: any[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const q = searchParams.get("q")?.toLowerCase().trim() || "";
        const subject = searchParams.get("subject")?.toUpperCase().trim() || "";
        const level = searchParams.get("level") || "";

        // Only fetch from Firestore if cache is missing or expired
        if (!cachedCourses || Date.now() - lastCacheTime > CACHE_TTL) {
            const coursesRef = adminDb.collection("courses");
            const snapshot = await coursesRef.get();

            cachedCourses = [];
            snapshot.forEach(doc => {
                cachedCourses!.push(doc.data());
            });
            lastCacheTime = Date.now();
            console.log(`[Cache Miss] Fetched ${cachedCourses.length} courses from Firestore.`);
        }

        const courses: any[] = [];

        for (const data of cachedCourses!) {
            let matchesSubject = true;
            if (subject) {
                matchesSubject = data.subject === subject;
            }

            let matchesLevel = true;
            if (level) {
                const num = parseInt(data.number, 10);
                if (!isNaN(num)) {
                    const levelFilter = parseInt(level, 10);
                    matchesLevel = num >= levelFilter && num < levelFilter + 1000;
                } else {
                    matchesLevel = false;
                }
            }

            let matchesQuery = true;
            if (q) {
                // Determine if query is an exact course ID search (e.g. "cs2500" or "cs 2500")
                const normalizedQ = q.replace(/[\\s\\-]+/g, '');
                const exactCourseIdMatch = data.id?.toLowerCase().replace(/[\\s\\-]+/g, '') === normalizedQ;

                // Determine if query is searching for a number range or exact number
                // Allows searching just "2500" or partial course names
                const numStr = data.number ? String(data.number) : "";

                const searchableString = `${data.subject || ''} ${data.number || ''} ${data.name || ''} ${data.description || ''}`.toLowerCase();

                // Advanced matching logic
                if (exactCourseIdMatch) {
                    matchesQuery = true;
                } else if (/^\\d{1,4}$/.test(q)) {
                    // if user types just a course number, match startsWith to allow "25" to match "2500"
                    matchesQuery = numStr.startsWith(q);
                } else {
                    matchesQuery = searchableString.includes(q);
                }
            }

            if (matchesSubject && matchesLevel && matchesQuery) {
                courses.push(data);
            }

            // Limit results to improve performance
            if (courses.length >= 50) {
                break;
            }
        }

        // Return up to 50 results directly from memory cache
        return NextResponse.json({ data: courses }, { status: 200 });

    } catch (error: any) {
        console.error("API /courses error:", error);
        return NextResponse.json({
            error: { code: "SERVER_ERROR", message: "Failed to fetch course data." }
        }, { status: 500 });
    }
}
