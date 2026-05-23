create extension if not exists pgcrypto;

do $$
begin
  create type difficulty as enum ('easy', 'medium', 'hard');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type question_type as enum ('guess_artist', 'guess_artwork', 'guess_movement');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type quiz_mode as enum ('classic', 'famous_10', 'interested_10', 'art_lover_10', 'vs');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type match_status as enum ('waiting', 'active', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists artists (
  id text primary key,
  name text not null,
  nationality text,
  birth_year integer,
  death_year integer,
  bio text,
  fun_fact text,
  image_url text
);

create table if not exists movements (
  id text primary key,
  name text not null,
  description text,
  theme_key text not null
);

create table if not exists artworks (
  id text primary key,
  title text not null,
  artist_id text not null references artists(id) on update cascade,
  movement_id text not null references movements(id) on update cascade,
  year text,
  image_url text not null,
  wikimedia_file text,
  description text not null,
  difficulty difficulty not null,
  public_domain boolean not null default true,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  artwork_id text not null references artworks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, artwork_id)
);

create table if not exists quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  mode quiz_mode not null,
  round integer not null default 0,
  score_correct integer not null default 0,
  score_total integer not null default 0,
  score_unanswered integer not null default 0,
  current_artwork_id text not null references artworks(id),
  current_question_type question_type not null,
  current_options text[] not null,
  current_correct_answer text not null,
  selected_answer text,
  question_started_at timestamptz not null default now(),
  timed_out boolean not null default false,
  artwork_queue text[],
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, mode)
);

create table if not exists quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  session_id uuid references quiz_sessions(id) on delete set null,
  mode quiz_mode not null,
  score_correct integer not null,
  score_total integer not null,
  score_unanswered integer not null default 0,
  round_reached integer,
  final_artwork_id text references artworks(id),
  created_at timestamptz not null default now()
);

create table if not exists vs_matches (
  id uuid primary key default gen_random_uuid(),
  status match_status not null default 'waiting',
  mode quiz_mode not null default 'vs',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists vs_match_players (
  match_id uuid not null references vs_matches(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  score_correct integer not null default 0,
  score_total integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key (match_id, user_id)
);

create table if not exists vs_match_questions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references vs_matches(id) on delete cascade,
  round integer not null,
  artwork_id text not null references artworks(id),
  question_type question_type not null,
  options text[] not null,
  correct_answer text not null,
  created_at timestamptz not null default now(),
  unique (match_id, round)
);

create table if not exists vs_match_answers (
  question_id uuid not null references vs_match_questions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  answer text,
  is_correct boolean not null default false,
  answered_at timestamptz not null default now(),
  primary key (question_id, user_id)
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists quiz_sessions_set_updated_at on quiz_sessions;
create trigger quiz_sessions_set_updated_at
before update on quiz_sessions
for each row
execute function set_updated_at();

alter table artists enable row level security;
alter table movements enable row level security;
alter table artworks enable row level security;
alter table profiles enable row level security;
alter table favorites enable row level security;
alter table quiz_sessions enable row level security;
alter table quiz_results enable row level security;
alter table vs_matches enable row level security;
alter table vs_match_players enable row level security;
alter table vs_match_questions enable row level security;
alter table vs_match_answers enable row level security;

drop policy if exists "public read artists" on artists;
create policy "public read artists" on artists for select using (true);

drop policy if exists "public read movements" on movements;
create policy "public read movements" on movements for select using (true);

drop policy if exists "public read artworks" on artworks;
create policy "public read artworks" on artworks for select using (true);

drop policy if exists "profiles own row" on profiles;
create policy "profiles own row" on profiles
for all using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "favorites own rows" on favorites;
create policy "favorites own rows" on favorites
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "quiz sessions own rows" on quiz_sessions;
create policy "quiz sessions own rows" on quiz_sessions
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "quiz results own rows" on quiz_results;
create policy "quiz results own rows" on quiz_results
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "vs matches read for participants" on vs_matches;
create policy "vs matches read for participants" on vs_matches
for select using (
  created_by = auth.uid()
  or exists (
    select 1 from vs_match_players
    where vs_match_players.match_id = vs_matches.id
      and vs_match_players.user_id = auth.uid()
  )
);

drop policy if exists "vs matches create own" on vs_matches;
create policy "vs matches create own" on vs_matches
for insert with check (created_by = auth.uid());

drop policy if exists "vs players own rows" on vs_match_players;
create policy "vs players own rows" on vs_match_players
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "vs questions participants read" on vs_match_questions;
create policy "vs questions participants read" on vs_match_questions
for select using (
  exists (
    select 1 from vs_match_players
    where vs_match_players.match_id = vs_match_questions.match_id
      and vs_match_players.user_id = auth.uid()
  )
);

drop policy if exists "vs answers own rows" on vs_match_answers;
create policy "vs answers own rows" on vs_match_answers
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);
