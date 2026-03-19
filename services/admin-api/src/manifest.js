'use strict';

const { randomUUID } = require('node:crypto');

function normalizeString(value) {
  return String(value ?? '').trim();
}

function normalizeReason(reason) {
  return normalizeString(reason).replace(/\s+/g, ' ');
}

function normalizeObject(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeObject(item));
  }

  const result = {};
  for (const key of Object.keys(value).sort()) {
    result[key] = normalizeObject(value[key]);
  }
  return result;
}

function normalizeTargets(targets) {
  if (!Array.isArray(targets) || targets.length === 0) {
    throw new Error('targets must be a non-empty array');
  }

  return targets.map((target) => {
    const normalizedTarget = normalizeString(target.target);
    const normalizedEnv = normalizeString(target.env).toLowerCase();
    if (!normalizedTarget || !normalizedEnv) {
      throw new Error('each target requires non-empty target/env');
    }

    return {
      target: normalizedTarget,
      env: normalizedEnv,
    };
  });
}

function createDraft(input) {
  const manifest = {
    decision_id: randomUUID(),
    version: 1,
    drafted_at: new Date().toISOString(),
    targets: normalizeTargets(input.targets),
    change: normalizeObject(input.change ?? {}),
    reason: normalizeReason(input.reason),
    rollback: normalizeObject(input.rollback ?? {}),
  };

  if (!manifest.reason) {
    throw new Error('reason must not be empty');
  }

  return manifest;
}

module.exports = {
  createDraft,
  normalizeObject,
};
