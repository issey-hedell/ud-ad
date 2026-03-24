-- ============================================================
-- UDエスカレーター広告管理システム 初期スキーマ
-- ============================================================

-- UUID 拡張

-- ============================================================
-- マスタテーブル
-- ============================================================

-- 建物マスタ
create table buildings (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text not null,
  created_at timestamptz not null default now()
);

-- エスカレーター（FK: building_id）
create table escalators (
  id          uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  name        text not null,
  floor       text not null,
  direction   text not null check (direction in ('up', 'down', 'both')),
  created_at  timestamptz not null default now()
);

-- バナーサイズマスタ
create table banner_sizes (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  width_mm  integer not null,
  height_mm integer not null
);

-- 掲載料金（FK: escalator_id, banner_size_id）
create table pricing_rules (
  id                uuid primary key default gen_random_uuid(),
  escalator_id      uuid not null references escalators(id) on delete cascade,
  banner_size_id    uuid not null references banner_sizes(id),
  price_per_month   integer not null,
  created_at        timestamptz not null default now(),
  unique (escalator_id, banner_size_id)
);

-- ============================================================
-- ユーザー関連テーブル
-- ============================================================

-- 代理店
create table agencies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null unique,
  created_at timestamptz not null default now()
);

-- 広告主（FK: agency_id）
create table advertisers (
  id         uuid primary key default gen_random_uuid(),
  agency_id  uuid not null references agencies(id),
  name       text not null,
  email      text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 業務テーブル
-- ============================================================

-- 予約・掲載管理
create table reservations (
  id                       uuid primary key default gen_random_uuid(),
  escalator_id             uuid not null references escalators(id),
  agency_id                uuid not null references agencies(id),
  advertiser_id            uuid references advertisers(id),
  start_date               date not null,
  end_date                 date not null,
  payment_method           text not null check (payment_method in ('card', 'invoice')),
  status                   text not null default 'pending'
                             check (status in ('pending', 'pending_payment', 'confirmed', 'cancelled')),
  stripe_payment_intent_id text,
  created_at               timestamptz not null default now(),
  check (end_date > start_date)
);

-- 請求書（FK: reservation_id）
create table invoices (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id),
  amount         integer not null,
  pdf_url        text,
  issued_at      timestamptz not null default now(),
  paid_at        timestamptz
);

-- 広告主向け申込リンク（FK: agency_id）
create table inquiry_links (
  id         uuid primary key default gen_random_uuid(),
  agency_id  uuid not null references agencies(id),
  token      text not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 64),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- 建物オーナー入力フォーム（トークン管理）
create table building_forms (
  id           uuid primary key default gen_random_uuid(),
  token        text not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 64),
  building_id  uuid references buildings(id),
  submitted_at timestamptz,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- インデックス
-- ============================================================
create index on escalators(building_id);
create index on pricing_rules(escalator_id);
create index on advertisers(agency_id);
create index on reservations(escalator_id);
create index on reservations(agency_id);
create index on invoices(reservation_id);
create index on inquiry_links(agency_id);
create index on inquiry_links(token);
create index on building_forms(token);

-- ============================================================
-- RLS 有効化
-- ============================================================
alter table buildings      enable row level security;
alter table escalators     enable row level security;
alter table banner_sizes   enable row level security;
alter table pricing_rules  enable row level security;
alter table agencies       enable row level security;
alter table advertisers    enable row level security;
alter table reservations   enable row level security;
alter table invoices       enable row level security;
alter table inquiry_links  enable row level security;
alter table building_forms enable row level security;

