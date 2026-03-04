const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

const sampleCourses = [
    {
        courseName: "Fundamentals of Computer Science 1",
        courseNumber: "2500",
        subject: "CS",
        creditHours: 4,
        description: "Introduces the fundamental ideas of computing and the principles of programming. Discusses a systematic approach to word problems, including analytic reading, synthesis, goal setting, planning, plan execution, and testing.",
        prereqs: [],
        coreqs: ["CS 2501"]
    },
    {
        courseName: "Fundamentals of Computer Science 2",
        courseNumber: "2510",
        subject: "CS",
        creditHours: 4,
        description: "Continues CS 2500. Examines object-oriented programming and associated algorithms using more complex data structures. Discusses encapsulation, information hiding, and object-oriented design.",
        prereqs: ["CS 2500"],
        coreqs: ["CS 2511"]
    },
    {
        courseName: "Object-Oriented Design",
        courseNumber: "3500",
        subject: "CS",
        creditHours: 4,
        description: "Presents a comparative approach to software design and architecture. Students design and implement a moderately large software system using object-oriented principles.",
        prereqs: ["CS 2510", "MATH 1365"],
        coreqs: []
    },
    {
        courseName: "Algorithms and Data",
        courseNumber: "5800",
        subject: "CS",
        creditHours: 4,
        description: "Presents the mathematical techniques used for the design and analysis of computer algorithms. Focuses on algorithmic design paradigms and methods for analyzing the performance of algorithms.",
        prereqs: ["CS 3000", "CS 4800"],
        coreqs: []
    },
    {
        courseName: "Introduction to Mathematical Reasoning",
        courseNumber: "1365",
        subject: "MATH",
        creditHours: 4,
        description: "Covers the basics of mathematical reasoning and problem solving to prepare incoming math majors for more rigorous mathematics courses.",
        prereqs: [],
        coreqs: []
    },
    {
        courseName: "Calculus 1 for Science and Engineering",
        courseNumber: "1341",
        subject: "MATH",
        creditHours: 4,
        description: "Covers definition, calculation, and major uses of the derivative, as well as an introduction to integration.",
        prereqs: [],
        coreqs: []
    },
    {
        courseName: "Programming with Data",
        courseNumber: "2000",
        subject: "DS",
        creditHours: 4,
        description: "Introduces programming for data and information science through case studies in business, sports, education, social science, economics, and the natural world.",
        prereqs: [],
        coreqs: ["DS 2001"]
    },
    {
        courseName: "First-Year Writing",
        courseNumber: "1111",
        subject: "ENGW",
        creditHours: 4,
        description: "Designed for students to study and practice writing in a workshop setting. Students read a range of texts in order to describe and evaluate the choices writers make and apply that knowledge to their own writing.",
        prereqs: [],
        coreqs: []
    },
    {
        courseName: "Foundations of Data Science",
        courseNumber: "3000",
        subject: "DS",
        creditHours: 4,
        description: "Introduces core methods in data science. Covers data collection, data wrangling, explanatory data analysis, data visualization, and statistical modeling.",
        prereqs: ["DS 2000"],
        coreqs: []
    }
];

async function seedDatabase() {
    console.log('Seeding database with NEU courses...');
    const batch = db.batch();
    const coursesRef = db.collection('courses');

    let count = 0;
    for (const course of sampleCourses) {
        // Document ID will be Subject + Number (e.g., "CS-2500")
        const docId = `${course.subject}-${course.courseNumber}`;
        const docRef = coursesRef.doc(docId);
        batch.set(docRef, course);
        count++;
    }

    try {
        await batch.commit();
        console.log(`Successfully seeded ${count} courses into Firestore.`);
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        process.exit(0); // Exit script
    }
}

seedDatabase();
