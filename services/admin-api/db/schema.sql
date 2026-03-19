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
