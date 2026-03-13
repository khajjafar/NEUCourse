# NEUCourse - 10-Minute Demo Video Script

**Speakers:** Keeyon Hajjafar and Joythish Evuri
**Target Length:** 10 Minutes (~1250 words)
**Pace:** Slow, deliberate speaking pace for clarity.

---

**[00:00] Keeyon:**
Hello everyone, and welcome to our project showcase. I'm Keeyon.

**[00:05] Joythish:**
And I'm Joythish. Today, we're really excited to walk you through NEUCourse, a web application we built from the ground up to revolutionize how Northeastern students plan their degrees and schedule their classes.

**[00:18] Keeyon:**
If you're a Northeastern student, you probably know the struggle. It's the week before registration, you have Banner open on one monitor, a messy spreadsheet on another, and you're manually making sure that CS 4520 doesn't overlap with another class. You're constantly checking prerequisite lists and copying meeting times into Google Calendar one by one. 

**[00:40] Joythish:**
Exactly. And somewhere in that chaotic process, it's so easy to make a mistake that could delay your graduation. That was the problem we set out to solve. NEUCourse is a centralized degree planning and scheduling hub. But what we really want to highlight today isn't just *what* we built—it's *how* we built it. Over two one-week sprints, we heavily integrated AI models into our workflow to handle the heavy lifting, allowing us to build a full MVP at an unprecedented speed.

**[01:10] Keeyon (Topic: Designing the PRD with AI):**
Let's rewind to day one: our initial sprint planning. Before writing a single line of code, we needed a solid Product Requirements Document, or PRD. We used Claude Chat as a sounding board to design this PRD. We talked through our core user personas—like the "Overwhelmed Planner" and the "Degree Tracker"—and used the AI to help us shape our acceptance criteria. 

**[01:35] Joythish:**
Claude was also huge for our architectural planning. For instance, we weren't sure whether to store a user's semesters as an array or as a subcollection in Firestore. By thinking through the trade-offs out loud with the AI, we decided on subcollections for better scaling and tighter security rules. That early AI feedback shaped the entire foundation of our database.

**[02:00] Keeyon (Topic: Wireframes):**
Once we knew what we were building, we needed to know what it looked like. We actually started by drawing our wireframes by hand. Just rough sketches of a dashboard, a course search interface, and a calendar. 

**[02:15] Joythish:**
But instead of spending hours manually recreating those sketches in Figma, we fed our hand-drawn diagrams into an AI generation tool. The AI was able to interpret our drawings and instantly generate styled, high-fidelity wireframes using Tailwind UI patterns. In a matter of minutes, we had beautiful mockups for our Dashboard, Course Search, Plan Details, and Calendar screens.

**[02:40] Keeyon (Topic: Building the Project):**
With our deliverables in hand, the actual building process began. We chose a modern tech stack focused on velocity: Next.js 14 with the App Router, and TailwindCSS for styling. All of our data is managed using Firebase for authentication and Firestore for the database. 

**[03:00] Joythish:**
One of the most critical decisions we made in our architecture was enforcing a strict boundary between our client code and our server code. We set a hard rule: the Firebase Admin SDK never gets imported into client components. All data fetching goes through our own Next.js API routes. We passed JSON Web Tokens from the client to the server for authentication, keeping the app highly secure. 

**[03:25] Keeyon:**
Our primary AI coding assistant throughout this implementation was Antigravity, an AI-native IDE. Because we had a detailed PRD and a strict set of rules in our `.antigravityrules` file, the AI understood our exact coding standards. If I needed a new custom hook or a new API route handler, I could prompt Antigravity, and it would generate the boilerplate perfectly aligned with our existing architecture. 

**[03:52] Joythish (Topic: App Walkthrough):**
Now, let's actually show you the app. 
*(Visual: Screen transition to the App Dashboard)*
When a student logs in, they land on a personalized dashboard showing their active degree plans and upcoming calendar events. 

**[04:10] Keeyon:**
From here, we can jump into the Course Browser. Now, a quick architectural note here: instead of live-scraping the Northeastern catalog on every search—which is slow and unreliable—we wrote a one-time scraper to dump the course catalog into Firestore. Because of this, our course search is lightning fast. 

