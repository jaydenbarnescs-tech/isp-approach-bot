# ISP Approach Bot — Product Requirements Document

**Project codename:** ISP Voice Approach Bot  
**Version:** 0.2  
**Date:** 2026-03-22  
**Author:** MGC Inc.

---

## 1. Overview

ISP（インターネットサービスプロバイダ）向けの AI 音声営業アプローチボット。ElevenLabs Conversational AI 2.0 をコアエンジンとして、ダミー顧客データ（氏名・住所・契約回線情報）をもとに、電話・Web・LINE・Slack 等の複数チャネルから顧客にアプローチできる統合営業支援システム。

**Key insight:** ElevenLabs Conversational AI 2.0 が LLM + TTS + RAG + Tool Call を一体化しているため、別途 Claude API を叩く必要がなく、ElevenAgents だけで「考えて、話して、データを引いて、記録する」が完結する。

---

## 2. Problem Statement

ISP 営業チームの課題：

- 手動で顧客リストを精査し、個別の営業トークを考え、電話をかけている（非効率・属人的）
- 顧客情報が複数の基幹システムに分散している（契約情報、請求情報、工事状況が別々）
- 成約率のばらつきが大きく、新人営業の立ち上がりが遅い
- 顧客接点が電話中心で、LINE / Web 等のチャネルを活用できていない

---

## 3. Target Users

| ユーザー | 役割 | 主な利用チャネル |
|---------|------|---------------|
| 営業担当者 | 日々の電話営業 / 顧客対応 | Web, Phone App, Slack |
| 営業マネージャー | チーム成績管理 / スクリプト承認 | Web |
| 見込み客 | 問い合わせ / 契約相談 | LINE, 電話, WhatsApp |
| システム管理者 | データ管理 / ワークフロー設定 | Web |

---

## 4. System Architecture

### 4.1 Full Architecture（最終形）

→ 詳細: [`docs/architecture-full.mermaid`](architecture-full.mermaid)

**7つのチャネル** → **ElevenAgents（中枢）** → **複数データソース**

チャネル: Web / Phone App / LINE / Slack / 電話(Twilio) / WhatsApp / etc  
コア: ElevenLabs Conversational AI 2.0（LLM + TTS + RAG + Tool Call 一体型）  
データ: Supabase + 基幹システムA/B/C（Tool Call 経由で照会）  
通知: Slack / n8n（バッチ処理）

### 4.2 MVP Architecture（Phase 1）

→ 詳細: [`docs/architecture-mvp.mermaid`](architecture-mvp.mermaid)

**Web のみ** → **ElevenAgents** → **Supabase（ダミーデータ50件）**

最小構成で2週間以内に動くプロトタイプを構築する。

---

## 5. ElevenLabs Conversational AI — Core Engine

### 5.1 なぜ ElevenAgents で完結するか

| 機能 | 従来構成 | ElevenAgents |
|------|---------|-------------|
| LLM（思考） | Claude API を別途呼び出し | Built-in（Claude / GPT 選択可） |
| TTS（音声合成） | ElevenLabs TTS API | Built-in |
| STT（音声認識） | 別サービス | Built-in (Scribe v2) |
| RAG（知識検索） | LangChain + Vector DB | Built-in RAG（URL/ファイル取込） |
| データ取得 | n8n 等で API 連携 | Tool Call（Webhook / MCP） |
| テレフォニー | Twilio + 自前連携 | Twilio/SIP 直接統合 |
| マルチチャネル | 個別実装 | WhatsApp/Widget/SDK 対応 |

### 5.2 利用ボイス

| ボイス名 | Voice ID | 特徴 | 用途 |
|----------|----------|------|------|
| Konoha | `T7yYq3WpB94yAuOXraRi` | プロフェッショナル女性・関東 | メイン営業ボイス |
| Hideki | `nHEVPT3LS1V37bXZNr82` | 穏やかな男性・関西 | 関西エリア向け |
| あいこ | `NQZUZmZFxoCYFGj4gD2o` | 優しい女性・関東 | ソフトアプローチ用 |
| Hinata | `j210dv0vWm7fCknyQpbA` | 自信ある若い男性 | 法人営業向け |

### 5.3 Knowledge Base に投入するデータ

- ISP 商品ラインナップ（速度・料金・キャンペーン）
- 競合比較表（NTT / au / SoftBank / NURO 等）
- よくある質問（FAQ）
- 営業トークスクリプトのテンプレート
- 建物タイプ別の提案パターン（マンション / 戸建て）

