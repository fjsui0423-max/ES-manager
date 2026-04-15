-- ============================================================
-- ES Tree Manager - Initial Schema
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Industries ──────────────────────────────────────────────
create table industries (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz default now()
);

-- ── Companies ────────────────────────────────────────────────
create table companies (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  industry_id   uuid references industries(id) on delete cascade not null,
  name          text not null,
  website_url   text,
  logo_url      text,
  sort_order    integer not null default 0,
  created_at    timestamptz default now()
);

-- ── Selections ───────────────────────────────────────────────
create type selection_type as enum ('internship', 'main', 'other');
create type selection_status as enum (
  'not_started', 'in_progress', 'submitted',
  'passed_doc', 'interview', 'offered', 'rejected', 'declined'
);

create table selections (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  company_id      uuid references companies(id) on delete cascade not null,
  type            selection_type not null default 'main',
  label           text,
  status          selection_status not null default 'not_started',
  deadline        date,
  sort_order      integer not null default 0,
  created_at      timestamptz default now()
);

-- ── Questions ────────────────────────────────────────────────
create table questions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  selection_id    uuid references selections(id) on delete cascade not null,
  body            text not null,
  char_limit      integer,
  deadline        date,
  sort_order      integer not null default 0,
  created_at      timestamptz default now()
);

-- ── Answers (drafts) ─────────────────────────────────────────
create table answers (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  question_id     uuid references questions(id) on delete cascade not null,
  draft_index     integer not null default 1,
  content_json    jsonb,
  content_text    text,
  is_active       boolean not null default false,
  updated_at      timestamptz default now(),
  created_at      timestamptz default now(),
  unique(question_id, draft_index)
);

-- ── Templates ────────────────────────────────────────────────
create table templates (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  title           text not null,
  content_json    jsonb,
  content_text    text,
  category        text,
  created_at      timestamptz default now()
);

-- ── Push Subscriptions ───────────────────────────────────────
create table push_subscriptions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  endpoint        text not null unique,
  p256dh          text not null,
  auth            text not null,
  created_at      timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table industries         enable row level security;
alter table companies          enable row level security;
alter table selections         enable row level security;
alter table questions          enable row level security;
alter table answers            enable row level security;
alter table templates          enable row level security;
alter table push_subscriptions enable row level security;

create policy "owner_all" on industries         for all using (auth.uid() = user_id);
create policy "owner_all" on companies          for all using (auth.uid() = user_id);
create policy "owner_all" on selections         for all using (auth.uid() = user_id);
create policy "owner_all" on questions          for all using (auth.uid() = user_id);
create policy "owner_all" on answers            for all using (auth.uid() = user_id);
create policy "owner_all" on templates          for all using (auth.uid() = user_id);
create policy "owner_all" on push_subscriptions for all using (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================

create index on companies   (industry_id, sort_order);
create index on selections  (company_id,  sort_order);
create index on questions   (selection_id, sort_order);
create index on answers     (question_id, draft_index);
create index on selections  (deadline) where deadline is not null;
create index on questions   (deadline) where deadline is not null;
