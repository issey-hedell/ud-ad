-- ============================================================
-- 代理店申請テーブル（公開フォームからの申請を受け付ける）
-- ============================================================
create table agency_applications (
  id           uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email        text not null,
  phone        text not null,
  address      text,
  business     text,
  agreed_at    timestamptz not null default now(),
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  created_at   timestamptz not null default now()
);

create index on agency_applications(status);
create index on agency_applications(email);

alter table agency_applications enable row level security;

-- ud_admin のみ参照・管理可能
create policy "ud_admin_all" on agency_applications
  for all using ((auth.jwt() ->> 'role') = 'ud_admin')
  with check ((auth.jwt() ->> 'role') = 'ud_admin');

-- 公開フォームからの INSERT は認証不要
create policy "public_insert" on agency_applications
  for insert with check (true);