// Dedicated disposable PostgreSQL only. Never uses the application's .env DB.
const { spawnSync } = require('node:child_process');
const { randomBytes, randomUUID } = require('node:crypto');
const { resolve } = require('node:path');
const name = `lexi-auth-test-${randomUUID()}`;
const root = resolve(__dirname, '..');
const password = randomBytes(24).toString('hex');
let created = false;
function run(bin, args, env = process.env, capture = false) {
  const result = spawnSync(bin, args, {
    cwd: root,
    env,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
    timeout: 180000,
  });
  if (result.error || result.status !== 0)
    throw new Error(`Test command failed: ${bin} (exit ${result.status})`);
  return result.stdout?.trim();
}
try {
  run(
    'docker',
    [
      'run',
      '-d',
      '--rm',
      '--name',
      name,
      '--label',
      'com.lexi.purpose=phase4-auth-test',
      '-e',
      'POSTGRES_USER=lexi_test',
      '-e',
      'POSTGRES_PASSWORD',
      '-e',
      'POSTGRES_DB=lexi_phase4_auth',
      '-p',
      '127.0.0.1::5432',
      'postgres:17-alpine',
    ],
    { ...process.env, POSTGRES_PASSWORD: password },
    true,
  );
  created = true;
  let ready = false;
  for (let i = 0; i < 45; i++) {
    const probe = spawnSync(
      'docker',
      ['exec', name, 'pg_isready', '-U', 'lexi_test', '-d', 'lexi_phase4_auth'],
      { stdio: 'ignore' },
    );
    if (probe.status === 0) {
      ready = true;
      break;
    }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  }
  if (!ready) throw new Error('Disposable PostgreSQL did not become ready');
  const binding = run('docker', ['port', name, '5432/tcp'], process.env, true);
  if (!/^127\.0\.0\.1:\d+$/.test(binding))
    throw new Error('Unexpected test DB binding');
  const url = `postgresql://lexi_test:${password}@${binding}/lexi_phase4_auth`;
  const env = {
    ...process.env,
    DATABASE_URL: url,
    DIRECT_URL: url,
    LEXI_AUTH_DB_TEST: '1',
  };
  run(
    process.execPath,
    ['node_modules/prisma/build/index.js', 'db', 'push'],
    env,
  );
  run(
    process.execPath,
    [
      '--experimental-vm-modules',
      'node_modules/jest/bin/jest.js',
      '--config',
      'test/jest-auth-db.json',
      '--runInBand',
    ],
    env,
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  // Only the UUID-named container created by this process; no volumes or host files.
  if (created) spawnSync('docker', ['rm', '-f', name], { stdio: 'ignore' });
}
