create table if not exists vs_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text unique not null,
  status text not null default 'waiting',
  created_by uuid references auth.users(id) on delete cascade,
  winner_user_id uuid references auth.users(id),
  current_round int default 1,
  total_rounds int default 5,
  created_at timestamptz default now(),
  started_at timestamptz,
  finished_at timestamptz,
  constraint vs_rooms_status_check check (status in ('waiting', 'active', 'completed', 'cancelled')),
  constraint vs_rooms_rounds_check check (current_round >= 1 and total_rounds >= 1)
);

create table if not exists vs_room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references vs_rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  score int default 0,
  joined_at timestamptz default now(),
  unique(room_id, user_id)
);

create table if not exists vs_rounds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references vs_rooms(id) on delete cascade,
  round_number int not null,
  question_id text not null,
  created_at timestamptz default now(),
  unique(room_id, round_number)
);

create table if not exists vs_answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references vs_rooms(id) on delete cascade,
  round_id uuid references vs_rounds(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  selected_option text not null,
  is_correct boolean not null,
  response_time_ms int,
  points_earned int default 0,
  answered_at timestamptz default now(),
  unique(round_id, user_id)
);

create index if not exists vs_room_players_room_id_idx on vs_room_players(room_id);
create index if not exists vs_rounds_room_id_idx on vs_rounds(room_id);
create index if not exists vs_answers_room_id_idx on vs_answers(room_id);
create index if not exists vs_answers_round_id_idx on vs_answers(round_id);

alter table vs_rooms enable row level security;
alter table vs_room_players enable row level security;
alter table vs_rounds enable row level security;
alter table vs_answers enable row level security;

create or replace function is_vs_room_participant(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from vs_room_players
    where room_id = target_room_id
      and user_id = auth.uid()
  );
$$;

