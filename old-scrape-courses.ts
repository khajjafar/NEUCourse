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
    console.log('Attempting to fetch course data from SearchNEU GraphQL API...');

    // The SearchNEU API often uses a graphql query to fetch term course data.
    // If the schema or endpoint is unreachable, we will gracefully fallback to the local mock data
    // to ensure the frontend development isn't blocked.
    try {
        const response = await fetch('https://searchneu.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    query {
                        classes(termId: "202510") {
                            subject
                            number
                            title
                            description
                            credits
                            prerequisites
                            corequisites
                        }
                    }
                `
            })
        });

        if (!response.ok) {
            throw new Error(`SearchNEU HTTP status ${response.status}`);
        }

        const json = await response.json();

        if (json.errors || !json.data || !json.data.classes) {
            throw new Error("SearchNEU GraphQL schema changed or returned errors.");
        }

        const courses: Course[] = json.data.classes.map((c: any) => ({
            id: `${c.subject}${c.number}`,
            subject: c.subject,
            number: c.number,
            name: c.title || "Unknown Course",
            description: c.description || "No description available.",
            creditHours: Number(c.credits) || 4,
            prereqs: [], // Real parsing of text to Course IDs is complex, simplified for demo
            coreqs: []
        }));

        console.log(`Successfully scraped ${courses.length} courses from SearchNEU.`);
        return courses;

    } catch (error: any) {
        console.warn(`\n[WARNING]: SearchNEU scrape failed (${error.message}).`);
        console.warn('Falling back to foundational NEU dataset to ensure Firebase populates.\n');
        return fallbackCourses;
    }
}

async function uploadCoursesToFirestore(courses: Course[]) {
    console.log(`Starting upload of ${courses.length} courses to Firestore...`);
    const batch = db.batch();
    const coursesRef = db.collection('courses');

    for (const course of courses) {
        const docRef = coursesRef.doc(course.id);
        batch.set(docRef, course);
    }

    try {
        await batch.commit();
        console.log('Successfully uploaded all courses to Firestore!');
    } catch (error) {
        console.error('Error uploading to Firestore:', error);
    }
}

async function run() {
    console.log('--- Starting Course Scraper ---');
    const courses = await scrapeSearchNeu();
    await uploadCoursesToFirestore(courses);
    console.log('--- Finished Course Scraper ---');
    process.exit(0);
}

run();
