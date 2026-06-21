-- Habla — initial schema (Iteration 0).
-- Durable primitives only (see habla_v4_scope.md §7). Persona-aware so the
-- Absorber pathway can be added later without a rewrite. RLS enabled; queries
-- scope by user_id even in single-user mode.

-- Enums ---------------------------------------------------------------------
create type pathway as enum ('returner', 'absorber');
create type cefr_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
create type item_type as enum ('vocab', 'pattern', 'move');
create type item_source as enum ('seeded', 'generated', 'from_conversation');

-- users ---------------------------------------------------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  pathway pathway not null default 'returner',
  receptive_level cefr_level,
  productive_level cefr_level,
  peak_level cefr_level,                       -- returner
  years_since_active_use int,                  -- returner
  reads_spanish boolean,                       -- returner
  goals text[] not null default '{}',
  topics text[] not null default '{}',
  correction_intensity text not null default 'standard', -- minimal | standard | detailed
  streak_count int not null default 0,
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- practice_items (SRS / pattern bank) --------------------------------------
create table if not exists practice_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  item_type item_type not null,
  prompt text not null,
  target text not null,
  topic text,
  level cefr_level,
  recognition_interval_days int not null default 1,
  recognition_next_due timestamptz,
  recognition_streak int not null default 0,
  production_interval_days int not null default 1,
  production_next_due timestamptz,
  production_streak int not null default 0,
  source item_source not null default 'seeded',
  is_savings boolean not null default false,   -- returner "I already know this"
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists practice_items_user_idx on practice_items(user_id);

-- sessions ------------------------------------------------------------------
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  exercise_blocks text[] not null default '{}',
  duration_seconds int,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_idx on sessions(user_id);

-- attempts (first-class — the most valuable data) --------------------------
create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  session_id uuid references sessions(id) on delete set null,
  practice_item_id uuid references practice_items(id) on delete set null,
  prompt_shown text,
  expected_target text,
  user_transcript text,
  latency_ms int,
  completed boolean not null default false,
  assessment jsonb,
  correction text,
  should_reappear boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists attempts_user_idx on attempts(user_id);
create index if not exists attempts_session_idx on attempts(session_id);

-- assessments (diagnostic + level estimates over time) ---------------------
create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  pathway pathway not null default 'returner',
  receptive_estimate cefr_level,
  productive_estimate cefr_level,
  confidence real,
  raw jsonb,
  created_at timestamptz not null default now()
);
create index if not exists assessments_user_idx on assessments(user_id);

-- events (analytics-lite) ---------------------------------------------------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  props jsonb,
  created_at timestamptz not null default now()
);
create index if not exists events_user_idx on events(user_id);

-- Row level security --------------------------------------------------------
alter table users enable row level security;
alter table practice_items enable row level security;
alter table sessions enable row level security;
alter table attempts enable row level security;
alter table assessments enable row level security;
alter table events enable row level security;