---

## 6. Data Design

### 6.1 Supabase テーブル

**`customers`** — 顧客マスター（MVP: ダミーデータ50件）

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | PK |
| `full_name` | text | 氏名 |
| `address` | text | 住所 |
| `phone` | text | 電話番号 |
| `email` | text | メールアドレス |
| `current_isp` | text | 現在の回線事業者 |
| `contract_speed` | text | 契約速度 |
| `contract_end_date` | date | 契約終了日 |
| `monthly_cost` | integer | 月額料金（円） |
| `building_type` | text | マンション / 戸建て |
| `approach_status` | text | 未着手 / 架電済 / 商談中 / 成約 / 見送り |
| `priority_score` | integer | 優先度スコア（0-100） |
| `last_contacted` | timestamp | 最終連絡日 |
| `notes` | text | メモ |

**`call_logs`** — 通話記録

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | PK |
| `customer_id` | uuid | FK → customers |
| `channel` | text | phone / web / line / slack |
| `called_at` | timestamp | 架電日時 |
| `duration_seconds` | integer | 通話時間 |
| `result` | text | 成約 / 検討中 / 不在 / 断り |
| `transcript` | text | 会話ログ（ElevenAgents から取得） |
| `audio_url` | text | 音声ファイルURL |
| `next_action` | text | 次回アクション |
| `next_action_date` | date | 次回アクション日 |
| `rep_id` | uuid | 担当者ID |

**`users`** — 営業担当者

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | PK |
| `name` | text | 氏名 |
| `email` | text | メール |
| `role` | text | rep / manager / admin |
| `slack_user_id` | text | Slack ユーザーID |

### 6.2 基幹システム連携（Phase 2）

ElevenAgents の Tool Call（Webhook）を使って、外部システムから情報を取得する。

- **基幹システムA（契約情報）**: 顧客の契約状態、プラン、回線種別
- **基幹システムB（請求情報）**: 請求金額、支払い状況、未払いフラグ
- **基幹システムC（工事情報）**: 工事スケジュール、開通状況、機器情報

MVP では全て Supabase のダミーデータで代替。

---

## 7. Development Roadmap

### Phase 1: MVP（2週間）— 「まず動くもの」

**Goal:** Web ダッシュボード + ElevenLabs Voice Widget + ダミー顧客データ50件

| Week | Day | Task | Owner | Deliverable |
|------|-----|------|-------|-------------|
| W1 | 1 | GitHub リポジトリ作成 + 初期構成 | Dev | Repo + README |
| W1 | 1 | Supabase プロジェクト作成 + テーブル定義 | Dev | DB schema |
| W1 | 2 | ダミー顧客データ生成スクリプト（50件） | Dev | Seed data |
| W1 | 2-3 | Next.js ダッシュボード骨組み | Dev | リード一覧画面 |
| W1 | 3-4 | Supabase Auth + ログイン画面 | Dev | Auth flow |
| W1 | 4-5 | 顧客詳細画面（情報表示 + ステータス更新） | Dev | Detail page |
| W2 | 1 | ElevenLabs Agent 作成 + Knowledge Base 投入 | Dev | Agent config |
| W2 | 2 | ElevenLabs Widget をダッシュボードに埋め込み | Dev | Voice UI |
| W2 | 3 | Agent → Supabase の Tool Call 設定 | Dev | Data retrieval |
| W2 | 4 | 通話ログ記録フロー | Dev | Call logging |
| W2 | 5 | Vercel デプロイ + E2Eテスト | Dev | Live demo |

**Phase 1 完了基準:**
- [ ] ダッシュボードで顧客一覧が見れる
- [ ] 顧客を選んで音声エージェントと会話できる
- [ ] エージェントが顧客情報を参照して営業トークできる
- [ ] 通話結果が記録される
- [ ] Vercel にデプロイ済み

### Phase 2: Full System（6週間）— 「本番に近づける」

**Goal:** マルチチャネル + 基幹システム連携 + n8n 自動化 + Twilio 架電

