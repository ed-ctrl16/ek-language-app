-- Row-level security policies for Supabase Auth.
-- The profile row's id IS the auth user id; every other table scopes by user_id.
-- Run after 0001_init.sql. Users are created in the Supabase Auth dashboard;
-- the app writes the matching profile row on first onboarding.

-- users: a user can read/write only their own profile row (id = auth uid)
create policy users_select on users for select using (auth.uid() = id);
create policy users_insert on users for insert with check (auth.uid() = id);
create policy users_update on users for update using (auth.uid() = id) with check (auth.uid() = id);

-- Helper macro pattern repeated per child table (user_id = auth uid).
create policy practice_items_all on practice_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy sessions_all on sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy attempts_all on attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy assessments_all on assessments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy events_all on events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
