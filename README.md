# Ken Framework Users App (Next.js)

User-facing frontend built with Next.js App Router and NextAuth (JWT session strategy). It talks to the NestJS APIs in `../backend-apis`.

## Runs on

- App: `http://localhost:3030`

## Key routes

- Public: `/`
- Auth: `/auth/login`, `/auth/signup`, `/auth/reset`, `/auth/new-password`
- Protected: `/dashboard`, `/settings`, `/get-support`

Note: `/profile` redirects to `/settings`.

## Prerequisites

- Node.js 18+
- The backend APIs running locally (see `../backend-apis/README.md`)

## Environment variables

Create a `users-app/.env.local` file.

Required:

- `AUTH_SECRET` – NextAuth secret (set a long random string; do not use the default)

Backend endpoints (optional, have sane defaults):

- `NEXT_PUBLIC_AUTH_API` – defaults to `http://localhost:3001/`
- `NEXT_PUBLIC_USERS_API` – defaults to `http://localhost:3002/`

Google OAuth (optional):

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Build / lint

```bash
npm run lint
npm run build
```

## Auth flow notes

- Credentials login: backend returns a JWT, which is stored in `localStorage` and also attached to the NextAuth session.
- Google login: NextAuth completes OAuth, then the app posts the Google `id_token` to the backend to receive the backend JWT.
- Token sync: when `localStorage` is missing a token (e.g. after OAuth redirect), the app syncs `session.user.accessToken` into `localStorage`.

## Troubleshooting

- If login intermittently fails with a Next.js “unexpected response” message, check middleware changes in `middleware.ts` were not reverted. Redirecting Server Action / RSC POST requests can break auth flows.
