# Ticket 0003 — Central de Agentes (feed de execuções, tempo real mockado)

- **Fase:** 0/1 (prepara a Fase 1 — Dashboard/Central de Agentes/Realtime)
- **Responsável:** Codex
- **Depende de:** [0001](0001-frontend-nextjs-scaffold-design-system.md), [0002](0002-frontend-login-dashboard-shell.md)

## Contexto

A rota `/agentes` já existe como placeholder genérico em `apps/web/app/(dashboard)/[section]/page.tsx` (item "Central de Agentes" já está no nav de `apps/web/app/(dashboard)/layout.tsx`). Este ticket cria uma rota dedicada `apps/web/app/(dashboard)/agentes/page.tsx` — o Next.js App Router prioriza automaticamente a rota estática sobre a dinâmica `[section]`, então basta criar o arquivo, sem tocar no catch-all.

Assim como no ticket 0002 (`AuthClient` mockado), a integração real com Supabase Realtime é feita depois, em paralelo, por Claude. Para não bloquear, o contrato de dados abaixo **espelha exatamente** as colunas de `supabase/migrations/20260713120000_create_canaltopfy_schema.sql` (tabela `canaltopfy.agent_runs`) — quando a implementação real substituir o mock, os componentes de tela não devem precisar mudar.

Siga o mesmo padrão já estabelecido em `apps/web/lib/auth/` (`types.ts` + `mock-client.ts` com classe `Mock*Client` + `context.tsx` com Provider/hook + registro em `apps/web/app/providers.tsx`) e cubra com testes como em `apps/web/lib/auth/mock-client.test.ts`.

## Contrato de dados

Criar `apps/web/lib/agent-runs/types.ts`:

```ts
export type AgentRunStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

export interface AgentRun {
  id: string;
  agentName: string;
  status: AgentRunStatus;
  progress: number; // 0-100, espelha `progress` (smallint) no banco
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  messages: string[];
  error: string | null;
  result: unknown | null;
  startedAt: string | null; // ISO timestamp
  finishedAt: string | null; // ISO timestamp
  createdAt: string; // ISO timestamp
}

export interface AgentRunsClient {
  list(): Promise<AgentRun[]>;
  subscribe(onChange: (runs: AgentRun[]) => void): () => void; // retorna função de unsubscribe
}
```

`MockAgentRunsClient` (em `apps/web/lib/agent-runs/mock-client.ts`): gerar 6–8 runs cobrindo todos os status (`agentName` usando os nomes reais de `docs/ARCHITECTURE.md`: `ScoutWorker`, `NormalizerWorker`, `RankingWorker`, `ContentWorker`, `PublisherWorker`, `GrowthWorker`, `AnalyticsWorker`, `MonitorWorker`). A cada ~2s, simular progresso: runs `running` avançam `progress`, eventualmente terminam (`succeeded` ou `failed`, ocasionalmente com `error` preenchido), e um novo run `queued` aparece — chamando os callbacks registrados via `subscribe`. Isso simula o formato de evento que o Supabase Realtime vai entregar depois.

## Arquivos

- `apps/web/lib/agent-runs/types.ts`, `apps/web/lib/agent-runs/mock-client.ts`, `apps/web/lib/agent-runs/mock-client.test.ts`, `apps/web/lib/agent-runs/context.tsx` (`AgentRunsProvider` + `useAgentRuns()`, mesmo formato de `apps/web/lib/auth/context.tsx`).
- `apps/web/app/providers.tsx` — registrar `AgentRunsProvider` com `MockAgentRunsClient`, ao lado do `AuthProvider` já existente.
- `apps/web/components/agents/agent-status-badge.tsx` — cor/ícone por status (`queued` neutro, `running` azul/pulsante, `succeeded` verde, `failed` vermelho, `cancelled` cinza).
- `apps/web/components/agents/agent-run-progress.tsx` — barra de progresso real (0–100 vindo do dado, nunca CSS animado sem relação ao valor).
- `apps/web/components/agents/agent-run-table.tsx` (ou cards em telas estreitas — usar os breakpoints já definidos no Design System) — colunas: agente, status, progresso, tokens (input/output), custo (USD), início/duração, erro (quando houver).
- `apps/web/app/(dashboard)/agentes/page.tsx` — consome `useAgentRuns()`, renderiza a tabela/cards com estados vazio/carregando/erro.

## Riscos

- Não implementar paginação/virtualização ainda — poucos itens mockados, YAGNI por ora; deixar anotado como próximo passo quando o volume real justificar.
- Não criar nenhum client real do Supabase neste ticket (isso é integração de Claude, em paralelo).
- Manter o nome da rota (`/agentes`) e o label do nav ("Central de Agentes") inalterados — já estão em `apps/web/app/(dashboard)/layout.tsx`.
- `costUsd` deve ser formatado como moeda (USD) na UI — não exibir número cru.

## Plano

1. Criar `types.ts` espelhando as colunas de `canaltopfy.agent_runs`.
2. Criar `MockAgentRunsClient` com o simulador de progresso incremental (intervalo, não polling agressivo — ~2s é suficiente).
3. Criar `AgentRunsProvider`/`useAgentRuns()` seguindo o padrão de `lib/auth/context.tsx`.
4. Registrar o provider em `app/providers.tsx`.
5. Construir os componentes de UI (badge, barra de progresso, tabela/cards).
6. Criar `apps/web/app/(dashboard)/agentes/page.tsx` consumindo tudo isso.
7. Cobrir `mock-client.ts` com teste (igual ao padrão de `auth/mock-client.test.ts`).

## Critério de aceite

- [ ] Acessar `/agentes` (autenticado) mostra a lista de execuções de agentes, não mais o placeholder genérico "em construção".
- [ ] Barras de progresso avançam sozinhas a cada poucos segundos sem reload de página (simulação de realtime).
- [ ] Badges de status com cor/ícone distintos por status.
- [ ] Estados vazio/carregando/erro implementados (mesmo que o mock raramente produza erro/vazio — testável forçando esses casos no teste unitário).
- [ ] Nenhum componente de tela importa `mock-client.ts` diretamente — só via `useAgentRuns()`.
- [ ] `pnpm --filter web lint`, `pnpm --filter web build` e os testes passam.
