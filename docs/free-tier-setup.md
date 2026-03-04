# Free Tools & Environment Setup Guide

NEUCourse is built entirely on free-tier tools to ensure zero hosting or operational costs. This guide explains how to configure Firebase (Auth & Firestore) and Vercel (Hosting) to run the application for free.

## 1. Firebase Backend Setup (Spark Free Plan)
Firebase provides the backend authentication and NoSQL database (Firestore).

### Creating the Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **"Add project"**.
2. Name it `neucourse` (or your preferred name).
3. Disable Google Analytics (not needed for this project) and create the project.
4. The project defaults to the **"Spark Plan"**, which is 100% free and provides more than enough limits for development and small-to-medium usage.

### Setting up Authentication
1. On the left sidebar, click **Build > Authentication**.
2. Click **Get Started**.
3. Under the "Sign-in method" tab, click **Email/Password**.
4. Enable the first toggle ("Email/Password") and click **Save**. *(Do not enable Email link/passwordless).*

### Setting up Firestore Database
1. On the left sidebar, click **Build > Firestore Database**.
2. Click **Create database**.
3. In the security rules prompt, select **Start in Test Mode** (you will lock this down later in development using Security Rules).
4. Choose a Cloud Firestore location (e.g., `us-east1`) and click **Create**. This creates the free-tier database.

---

## 2. Generating Environment Variables (`.env.local`)

You need to connect your local Next.js project to your new Firebase project. You will place these keys exactly as formatted into a new `.env.local` file in your repository root. Note `.env.local` is `.gitignore`d, protecting your keys from being pushed to GitHub.

### Step 2a: Client-Side Keys (Web App)
These keys power user logins on the frontend.
1. Go to your **Project Overview** in Firebase (click the home icon top-left).
2. Click the **web icon (`</>`)** to add a Firebase Web App.
3. Name it (e.g., "NEUCourse Web") and click **Register app**.
4. You will be provided with a `firebaseConfig` block. Map those values to your `.env.local` file corresponding to `.env.example`.

### Step 2b: Server-Side Keys (Admin SDK Service Account)
These keys power API routes securely checking user tokens. **NEVER share these.**
1. Click the **Settings Gear** next to "Project Overview" and select **Project settings**.
2. Go to the **Service accounts** tab.
3. Ensure "Node.js" is selected and click **Generate new private key**.
4. This downloads a `.json` file containing your server credentials.
5. Open the downloaded `.json` file and map `client_email` and `private_key` to your `.env.local` file.

### Complete `.env.local` Example Structure:
```env
# Client-Side Variables (From Step 2A)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=neucourse.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=neucourse
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=neucourse.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456...

# Server-Side Admin Variables (From Step 2B)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@neucourse.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIB... (Entire string inside quotes) ...\n-----END PRIVATE KEY-----\n"
```
*(Warning: Make sure `FIREBASE_PRIVATE_KEY` keeps the exact `\n` linebreaks intact, inside quotation marks!)*

---

## 3. Vercel Deployment (Free Hobby Tier)
When you're ready to deploy the live application (part of a later sprint task):

1. Commit your codebase and push it to your GitHub repository.
2. Sign up for a free Hobby account at [Vercel](https://vercel.com/).
3. Connect your GitHub account and import the `NEUCourse` repository.
4. During the project configuration on Vercel, expand the **Environment Variables** section.
5. Copy/paste all key-value pairs from your `.env.local` directly into the Vercel dashboard.
6. Click **Deploy**. Vercel will build and host the Next.js App Router seamlessly and for free.
