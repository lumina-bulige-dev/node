'use strict';

const { createHmac, timingSafeEqual } = require('node:crypto');
const http = require('node:http');
const { URL } = require('node:url');
const { canonicalize } = require('./jcs');
const { createDraft } = require('./manifest');
const { AdminApiStore } = require('./store');


function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

function reply(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

function signManifestJws(manifest, signingSecret = process.env.ADMIN_SIGNING_SECRET || 'dev-secret') {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(canonicalize(manifest));
  const signingInput = `${header}.${payload}`;
  const signature = createHmac('sha256', signingSecret)
    .update(signingInput)
    .digest('base64url');

  return `${signingInput}.${signature}`;
}

function secureEqual(left, right) {
  const leftBuf = Buffer.from(String(left));
  const rightBuf = Buffer.from(String(right));
  if (leftBuf.length !== rightBuf.length) return false;
  return timingSafeEqual(leftBuf, rightBuf);
}

function createAdminApiServer(store = new AdminApiStore()) {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');

      if (req.method === 'POST' && url.pathname === '/api/decisions/draft') {
        const body = await readJson(req);
        const manifest = createDraft(body);
        return reply(res, 200, {
          unsigned_manifest: manifest,
        });
      }

      if (req.method === 'POST' && url.pathname === '/api/decisions/approve') {
        const body = await readJson(req);
        const { manifest, confirm_phrase: confirmPhrase, otp, approved_by: approvedBy = 'human-approver' } = body;

        if (!manifest || typeof manifest !== 'object') {
          return reply(res, 400, { error: 'manifest is required' });
        }

        const confirmPhraseSecret = process.env.ADMIN_CONFIRM_PHRASE || 'CONFIRM_DEPLOY';
        const otpSecret = process.env.ADMIN_OTP || '000000';

        if (!secureEqual(confirmPhrase, confirmPhraseSecret) || !secureEqual(otp, otpSecret)) {
          return reply(res, 403, { error: 'approval challenge failed' });
        }

        const approvedAt = new Date().toISOString();
        const jws = signManifestJws(manifest);

        store.saveDecision({
          manifest,
          signature: jws,
          approvedBy,
          approvedAt,
        });

        return reply(res, 200, {
          decision_id: manifest.decision_id,
          approved_at: approvedAt,
          signature: jws,
        });
      }

      if (req.method === 'GET' && url.pathname === '/api/decisions/latest') {
        const target = (url.searchParams.get('target') || '').trim();
        const env = (url.searchParams.get('env') || '').trim().toLowerCase();

        if (!target || !env) {
          return reply(res, 400, { error: 'target and env query params are required' });
        }

        const latest = store.getLatestDecision(target, env);
        if (!latest) {
          return reply(res, 404, { error: 'no decision found' });
        }

        return reply(res, 200, {
          decision_id: latest.decision_id,
          target: latest.target,
          env: latest.env,
          approved_by: latest.approved_by,
          approved_at: latest.approved_at,
          manifest: latest.manifest,
          signature: latest.signature,
        });
      }

      if (req.method === 'POST' && url.pathname === '/api/fleet/report') {
        const body = await readJson(req);
        const decisionId = String(body.decision_id || '').trim();
        const target = String(body.target || '').trim();
        const env = String(body.env || '').trim().toLowerCase();
        const appliedAt = String(body.applied_at || '').trim();
        const status = String(body.status || '').trim().toLowerCase();

        if (!decisionId || !target || !env || !appliedAt || !status) {
          return reply(res, 400, { error: 'decision_id/target/env/applied_at/status are required' });
        }

        store.saveFleetReport({
          decisionId,
          target,
          env,
          appliedAt,
          status,
        });

        return reply(res, 201, { ok: true });
      }

      return reply(res, 404, { error: 'not found' });
    } catch (error) {
      return reply(res, 400, { error: error.message });
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  createAdminApiServer().listen(port, () => {
    process.stdout.write(`admin-api listening on :${port}\n`);
  });
}

module.exports = {
  createAdminApiServer,
  signManifestJws,
};
