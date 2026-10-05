# ken-users-app: local backend testing

Next 16.3.8 / React 19.3.0 with refreshed UI dependencies. This is a basic
functional handoff with basic local real-backend integration checked and user manual
testing confirmed, not production readiness or full security closure.

## Quick start

Use Node **24.20.0 (24.x)** and Node-24-compatible **pnpm 11.4.0**.
The host standalone pnpm bundles Node 26; do not use it for this pinned setup.
With the compatible pnpm on your PATH, run from this app directory:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm run dev
```

Open http://localhost:3033/auth/login. Production: `pnpm run build`, then
`pnpm run start`. Webpack is explicit to preserve the existing native-module/CSP setup.
`next-env.d.ts` is generated locally by Next; generated files and dependencies were not promoted.

For this temporary workspace only, the already available JS CLI is:

```sh
/home/linuxbrew/.linuxbrew/bin/node /tmp/ken-frontend-refresh-n5zlxfoy/tools/node_modules/pnpm/bin/pnpm.cjs install --frozen-lockfile --ignore-scripts
/home/linuxbrew/.linuxbrew/bin/node /tmp/ken-frontend-refresh-n5zlxfoy/tools/node_modules/pnpm/bin/pnpm.cjs run dev
```

That temporary path is not portable. Other machines need a Node-24-compatible pnpm;
no installed Corepack is assumed. Keep lifecycle scripts disabled and the workspace
`onlyBuiltDependencies: []` / `ignoreScripts` policy unchanged.

## Local configuration

Provide local Auth.js configuration before testing: a private `AUTH_SECRET` and
`AUTH_URL` matching this frontend origin. Configure optional Google credentials
only if testing that provider. Keep real dotenv files and credentials out of the
repository. Initial isolated verification did not contact real auth/backend
services; subsequent integration used an owned local backend and synthetic accounts.

Start the backend services separately. API defaults are Auth `http://localhost:3011/`,
Users `http://localhost:3012/`, Admin `http://localhost:3013/`; override via
`NEXT_PUBLIC_AUTH_API`, `NEXT_PUBLIC_USERS_API`, `NEXT_PUBLIC_ADMIN_API` as needed.
Frontend ports are Users 3033 and Admin 3034. Basic login, dashboard and logout
were checked on both, plus the Admin users list; user manual testing was confirmed.
2FA, recovery and deeper auth/session changes remain out of scope.

## Verified scope and known limits

- The staged graph previously passed frozen script-disabled install, auth (4), HTTP (2),
  types, lint, build and a narrow synthetic Sharp probe. Final types/build and fresh
  production/full audit receipts are in the parent workspace's private
  `.pi/frontend-modernization/logs/*finalize*`. These initial isolated checks are
  separate from the subsequent local integration checks above; neither establishes
  production readiness or full security closure.
- Tailwind 3 / tailwind-merge 2 and Zod 3 / resolvers 3 are deliberately retained.
  Tailwind 4 and Zod 4 migration is deferred. Auth.js 5.0.0-beta.32 is a deliberate
  beta exception. ESLint 9.39.5 / TypeScript 6.0.3 respect current plugin peer constraints;
  this is not an all-libraries-latest claim. Legacy `.eslintrc.json` is unused by flat ESLint.
- `tailwindcss-animate` is used only by `tailwind.config.ts`, so it is classified as
  a development/build dependency at the same version. This is **not a vulnerability fix**.
  The full audit still reports high-severity braces 3.0.3 (GHSA-vfj7-8cjw-p6xm).
  Official registry latest is 3.0.3 and the advisory has no published patched version;
  do not invent a 3.0.4 override. Production audit results are recorded separately.
- The animation plugin peer warning remains. Existing lint warnings (Users 3/Admin 2),
  middleware deprecation and browser-data warnings are not hidden or claimed fixed.

No dependency installation was performed in the original repositories.
