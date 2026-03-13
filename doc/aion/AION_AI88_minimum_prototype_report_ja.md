# AION × AI88 最小プロトタイプ レポート（開発・デモ用）

## 1. プロジェクト概要

### 目的
- AI群（AI88モデル）を **AION OS** でオーケストレーションし、統合AI OSとして運用する。
- 教育・生成コンテンツ・マルチモーダル用途へ短期展開できる実装基盤をつくる。
- 128k+ tokensの長大コンテキストに対応し、書籍・規約・議事録などの大規模データを扱える構成にする。

### 目標
1. 最小プロトタイプ構築
2. API接続とルーティングの成立確認
3. 「ユーザー入力 → 複数AI処理 → 統合出力」までのデモ実施

### 成果物
1. AION OS設計図
2. モデル選定表（Text / Image / Voice / Translation）
3. タスクルーティングフロー
4. Memory / Context管理設計
5. 外部API統合設計

---

## 2. システム構成

```text
                   ┌─────────────┐
                   │   User UI    │  ← Web / App / Chat
                   └─────┬───────┘
                         │ ユーザー入力
               ┌─────────┴─────────┐
               │      AION OS       │ ← 司令塔AI / タスク管理
               │  (Router + Memory) │
               └─────────┬─────────┘
                         │ タスク分配
         ┌───────────────┼───────────────┐
         │               │               │
      Text AI         Image AI        Voice AI
   (LLM & Embeds)   (Generation)   (TTS / STT)
         │               │               │
 ┌───────┴───────┐ ┌─────┴─────┐ ┌───────┴───────┐
 │ Summarize     │ │ Text→Image │ │ Speech→Text  │
 │ QA / Reason   │ │ Inpainting │ │ Text→Speech  │
 │ Translation   │ │ Styling    │ │ Context-aware│
 └───────────────┘ └─────────────┘ └───────────────┘
         │
   DB / Memory / Vector DB ← 長大コンテキスト128k対応
         │
   External APIs / Tools
```

---

## 3. 最小構成モデルリスト（プロトタイプ）

### 3.1 Text AI
| モデル | 役割 |
|---|---|
| glm-4.7-flash | 高速マルチ言語テキスト生成 |
| gpt-oss-120b | 高精度推論・QA・要約 |
| llama-4-scout-17b | マルチモーダル推論 |
| plamo-embedding-1b | 文書検索・類似度計算 |
| qwen3-embedding-0.6b | ベクトル検索・ランキング |

### 3.2 Image AI
| モデル | 役割 |
|---|---|
| flux-2-klein-9b | 高品質画像生成・編集 |
| lucid-origin | デザイン画像生成 |
| phoenix-1.0 | プロンプト忠実生成 |

### 3.3 Voice AI
| モデル | 役割 |
|---|---|
| aura-2-en / aura-2-es | 文脈考慮TTS |
| flux / nova-3 | STT / 音声認識 |

### 3.4 Translation AI
| モデル | 役割 |
|---|---|
| indictrans2-en-indic-1b | インド言語翻訳 |
| gemma-sea-lion | 東南アジア多言語対応 |

---

## 4. タスクルーティングフロー

1. **User Input → AION OS**
   - 入力種別（text / image / voice）判定
   - 意図分類（質問、要約、翻訳、生成、分析）
2. **Router → 専門AIへ分配**
   - Text、Image、Voiceにタスク分解
3. **Memory参照**
   - ユーザー履歴・過去指示・ナレッジ参照
4. **外部API実行（必要時）**
   - 検索、翻訳、分析、CRM等
5. **AION OSで統合**
   - マルチモーダル結果を1レスポンス化
6. **User UIへ返却**

---

## 5. 共通言語化（AI群統合ルール）

今後のAI追加・機能追加は、以下の共通スキーマを必須にする。

