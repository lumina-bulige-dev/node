# Fleet監査 判定ロジック仕様（UI整合版）

このドキュメントは Fleet 監査の判定ロジックを固定化し、Control Panel 表示と API 返却値を一致させるための共通仕様です。

## 1. 用語（共通言語）

- `target`: 監査対象の論理識別子（例: `payments-api`）。
- `env`: 実行環境（例: `prod`, `stg`）。
- `decision_id`: Control Plane が配布した意思決定ID。
- `expected_decision_id`: 当該 `target/env` に対して「現在適用されるべき」 `decision_id`。
- `service_instance_id`: レポート送信元インスタンス識別子。
- `applied_at`: インスタンスが `decision_id` を適用完了した時刻（RFC3339, UTC）。
- `reported_at`: `/api/fleet/report` を受信したサーバ時刻（RFC3339, UTC）。
- `verification_result`: 適用後検証結果。`PASS` / `FAIL`。
- `max_apply_delay_sec`: 決定配布 (`decision_created_at`) から `applied_at` までの許容遅延秒。
- `max_report_gap_sec`: 最終 `reported_at` から現在時刻までの許容ギャップ秒。
- `drift`: `expected_decision_id` と実適用 `decision_id` の不一致状態。

## 2. `target/env` 単位のしきい値設定

`target/env` ごとに次のしきい値を持つ。

```json
{
  "target": "payments-api",
  "env": "prod",
  "max_apply_delay_sec": 120,
  "max_report_gap_sec": 90
}
```

### 設定解決順

1. `target + env` 完全一致
2. `target + *`
3. `* + env`
4. グローバルデフォルト

## 3. `POST /api/fleet/report` 入力仕様（必須項目）

以下を必須化する。

```json
{
  "target": "payments-api",
  "env": "prod",
  "service_instance_id": "payments-api-7f7c9c8f7f-8x3kw",
  "decision_id": "dec_2025_03_11_001",
  "applied_at": "2025-03-11T10:15:00Z",
  "verification_result": "PASS"
}
```

### バリデーション

- `service_instance_id`: 1..128 文字、空白のみ不可
- `decision_id`: 1..128 文字、空白のみ不可
- `applied_at`: RFC3339 UTC で現在時刻より未来不可
- `verification_result`: `PASS` または `FAIL`

バリデーション失敗時は `400 Bad Request`。

## 4. 固定 `status` 算出式

`status` は以下の優先順位で決定する（上ほど優先）。

1. `ERROR`
   - `verification_result == FAIL`
   - または不正時刻（`applied_at > reported_at`）
2. `STALE`
   - `now - reported_at > max_report_gap_sec`
3. `LAGGING`
   - `decision_id != expected_decision_id`
   - または `applied_at - decision_created_at > max_apply_delay_sec`
4. `OK`
   - 上記すべてに該当しない

### 擬似コード

```text
if verification_result == FAIL or applied_at > reported_at:
  status = ERROR
else if (now - reported_at) > max_report_gap_sec:
  status = STALE
else if decision_id != expected_decision_id or
        (applied_at - decision_created_at) > max_apply_delay_sec:
  status = LAGGING
else:
  status = OK
```

## 5. 最新スナップショット API

ページング履歴 API とは別に、最新状態のみを返す API を定義する。

- `GET /api/fleet/status/latest?target=<target>&env=<env>`
- レスポンスは `target/env/service_instance_id` ごとに最新1件。

```json
{
  "items": [
    {
      "target": "payments-api",
      "env": "prod",
      "service_instance_id": "payments-api-7f7c9c8f7f-8x3kw",
      "expected_decision_id": "dec_2025_03_11_002",
      "decision_id": "dec_2025_03_11_001",
      "drift": true,
      "status": "LAGGING",
      "applied_at": "2025-03-11T10:15:00Z",
      "reported_at": "2025-03-11T10:15:03Z",
      "verification_result": "PASS"
    }
  ],
  "generated_at": "2025-03-11T10:16:00Z"
}
```

## 6. Control Panel テーブル表示仕様

Control Panel の行表示は `/api/fleet/status/latest` の値をそのまま表示する。

追加列:

- `expected_decision_id`: バックエンド算出値を表示
- `drift`: `decision_id != expected_decision_id`
  - `true`: 未反映差分あり（警告表示）
  - `false`: 差分なし

### UI と判定値の整合ルール

- UI 側で `status` 再計算をしない（API 値を信頼して表示のみ）。
- 色分けは `status` にのみ依存。
- `drift=true` かつ `status=OK` は許可しない（バックエンド式で `LAGGING` になるため）。

## 7. 互換性と移行

- 必須化前のクライアントには暫定で `422` とエラーメッセージを返し、欠落フィールドを明示する。
- 移行期間終了後は完全に `400` へ統一。
- 監査ログには、算出時に使ったしきい値 (`max_apply_delay_sec`, `max_report_gap_sec`) を記録し、後追い検証可能にする。
