// Component probes against existing source, with synthetic requests only.
// Does NOT validate JWT signatures, run HTTP, connect to a DB, or prove G3.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '../..');
const req = createRequire(path.join(root, 'backend/package.json'));
req('ts-node').register({
  project: path.join(root, 'backend/tsconfig.json'),
  transpileOnly: true,
  compilerOptions: { module: 'CommonJS', moduleResolution: 'Node', resolvePackageJsonExports: false, resolvePackageJsonImports: false },
});
req('reflect-metadata');
const { CsrfGuard } = req('./src/auth/guards/csrf.guard.ts');
const { JwtStrategy } = req('./src/auth/strategies/jwt.strategy.ts');
const { ConfigService } = req('@nestjs/config');
const { AllExceptionsFilter } = req('./src/common/filters/all-exceptions.filter.ts');
const { Logger, UnauthorizedException, ForbiddenException } = req('@nestjs/common');
const { ThrottlerException } = req('@nestjs/throttler');
Logger.overrideLogger(false);
const strategy = new JwtStrategy(new ConfigService({ JWT_SECRET: 'synthetic-component-probe-only' }));
const cases = [
  { name: 'cookie_with_csrf', method: 'POST', cookies: { access_token: 'cookie-value', csrf_token: 'synthetic-csrf' }, headers: { 'x-csrf-token': 'synthetic-csrf' }, expectedSource: 'cookie', expectedCsrf: 'allow' },
  { name: 'cookie_without_csrf', method: 'POST', cookies: { access_token: 'cookie-value' }, headers: {}, expectedSource: 'cookie', expectedCsrf: 403 },
  { name: 'cookie_plus_bearer_without_csrf', method: 'POST', cookies: { access_token: 'cookie-value' }, headers: { authorization: 'Bearer bearer-value' }, expectedSource: 'cookie', expectedCsrf: 403 },
  { name: 'bearer_only_without_csrf', method: 'POST', cookies: {}, headers: { authorization: 'Bearer bearer-value' }, expectedSource: 'bearer', expectedCsrf: 403 },
  { name: 'bearer_get', method: 'GET', cookies: {}, headers: { authorization: 'Bearer bearer-value' }, expectedSource: 'bearer', expectedCsrf: 'allow' },
  { name: 'public_post', method: 'POST', cookies: {}, headers: {}, public: true, expectedSource: 'none', expectedCsrf: 'allow' },
];
const results = cases.map(test => {
  const guard = new CsrfGuard({ getAllAndOverride: () => Boolean(test.public) });
  const ctx = { switchToHttp: () => ({ getRequest: () => test }), getHandler: () => function handler() {}, getClass: () => class Controller {} };
  const extracted = strategy._jwtFromRequest(test);
  const source = extracted === 'cookie-value' ? 'cookie' : extracted === 'bearer-value' ? 'bearer' : 'none';
  let csrf;
  try { csrf = guard.canActivate(ctx) ? 'allow' : 'deny'; } catch (error) { csrf = error.getStatus(); }
  assert.equal(source, test.expectedSource, test.name);
  assert.equal(csrf, test.expectedCsrf, test.name);
  return { name: test.name, selectedCredentialSource: source, csrfComponentResult: csrf };
});
const fixtureFile = path.join(root, 'iOS/docs/contracts/fixtures/baseline.json');
const fixtures = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'));
const errors = {
  auth_401: new UnauthorizedException(),
  csrf_403: new ForbiddenException('Invalid or missing CSRF token'),
  rate_limit_429: new ThrottlerException(),
  server_500: new Error('synthetic failure'),
};
for (const fixture of fixtures.cases) {
  const error = errors[fixture.name];
  if (!error) continue;
  const response = { status(code) { assert.equal(code, fixture.status); return this; }, json(body) { fixture.body = { ...body, timestamp: '2026-10-17T00:00:00.000Z' }; } };
  new AllExceptionsFilter().catch(error, { switchToHttp: () => ({ getResponse: () => response, getRequest: () => ({ method: fixture.method, url: fixture.path }) }) });
  fixture.provenance = 'Actual exception filter component with synthetic exception; timestamp normalized. NOT HTTP capture.';
}
fs.writeFileSync(fixtureFile, JSON.stringify(fixtures, null, 2) + '\n');
const evidence = {
  scope: 'Synthetic component probes only. JWT extraction + CSRF separately; no signature validation, HTTP, database, device or native auth.',
  cases: results,
  generatedErrorFixtures: Object.keys(errors),
};
fs.mkdirSync(path.join(root, 'iOS/docs/evidence'), { recursive: true });
fs.writeFileSync(path.join(root, 'iOS/docs/evidence/auth-baseline.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(`Verified ${results.length} existing auth component scenarios; rendered ${Object.keys(errors).length} synthetic errors through the actual exception filter.`);
