# REP//AI — AI Gym Trainer Website

A responsive Next.js website. Users upload a gym-machine photo, the server sends it to OpenAI vision for machine identification, then displays compatible exercise suggestions and a manual set/rep tracker.

## Requirements
- Node.js 20.9 or newer
- An OpenAI API key with API billing enabled\n- A Supabase project for accounts and cloud workout history
- A Vercel account (recommended for deployment)

## Run locally
1. Extract the ZIP.
2. Open the project folder in VS Code or a terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local`.
5. Put your keys in `.env.local`: `OPENAI_API_KEY=...`, `NEXT_PUBLIC_SUPABASE_URL=...`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
6. In Supabase Dashboard → SQL Editor, run `supabase/schema.sql` to create the workout table and security policies.\n7. In Supabase Authentication settings, configure your site URL and email confirmation settings.\n8. Run `npm run dev`.
7. Open `http://localhost:3000`.

Never put the OpenAI key in a `NEXT_PUBLIC_` variable or in browser code.

## Deploy to a public URL with Vercel
1. Create a GitHub account if you do not have one.
2. Create a new GitHub repository and upload the contents of this folder (not the ZIP itself).
3. Sign in to Vercel using GitHub and choose **Add New → Project**.
4. Import the `repai-gym-trainer` repository. Vercel should detect Next.js automatically.
5. In **Environment Variables**, add `OPENAI_API_KEY` and paste your secret API key.
6. Click **Deploy**. Vercel will provide a public `*.vercel.app` URL you can share.
7. Whenever you update the GitHub repository, Vercel can redeploy automatically.

## Accounts and cloud history\n- Supabase email/password sign-up and sign-in are included.\n- Workout history is saved to the signed-in user's Supabase account. Logged-out use falls back to browser-local history.\n- Run `supabase/schema.sql` in the Supabase SQL Editor. Row Level Security restricts each user to their own workout rows.\n- In Vercel, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables, then redeploy. Use the Supabase publishable/anon key only; never expose a service-role key.\n\n## Current prototype scope
- Real AI machine photo analysis via the server-side `/api/analyze` route.
- Exercise suggestions and step-by-step written movement guidance.
- Manual sets/reps/weight logging.
- Workout history saved in the browser's local storage on that device/browser.

## Important limitations before public launch
- Email/password accounts and cloud workout history are supported once Supabase is configured.
- The workout guide includes a simple looping illustrative SVG animation. It is not a biomechanically accurate, exercise-specific video demonstration.
- Add rate limiting, abuse protection, image moderation, privacy policy, and usage limits before sharing widely. The API route sends uploaded photos to OpenAI for analysis; tell users this clearly and obtain appropriate consent.
- AI identification can be wrong. Users should confirm machine identity, attachment, setup and form with qualified gym staff. Do not treat AI instructions as medical or individualized coaching.
- Consider adding authentication and a database (e.g. Supabase) before storing user accounts or personal workout data.
