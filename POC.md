# Hash Length Extension PoC

This project includes two vulnerable flows and ready-to-run exploit scripts.

## 1) Payment flow vulnerability

Vulnerable integrity check:

- server validates `SHA256(secret || payload)` instead of HMAC
- attacker performs length extension and appends `&amount=100000`

Run:

```bash
npm run poc:payment
```

Optional target:

```bash
set TARGET_BASE_URL=https://your-vercel-app.vercel.app
npm run poc:payment
```

## 2) Role escalation vulnerability

Vulnerable role token:

- server issues `user=<name>&role=user&nonce=...` with hash `SHA256(secret || token)`
- attacker extends token and appends `&role=admin`
- admin endpoint accepts forged payload if hash is valid

Run:

```bash
npm run poc:role
```

Optional target/user:

```bash
set TARGET_BASE_URL=https://your-vercel-app.vercel.app
set POC_USER=arif
npm run poc:role
```

## Manual API flow (without scripts)

1. Get signed role token:
   - `GET /api/role/issue?user=arif`
2. Forge with extension:
   - `POST /api/forge` with `appendText: "&role=admin"`
3. Call admin action:
   - `POST /api/role/admin-action`

If successful, response includes admin flag.
