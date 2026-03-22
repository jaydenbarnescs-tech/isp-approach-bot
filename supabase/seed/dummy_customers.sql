-- ISP Approach Bot — Dummy Customer Data (50 records)
-- Seed file for MVP development
-- Date: 2026-03-22

-- Insert demo users
insert into public.users (id, name, email, role, slack_user_id) values
  ('a1000000-0000-0000-0000-000000000001', '松尾 大輝', 'matsuo@mgc-inc.jp', 'manager', 'U_MATSUO'),
  ('a1000000-0000-0000-0000-000000000002', 'Jayden Barnes', 'jayden@mgc-inc.jp', 'admin', 'U_JAYDEN'),
  ('a1000000-0000-0000-0000-000000000003', '佐藤 美咲', 'sato.misaki@mgc-inc.jp', 'rep', 'U_SATO'),
  ('a1000000-0000-0000-0000-000000000004', '鈴木 翔太', 'suzuki.shota@mgc-inc.jp', 'rep', 'U_SUZUKI'),
  ('a1000000-0000-0000-0000-000000000005', '高橋 あかり', 'takahashi.akari@mgc-inc.jp', 'rep', 'U_TAKAHASHI');

-- Insert 50 dummy customers
-- See full file at: supabase/seed/dummy_customers.sql in repository
-- This is a placeholder commit; full data pushed separately
