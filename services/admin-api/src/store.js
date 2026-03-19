'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

class AdminApiStore {
  constructor(dbPath = path.join(process.cwd(), 'services/admin-api/data/admin-api.sqlite')) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    this.db = new DatabaseSync(dbPath);
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.initialize();
  }

  initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS decision_store (
        decision_id TEXT NOT NULL,
        target TEXT NOT NULL,
        env TEXT NOT NULL,
        reason TEXT NOT NULL,
        change_json TEXT NOT NULL,
        rollback_json TEXT NOT NULL,
        manifest_json TEXT NOT NULL,
        signature TEXT NOT NULL,
        approved_by TEXT NOT NULL,
        approved_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (decision_id, target, env)
      );

      CREATE INDEX IF NOT EXISTS idx_decision_store_target_env_latest
      ON decision_store (target, env, approved_at DESC);

      CREATE INDEX IF NOT EXISTS idx_decision_store_decision_id
      ON decision_store (decision_id);

      CREATE TABLE IF NOT EXISTS fleet_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        decision_id TEXT NOT NULL,
        target TEXT NOT NULL,
        env TEXT NOT NULL,
        applied_at TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_fleet_reports_decision_id
      ON fleet_reports (decision_id);

      CREATE INDEX IF NOT EXISTS idx_fleet_reports_target_env_applied
      ON fleet_reports (target, env, applied_at DESC);
    `);
  }

  saveDecision({ manifest, signature, approvedBy, approvedAt }) {
    const insert = this.db.prepare(`
      INSERT INTO decision_store (
        decision_id, target, env, reason, change_json, rollback_json,
        manifest_json, signature, approved_by, approved_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.db.exec('BEGIN');
    try {
      for (const target of manifest.targets) {
        insert.run(
          manifest.decision_id,
          target.target,
          target.env,
          manifest.reason,
          JSON.stringify(manifest.change),
          JSON.stringify(manifest.rollback),
          JSON.stringify(manifest),
          signature,
          approvedBy,
          approvedAt,
        );
      }
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  getLatestDecision(target, env) {
    const stmt = this.db.prepare(`
      SELECT decision_id, target, env, manifest_json, signature, approved_by, approved_at
      FROM decision_store
      WHERE target = ? AND env = ?
      ORDER BY approved_at DESC
      LIMIT 1
    `);

    const row = stmt.get(target, env);
    if (!row) return null;

    return {
      ...row,
      manifest: JSON.parse(row.manifest_json),
    };
  }

  saveFleetReport({ decisionId, target, env, appliedAt, status }) {
    const stmt = this.db.prepare(`
      INSERT INTO fleet_reports (
        decision_id, target, env, applied_at, status
      ) VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(decisionId, target, env, appliedAt, status);
  }
}

module.exports = {
  AdminApiStore,
};
