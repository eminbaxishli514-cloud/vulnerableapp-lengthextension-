# Length Extension Marketplace Lab

Modern marketplace app with Firebase authentication and a vulnerable signed payment backend for CTF-style manual exploitation.

## Stack

- Next.js app router
- Firebase Auth (Google + email/password)
- Vercel hosting/functions for dynamic routes (`/api/*`)

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required env vars are in `.env.example`.

## Vercel deployment (recommended)

1. Push this project to GitHub.
2. Import repo in Vercel.
3. In Vercel project settings, add all env vars from `.env.example`.
4. Deploy.

## Firebase Auth setup checklist

In Firebase Console (`length-ad64f`):

1. Authentication -> Sign-in method:
   - Enable `Google`
   - Enable `Email/Password`
2. Authentication -> Settings -> Authorized domains:
   - Add your Vercel domain (for example: `your-app.vercel.app`)
   - Add custom domain if used

## Notes

- Keep `DEMO_SECRET` private (server-side env only).
- `NEXT_PUBLIC_FIREBASE_*` vars are safe on client side (Firebase web config).
- Payment APIs are server-side on Vercel and keep the challenge logic intact.
