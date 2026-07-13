# Supabase — CanalTopfy OS

Este projeto **reaproveita o mesmo projeto Supabase Cloud usado por TopFY_retrogames** (ver `docs/ARCHITECTURE.md`, "Decisões já tomadas") — não criamos um projeto novo. Todo objeto do CanalTopfy vive isolado no schema `canaltopfy`, nunca em `public`, para não colidir com as tabelas de TopFY_retrogames.

## Aplicar a migration inicial (Fase 0)

Ainda não temos as credenciais do projeto compartilhado nem o Supabase CLI instalado neste ambiente. Duas formas de aplicar `migrations/20260713120000_create_canaltopfy_schema.sql`:

**Opção A — SQL Editor (mais rápido, sem CLI):**
1. Abrir o projeto Supabase (o mesmo do TopFY_retrogames) no Dashboard.
2. SQL Editor → colar o conteúdo do arquivo de migration → Run.
3. **Importante:** Project Settings → API → **Exposed schemas** → adicionar `canaltopfy` (por padrão o PostgREST só expõe `public`/`graphql_public` — sem isso, o client Supabase não consegue ler as tabelas deste schema).

**Opção B — Supabase CLI (recomendado a partir daqui em diante):**
```bash
supabase login
supabase link --project-ref <ref-do-projeto-compartilhado>
supabase db push
```

## Dados de desenvolvimento (Fase 1)

Depois da migration aplicada e de existir pelo menos um usuário (signup normal via Supabase Auth), rodar `seed.sql` (SQL Editor ou `supabase db execute -f supabase/seed.sql` / incluso automaticamente em `supabase db reset` local) para popular `canaltopfy.agent_runs` com o mesmo dataset usado no mock do frontend (`apps/web/lib/agent-runs/mock-client.ts`) — satisfaz a Fase 1 ("dados simulados persistidos... não mock no front").

## Pendências

- Credenciais do projeto (URL, anon key, service role key) ainda não foram compartilhadas neste ambiente — necessárias para configurar `apps/web` (client Supabase) e os Workers (service role, para escrever em `agent_runs` ignorando RLS).
- `supabase/config.toml` ainda não foi gerado — rodar `supabase init` (com o CLI instalado) para criar a config de dev local oficial, em vez de escrevê-la à mão.
- Nenhum comando deste README foi executado neste ambiente (sem Supabase CLI disponível) — validar antes de assumir que a migration aplica sem erro.
