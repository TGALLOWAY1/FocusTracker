-- Focus Ladder — initial schema (M1)
-- One file per the plan; safe to re-run via `drop schema public cascade; create schema public;` in dev.
--
-- Conventions:
--   * UUIDs come from the client (crypto.randomUUID()); server defaults exist only for inserts that omit the id.
--   * Timestamps are timestamptz; epoch-ms in the client is converted in src/lib/dbDates.ts.
--   * Every user-owned table carries user_id with FK to auth.users and a single RLS policy `auth.uid() = user_id`.
--   * project_id in focus_sessions is uuid WITHOUT an FK — sessions outlive project deletes (project_name snapshot).

-- ---------------------------------------------------------------------------
-- focus_sessions / focus_reflections
-- ---------------------------------------------------------------------------

create table public.focus_sessions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  project_id            uuid,
  project_name          text not null,
  task                  text not null,
  started_at            timestamptz not null,
  ended_at              timestamptz not null,
  planned_duration_sec  integer not null check (planned_duration_sec >= 0),
  actual_duration_sec   integer not null check (actual_duration_sec  >= 0),
  completed_naturally   boolean not null,
  activity_category     text not null check (activity_category in
    ('coding','learning','planning','reading','design','music','other')),
  session_type          text not null check (session_type in ('deep','light','learning')),
  tags                  text[] not null default '{}',
  created_at            timestamptz not null default now()
);
create index focus_sessions_user_ended_idx  on public.focus_sessions (user_id, ended_at desc);
create index focus_sessions_user_project_idx on public.focus_sessions (user_id, project_id);

alter table public.focus_sessions enable row level security;
create policy "own focus_sessions" on public.focus_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.focus_reflections (
  session_id        uuid primary key references public.focus_sessions(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  focus_level       smallint not null check (focus_level  between 0 and 5),
  energy_level      smallint not null check (energy_level between 0 and 5),
  reflection        text,
  completed_planned boolean not null,
  created_at        timestamptz not null default now()
);
create index focus_reflections_user_idx on public.focus_reflections (user_id);

alter table public.focus_reflections enable row level security;
create policy "own focus_reflections" on public.focus_reflections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- projects (+ children)
-- ---------------------------------------------------------------------------

create table public.projects (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  name                  text not null,
  description           text not null default '',
  category              text not null default '',
  status                text not null check (status in ('active','on-hold','completed','archived')),
  tags                  text[] not null default '{}',
  weekly_minutes        integer not null default 0,
  weekly_goal_minutes   integer not null default 600,
  progress_percent      integer not null default 0 check (progress_percent between 0 and 100),
  color                 text not null,
  icon_key              text not null,
  activity_category     text not null check (activity_category in
    ('coding','learning','planning','reading','design','music','other')),
  cover                 jsonb not null,
  links                 jsonb not null default '[]'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index projects_user_updated_idx on public.projects (user_id, updated_at desc);

alter table public.projects enable row level security;
create policy "own projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.project_tasks (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  completed  boolean not null default false,
  category   text,
  due_date   date,
  created_at timestamptz not null default now()
);
create index project_tasks_project_idx on public.project_tasks (project_id);

alter table public.project_tasks enable row level security;
create policy "own project_tasks" on public.project_tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.project_notes (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  body       text not null default '',
  pinned     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index project_notes_project_idx on public.project_notes (project_id);

alter table public.project_notes enable row level security;
create policy "own project_notes" on public.project_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.project_manual_entries (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  minutes    integer not null check (minutes > 0),
  note       text,
  added_at   timestamptz not null default now()
);
create index project_manual_project_idx on public.project_manual_entries (project_id, added_at desc);

alter table public.project_manual_entries enable row level security;
create policy "own project_manual_entries" on public.project_manual_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.project_events (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null,
  title      text not null,
  at         timestamptz not null default now()
);
create index project_events_project_at_idx on public.project_events (project_id, at desc);

alter table public.project_events enable row level security;
create policy "own project_events" on public.project_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- learning_notes
-- ---------------------------------------------------------------------------

create table public.learning_notes (
  user_id          uuid not null references auth.users(id) on delete cascade,
  subtopic_id      text not null,
  user_paragraphs  jsonb not null default '[]'::jsonb,
  updated_at       timestamptz not null default now(),
  primary key (user_id, subtopic_id)
);

alter table public.learning_notes enable row level security;
create policy "own learning_notes" on public.learning_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- ideas
-- ---------------------------------------------------------------------------

create table public.ideas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  text       text not null,
  status     text not null check (status in ('Future Idea','Maybe Later','Incubating')),
  created_at timestamptz not null default now()
);
create index ideas_user_created_idx on public.ideas (user_id, created_at desc);

alter table public.ideas enable row level security;
create policy "own ideas" on public.ideas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- focus_state (singleton per user)
-- ---------------------------------------------------------------------------

create table public.focus_state (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  project_id       uuid,
  task             text not null default '',
  duration_sec     integer not null default 2100 check (duration_sec > 0),
  flags            jsonb not null default
    '{"focusMode":true,"notificationsMuted":true,"distractionsBlocked":true}'::jsonb,
  current_tier_id  smallint not null default 1 check (current_tier_id between 1 and 6),
  xp               integer not null default 0 check (xp >= 0),
  daily_plan       jsonb,
  updated_at       timestamptz not null default now()
);

alter table public.focus_state enable row level security;
create policy "own focus_state" on public.focus_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- handle_new_user: seed only the focus_state row on signup.
-- Empty workspace by design (per locked-in user decision); onboarding wizard
-- handles first-project creation in M3.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.focus_state (user_id) values (new.id)
    on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
