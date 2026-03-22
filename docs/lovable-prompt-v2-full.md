# Lovable Prompt — ISP Approach Bot Dashboard v2

Build a **phone AI sales dashboard** for an ISP (Internet Service Provider) outbound/inbound AI calling team in Japan. Think of it as a product like **IVRy** (ivry.jp) or **スパ電** (super-denwa.com) — an AI phone agent management platform — but customized for ISP sales.

The app connects to a live Supabase database with 50 dummy customer records.

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
| full_name | text | Japanese names |
| address | text | Aichi/Gifu/Mie area |
| phone | text | Japanese phone numbers |
| email | text | |
| current_isp | text | NTT, au, SoftBank, NURO, コミュファ, J:COM, eo |
| contract_speed | text | 100Mbps ~ 2Gbps |
| contract_end_date | date | Some within 30 days |
| monthly_cost | integer | ¥4,100 ~ ¥6,800 |
| building_type | text | マンション/戸建て/アパート/オフィス |
| approach_status | text | 未着手/架電済/商談中/成約/見送り |
| priority_score | integer | 0-100 |
| last_contacted | timestamptz | |
| notes | text | Japanese notes |
| assigned_rep_id | uuid | FK users |

### `call_logs` table
customer_id, channel, called_at, duration_seconds, result, transcript, audio_url, next_action, next_action_date, rep_id

### `users` table
name, email, role (rep/manager/admin)

---

## App Structure — Multi-page with Sidebar Navigation

Full phone AI management platform with 5 pages:

### Page 1: ダッシュボード (Analytics)
Inspired by IVRy Analytics. KPI cards, time-series chart (mock data OK), status donut chart (real from Supabase), ISP bar chart, hot leads list, recent activity feed.

### Page 2: 架電リスト (Call List)
Inspired by スパ電. Table with all customers from Supabase. Search, filter by status, sort, clickable rows, checkboxes (visual), "架電開始" CTA button (placeholder toast).

### Page 3: 顧客詳細 (Customer Detail)
Slide-over or page. All fields organized in sections. Status change (write to Supabase). Call history. Editable notes. 🎙️ AI Voice Agent placeholder (centerpiece). Activity timeline.

### Page 4: シナリオ設定 (Scenario Builder) — UI Only
Static mockup of visual call flow builder with connected nodes, branching paths, prompt settings sidebar, knowledge base file list.

### Page 5: 設定 (Settings) — UI Only
Voice selection (Konoha/Hideki/あいこ/Hinata), notification toggles, business hours, API keys.

---

## Design Direction

Feel like a real Japanese SaaS product worth ¥100,000/month.
- Modern dark theme preferred (Linear/Vercel vibe) but creative freedom OK
- Japanese typography (Noto Sans JP or similar)
- Sidebar navigation required
- Visual urgency indicators (pulsing dots, color-coded bars)
- Micro-interactions, loading skeletons, beautiful empty states
- Professional and trustworthy, not boring

## Technical Notes
- @supabase/supabase-js or REST API
- Mock data OK for charts/scenario/settings
- Live Supabase for customer list + status updates
- Deploy target: Vercel

## What NOT to do
- No Bootstrap/MUI templates
- No boring gray-white enterprise look
- No auth screens
- No hardcoded customer data
- Don't over-simplify