create or replace function vs_room_player_count(target_room_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from vs_room_players
  where room_id = target_room_id;
$$;

drop policy if exists "vs rooms read participants" on vs_rooms;
create policy "vs rooms read participants" on vs_rooms
for select using (
  created_by = auth.uid()
  or is_vs_room_participant(id)
);

drop policy if exists "vs rooms create own" on vs_rooms;
create policy "vs rooms create own" on vs_rooms
for insert with check (created_by = auth.uid());

drop policy if exists "vs rooms creator starts" on vs_rooms;
create policy "vs rooms creator starts" on vs_rooms
for update using (created_by = auth.uid() and status = 'waiting')
with check (created_by = auth.uid() and status = 'active');

drop policy if exists "vs players read participants" on vs_room_players;
create policy "vs players read participants" on vs_room_players
for select using (is_vs_room_participant(room_id));

drop policy if exists "vs players insert own waiting room" on vs_room_players;
create policy "vs players insert own waiting room" on vs_room_players
for insert with check (
  user_id = auth.uid()
  and exists (
    select 1
    from vs_rooms
    where vs_rooms.id = room_id
      and vs_rooms.status = 'waiting'
  )
  and vs_room_player_count(room_id) < 2
);

drop policy if exists "vs rounds read participants" on vs_rounds;
create policy "vs rounds read participants" on vs_rounds
for select using (is_vs_room_participant(room_id));

drop policy if exists "vs rounds creator inserts" on vs_rounds;
create policy "vs rounds creator inserts" on vs_rounds
for insert with check (
  exists (
    select 1
    from vs_rooms
    where vs_rooms.id = room_id
      and vs_rooms.created_by = auth.uid()
      and vs_rooms.status in ('waiting', 'active')
  )
);

drop policy if exists "vs answers read participants" on vs_answers;
create policy "vs answers read participants" on vs_answers
for select using (is_vs_room_participant(room_id));

drop policy if exists "vs answers insert own active room" on vs_answers;
create policy "vs answers insert own active room" on vs_answers
for insert with check (
  user_id = auth.uid()
  and is_vs_room_participant(room_id)
  and exists (
    select 1
    from vs_rooms
    where vs_rooms.id = room_id
      and vs_rooms.status <> 'completed'
      and vs_rooms.finished_at is null
  )
  and exists (
    select 1
    from vs_rounds
    inner join vs_rooms on vs_rooms.id = vs_rounds.room_id
    where vs_rounds.id = round_id
      and vs_rounds.room_id = vs_answers.room_id
      and vs_rounds.round_number = vs_rooms.current_round
  )
);

create or replace function join_vs_room(p_room_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_room_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select id into target_room_id
  from vs_rooms
  where room_code = upper(trim(p_room_code))
    and status = 'waiting'
  limit 1;

  if target_room_id is null then
    raise exception 'Room not found or already started';
  end if;

  if (
    select count(*)
    from vs_room_players
    where room_id = target_room_id
  ) >= 2 and not exists (
    select 1
    from vs_room_players
    where room_id = target_room_id
      and user_id = auth.uid()
  ) then
    raise exception 'Room is full';
  end if;

  insert into vs_room_players (room_id, user_id)
  values (target_room_id, auth.uid())
  on conflict (room_id, user_id) do nothing;

  return target_room_id;
end;
$$;

create or replace function submit_vs_answer(
  p_room_id uuid,
  p_round_id uuid,
  p_selected_option text,
  p_is_correct boolean,
  p_response_time_ms int default null,
  p_points_earned int default 0
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_answer_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not is_vs_room_participant(p_room_id) then
    raise exception 'Only participants can answer';
  end if;

  if not exists (
    select 1
    from vs_rooms
    where id = p_room_id
      and status = 'active'
      and finished_at is null
  ) then
    return false;
  end if;

  if not exists (
    select 1
    from vs_rounds
    inner join vs_rooms on vs_rooms.id = vs_rounds.room_id
    where vs_rounds.id = p_round_id
      and vs_rounds.room_id = p_room_id
      and vs_rounds.round_number = vs_rooms.current_round
  ) then
    raise exception 'Round is not active for room';
  end if;

  insert into vs_answers (
    room_id,
    round_id,
    user_id,
    selected_option,
    is_correct,
    response_time_ms,
    points_earned
  )
  values (
    p_room_id,
    p_round_id,
    auth.uid(),
    p_selected_option,
    p_is_correct,
    p_response_time_ms,
    greatest(p_points_earned, 0)
  )
  on conflict (round_id, user_id) do nothing
  returning id into inserted_answer_id;

  if inserted_answer_id is null then
    return false;
  end if;

  update vs_room_players
  set score = score + greatest(p_points_earned, 0)
  where room_id = p_room_id
    and user_id = auth.uid();

  return true;
end;
$$;

create or replace function advance_vs_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  room_record vs_rooms%rowtype;
  player_count int;
  answer_count int;
  winning_user_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not is_vs_room_participant(p_room_id) then
    raise exception 'Only participants can advance a room';
  end if;

  select * into room_record
  from vs_rooms
  where id = p_room_id
  for update;

  if room_record.id is null or room_record.status <> 'active' then
    return;
  end if;

  select count(*) into player_count
  from vs_room_players
  where room_id = p_room_id;

  if player_count < 2 then
    return;
  end if;

  select count(*) into answer_count
  from vs_answers
  inner join vs_rounds on vs_rounds.id = vs_answers.round_id
  where vs_answers.room_id = p_room_id
    and vs_rounds.round_number = room_record.current_round;

  if answer_count < player_count then
    return;
  end if;

  if room_record.current_round < room_record.total_rounds then
    update vs_rooms
    set current_round = room_record.current_round + 1
    where id = p_room_id
      and status = 'active'
      and current_round = room_record.current_round;

    return;
  end if;

  select user_id into winning_user_id
  from vs_room_players
  where room_id = p_room_id
  order by score desc, joined_at asc
  limit 1;

  update vs_rooms
  set status = 'completed',
      winner_user_id = winning_user_id,
      finished_at = coalesce(finished_at, now())
  where id = p_room_id
    and status = 'active';
end;
$$;

grant execute on function join_vs_room(text) to authenticated;
grant execute on function submit_vs_answer(uuid, uuid, text, boolean, int, int) to authenticated;
grant execute on function advance_vs_room(uuid) to authenticated;

notify pgrst, 'reload schema';
