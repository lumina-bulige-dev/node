# Cloudflare 8ルート配備計画（lumi-core-api）

## 1. 対象ルート
以下の8系統を有効化対象として管理する。

1. `app.luminabulige.com/api/*`
2. `api.luminabulige.com/Javis/*`
3. `api.luminabulige.com/v0/*`
4. `api.luminabulige.com/v1/*`
5. `api.luminabulige.com/v2/*`
6. `api.luminabulige.com/v3/*`
7. `api.luminabulige.com/v4/*`
8. `api.luminabulige.com/*`

> `api.luminabulige.com`（ワイルドカードなし）は、必要時にHTTPリダイレクトまたはヘルス専用Workerで扱う。

---

## 2. Wrangler設定テンプレート

`wrangler.toml` 例:

```toml
name = "lumi-core-api"
main = "src/worker.ts"
compatibility_date = "2026-03-13"

routes = [
  { pattern = "app.luminabulige.com/api/*", zone_name = "luminabulige.com" },
  { pattern = "api.luminabulige.com/Javis/*", zone_name = "luminabulige.com" },
  { pattern = "api.luminabulige.com/v0/*", zone_name = "luminabulige.com" },
  { pattern = "api.luminabulige.com/v1/*", zone_name = "luminabulige.com" },
  { pattern = "api.luminabulige.com/v2/*", zone_name = "luminabulige.com" },
  { pattern = "api.luminabulige.com/v3/*", zone_name = "luminabulige.com" },
  { pattern = "api.luminabulige.com/v4/*", zone_name = "luminabulige.com" },
  { pattern = "api.luminabulige.com/*", zone_name = "luminabulige.com" }
]
```

---

## 3. DNS前提条件

- `app.luminabulige.com` を proxied（オレンジ雲）で作成
- `api.luminabulige.com` を proxied（オレンジ雲）で作成
- 既存A/CNAME競合がある場合、旧レコードを整理

---

## 4. デプロイ手順

```bash
npm i -D wrangler
npx wrangler login
npx wrangler deploy
npx wrangler deployments list
npx wrangler routes list
```

---

## 5. 失敗時チェックリスト

1. Zone不一致（`zone_name` typo）
2. DNSが灰色雲（DNS only）
3. 同一パターンを別Workerが先に掴んでいる
4. GitHub連携ビルド失敗（Node version / lockfile）
5. ルート数超過や契約制限

---

## 6. バイパス戦略（先導役）

- Primary: Cloudflare Worker
- Secondary: Google Cloud Run
- Tertiary: AWS Lambda + API Gateway

AION Routerは障害時に優先順位に沿って自動切替し、`/health` 成否で経路決定する。


## 7. app.luminabulige.com と VCPサイト連結ルート

### 7.1 推奨API設計
- `app.luminabulige.com/api/v1/orchestrate` : ユーザー要求受付
- `api.luminabulige.com/v1/router/*` : AIONタスク分配
- `api.luminabulige.com/v1/arz/*` : ARZ比較・選抜
- `api.luminabulige.com/v1/vcp/connect` : VCP連携開始
- `api.luminabulige.com/v1/vcp/sync` : データ同期
- `api.luminabulige.com/v1/vcp/events` : イベント通知

### 7.2 デプロイ可視化（8ルート確認）
Cloudflare側でデプロイ完了を可視化する際、以下の状態を必須確認とする。
1. Route `active` 状態
2. DNS `proxied=true`
3. Worker紐付け先が `lumi-core-api`
4. `/health` が 200 応答

### 7.3 将来クラウド展開（Cloudflare / GCP / AWS）
- Cloudflare: 低遅延のエッジ実行を優先
- GCP: VCP統合・分析ワークロードを優先
- AWS: 企業向けAPIゲートウェイ連携を優先

AIONは同一共通契約（task schema）を前提に経路切替し、クラウド差分を吸収する。