**[04:30] Joythish:**
*(Visual: User adds a course, maybe triggers a prerequisite warning)*
Next is our multi-semester degree planner. Students can create a plan and drag courses into different semesters. One feature we're really proud of is our automated prerequisite validation. If you try to add a course without taking its prerequisite in an earlier semester, the app gives you a soft warning—meaning you can still add it if you have special circumstances, but you are visually alerted to the missing requirement.

**[05:00] Keeyon:**
*(Visual: Moving to the Calendar view)*
Finally, students can push their planned courses directly onto a weekly calendar. And when you're done, there's a button to export your entire schedule as a `.ics` file, which drops perfectly into Google Calendar. 

**[05:20] Joythish (Topic: Bumps in Development):**
But of course, software development is rarely perfectly smooth, even with AI. We hit a few significant bumps along the way. For example, our scraper pulled in course data perfectly, but when we tried to map scheduling data to our calendar, things got messy. 

**[05:40] Keeyon:**
Right. Our first big issue was with the dates when scraping the class times. When we tested adding a class to the calendar, the app was inadvertently creating an event for *every single day* of the week instead of just the actual meeting days. We also had a persistent problem properly extracting Tuesday and Thursday class times from the scraped data string, since the letters TR overlap in abbreviations and Banner formatting was tricky to parse.

**[06:05] Joythish:**
And then there was the en-dash bug. The SearchNEU scraper output used a Unicode en-dash for time ranges, like "10:30am – 11:35am." But our regex was looking for a standard keyboard hyphen. The calendar integration was silently failing until we used our AI assistant to trace the parsing logic all the way back to the scraper output format. A quick normalization fix, and it was working perfectly.

**[06:35] Keeyon:**
We also ran into some UI glitches. We used a Tailwind CSS pattern for our modals—like the Course Details popup—but because of how CSS stacking contexts work, the dark backdrop kept rendering *on top* of the modal card. We had to rethink our layout and switch to a flex-centered absolute positioning pattern to fix it. 

**[07:00] Joythish:**
These bumps taught us a huge lesson about using AI. AI is amazing at throughput. It can write repetitive tests, scaffold out routes, and trace logic errors. But it isn't a replacement for your own testing and debugging. If your logic or your data source is flawed—like our scraper logic was—the AI will faithfully build on top of that flaw.

**[07:25] Keeyon:**
We also learned a lot about team discipline. During the first sprint, we realized that because we were both using AI to code incredibly fast, we ended up modifying the same core files at the same time. We got hit with some nasty merge conflicts that cost us a lot of time. 

**[07:45] Joythish:**
For sprint two, we adapted. We strictly separated our issues to avoid overlapping files, and we required pull request reviews from each other before merging anything to the main branch. This discipline, combined with the AI speed, made our second sprint incredibly productive. 

**[08:10] Keeyon (Topic: Conclusion and Final Remarks):**
Looking back, the synergy between two very different AI tools—one for planning and one for execution—was the secret sauce of NEUCourse. We bridged the gap between an idea and a shipped product faster than we ever thought possible.

**[08:35] Joythish:**
We took a process that plagues thousands of Northeastern students every semester and turned it into an intuitive, seamless experience. And we built it in a way that is highly typed, fully tested, and easily extensible.

**[08:55] Keeyon:**
NEUCourse is completely open source, and the full API documentation is available right in the app. If you're a Northeastern student tired of cross-referencing spreadsheets and Banner, we hope you'll give it a try.

**[09:20] Joythish:**
Thank you so much for watching. We'd love to take any questions you have about our architecture, our workflow, or our AI stack.

*(End of video)*

---

**Notes for Keeyon & Joythish:**
- This script is currently estimated at ~1250 words, which at a slow, deliberate pace should take exactly 9-10 minutes.
- When recording, remember to pause for 1-2 seconds when switching speakers or presenting visual transitions.
- **Questions for you:** 
  1. Are there any specific details about the Tuesday/Thursday extraction bug that you'd like me to expand on? 
  2. How do you plan to show the app walkthrough (screen recording vs. live demo)? I can adjust the visual cues accordingly.
  3. Would you like to add any other specific bugs or edge cases you guys encountered? 
