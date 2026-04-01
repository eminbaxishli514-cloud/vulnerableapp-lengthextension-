# Deploy on Vercel + Firebase Auth

This project is designed for:

- Hosting/deployment: **Vercel**
- Authentication only: **Firebase Auth**

## 1) Firebase console setup

Project: `length-ad64f`

1. Go to Authentication -> Sign-in method
   - Enable **Google**
   - Enable **Email/Password**
2. Go to Authentication -> Settings -> Authorized domains
   - Add your Vercel URL, e.g. `your-app.vercel.app`
   - Add custom domain if any

## 2) Vercel project setup

1. Push code to GitHub.
2. Import repository in Vercel.
3. Framework preset: **Next.js**
4. Add environment variables (Project Settings -> Environment Variables):

- `DEMO_SECRET` = strong random secret
- `CTF_FLAG` = challenge flag
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

Use values from `.env.example` for Firebase public keys.

## 3) Deploy

Click **Deploy** in Vercel.

## 4) Post-deploy checks

1. Open site and verify:
   - email/password registration works
   - Google sign-in works
2. Visit `/cart` after login and run checkout flow.
3. Confirm `/api/pay` responds in deployed environment.
