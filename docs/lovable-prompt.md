# Lovable Prompt — ISP Approach Bot Dashboard

Build a **sales lead management dashboard** for an ISP (Internet Service Provider) outbound sales team in Japan. The app connects to a live Supabase database with 50 dummy customer records.

---

## Supabase Connection

```
URL: https://vrsvfphylajgrnjiewxk.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyc3ZmcGh5bGFqZ3Juamlld3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjU3NzIsImV4cCI6MjA4OTc0MTc3Mn0.hRgQqx-EBgPxUxehqdyUy8iuTN2NQiHjwQ4y0dDBHb8
```

## Database Schema

### `customers` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| full_name | text | Japanese names (e.g. 田中 太郎) |
| address | text | Japanese addresses (Aichi/Gifu/Mie area) |
| phone | text | Japanese phone numbers |
| email | text | |
| current_isp | text | NTT フレッツ光, au ひかり, SoftBank 光, NURO 光, コミュファ光, J:COM, eo 光 |
| contract_speed | text | 100Mbps, 200Mbps, 300Mbps, 1Gbps, 2Gbps |
| contract_end_date | date | Some expire within 30 days (urgent leads) |
| monthly_cost | integer | JPY (¥4,100 ~ ¥6,800) |
| building_type | text | マンション / 戸建て / アパート / オフィス |
| approach_status | text | 未着手 / 架電済 / 商談中 / 成約 / 見送り |
| priority_score | integer | 0-100 (higher = more urgent) |
| last_contacted | timestamptz | |
| notes | text | Japanese context notes about the customer |
| assigned_rep_id | uuid | FK to users table |

### `call_logs` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| customer_id | uuid | FK → customers |
| channel | text | phone / web / line / slack / whatsapp / other |
| called_at | timestamptz | |
| duration_seconds | integer | |
| result | text | 成約 / 検討中 / 不在 / 断り / 折り返し予定 / その他 |
| transcript | text | Conversation log |
| audio_url | text | |
| next_action | text | |
| next_action_date | date | |
| rep_id | uuid | FK to users |

### `users` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | |
| email | text | |
| role | text | rep / manager / admin |

---

## Required Features (must have)

1. **Lead list view** — Show all customers from Supabase in a table/list. Display: name, ISP, speed, monthly cost, contract end date, status, priority score. Sortable.

2. **Search & filter** — Text search across name, address, ISP, phone. Filter by approach_status. Show result count.

3. **Customer detail view** — Click a customer to see all their information.

4. **Status update** — Allow changing approach_status directly (write back to Supabase via PATCH).

5. **Stats/KPI cards** — Total leads, high priority (score ≥ 80), expiring within 30 days, conversion (成約), untouched (未着手).

6. **Placeholder for ElevenLabs Voice Agent** — In customer detail, include a visible placeholder for a voice AI widget. Label it "🎙️ AI Voice Agent" with a button "音声エージェントを起動".

---

## Design Direction (creative freedom — surprise me!)

I want something **premium, modern, and distinctly NOT generic**. Full creative freedom on:

- **Color palette & theme** — dark, light, or unexpected
- **Typography** — bilingual-friendly (Japanese + English)
- **Layout** — table, cards, kanban, or hybrid
- **Animations** — polish where natural
- **Visual hierarchy** — make expiring contracts and high priority leads scannable
- **Vibe** — inspired by Linear, Vercel, Raycast, Notion, or something original

Hard requirements: **functional** (reads/writes Supabase), **bilingual** (Japanese content), **responsive** (desktop + tablet).

---

## Technical Notes

- Use `@supabase/supabase-js` or direct REST API
- REST: `GET {URL}/rest/v1/customers?select=*&order=priority_score.desc` with `apikey` header
- Updates: `PATCH {URL}/rest/v1/customers?id=eq.{uuid}`
- Deploy target: Vercel

## What NOT to do

- No generic Bootstrap/Material UI admin panels
- No boring gray-on-white tables
- No auth (added later)
- No hardcoded data — always fetch from Supabase
