-- Fase 0 — schema dedicado do CanalTopfy OS.
--
-- Este projeto Supabase é COMPARTILHADO com TopFY_retrogames (ver
-- docs/ARCHITECTURE.md, "Decisões já tomadas"). Todo objeto do CanalTopfy
-- vive no schema `canaltopfy`, nunca em `public`, para não colidir com as
-- tabelas de TopFY_retrogames.
--
-- Após aplicar esta migration, expor o schema `canaltopfy` na API:
-- Dashboard > Project Settings > API > Exposed schemas > adicionar
-- "canaltopfy" (por padrão o PostgREST só expõe "public"/"graphql_public").

create extension if not exists pgcrypto;

create schema if not exists canaltopfy;

-- === profiles ===============================================================
-- Dados de aplicação do usuário (não confundir com auth.users, gerenciada
-- pelo Supabase Auth).

create table canaltopfy.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

alter table canaltopfy.profiles enable row level security;
alter table canaltopfy.profiles force row level security;

create policy "profiles_select_own"
  on canaltopfy.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on canaltopfy.profiles for update
  using (auth.uid() = id);

-- Cria o profile automaticamente quando um usuário se registra via Supabase Auth.
create function canaltopfy.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = canaltopfy, public
as $$
begin
  insert into canaltopfy.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function canaltopfy.handle_new_user();

-- === agent_runs ==============================================================
-- Observabilidade obrigatória de agentes (ver PROJECT_CHARTER.md, seção 5):
-- status, progresso, tokens, custo, mensagens, erros e resultado de cada
-- execução de agente/worker. Escrito pelos Workers via service role key
-- (que ignora RLS); lido pelo frontend via Supabase Realtime.

create table canaltopfy.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  agent_name text not null,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  progress smallint not null default 0
    check (progress between 0 and 100),
  tokens_input integer not null default 0,
  tokens_output integer not null default 0,
  cost_usd numeric(10, 4) not null default 0,
  messages jsonb not null default '[]'::jsonb,
  error text,
  result jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

alter table canaltopfy.agent_runs enable row level security;
alter table canaltopfy.agent_runs force row level security;

-- Somente leitura para o dono do run a partir do client (authenticated).
-- Insert/update são feitos pelos Workers com a service role key, que
-- ignora RLS por padrão — por isso não há policy de insert/update aqui.
create policy "agent_runs_select_own"
  on canaltopfy.agent_runs for select
  using (auth.uid() = user_id);

create index agent_runs_user_id_idx on canaltopfy.agent_runs (user_id);
create index agent_runs_status_idx on canaltopfy.agent_runs (status);
