-- Seed de desenvolvimento para canaltopfy.agent_runs — NUNCA rodar em produção.
-- Satisfaz a Fase 1 ("dados simulados persistidos (seed real no banco, não
-- mock no front)" — ver PROJECT_CHARTER.md, seção 8).
--
-- Requer pelo menos um usuário já criado via Supabase Auth (signup normal)
-- antes de rodar este seed — associamos os agent_runs ao primeiro usuário
-- encontrado em auth.users. Os valores espelham exatamente o dataset mockado
-- usado no frontend (apps/web/lib/agent-runs/mock-client.ts) para que a
-- troca do mock pela leitura real via Supabase não mude o que aparece na tela.

do $$
declare
  seed_user_id uuid;
begin
  select id into seed_user_id from auth.users order by created_at asc limit 1;

  if seed_user_id is null then
    raise notice 'Nenhum usuário encontrado em auth.users — crie uma conta via signup antes de rodar este seed.';
    return;
  end if;

  insert into canaltopfy.agent_runs
    (user_id, agent_name, status, progress, tokens_input, tokens_output, cost_usd, messages, error, result, started_at, finished_at, created_at)
  values
    (seed_user_id, 'ScoutWorker', 'succeeded', 100, 942, 301, 0.0089, '["Oportunidades capturadas."]'::jsonb, null, '{"productsFound": 18}'::jsonb, now() - interval '42 minutes', now() - interval '39 minutes', now() - interval '42 minutes'),
    (seed_user_id, 'NormalizerWorker', 'running', 64, 538, 174, 0.0047, '["Normalizando atributos de produto."]'::jsonb, null, null, now() - interval '34 minutes', null, now() - interval '34 minutes'),
    (seed_user_id, 'RankingWorker', 'queued', 0, 0, 0, 0, '["Aguardando normalização dos produtos."]'::jsonb, null, null, null, null, now() - interval '28 minutes'),
    (seed_user_id, 'ContentWorker', 'failed', 68, 1830, 622, 0.0154, '["A geração foi interrompida."]'::jsonb, 'O provedor não respondeu dentro do limite configurado.', null, now() - interval '24 minutes', now() - interval '21 minutes', now() - interval '24 minutes'),
    (seed_user_id, 'PublisherWorker', 'cancelled', 42, 312, 86, 0.0021, '["Execução cancelada pelo operador."]'::jsonb, null, null, now() - interval '16 minutes', now() - interval '15 minutes', now() - interval '16 minutes'),
    (seed_user_id, 'GrowthWorker', 'succeeded', 100, 1204, 487, 0.0118, '["Recomendações geradas."]'::jsonb, null, '{"recommendations": 4}'::jsonb, now() - interval '9 minutes', now() - interval '7 minutes', now() - interval '9 minutes'),
    (seed_user_id, 'AnalyticsWorker', 'running', 31, 846, 215, 0.0062, '["Consolidando sinais de desempenho."]'::jsonb, null, null, now() - interval '2 minutes', null, now() - interval '2 minutes'),
    (seed_user_id, 'MonitorWorker', 'queued', 0, 0, 0, 0, '["Aguardando capacidade disponível."]'::jsonb, null, null, null, null, now() - interval '1 minute');
end $$;
