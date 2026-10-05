const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const zod = require('zod');

const admin = false;
// Explicitly synthetic regression values, never real credentials.
const bearer = 'FAKE-BEARER-REGRESSION-ONLY';
const google = 'FAKE-GOOGLE-REGRESSION-ONLY';
const backend = 'FAKE-BACKEND-REGRESSION-ONLY';

function harness() {
  const logs = [];
  const calls = [];
  const state = { data: {}, error: null };
  const axios = Object.fromEntries(['get', 'post'].map(method => [method, async (...args) => {
    calls.push({ method, args });
    if (state.error) throw state.error;
    return { data: state.data };
  }]));
  let options;
  const nextAuth = config => {
    if (config.callbacks) options = config;
    return { handlers: {}, auth: callback => callback, signIn() {}, signOut() {} };
  };
  const redirect = url => ({ status: 307, location: String(url) });
  const mocks = {
    'next-auth': nextAuth,
    'next-auth/providers/credentials': config => ({ ...config, id: 'credentials' }),
    'next-auth/providers/google': config => ({ ...config, id: 'google' }),
    'next/server': { NextResponse: { redirect } },
    axios,
    zod,
    '@/lib/constants': { AUTH_URL: 'http://invalid.test/' },
    './lib/constants': { AUTH_URL: 'http://invalid.test/' }
  };
  const sources = {
    '@/auth.config': 'auth.config.ts',
    '@/routes': 'routes.ts',
    '@/schemas/zod/auth-zod-schema': 'schemas/zod/auth-zod-schema.ts',
    './types/user-types': 'types/user-types.ts'
  };
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
    }).outputText;
    vm.runInNewContext(code, {
      module, exports: module.exports,
      require(id) {
        if (Object.hasOwn(mocks, id)) return mocks[id];
        if (Object.hasOwn(sources, id)) return load(sources[id]);
        throw new Error(`Unrecognized test import: ${id}`);
      },
      // No ambient environment, network primitives, or unrestricted require.
      process: { env: Object.freeze({ AUTH_GOOGLE_ID: google, AUTH_GOOGLE_SECRET: 'FAKE-CLIENT-SECRET' }) },
      console: Object.fromEntries(['log', 'error', 'warn'].map(level => [level, (...args) => logs.push(args)])),
      URL, Response: { redirect }
    }, { filename: file, timeout: 1000 });
    cache.set(file, module.exports);
    return module.exports;
  }
  const config = load('auth.config.ts').default;
  load('auth.ts');
  return { state, logs, calls, authorize: config.providers[0].authorize,
    signIn: options.callbacks.signIn, middleware: load('middleware.ts').default };
}

function profile(role = 3) {
  return { name: 'Synthetic User', email: 'fake@example.invalid', role, userStatus: 1, isTwoFactorEnabled: false };
}
function request(auth, pathname = '/dashboard', method = 'GET', headers = {}) {
  return { auth, nextUrl: new URL(pathname, 'https://example.invalid'), method,
    headers: { get: key => headers[key] ?? null } };
}
function assertNoSecrets(logs) {
  const output = JSON.stringify(logs);
  for (const secret of [bearer, google, backend]) assert.equal(output.includes(secret), false);
}

test('protected routes require a session user; preserve login and bypass routes', async () => {
  const h = harness();
  for (const auth of [null, {}, { error: 'synthetic failure' }]) {
    const result = await h.middleware(request(auth));
    assert.equal(result.status, 307);
    assert.equal(new URL(result.location).pathname, '/auth/login');
  }
  assert.equal(await h.middleware(request({ user: { name: 'Synthetic' } })), null);
  const login = await h.middleware(request({ user: {} }, '/auth/login/'));
  assert.equal(new URL(login.location).pathname, '/dashboard');
  for (const route of ['/', '/api/auth/session', '/auth/login']) {
    assert.equal(await h.middleware(request(null, route)), null);
  }
  assert.equal(await h.middleware(request(null, '/dashboard', 'POST', { 'next-action': 'synthetic' })), null);
});

test('credentials validate before HTTP and preserve backend mapping and role policy', async () => {
  const h = harness();
  for (const token of [undefined, '', 'short', 123]) assert.equal(await h.authorize({ token }), null);
  assert.equal(h.calls.length, 0);
  h.state.data = profile();
  const user = await h.authorize({ token: bearer });
  assert.deepEqual(JSON.parse(JSON.stringify(user)), { ...profile(), accessToken: bearer, isOAuth: false });
  assert.equal(h.calls[0].args[1].headers.Authorization, `Bearer ${bearer}`);
  h.state.data = profile(0);
  const nonAdmin = await h.authorize({ token: bearer });
  if (admin) assert.equal(nonAdmin, null);
  else assert.equal(nonAdmin.role, 0);
});

test('Google preserves nested Users or flat Admin mapping and role policy', async () => {
  const h = harness();
  for (const role of [3, 0]) {
    const data = { ...profile(role), token: backend };
    h.state.data = admin ? data : { ...data, user: { ...profile(role), username: data.name } };
    const user = {};
    const allowed = await h.signIn({ user, account: { provider: 'google', id_token: google } });
    assert.equal(allowed, !admin || role === 3);
    if (allowed) {
      assert.equal(user.accessToken, backend);
      assert.equal(user.name, data.name);
      assert.equal(user.email, data.email);
      assert.equal(user.role, role);
      assert.equal(user.userStatus, 1);
      assert.equal(user.isTwoFactorEnabled, false);
      if (!admin) assert.equal(user.isOAuth, true);
    }
  }
  assert.equal(h.calls[0].args[1].googleTokenId, google);
  assert.equal(await h.signIn({ user: {}, account: { provider: 'credentials' } }), true);
  assertNoSecrets(h.logs);
});

test('Axios failures fail closed without logging synthetic bearer or Google secrets', async () => {
  const h = harness();
  h.state.error = { message: bearer, config: { headers: { Authorization: bearer }, data: google }, response: { data: backend } };
  assert.equal(await h.authorize({ token: bearer }), null);
  assert.equal(await h.signIn({ user: {}, account: { provider: 'google', id_token: google } }), false);
  assert.ok(h.logs.some(args => args[0] === 'Signing server error'));
  assertNoSecrets(h.logs);
});
