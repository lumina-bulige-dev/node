# JWT `kid` + JWKS 運用仕様（Admin / Receiver / Control Panel）

<!--introduced_in=v0.10.0-->

## 目的

JWT 署名鍵のローテーションを安全に実行するため、Admin 側・Receiver 側・Control Panel 側で共通の運用言語を定義します。

* Admin は `kid` 付きで JWT を署名し、公開鍵を `/.well-known/jwks.json` で配布する。
* Receiver は `kid` で鍵を選択し、JWKS キャッシュ TTL と失効時の再取得戦略を実装する。
* 鍵運用ポリシー（有効期限、重複運用期間、緊急失効フロー）を明文化する。
* Control Panel に現在アクティブな `kid` と次期鍵の切替予定を表示する。

## 共通用語（共通言語化）

* **Active Key**: 新規発行トークンに使う秘密鍵。
* **Next Key**: 次回切替対象。JWKS には事前公開する。
* **Grace Period**: Active 切替後も旧鍵検証を許容する重複運用期間。
* **Hard Revoke**: 重大インシデント時に旧鍵を即時失効する運用。
* **JWKS TTL**: Receiver が JWKS をキャッシュする最大秒数。

## Admin 側仕様

### JWT 署名

* JWT Header に `kid` を必須付与する。
* `alg` は固定（例: `RS256` または `ES256`）し、Receiver で許可リスト検証する。
* `kid` は一意で追跡可能な形式（例: `2026-03-k01`）を採用する。

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "2026-03-k01"
}
```

### JWKS 配布

* エンドポイント: `GET /.well-known/jwks.json`
* レスポンス形式: RFC 7517 の `{"keys": [...]}`
* 現行 Active と Next の公開鍵を同時掲載する。
* `Cache-Control: max-age=<ttl>, must-revalidate` を付与する。
* 監査性のため `ETag` か `Last-Modified` を返す。

```json
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256",
      "kid": "2026-03-k01",
      "n": "...",
      "e": "AQAB"
    },
    {
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256",
      "kid": "2026-04-k01",
      "n": "...",
      "e": "AQAB"
    }
  ]
}
```

## Receiver 側仕様

### 検証フロー

1. JWT Header から `kid` / `alg` を取得。
2. `alg` が許可リスト外なら即失敗。
3. ローカル JWKS キャッシュから `kid` 一致キーを検索。
4. 見つかれば署名検証。
5. 見つからない場合のみ JWKS を再取得して再検索。
6. 再取得後も見つからなければ `unknown_kid` として失敗。

### キャッシュ TTL

* 標準 TTL: 300 秒（5 分）
* 失敗時の最小再取得間隔（スロットリング）: 30 秒
* `ETag` / `If-None-Match` を使用して差分更新する。

### 失効時の再取得戦略

* **Soft miss**: `kid` 不一致時に 1 回だけ強制再取得して再検証。
* **Hard revoke 通知時**: キャッシュ即時破棄し、次リクエストで強制再取得。
* **JWKS 取得失敗時**:
  * キャッシュが有効なら既存キャッシュで継続。
  * キャッシュ期限切れかつ取得不能なら認証失敗（fail-closed）。

## 鍵運用ポリシー

### 有効期限

* 鍵寿命（推奨）: 90 日
* Active 運用期間: 60 日
* Next 事前公開期間: 7 日以上

### 重複運用期間

* 切替後の旧鍵検証許容期間（Grace Period）: 14 日
* 期間終了後は JWKS から旧鍵を削除し検証不可にする。

### 緊急失効フロー

1. 失効対象 `kid` をインシデント管理システムに登録。
2. Admin は当該鍵での署名を停止。
3. JWKS から失効鍵を除外して即時デプロイ。
4. Receiver にキャッシュ破棄イベントを配信（Webhook / PubSub）。
5. 失効後の検証失敗ログを監視し、影響範囲を評価。

## Control Panel 表示要件

Control Panel は次の情報を表示する。

* 現在アクティブな `kid`
* 次期鍵 `kid`
* 次回切替予定日時（UTC）
* Grace Period 終了日時
* 最終 JWKS 更新時刻
* 緊急失効中フラグ

### 表示 API 例

`GET /api/key-management/status`

```json
{
  "activeKid": "2026-03-k01",
  "nextKid": "2026-04-k01",
  "nextSwitchAt": "2026-04-01T00:00:00Z",
  "gracePeriodEndsAt": "2026-04-15T00:00:00Z",
  "jwksLastUpdatedAt": "2026-03-17T06:00:00Z",
  "emergencyRevocation": false
}
```

## 運用チェックリスト

* [ ] 署名時に `kid` が常に付与される。
* [ ] `/.well-known/jwks.json` に Active と Next が掲載される。
* [ ] Receiver は `kid` miss 時に 1 回のみ再取得する。
* [ ] TTL・再取得間隔・fail-closed 動作が監視対象になっている。
* [ ] Control Panel で Active/Next/切替予定が確認できる。
* [ ] 緊急失効手順を四半期ごとに演習する。
