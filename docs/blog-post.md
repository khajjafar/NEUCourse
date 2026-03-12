# Building NEUCourse: Two Sprints, Two AI Tools, and One Very Chaotic Registration Season

Every Northeastern student has a version of the same story. It's the week before course registration opens, you've pulled up Banner on one screen, a spreadsheet on another, and you're manually calculating whether CS 4520 conflicts with your Thursday seminar. You check the prereq list for the fifth time because you can't remember if you took the right version of Discrete Math. You copy-paste the class meeting times into Google Calendar one by one. And somewhere in the middle of this circus, you lose track of which courses you still need for your concentration.

That was the problem I set out to fix with NEUCourse — a degree planning and scheduling tool built specifically for NEU students. My teammate Keeyon and I built it as a course project, two engineers over two one-week sprints, and the experience taught me more about software architecture, AI-assisted development, and the gap between "we could build that" and "we should build that" than any single project I've worked on before.

## What We Built and Why We Made the Choices We Did

NEUCourse has four main pieces: a course search browser fed by pre-scraped data from SearchNEU, a multi-semester degree plan builder where you can drag courses around across semesters, a weekly calendar for scheduling classes and other commitments, and an export button that spits out a `.ics` file you can drop into Google Calendar.

The tech stack choices came down to what would let two people move fast without accumulating debt. We chose Next.js 14 with the App Router because it let us write server components by default — no need for a separate backend, no CORS headaches, and the API route handlers sit right next to the pages that use them. Firebase was an obvious fit for a student project: one service for auth and database, a free tier that covers our traffic comfortably, and Firestore's document model maps naturally to users → plans → semesters → courses.

TailwindCSS was non-negotiable. When you're shipping features every two days, utility classes are a superpower. We never wrote a single custom CSS file. Every UI element is built entirely from Tailwind utilities, which also makes the codebase much easier to scan when you're context-switching between the calendar page and an API route.

The biggest deliberate trade-off was the scraping approach. We could have built live scraping — hit SearchNEU on every search request and return fresh results. We chose not to. Live scraping adds latency, creates rate-limit risk, and makes every search dependent on an external service staying up. Instead, we ran a one-time scraper that dumped the full NEU course catalog into Firestore. Search requests query our own database, which is fast, reliable, and free at our scale. The data is a snapshot in time, but for a planning tool that's completely fine — students aren't registering through us, they're planning.

## The Architecture That Made Everything Work (and a Few Things That Almost Didn't)

The single hardest architectural decision in the project was the Firebase client SDK versus Admin SDK boundary. Next.js App Router blurs the line between server and client code — you write `.tsx` files, some render on the server, some on the client, and it's easy to accidentally import the wrong Firebase module into the wrong context.

We established a hard rule early: `firebase-admin` never gets imported outside of API route handlers and `/lib/firebase-admin.ts`. Client components and custom hooks use the browser Firebase SDK (`/lib/firebase.ts`) only to get auth tokens. All actual data reads and writes go through our own API routes. This means every page and component fetches from `/api/v1/...` — our own endpoints — not from Firestore directly.

This might feel like adding a layer you don't need, but it paid off in a few ways. It meant our Firestore security rules could stay simple (each user can only read their own documents). It meant we could add server-side validation in one place. And it made testing straightforward: mock `fetch`, mock `firebase-admin`, and every test is isolated from the real database.

The JWT flow was the other thing I had to think carefully about. Firebase gives you an ID token via `getIdToken()` on the client. Every API request needs to include it as a Bearer token. The question is where to store it. We keep it in React context only — retrieved fresh from Firebase when needed, never written to localStorage or sessionStorage. This sounds inconvenient but Firebase handles token refresh automatically, and the security benefit of not persisting JWTs in browser storage is real.

One bug that genuinely tripped me up: the SearchNEU scraper stores meeting times with an en-dash (–) as the time range separator — "MWF 10:30am – 11:35am" — but my regex was matching a regular hyphen (-). The calendar integration was silently failing to parse any meeting time until I traced it down to a Unicode normalization issue. The fix was one line: normalize en-dash and em-dash to hyphen before running the match. Now I double-check character encoding every time I write a regex against scraped data.

## Two AI Tools, Two Very Different Jobs

We used AI throughout the project, but not as a replacement for thinking. Each tool had a specific role, and understanding where each one added value (and where it didn't) is honestly one of the most useful things I'll take away from this project.

The primary coding tool was Antigravity, an AI-native IDE. This was the workhorse — it handled feature implementation prompts, generated boilerplate for new API routes, filled in the repetitive parts of components, and helped with code review and architectural guidance across the codebase. When I needed to add a new hook that followed the same pattern as `usePlans`, I could describe what I wanted and get a working scaffold in seconds. Antigravity's awareness of the full project context made it invaluable for multi-file reasoning too: spotting inconsistencies between a route handler and its test, or noticing that a component was importing something it shouldn't. When I was debugging the en-dash issue in `parse-meeting-times.ts`, it helped me trace the call chain from the calendar button all the way back to the scraper output format. This is where AI adds the most raw throughput: when you know exactly what you want and you just need a tool that understands your whole codebase.

Claude Chat was the second tool, used heavily in the planning and design phases. When Keeyon and I were figuring out how to structure the Firestore data model — should semesters be a subcollection or an array on the plan document? — I used Claude Chat to think through the trade-offs out loud. Subcollections scale better and allow security rules per document. Arrays are simpler to read in one roundtrip. We went with subcollections. That conversation shaped a lot of downstream decisions about the API design and the overall architecture.

The two tools genuinely complemented each other: Claude Chat for planning and design decisions, Antigravity for implementation and review. Using both well required knowing which one to reach for — and being disciplined enough not to let either of them override your own judgment when the suggestion was wrong.

## What I Learned and What I'd Do Differently

The testing strategy was harder to get right than the feature code. Reaching 80% branch coverage forced me to think carefully about edge cases I had mentally glossed over — what happens if `getIdToken()` throws? What if the API returns `null` for a data field? Those branches represent real failure modes in production, and writing tests for them revealed two actual bugs that I then fixed.

The modal layout was something that burned me once. I had used a Tailwind UI pattern with a `fixed` backdrop and an `inline-block transform` card, and the backdrop was rendering on top of the card because of how the stacking context worked. The fix was switching to a flex-centered layout: `fixed inset-0 flex items-center justify-center` with an absolute backdrop and a relative card. Once I found the working pattern I documented it in the codebase so we'd stop reinventing it.

If I were starting over, I'd write the documentation earlier. Not the auto-generated API docs — those were easy with Swagger annotations — but the human-readable docs: what each module is responsible for, what architectural rules matter and why. Writing JSDoc comments at the end of the project felt like catching up. Writing them as I built would have caught a few design decisions that felt obvious in the moment but weren't obvious three weeks later.

The thing I'm most proud of is the prereq validation. It's soft — amber inline badges, never a hard block. A student can ignore a warning and add the course anyway. That was a deliberate product decision, and getting the balance right between "helpful guidance" and "paternalistic gating" is harder than it sounds. Students know their situation better than our system does. We give them information; they make the call.

NEUCourse is open source and the API is documented at `/api-docs` in the running app. If you're a NEU student who's spent too much time building your schedule in a spreadsheet, I'd love for you to try it.
