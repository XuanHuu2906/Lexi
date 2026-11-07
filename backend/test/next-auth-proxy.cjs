// Test-only host for the real frontend rewrite configuration. Isolated cache,
// loopback listener, no browser and no production service dependencies.
const { createServer } = require('node:http');
const { resolve } = require('node:path');
const { createRequire } = require('node:module');
const { randomUUID } = require('node:crypto');
const { mkdirSync, writeFileSync } = require('node:fs');
const frontend = resolve(__dirname, '../../frontend');
const requireFrontend = createRequire(resolve(frontend, 'package.json'));
const next = requireFrontend('next');
const loadConfig = requireFrontend('next/dist/server/config').default;
const { PHASE_DEVELOPMENT_SERVER } = requireFrontend('next/constants');

async function main() {
  if (
    process.env.LEXI_AUTH_DB_TEST !== '1' ||
    !/^http:\/\/127\.0\.0\.1:\d+$/.test(process.env.BACKEND_URL ?? '')
  ) {
    throw new Error('Test-only loopback backend required');
  }
  // Read frontend/next.config.ts, including its actual /api/* rewrites.
  const config = await loadConfig(PHASE_DEVELOPMENT_SERVER, frontend);
  // Next's custom dev server reloads config and ignores conf.distDir in
  // prepare(). Give it a separate project, using the real evaluated rewrites.
  const fixture = resolve(frontend, '.next', `auth-test-${randomUUID()}`);
  mkdirSync(resolve(fixture, 'pages'), { recursive: true });
  writeFileSync(
    resolve(fixture, 'pages/index.js'),
    'export default function Page() { return null; }\n',
  );
  const rewrites = await config.rewrites();
  writeFileSync(
    resolve(fixture, 'next.config.js'),
    `module.exports = { rewrites: async () => (${JSON.stringify(rewrites)}) };\n`,
  );
  const app = next({
    dev: true,
    // Release checkouts may share dependencies through a Windows junction.
    // Webpack supports that layout; Turbopack rejects targets outside its root.
    webpack: true,
    dir: fixture,
    quiet: true,
  });
  await app.prepare();
  const handler = app.getRequestHandler();
  const server = createServer((req, res) => handler(req, res));
  server.listen(0, '127.0.0.1', () =>
    process.send?.({ port: server.address().port }),
  );
  process.on('message', async (message) => {
    if (message !== 'close') return;
    server.closeAllConnections();
    server.close();
    await app.close();
    process.exit(0);
  });
  process.on('disconnect', () => process.exit(0));
}
main().catch((error) => {
  const detail = String(error.message).replace(
    /postgres(?:ql)?:\/\/\S+/gi,
    '[redacted database URL]',
  );
  process.send?.({ error: `Next test proxy startup failed: ${detail}` });
  process.exit(1);
});
