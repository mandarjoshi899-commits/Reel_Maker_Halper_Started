# Reel Maker Helper 2.0 — Android-first starter

## What works immediately
- Script generation using built-in starter templates (no account/API needed)
- Emotional, comedy, motivational, educational, daily-life and suspense categories
- Scene planner and copy buttons
- Music mood + background suggestions
- Thumbnail headline/design brief preview
- Local saved scripts in the browser

## Optional cloud account + cloud saved scripts (Supabase)
1. Create a project at https://supabase.com/ .
2. In Project Settings > API, copy Project URL and anon/public key.
3. In `index.html`, replace:
   - `YOUR_SUPABASE_PROJECT_URL`
   - `YOUR_SUPABASE_ANON_KEY`
   These are public client settings; never put a service-role key in the website.
4. Open Supabase SQL Editor and run `supabase/schema.sql`.
5. In Supabase Authentication settings, configure email sign-up. For production, enable email confirmation and configure allowed redirect URLs to your deployed site.
6. Upload `index.html` to GitHub Pages or another static host.
7. Sign up/login from the Account tab. Logged-in scripts are stored in the user's own cloud rows through Row Level Security.

## Optional real AI script generation
The built-in generator works free. Live AI generation requires an AI provider API key and may incur usage charges; free credits/availability vary.
1. Install/use Supabase CLI from a computer or supported cloud development environment.
2. Deploy `supabase/functions/generate/index.ts` as a Supabase Edge Function named `generate`.
3. Set secret `OPENAI_API_KEY` in Supabase Function Secrets. Never add this key to `index.html` or a public GitHub repository.
4. Ensure the function requires a signed-in user before public launch. For a production app, add JWT verification and rate limits; keep the function private to authenticated users.
5. The front-end calls `supabase.functions.invoke("generate", ...)`.

Important: The included function is a starter example. Before public launch, enforce authentication/JWT verification and rate limiting, set spending limits with the AI provider, and test abuse controls. Do not expose API keys in client-side code.

## Android phone testing
1. Download and extract the ZIP using Files/File Manager.
2. For a quick local check, open `index.html` in a mobile browser. Some browsers restrict local-file features; hosting it on GitHub Pages is the more reliable test.
3. For online hosting, create a PUBLIC GitHub repository, upload `index.html` to repository root, then Settings > Pages > Deploy from a branch > `main` > `/ (root)` > Save.
4. Open the published HTTPS URL on Android Chrome. Test Generate, Copy, Music, Thumbnail, and local Save.
5. To install as a home-screen shortcut, use Chrome menu > Add to Home screen (wording may vary). This is not yet a Play Store app.

## Before Play Store
This ZIP is a website starter, not an Android App Bundle (AAB). A proper PWA manifest/service worker and an Android packaging/testing step are still required. Google Play developer registration has a fee and may require closed testing for new personal accounts. Also publish a privacy policy that accurately explains email login, cloud storage, and any AI processing.