-- ============================================================
-- RLS ポリシー: ud_admin → 全テーブルフルアクセス
-- ============================================================
create policy "ud_admin_all" on buildings      for all using ((auth.jwt() ->> 'role') = 'ud_admin') with check ((auth.jwt() ->> 'role') = 'ud_admin');
create policy "ud_admin_all" on escalators     for all using ((auth.jwt() ->> 'role') = 'ud_admin') with check ((auth.jwt() ->> 'role') = 'ud_admin');
create policy "ud_admin_all" on banner_sizes   for all using ((auth.jwt() ->> 'role') = 'ud_admin') with check ((auth.jwt() ->> 'role') = 'ud_admin');
create policy "ud_admin_all" on pricing_rules  for all using ((auth.jwt() ->> 'role') = 'ud_admin') with check ((auth.jwt() ->> 'role') = 'ud_admin');
create policy "ud_admin_all" on agencies       for all using ((auth.jwt() ->> 'role') = 'ud_admin') with check ((auth.jwt() ->> 'role') = 'ud_admin');
create policy "ud_admin_all" on advertisers    for all using ((auth.jwt() ->> 'role') = 'ud_admin') with check ((auth.jwt() ->> 'role') = 'ud_admin');
create policy "ud_admin_all" on reservations   for all using ((auth.jwt() ->> 'role') = 'ud_admin') with check ((auth.jwt() ->> 'role') = 'ud_admin');
create policy "ud_admin_all" on invoices       for all using ((auth.jwt() ->> 'role') = 'ud_admin') with check ((auth.jwt() ->> 'role') = 'ud_admin');
create policy "ud_admin_all" on inquiry_links  for all using ((auth.jwt() ->> 'role') = 'ud_admin') with check ((auth.jwt() ->> 'role') = 'ud_admin');
create policy "ud_admin_all" on building_forms for all using ((auth.jwt() ->> 'role') = 'ud_admin') with check ((auth.jwt() ->> 'role') = 'ud_admin');

-- ============================================================
-- RLS ポリシー: agency → 自社データのみ
-- ============================================================
create policy "agency_read_buildings"     on buildings    for select using ((auth.jwt() ->> 'role') = 'agency');
create policy "agency_read_escalators"    on escalators   for select using ((auth.jwt() ->> 'role') = 'agency');
create policy "agency_read_banner_sizes"  on banner_sizes for select using ((auth.jwt() ->> 'role') = 'agency');
create policy "agency_read_pricing_rules" on pricing_rules for select using ((auth.jwt() ->> 'role') = 'agency');

create policy "agency_own" on agencies
  for select using (
    (auth.jwt() ->> 'role') = 'agency' and
    id = ((auth.jwt() -> 'user_metadata') ->> 'agency_id')::uuid
  );

create policy "agency_advertisers" on advertisers
  for all using (
    (auth.jwt() ->> 'role') = 'agency' and
    agency_id = ((auth.jwt() -> 'user_metadata') ->> 'agency_id')::uuid
  )
  with check (
    (auth.jwt() ->> 'role') = 'agency' and
    agency_id = ((auth.jwt() -> 'user_metadata') ->> 'agency_id')::uuid
  );

create policy "agency_reservations" on reservations
  for all using (
    (auth.jwt() ->> 'role') = 'agency' and
    agency_id = ((auth.jwt() -> 'user_metadata') ->> 'agency_id')::uuid
  )
  with check (
    (auth.jwt() ->> 'role') = 'agency' and
    agency_id = ((auth.jwt() -> 'user_metadata') ->> 'agency_id')::uuid
  );

create policy "agency_invoices" on invoices
  for all using (
    (auth.jwt() ->> 'role') = 'agency' and
    reservation_id in (
      select id from reservations
      where agency_id = ((auth.jwt() -> 'user_metadata') ->> 'agency_id')::uuid
    )
  );

create policy "agency_inquiry_links" on inquiry_links
  for all using (
    (auth.jwt() ->> 'role') = 'agency' and
    agency_id = ((auth.jwt() -> 'user_metadata') ->> 'agency_id')::uuid
  )
  with check (
    (auth.jwt() ->> 'role') = 'agency' and
    agency_id = ((auth.jwt() -> 'user_metadata') ->> 'agency_id')::uuid
  );

-- ============================================================
-- RLS ポリシー: advertiser → 自社予約の閲覧のみ
-- ============================================================
create policy "advertiser_read_reservations" on reservations
  for select using (
    (auth.jwt() ->> 'role') = 'advertiser' and
    advertiser_id = ((auth.jwt() -> 'user_metadata') ->> 'advertiser_id')::uuid
  );

-- ============================================================
-- RLS ポリシー: URLトークン経由フォーム（匿名 INSERT）
-- ============================================================
create policy "token_insert_building_forms" on building_forms
  for insert with check (true);

-- ============================================================
-- 初期データ: バナーサイズ
-- ============================================================
insert into banner_sizes (name, width_mm, height_mm) values
  ('A4 縦', 210, 297),
  ('A3 横', 420, 297),
  ('B3 縦', 364, 515),
  ('カスタム S', 300, 400),
  ('カスタム M', 400, 600);
