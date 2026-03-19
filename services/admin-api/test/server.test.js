'use strict';

const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const test = require('node:test');
const assert = require('node:assert/strict');
const { createAdminApiServer } = require('../src/server');
const { AdminApiStore } = require('../src/store');

function makeServer() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'admin-api-'));
  const dbPath = path.join(tempDir, 'test.sqlite');
  const store = new AdminApiStore(dbPath);
  const server = createAdminApiServer(store);
  return new Promise((resolve) => {
    server.listen(0, () => {
      const { port } = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}`,
      });
    });
  });
}

test('draft -> approve -> latest -> fleet report flow', async (t) => {
  process.env.ADMIN_CONFIRM_PHRASE = 'CONFIRM_DEPLOY';
  process.env.ADMIN_OTP = '000000';

  const { server, baseUrl } = await makeServer();
  t.after(() => server.close());

  const draftResponse = await fetch(`${baseUrl}/api/decisions/draft`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      targets: [{ target: 'checkout', env: 'Prod' }],
      change: { b: 1, a: { y: 2, x: 1 } },
      reason: '  emergency   fix  ',
      rollback: { enabled: true },
    }),
  });
  assert.equal(draftResponse.status, 200);
  const draftBody = await draftResponse.json();
  assert.equal(draftBody.unsigned_manifest.targets[0].env, 'prod');
  assert.equal(draftBody.unsigned_manifest.reason, 'emergency fix');

  const approveResponse = await fetch(`${baseUrl}/api/decisions/approve`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      manifest: draftBody.unsigned_manifest,
      confirm_phrase: 'CONFIRM_DEPLOY',
      otp: '000000',
      approved_by: 'ops-user',
    }),
  });
  assert.equal(approveResponse.status, 200);
  const approveBody = await approveResponse.json();
  assert.ok(approveBody.signature.includes('.'));

  const latestResponse = await fetch(`${baseUrl}/api/decisions/latest?target=checkout&env=prod`);
  assert.equal(latestResponse.status, 200);
  const latestBody = await latestResponse.json();
  assert.equal(latestBody.decision_id, draftBody.unsigned_manifest.decision_id);

  const reportResponse = await fetch(`${baseUrl}/api/fleet/report`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      decision_id: latestBody.decision_id,
      target: 'checkout',
      env: 'prod',
      applied_at: new Date().toISOString(),
      status: 'applied',
    }),
  });

  assert.equal(reportResponse.status, 201);
});
