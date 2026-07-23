-- AI Application Engineering Academy
-- Run this file once in Supabase Dashboard -> SQL Editor -> New query.
-- It is safe to run repeatedly.

begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  completed_stages jsonb not null default '[]'::jsonb,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id),
  constraint lesson_progress_stages_array check (jsonb_typeof(completed_stages) = 'array')
);

create table if not exists public.exam_results (
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id text not null,
  score integer not null default 0 check (score between 0 and 100),
  passed boolean not null default false,
  attempts integer not null default 0 check (attempts >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, exam_id)
);

create table if not exists public.artifacts (
  user_id uuid not null references auth.users(id) on delete cascade,
  artifact_key text not null,
  artifact_value jsonb not null,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, artifact_key),
  constraint artifact_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = greatest(coalesce(new.updated_at, now()), old.updated_at);
  return new;
end;
$$;

create or replace function public.handle_new_academy_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'learner'), '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_academy_user() from public, anon, authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists lesson_progress_set_updated_at on public.lesson_progress;
create trigger lesson_progress_set_updated_at
before update on public.lesson_progress
for each row execute function public.set_updated_at();

drop trigger if exists exam_results_set_updated_at on public.exam_results;
create trigger exam_results_set_updated_at
before update on public.exam_results
for each row execute function public.set_updated_at();

drop trigger if exists artifacts_set_updated_at on public.artifacts;
create trigger artifacts_set_updated_at
before update on public.artifacts
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created_create_academy_profile on auth.users;
create trigger on_auth_user_created_create_academy_profile
after insert on auth.users
for each row execute function public.handle_new_academy_user();

alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.exam_results enable row level security;
alter table public.artifacts enable row level security;

-- Profiles

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
on public.profiles for delete
to authenticated
using ((select auth.uid()) = id);

-- Lesson progress

drop policy if exists lesson_progress_select_own on public.lesson_progress;
create policy lesson_progress_select_own
on public.lesson_progress for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists lesson_progress_insert_own on public.lesson_progress;
create policy lesson_progress_insert_own
on public.lesson_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists lesson_progress_update_own on public.lesson_progress;
create policy lesson_progress_update_own
on public.lesson_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists lesson_progress_delete_own on public.lesson_progress;
create policy lesson_progress_delete_own
on public.lesson_progress for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Exam results

drop policy if exists exam_results_select_own on public.exam_results;
create policy exam_results_select_own
on public.exam_results for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists exam_results_insert_own on public.exam_results;
create policy exam_results_insert_own
on public.exam_results for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists exam_results_update_own on public.exam_results;
create policy exam_results_update_own
on public.exam_results for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists exam_results_delete_own on public.exam_results;
create policy exam_results_delete_own
on public.exam_results for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Artifacts

drop policy if exists artifacts_select_own on public.artifacts;
create policy artifacts_select_own
on public.artifacts for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists artifacts_insert_own on public.artifacts;
create policy artifacts_insert_own
on public.artifacts for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists artifacts_update_own on public.artifacts;
create policy artifacts_update_own
on public.artifacts for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists artifacts_delete_own on public.artifacts;
create policy artifacts_delete_own
on public.artifacts for delete
to authenticated
using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.lesson_progress to authenticated;
grant select, insert, update, delete on public.exam_results to authenticated;
grant select, insert, update, delete on public.artifacts to authenticated;

commit;
