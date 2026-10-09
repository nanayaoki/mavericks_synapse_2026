## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Google Sign-In

The app uses Firebase Authentication with the Google provider for the landing-page
**Sign In** action. The provided SkillsBridge Firebase web configuration is used by
default; each `VITE_FIREBASE_*` value can be overridden in `.env.local` for another
Firebase project.

Before testing sign-in, enable **Google** under Firebase Console → Authentication →
Sign-in method and add the local or deployed host to Authentication → Settings →
Authorized domains.

Authenticated dashboard progress is isolated by Firebase user ID and persisted in
that browser's local storage. A different Google account receives a new empty
SkillTwin profile instead of sharing another account's remediation state.
