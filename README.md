# ISP Approach Bot 🤖📞

> AI 音声エージェントによる ISP 営業アプローチ自動化システム

**ElevenLabs Conversational AI 2.0** をコアエンジンとし、ダミー顧客データをもとに、マルチチャネル（電話 / Web / LINE / Slack 等）で見込み客にアプローチできる統合営業支援ボット。

---

## Architecture

### Full System（最終形）

```mermaid
graph TB
    subgraph USER["Users"]
        REP["Sales Rep<br/>営業担当者"]
        MGR["Sales Manager"]
        CUSTOMER["Customer<br/>見込み客"]
    end

    subgraph CHANNELS["Channels / Interfaces"]
        WEB["Web App<br/>ブラウザ"]
        PHONE_APP["Phone App<br/>iOS / Android"]
        LINE_APP["LINE<br/>公式アカウント"]
        SLACK_CH["Slack<br/>社内チャネル"]
        TEL["電話<br/>Twilio / SIP"]
        WHATSAPP["WhatsApp"]
        ETC["etc...<br/>SMS / Email / Messenger"]
    end

    subgraph FRONTEND["Frontend — Vercel"]
        DASH["Dashboard<br/>リード管理 / 通話履歴 / 成績"]
        WIDGET["ElevenLabs Widget<br/>音声エージェントUI"]
    end

    subgraph CORE["Core — ElevenAgents"]
        AGENT["ElevenLabs<br/>Conversational AI 2.0"]
        RAG["Built-in RAG<br/>商品知識 / FAQ / トークスクリプト"]
        LLM["Built-in LLM<br/>Claude / GPT"]
        VOICE["Japanese TTS<br/>Konoha / Hideki / あいこ"]
    end

    subgraph DATA["Data Layer"]
        SUPA["Supabase<br/>顧客DB / 通話履歴 / 音声ログ"]
        KIKAN_A["基幹システムA<br/>契約情報"]
        KIKAN_B["基幹システムB<br/>請求 / 回線情報"]
        KIKAN_C["基幹システムC<br/>工事 / 開通状況"]
    end

    subgraph ORCHESTRATION["Orchestration"]
        N8N["n8n<br/>バッチ処理 / 日次リード抽出"]
    end

    REP -->|営業ツールとして利用| WEB
    REP -->|外出先から| PHONE_APP
    REP -->|社内連携| SLACK_CH
    MGR -->|成績確認| WEB
    CUSTOMER -->|問い合わせ| LINE_APP
    CUSTOMER -->|着電 / 架電| TEL
    CUSTOMER -->|海外顧客| WHATSAPP
    WEB -->|ブラウザアクセス| DASH
    WEB -->|WebSocket| WIDGET
    PHONE_APP -->|API| DASH
    PHONE_APP -->|WebSocket| AGENT
    LINE_APP -->|Webhook| AGENT
    SLACK_CH -->|Slack Events| AGENT
    TEL -->|SIP / Twilio| AGENT
    WHATSAPP -->|WhatsApp API| AGENT
    ETC -->|各種API| AGENT
    WIDGET -->|WebSocket| AGENT
    AGENT --- RAG
    AGENT --- LLM
    AGENT --- VOICE
    AGENT -->|Tool Call: 顧客データ| SUPA
    AGENT -->|Tool Call: 契約照会| KIKAN_A
    AGENT -->|Tool Call: 請求照会| KIKAN_B
    AGENT -->|Tool Call: 工事状況| KIKAN_C
    AGENT -->|通話結果保存| SUPA
    N8N -->|日次リード抽出| SUPA
    N8N -->|リード通知| SLACK_CH
    N8N -->|バッチ架電トリガー| AGENT
    DASH -->|Read/Write| SUPA
```

### MVP（Phase 1 — 2週間）

```mermaid
graph LR
    subgraph MVP["Phase 1 — MVP (2週間で構築)"]
        REP["🧑‍💼 Sales Rep"]
        subgraph UI["Web Dashboard — Vercel"]
            DASH["リード一覧<br/>+ 音声プレーヤー"]
            WIDGET["ElevenLabs<br/>Voice Widget"]
        end
        subgraph ELEVEN["ElevenAgents"]
            AGENT["Conversational AI<br/>+ Built-in LLM<br/>+ Japanese TTS"]
            KB["Knowledge Base<br/>ISP商品情報 / FAQ"]
        end
        SUPA["Supabase<br/>ダミー顧客50件<br/>+ 通話ログ"]
        REP -->|ブラウザ| DASH
        REP -->|音声で質問| WIDGET
        WIDGET -->|WebSocket| AGENT
        AGENT --- KB
        AGENT -->|Tool Call| SUPA
        DASH -->|CRUD| SUPA
    end
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Core AI | ElevenLabs Conversational AI 2.0 |
| Frontend | Next.js + Tailwind CSS |
| Hosting | Vercel |
| Database | Supabase (PostgreSQL) |
| Telephony | Twilio / SIP (Phase 2) |
| Messaging | LINE Messaging API (Phase 2) |
| Workflow | n8n on Oracle Cloud VM |
| Notification | Slack |

---

## Quick Start

```bash
# Clone
git clone https://github.com/jaydenbarnescs-tech/isp-approach-bot.git
cd isp-approach-bot

# Install dependencies
cd web && npm install

# Set env vars
cp .env.example .env.local
# Edit .env.local with your Supabase + ElevenLabs keys

# Run dev server
npm run dev
```

---

## Documentation

- [PRD (Product Requirements Document)](docs/PRD.md)
- [Full Architecture Diagram](docs/architecture-full.mermaid)
- [MVP Architecture Diagram](docs/architecture-mvp.mermaid)

---

## Roadmap

- [x] Architecture design
- [x] PRD
- [ ] **Phase 1 (W1-W2):** MVP — Dashboard + ElevenLabs Agent + Dummy Data
- [ ] **Phase 2 (W3-W8):** Multi-channel + 基幹システム連携 + Twilio + n8n

---

## License

Private — MGC Inc.
