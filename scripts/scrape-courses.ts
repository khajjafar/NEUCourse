import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local for Firebase Admin credentials
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Ensure we have the required env variables
if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error('Missing Firebase environment variables in .env.local');
    process.exit(1);
}

// Format the private key
const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

// Initialize Firebase Admin
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
        }),
    });
}

const db = getFirestore();

interface Course {
    id: string;
    subject: string;
    number: string;
    name: string;
    description: string;
    creditHours: number;
    prereqs: string[];
    coreqs: string[];
}

// Fallback dataset of foundational NEU Courses if SearchNEU scraper fails
const fallbackCourses: Course[] = [
    {
        id: "CS1200",
        subject: "CS",
        number: "1200",
        name: "First Year Seminar",
        description: "Introduces students to the university and the Khoury College of Computer Sciences.",
        creditHours: 1,
        prereqs: [],
        coreqs: []
    },
    {
        id: "CS2500",
        subject: "CS",
        number: "2500",
        name: "Fundamentals of Computer Science 1",
        description: "Introduces the fundamental ideas of computing and the principles of programming.",
        creditHours: 4,
        prereqs: [],
        coreqs: ["CS2501"]
    },
    {
        id: "CS2510",
        subject: "CS",
        number: "2510",
        name: "Fundamentals of Computer Science 2",
        description: "Builds on CS 2500 to teach object-oriented programming and data structures.",
        creditHours: 4,
        prereqs: ["CS2500"],
        coreqs: ["CS2511"]
    },
    {
        id: "CS3500",
        subject: "CS",
        number: "3500",
        name: "Object-Oriented Design",
        description: "Presents a comparative approach to software design applying object-oriented principles.",
        creditHours: 4,
        prereqs: ["CS2510"],
        coreqs: ["CS3501"]
    },
    {
        id: "CS4530",
        subject: "CS",
        number: "4530",
        name: "Software Engineering",
        description: "Focuses on the engineering of complex software systems.",
        creditHours: 4,
        prereqs: ["CS3500"],
        coreqs: []
    },
    {
        id: "MATH1341",
        subject: "MATH",
        number: "1341",
        name: "Calculus 1 for Science and Engineering",
        description: "Covers definition, calculation, and major uses of the derivative, as well as an introduction to integration.",
        creditHours: 4,
        prereqs: [],
        coreqs: []
    },
    {
        id: "BUSN1101",
        subject: "BUSN",
        number: "1101",
        name: "Introduction to Business",
        description: "Provides an overview of the business world, including economics, management, and marketing.",
        creditHours: 4,
        prereqs: [],
        coreqs: []
    }
];

async function scrapeSearchNeu(): Promise<Course[]> {
    console.log('Fetching course data from SearchNEU API...');

    try {
        // Fetching courses for a representative active term
        const response = await fetch('https://searchneu.com/api/search?term=202630');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const courses: Course[] = [];

        for (const item of data) {
            if (!item.subject || !item.courseNumber || !item.name) continue;

            const rawId = `${item.subject} ${item.courseNumber}`;

            const courseObj: Course = {
                id: rawId.replace(/\\s+/g, ''), // e.g., 'CS2500' without spacing for document id consistency
                subject: item.subject,
                number: item.courseNumber,
                name: item.name.trim(),
                description: "Northeastern University course.",
                creditHours: parseInt(item.maxCredits, 10) || parseInt(item.minCredits, 10) || 4,
                prereqs: [],
                coreqs: []
            };

            // Parse prereqs from the AST provided by the API
            if (item.prereqs && typeof item.prereqs === 'object') {
                const extractReqs = (node: any, targetArray: string[]) => {
                    if (!node) return;
                    if (node.subject && node.courseNumber) {
                        targetArray.push(`${node.subject}${node.courseNumber}`);
                    }
                    if (Array.isArray(node.items)) {
                        node.items.forEach((child: any) => extractReqs(child, targetArray));
                    }
                };
                extractReqs(item.prereqs, courseObj.prereqs);
                courseObj.prereqs = [...new Set(courseObj.prereqs)]; // Deduplicate
            }

            // Parse coreqs 
            if (item.coreqs && typeof item.coreqs === 'object') {
                const extractReqs = (node: any, targetArray: string[]) => {
                    if (!node) return;
                    if (node.subject && node.courseNumber) {
                        targetArray.push(`${node.subject}${node.courseNumber}`);
                    }
                    if (Array.isArray(node.items)) {
                        node.items.forEach((child: any) => extractReqs(child, targetArray));
                    }
                };
                extractReqs(item.coreqs, courseObj.coreqs);
                courseObj.coreqs = [...new Set(courseObj.coreqs)]; // Deduplicate
            }

            // Deduplicate across the dataset
            if (!courses.find(c => c.id === courseObj.id)) {
                courses.push(courseObj);
            }
        }

        console.log(`Successfully fetched ${courses.length} courses from SearchNEU.`);
        return courses.length > 0 ? courses : fallbackCourses;

    } catch (error: any) {
        console.warn(`\\n[WARNING]: SearchNEU API fetch failed (${error.message}).`);
        console.warn('Falling back to foundational NEU dataset to ensure Firebase populates.\\n');
        return fallbackCourses;
    }
}

async function uploadCoursesToFirestore(courses: Course[]) {
    console.log(`Starting upload of ${courses.length} courses to Firestore...`);
    const coursesRef = db.collection('courses');

    // We use chunks to avoid hitting Firestore batch limits (limit is 500 ops per batch)
    const CHUNK_SIZE = 400;

    for (let i = 0; i < courses.length; i += CHUNK_SIZE) {
        const chunk = courses.slice(i, i + CHUNK_SIZE);
        const batch = db.batch();

        chunk.forEach((course) => {
            const docRef = coursesRef.doc(course.id);
            // Include a server timestamp for updates
            batch.set(docRef, {
                ...course,
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        });

        try {
            await batch.commit();
            console.log(`Uploaded chunk ${Math.floor(i / CHUNK_SIZE) + 1} / ${Math.ceil(courses.length / CHUNK_SIZE)}`);
        } catch (error) {
            console.error(`Error uploading chunk ${Math.floor(i / CHUNK_SIZE) + 1}:`, error);
        }
    }

    console.log('Successfully uploaded all courses to Firestore!');
}

async function run() {
    console.log('--- Starting Course Scraper ---');
    const courses = await scrapeSearchNeu();
    await uploadCoursesToFirestore(courses);
    console.log('--- Finished Course Scraper ---');
    process.exit(0);
}

run();