| Week | Task | Details |
|------|------|---------|
| W3 | Twilio / SIP 連携 | ElevenAgents ↔ Twilio で実際の電話ができるように |
| W3 | 基幹システム mock API | Supabase Edge Functions で契約/請求/工事の mock API を作成 |
| W4 | LINE 公式アカウント連携 | LINE Messaging API → ElevenAgents Webhook |
| W4 | Slack Bot 連携 | Slack Events API → ElevenAgents、社内からの問い合わせ対応 |
| W5 | n8n ワークフロー構築 | 日次リード抽出、バッチ架電トリガー、Slack 通知 |
| W5 | Phone App（PWA or React Native） | モバイル対応 |
| W6 | ダッシュボード強化 | 成績グラフ、チーム管理画面、マネージャー機能 |
| W6 | WhatsApp + SMS 連携 | 海外顧客向けチャネル追加 |
| W7 | 基幹システム本番 API 接続 | mock → 本番 API に切り替え |
| W7 | Agent チューニング | Knowledge Base 拡充、プロンプト最適化 |
| W8 | セキュリティ / パフォーマンス | RLS、認証強化、負荷テスト |
| W8 | ドキュメント + クライアントデモ | デモ準備、運用マニュアル |

**Phase 2 完了基準:**
- [ ] 電話 / Web / LINE / Slack の4チャネル以上で動作
- [ ] 基幹システムからリアルタイムでデータ取得
- [ ] n8n で日次リード抽出が自動化
- [ ] マネージャーが成績ダッシュボードを確認可能
- [ ] クライアントデモ実施

---

## 8. Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Core AI** | ElevenLabs Conversational AI 2.0 | 音声エージェント（LLM + TTS + STT + RAG + Tool Call） |
| **Frontend** | Next.js + Tailwind CSS | ダッシュボード |
| **Hosting** | Vercel | フロントエンドデプロイ |
| **Database** | Supabase (PostgreSQL) | 顧客DB, 通話履歴, 認証 |
| **Auth** | Supabase Auth | ユーザー認証 |
| **Telephony** | Twilio / SIP (Phase 2) | 実電話連携 |
| **Messaging** | LINE Messaging API (Phase 2) | LINE チャネル |
| **Workflow** | n8n (Oracle Cloud VM) | バッチ処理, 自動化 |
| **Notification** | Slack API | 社内通知 |
| **Source Control** | GitHub | ソースコード管理 |

---

## 9. n8n Workflows (Phase 2)

| Workflow | Trigger | Process |
|----------|---------|---------|
| Daily Lead Refresh | Cron 毎朝 9:00 | 契約終了30日以内の顧客を抽出 → priority_score 計算 → Slack通知 |
| Call Result Sync | Webhook (通話完了時) | ElevenAgents の transcript 取得 → call_logs 保存 → ステータス更新 |
| Weekly Report | Cron 毎週月曜 9:00 | 週間成績集計 → Slack チャネルに投稿 |
| Batch Call Trigger | Schedule or Manual | リード一覧から順次 ElevenAgents に架電リクエスト |

---

## 10. Success Metrics

| Metric | Phase 1 Target | Phase 2 Target |
|--------|---------------|---------------|
| エージェント応答レイテンシ | < 2秒 | < 1.5秒 |
| 顧客データ参照成功率 | 95% | 99% |
| 1日あたり対応可能件数 | 50件（手動） | 200件（自動+手動） |
| チャネル数 | 1（Web） | 4+（Web/電話/LINE/Slack） |
| デモ完了 | プロトタイプ | クライアントデモ |

---

## 11. Open Questions

1. **ElevenLabs プラン**: Conversational AI の利用量に対して、どのプランが適切か？
2. **基幹システム API**: 既存システムの API 仕様は入手可能か？REST / SOAP？
3. **Twilio 番号**: 日本の電話番号取得の手続きは？
4. **LINE 公式アカウント**: 既存アカウントの有無、Messaging API の契約状況
5. **データ規模**: 本番環境の顧客数は何件想定？
6. **コンプライアンス**: 通話録音の同意取得フロー、個人情報の取り扱い

---

## 12. File Structure (Planned)

```
isp-approach-bot/
├── README.md
├── docs/
│   ├── architecture-full.mermaid    # 最終形アーキテクチャ図
│   ├── architecture-mvp.mermaid     # MVP 簡略図
│   └── PRD.md                       # この文書
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed/
│       └── dummy_customers.sql
├── web/                             # Next.js dashboard
│   ├── src/
│   ├── package.json
│   └── ...
├── agent/                           # ElevenLabs Agent config
│   ├── knowledge/                   # KB files (ISP info, FAQ, scripts)
│   └── tools/                       # Tool Call definitions
└── n8n/                             # Workflow export JSONs (Phase 2)
```

---

*This is a living document. Updated as development progresses.*
