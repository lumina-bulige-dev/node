# Admin API Service

管理向けのDecision APIです。以下を提供します。

- `POST /api/decisions/draft`: `targets/change/reason/rollback` を正規化して未署名manifestを返す
- `POST /api/decisions/approve`: confirm phrase + OTP を検証後、JCS正規化したmanifestをJWS署名して永続化
- `GET /api/decisions/latest?target=&env=`: target/envごとの最新承認済みdecisionを取得
- `POST /api/fleet/report`: フリート適用結果 (`decision_id/applied_at/status`) を保存

## Run

```bash
cd services/admin-api
npm test
npm start
```

環境変数:

- `ADMIN_CONFIRM_PHRASE` (default: `CONFIRM_DEPLOY`)
- `ADMIN_OTP` (default: `000000`)
- `ADMIN_SIGNING_SECRET` (default: `dev-secret`)
- `PORT` (default: `3000`)
