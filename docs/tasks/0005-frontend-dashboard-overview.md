# Ticket 0005 — Dashboard (visão geral): KPIs, gráfico e atividade recente

- **Fase:** 1 (Aplicação Online — completa o item "Dashboard" do roadmap, junto com a Central de Agentes já feita no ticket 0003)
- **Responsável:** Codex
- **Depende de:** [0001](0001-frontend-nextjs-scaffold-design-system.md), [0002](0002-frontend-login-dashboard-shell.md), [0003](0003-frontend-central-de-agentes.md), [0004](0004-formatting-and-review-followups.md)

## Contexto

`apps/web/app/(dashboard)/dashboard/page.tsx` hoje é só o placeholder da Fase 0 ("Seu centro de operações está pronto para receber dados reais... nenhum dado operacional é simulado aqui"). Este ticket substitui esse placeholder pela visão geral real da Fase 1.

**Não criar nenhum client/mock novo.** Toda a tela deve derivar de `useAgentRuns()` (já existe em `apps/web/lib/agent-runs/context.tsx`, retorna `{ runs, state, error }`) — é o mesmo dado que alimenta a Central de Agentes (`/agentes`). Isso é reuso de contrato, não duplicação (ver `AGENTS.md`, "Ordem de prioridade de recursos").

**Não inventar KPIs de áreas que ainda não existem** (Radar, Growth, Analytics são fases futuras) — os indicadores desta tela são só sobre execução de agentes, que é o único subsistema real até agora. Mantenha a mesma transparência do placeholder atual e do padrão já usado no login (“sessão temporária”): deixe claro na UI que os números vêm de dados simulados de desenvolvimento (mesmo texto/estilo de aviso já usado em outras telas), até a Fase 1 ligar o Supabase de verdade.

## Objetivo

Construir a visão geral do Dashboard com:
1. **KPI cards**: total de execuções, execuções em andamento agora, sucesso hoje, falhas hoje, custo total (USD, formatado como moeda), tokens totais (input+output).
2. **Gráfico** (usar `recharts` — já era dependência do scaffold original, ainda não está em `apps/web/package.json`, precisa adicionar): evolução do custo acumulado ou contagem de execuções por status ao longo do tempo, derivado de `runs`.
3. **Atividade recente**: lista das últimas execuções/mudanças de status, ordenadas por mais recente, reaproveitando `AgentStatusBadge` já criado no ticket 0003 (não recriar um badge novo).

## Arquivos

- `apps/web/package.json` — adicionar `recharts`.
- `apps/web/lib/agent-runs/selectors.ts` (novo) — funções puras e testáveis que recebem `AgentRun[]` e retornam os KPIs/série do gráfico/lista de atividade recente. Nenhuma lógica de agregação deve viver dentro de JSX/componentes.
- `apps/web/lib/agent-runs/selectors.test.ts` — testes unitários dessas funções (casos: lista vazia, todos succeeded, mistura de status).
- `apps/web/components/dashboard/kpi-card.tsx`, `apps/web/components/dashboard/agent-activity-chart.tsx`, `apps/web/components/dashboard/recent-activity-list.tsx`.
- `apps/web/app/(dashboard)/dashboard/page.tsx` — substituir o placeholder, consumindo `useAgentRuns()` + os seletores acima.

## Riscos

- Reaproveitar `AgentStatusBadge`/`AgentRunProgress` do ticket 0003 em vez de recriar componentes semelhantes (ver `AGENTS.md`, "Component Reuse").
- Tratar os 3 estados de `useAgentRuns()` (`loading`/`empty`/`error`), não só o caminho feliz.
- `costUsd` sempre formatado como moeda; não exibir número cru em nenhum KPI.
- Não remover o aviso de "dados simulados" — só atualizar o texto para refletir que agora há KPIs/gráfico reais (calculados de verdade), mas sobre dados de desenvolvimento simulados (a mesma distinção já usada em outras telas).

## Plano

1. Adicionar `recharts` como dependência.
2. Criar `selectors.ts` com as funções de agregação (KPIs, série temporal, atividade recente) + testes.
3. Criar `KpiCard`, `AgentActivityChart` (recharts) e `RecentActivityList`.
4. Reescrever `dashboard/page.tsx` consumindo `useAgentRuns()` + selectors, tratando loading/empty/error.
5. Rodar lint/typecheck/build/test.

## Critério de aceite

- [ ] `/dashboard` mostra KPIs reais derivados de `runs` (não números fixos no JSX).
- [ ] Gráfico renderiza com `recharts` a partir dos dados de `useAgentRuns()`.
- [ ] Lista de atividade recente ordenada por mais recente, usando `AgentStatusBadge` já existente.
- [ ] Estados loading/empty/error de `useAgentRuns()` tratados na tela.
- [ ] Lógica de agregação isolada em `selectors.ts`, coberta por testes unitários.
- [ ] `pnpm --filter web lint`, `typecheck`, `build`, `test` passam.
