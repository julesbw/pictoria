alter table vs_room_players
  add column if not exists display_name text;

drop policy if exists "vs players update own display name" on vs_room_players;
create policy "vs players update own display name" on vs_room_players
for update using (
  user_id = auth.uid()
  and exists (
    select 1
    from vs_rooms
    where vs_rooms.id = room_id
      and vs_rooms.status = 'waiting'
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from vs_rooms
    where vs_rooms.id = room_id
      and vs_rooms.status = 'waiting'
  )
);

create or replace function join_vs_room(p_room_code text, p_display_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_room_id uuid;
  normalized_display_name text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  normalized_display_name := nullif(left(trim(coalesce(p_display_name, '')), 40), '');

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

  insert into vs_room_players (room_id, user_id, display_name)
  values (target_room_id, auth.uid(), normalized_display_name)
  on conflict (room_id, user_id) do update
    set display_name = coalesce(excluded.display_name, vs_room_players.display_name);

  return target_room_id;
end;
$$;

grant execute on function join_vs_room(text, text) to authenticated;

notify pgrst, 'reload schema';