```json
{
  "task_id": "uuid",
  "intent": "summarize|qa|translate|generate_image|stt|tts|analyze",
  "input": {
    "type": "text|image|audio|multimodal",
    "payload_ref": "uri-or-inline"
  },
  "context": {
    "session_id": "string",
    "memory_scope": "short|long|global",
    "language": "ja|en|..."
  },
  "policy": {
    "safety_level": "strict|balanced|open",
    "privacy_tier": "p0|p1|p2"
  },
  "output_contract": {
    "format": "markdown|json|audio|image",
    "max_tokens": 4000
  }
}
```

この方式により、AIONが異種モデルを同一ルールで扱える。

---

## 6. Memory / Context 管理設計

- **PostgreSQL**: 構造化データ（ユーザー、タスク、監査）
- **Redis**: 短期キャッシュ（会話状態、直近タスク）
- **Vector DB**: 埋め込み検索（文書、過去会話、プロンプト資産）

### 推奨保持戦略
- 短期記憶: 24h〜7d
- 中期記憶: 30d〜90d
- 長期知識: 明示保存のみ

---

## 7. 外部API統合

- Search: Google / Bing
- Translation: DeepL / Google Translate
- Analytics: BI / レポート出力
- 業務連携: CRM / LMS / ナレッジベース

AION OSがルーティングと結果統合を担当。

---

## 8. 実装優先順位（3段階）

1. **Phase 1: コア成立**
   - Router + Text AI + Memory最小構成
2. **Phase 2: マルチモーダル化**
   - Image / Voice導入
3. **Phase 3: 運用最適化**
   - 監査ログ、評価指標、A/B比較、自動ルーティング改善

---

## 9. 次段階拡張（AION技術向上 / ARZ / VCP連結）

### 9.1 共通言語化の拡張方針（最優先）
- 新規AI・新規機能は必ず `intent` / `policy` / `output_contract` を持つ共通契約で追加する。
- 実装チームは「モデル固有仕様」を直接UIに露出せず、AION Router内で吸収する。
- 全タスクに `capability_tags` を付与し、将来の自動最適ルーティングに利用する。

### 9.2 ARZ（Adaptive Response Zone）
- ARZは、同一タスクに対する複数候補応答を比較し、品質・安全・速度の重みで最終選択する層。
- 比較メトリクス（例）:
  - `quality_score`（正確性・網羅性）
  - `safety_score`（ポリシー適合性）
  - `latency_ms`（応答速度）
  - `cost_score`（推論コスト）
- ARZの選択結果はMemoryへ保存し、次回ルーティング時に再学習的に反映する。

### 9.3 暗号技術作戦特化部（Crypto Ops）
- 目的: 暗号機能を「運用」「監査」「鍵管理」単位で分離し、常時改善可能にする。
- 最小責務:
  1. 鍵ライフサイクル（発行・更新・失効）
  2. 署名検証フロー（Falcon系の移行計画含む）
  3. PQC移行管理（Kyber系アルゴリズム置換の検証）
  4. 監査証跡の改ざん検知

### 9.4 app.luminabulige.com → VCPサイト連結
- `app.luminabulige.com` をフロント統合面、`api.luminabulige.com` をAION API面として分離する。
- VCP連結は、以下の標準フローを採用する。
  1. User認証（SSO/OIDC）
  2. 共通契約でタスク生成
  3. AION Router実行
  4. VCP連携APIへ結果転送
  5. 監査ログ保存
- 連結時は `/vcp/connect`, `/vcp/sync`, `/vcp/events` などの契約を固定し、将来拡張は versioning (`/v1`, `/v2`) で管理する。

---

## 10. 付録: 実行設定サンプル

```toml
[core]
orchestrator = "AION"
heartbeat_bpm = 120

[shield]
mode = "enforce"
log_sink = "dlinuim://local"

[hands]
default_executor = "github-cockpit"

[zero]
pqc = "kyber"
sig = "falcon"
uuid_magic_commit = "dev"

[root]
provider = "tpm"
```
