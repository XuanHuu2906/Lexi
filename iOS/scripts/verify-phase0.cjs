// Static artifact verification; not an application or security test suite.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const docs = path.join(root, 'iOS/docs');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
let links = 0;
for (const file of [...walk(docs).filter(f => f.endsWith('.md')), path.join(root, 'iOS/README.md')]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const [, target] of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    if (/^(https?:|#)/.test(target)) continue;
    const local = target.split('#')[0];
    assert.ok(fs.existsSync(path.resolve(path.dirname(file), local)), `Broken link: ${file} -> ${target}`);
    links++;
  }
}
const fixtures = JSON.parse(fs.readFileSync(path.join(docs, 'contracts/fixtures/baseline.json'), 'utf8'));
const names = new Set();
for (const item of fixtures.cases) {
  assert.ok(!names.has(item.name), `Duplicate fixture ${item.name}`);
  names.add(item.name);
  assert.equal(typeof item.source, 'string');
  assert.equal(typeof item.body.success, 'boolean');
  if (item.body.success) assert.ok(Object.hasOwn(item.body, 'data'));
  else {
    assert.equal(item.body.statusCode, item.status);
    assert.equal(item.body.path, item.path);
    assert.ok(typeof item.body.message === 'string' || Array.isArray(item.body.message));
  }
}
const inProgress = fixtures.cases.find(f => f.name === 'quiz_in_progress').body.data;
assert.equal(inProgress.total, inProgress.questions.length);
assert.ok(inProgress.questions.every(q => !Object.hasOwn(q, 'answerIndex') && !Object.hasOwn(q, 'explanation')));
const master = fs.readFileSync(path.join(docs, 'LEXI_IOS_MASTER_IMPLEMENTATION_PLAN.md'), 'utf8');
assert.equal([...master.matchAll(/^- \[x\] \*\*IOS-00\d\d\*\*/gm)].length, 22);
const inventory = fs.readFileSync(path.join(docs, 'contracts/endpoint-inventory.md'), 'utf8');
const routeCount = [...inventory.matchAll(/^\| (GET|POST|PATCH|PUT|DELETE) \|/gm)].length;
assert.equal(routeCount, 77);
const probe = JSON.parse(fs.readFileSync(path.join(docs, 'evidence/auth-baseline.json'), 'utf8'));
assert.equal(probe.cases.length, 6);
const resultFile = path.join(docs, 'backend-unit-results.local.json');
if (fs.existsSync(resultFile)) {
  const result = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
  const summary = {
    command: 'rtk npm test -- --runInBand --json --outputFile=../iOS/docs/backend-unit-results.local.json',
    sourceCommit: '87760f17f0e40ae87447bf6cda9e2609ae0642a5',
    passedSuites: result.numPassedTestSuites, failedSuites: result.numFailedTestSuites,
    passedTests: result.numPassedTests, failedTests: result.numFailedTests,
    failures: result.testResults.flatMap(suite => suite.assertionResults.filter(t => t.status === 'failed').map(t => ({ file: path.relative(root, suite.name).replaceAll('\\', '/'), test: t.fullName }))),
  };
  fs.writeFileSync(path.join(docs, 'evidence/backend-unit-summary.json'), JSON.stringify(summary, null, 2) + '\n');
}
console.log(`Verified ${links} local links, ${fixtures.cases.length} fixture envelopes, ${routeCount} routes, 22 Phase 0 completed checkboxes and 6 auth component observations.`);
