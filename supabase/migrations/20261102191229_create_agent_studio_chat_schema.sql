create table public.team_chat_rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  created_at timestamptz not null default now(),
  constraint team_chat_rooms_slug_check check (
    slug = 'main' or slug in (
      'agent-problem-analyst',
      'agent-implementation-engineer',
      'agent-fast-task-engineer',
      'agent-visual-reviewer',
      'agent-long-horizon-engineer',
      'agent-qa-engineer',
      'agent-security-auditor',
      'agent-project-lead'
    )
  )
);

create table public.team_chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.team_chat_rooms(id) on delete cascade,
  run_id uuid,
  role text not null check (role in ('user', 'agent', 'assistant')),
  agent_id text check (agent_id is null or agent_id in (
    'problem-analyst', 'implementation-engineer', 'fast-task-engineer',
    'visual-reviewer', 'long-horizon-engineer', 'qa-engineer',
    'security-auditor', 'project-lead'
  )),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.team_chat_runs (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.team_chat_rooms(id) on delete cascade,
  prompt_message_id uuid not null references public.team_chat_messages(id) on delete restrict,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  stage text,
  progress integer not null default 0 check (progress between 0 and 100),
  error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

alter table public.team_chat_messages
  add constraint team_chat_messages_run_id_fkey
  foreign key (run_id) references public.team_chat_runs(id) on delete set null;

create table public.team_chat_agent_runs (
  run_id uuid not null references public.team_chat_runs(id) on delete cascade,
  agent_id text not null check (agent_id in (
    'problem-analyst', 'implementation-engineer', 'fast-task-engineer',
    'visual-reviewer', 'long-horizon-engineer', 'qa-engineer',
    'security-auditor', 'project-lead'
  )),
  model_id text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'skipped')),
  status_text text,
  progress integer not null default 0 check (progress between 0 and 100),
  response text,
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  primary key (run_id, agent_id)
);

create table public.team_chat_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.team_chat_runs(id) on delete cascade,
  agent_id text check (agent_id is null or agent_id in (
    'problem-analyst', 'implementation-engineer', 'fast-task-engineer',
    'visual-reviewer', 'long-horizon-engineer', 'qa-engineer',
    'security-auditor', 'project-lead'
  )),
  event_type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index team_chat_messages_room_created_idx
  on public.team_chat_messages (room_id, created_at desc);
create index team_chat_messages_run_created_idx
  on public.team_chat_messages (run_id, created_at desc);
create index team_chat_runs_room_created_idx
  on public.team_chat_runs (room_id, created_at desc);
create index team_chat_events_run_created_idx
  on public.team_chat_events (run_id, created_at desc);

alter table public.team_chat_rooms enable row level security;
alter table public.team_chat_messages enable row level security;
alter table public.team_chat_runs enable row level security;
alter table public.team_chat_agent_runs enable row level security;
alter table public.team_chat_events enable row level security;

revoke all on table public.team_chat_rooms from public, anon, authenticated;
revoke all on table public.team_chat_messages from public, anon, authenticated;
revoke all on table public.team_chat_runs from public, anon, authenticated;
revoke all on table public.team_chat_agent_runs from public, anon, authenticated;
revoke all on table public.team_chat_events from public, anon, authenticated;

grant select, insert, update, delete on table public.team_chat_rooms to service_role;
grant select, insert, update, delete on table public.team_chat_messages to service_role;
grant select, insert, update, delete on table public.team_chat_runs to service_role;
grant select, insert, update, delete on table public.team_chat_agent_runs to service_role;
grant select, insert, update, delete on table public.team_chat_events to service_role;

insert into public.team_chat_rooms (slug, title) values
  ('main', 'غرفة فريق UTILORA'),
  ('agent-problem-analyst', 'محادثة خاصة · Problem Analyst'),
  ('agent-implementation-engineer', 'محادثة خاصة · Implementation Engineer'),
  ('agent-fast-task-engineer', 'محادثة خاصة · Fast Task Engineer'),
  ('agent-visual-reviewer', 'محادثة خاصة · Visual Reviewer'),
  ('agent-long-horizon-engineer', 'محادثة خاصة · Long Horizon Engineer'),
  ('agent-qa-engineer', 'محادثة خاصة · QA Engineer'),
  ('agent-security-auditor', 'محادثة خاصة · Security Auditor'),
  ('agent-project-lead', 'محادثة خاصة · Project Lead')
on conflict (slug) do update set title = excluded.title;
