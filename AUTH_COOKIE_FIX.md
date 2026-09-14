# Auth / 401 Fix

## Symptom

After login succeeds, the next protected request (`GET /api/auth/me` or `/api/rooms`) can return `401 Unauthorized`.

## Request flow

1. `POST /api/auth/login` validates credentials.
2. `generateTokenAndSetCookies()` creates the JWT and sends it as an HttpOnly `jwt` cookie.
3. The frontend Axios client uses `withCredentials: true`.
4. `ProtectedRoute` calls `GET /api/auth/me`.
5. `protectRoute` reads only `req.cookies.jwt`.
6. If the browser does not send the cookie, the request is rejected with 401.

## Required production behavior

- API CORS must allow the exact deployed frontend origin and `credentials: true`.
- The auth cookie must use `SameSite=None` and `Secure` when frontend and API are cross-site.
- The cookie should explicitly use `Path=/`.
- For browsers that partition/block third-party cookies, production auth can opt into CHIPS with `Partitioned` so the cookie remains available to this frontend's top-level site.
- The frontend must never construct the Google OAuth URL from `window.location.hostname:5000`; it must use the configured API URL.

## Files changed

- `server/utils/generateToken.js`
  - Explicit `path: '/'`.
  - Production cross-site cookie uses `SameSite=None`, `Secure`, and `Partitioned`.
- `client/src/pages/Login.jsx`
  - Google OAuth URL uses the configured API base URL instead of hard-coded port 5000.
- `server/controllers/googleAuth.controller.js`
  - Google callback no longer puts the user's ID/username in the URL query string; the session cookie is the credential and `/auth/me` is the source of truth.
- `client/src/pages/Dashboard.jsx`
  - Google callback handling no longer reconstructs/stores identity from URL parameters.

## Environment requirements

Backend:

```env
NODE_ENV=production
CLIENT_URL=https://<exact-frontend-origin>
JWT_SECRET=<strong-secret>
```

Frontend:

```env
VITE_API_URL=https://<backend-origin>/api
```

After changing Render/Vercel environment variables, redeploy both affected services.

## Verification

1. Login.
2. In DevTools Network, inspect the login response and confirm `Set-Cookie: jwt=...`.
3. In Application -> Cookies, confirm the `jwt` cookie exists for the backend host.
4. Inspect `GET /api/auth/me`; it must contain the JWT cookie in the request.
5. Confirm `GET /api/rooms` returns 200.
6. Confirm Socket.IO connects using the same cookie-based session.

Do not fall back to storing the JWT in localStorage. The current design intentionally keeps the JWT HttpOnly.
