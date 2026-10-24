-- Initial schema for the starter app.
--
-- Creates two tables:
--   public.profiles  one row per user, created automatically when someone signs up
--   public.notes     a simple list of notes per user (used by the Home tab)
--
-- Both tables use Row Level Security (RLS), so each signed-in user can only
-- read and change their own rows. Copy the `notes` section when you add your
-- own tables (see "Add a new table + screen" in the README).


-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- There are no insert or delete policies on purpose: rows are created by the
-- trigger below and removed automatically when the auth user is deleted.


-- Create a profile row every time a new user signs up.
-- `security definer` lets the function write to public.profiles even though the
-- new user has no insert policy. `set search_path = ''` is a security best
-- practice, so every table name inside must be fully qualified (public.profiles).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Only the trigger should run this function, never app users through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- notes
-- ---------------------------------------------------------------------------

create table public.notes (
  id bigint generated always as identity primary key,
  -- Defaults to the signed-in user, so the app only has to send `content`.
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

-- RLS filters every query by user_id, so index it.
create index notes_user_id_idx on public.notes (user_id);

alter table public.notes enable row level security;

create policy "Users can view their own notes"
  on public.notes for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own notes"
  on public.notes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own notes"
  on public.notes for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own notes"
  on public.notes for delete
  to authenticated
  using ((select auth.uid()) = user_id);


-- ---------------------------------------------------------------------------
-- API access
-- ---------------------------------------------------------------------------

-- Some Supabase projects do not expose new tables to the API automatically.
-- These grants make the tables reachable for signed-in users; the RLS policies
-- above still decide which rows each user can see or change.
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.notes to authenticated;
