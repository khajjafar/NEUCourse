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
/** @fileoverview GET /api/v1/courses — Public endpoint for searching pre-scraped NEU courses. Supports query (q), subject, minLevel, and maxLevel filters. Results are cached in-memory for 5 minutes. No authentication required. */

interface CourseData {
    id?: string;
    subject?: string;
    number?: string | number;
    name?: string;
    [key: string]: unknown;
}

// Module-level cache to prevent re-fetching all 2800+ courses from Firestore on every keystroke
let cachedCourses: CourseData[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Searches the Firestore courses collection with optional filters. Returns up to 50 matching courses.
 *
 * @param request - Incoming Next.js Request object (supports q, subject, minLevel, maxLevel query params)
 * @returns NextResponse — 200 with array of courses, 500 on error
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const q = searchParams.get("q")?.toLowerCase().trim() || "";
        const subject = searchParams.get("subject")?.toUpperCase().trim() || "";
        const minLevelStr = searchParams.get("minLevel") || "";
        const maxLevelStr = searchParams.get("maxLevel") || "";

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

        const courses: CourseData[] = [];

        for (const data of cachedCourses!) {
            let matchesSubject = true;
            if (subject) {
                matchesSubject = data.subject === subject;
            }

            let matchesLevel = true;
            if (minLevelStr || maxLevelStr) {
                const num = parseInt(String(data.number ?? ''), 10);
                if (!isNaN(num)) {
                    if (minLevelStr) {
                        const minLevel = parseInt(minLevelStr, 10);
                        if (num < minLevel) matchesLevel = false;
                    }
                    if (maxLevelStr) {
                        const maxLevel = parseInt(maxLevelStr, 10);
                        if (num > maxLevel) matchesLevel = false;
                    }
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

                const searchableString = `${data.subject || ''} ${data.number || ''} ${data.name || ''}`.toLowerCase();

                // Advanced matching logic
                if (exactCourseIdMatch) {
                    matchesQuery = true;
                } else if (/^\d{1,4}$/.test(q)) {
                    // if user types just a course number, match startsWith to allow "25" to match "2500"
                    matchesQuery = numStr.startsWith(q);
                } else {
                    // Escape query for regex and use word boundary `\b` so "cs" matches "CS 2500" but not "AFCS" or "Ethics"
                    const escapedSearch = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const wordBoundaryRegex = new RegExp(`\\b${escapedSearch}`, 'i');
                    matchesQuery = wordBoundaryRegex.test(searchableString);
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

    } catch (error: unknown) {
        console.error("API /courses error:", error);
        return NextResponse.json({
            error: { code: "SERVER_ERROR", message: "Failed to fetch course data." }
        }, { status: 500 });
    }
}
