# Arquitetura Oficial — CanalTopfy OS

> Complementa [`PROJECT_CHARTER.md`](../PROJECT_CHARTER.md) (visão de produto, roadmap) e [`AGENTS.md`](../AGENTS.md) (workflow). Este é o documento técnico de referência — em caso de divergência com diagramas simplificados em outros documentos, **este arquivo é a fonte da verdade**.

## Missão

Construir uma plataforma SaaS comercial para automação inteligente de marketing de afiliados e criação de conteúdo utilizando IA, baseada em componentes open source, arquitetura modular e agentes especializados.

O CanalTopfy será um **orquestrador de tecnologias**, desenvolvendo apenas os componentes que representam seu diferencial competitivo.

---

## Princípios da Arquitetura

1. Reutilizar antes de desenvolver.
2. Integrar antes de substituir.
3. Modularizar antes de acoplar.
4. Persistir tudo no Supabase.
5. Mostrar tudo no Frontend.
6. IA apenas quando agregar valor.
7. Tokens são recurso limitado.
8. Todo agente é observável.
9. Todo workflow é rastreável.
10. Todo componente deve ser substituível.

---

## Arquitetura Geral

```text
                           USUÁRIO
                               │
                               ▼
┌───────────────────────────────────────────────────────────┐
│                  CANALTOPFY WEB (HTML)                    │
│                                                           │
│ Next.js + React + TypeScript + Tailwind + shadcn/ui       │
│                                                           │
│ Login                                                     │
│ Dashboard                                                 │
│ Central de Agentes                                        │
│ Radar de Produtos                                         │
│ Ranking                                                   │
│ Estúdio de Conteúdo                                       │
│ Publicações                                               │
│ Growth                                                    │
│ Analytics                                                 │
│ Configurações                                             │
└──────────────────────────┬────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│                     SUPABASE                              │
│                                                           │
│ Auth                                                      │
│ PostgreSQL                                                │
│ Realtime                                                  │
│ Storage                                                   │
│ Row Level Security                                        │
│ Edge Functions                                            │
│ Auditoria                                                 │
└──────────────────────────┬────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│              WORKFLOW ENGINE (Activepieces, self-hosted)  │
│                                                           │
│ Jobs                                                      │
│ Filas                                                     │
│ Scheduler                                                 │
│ Event Bus                                                 │
│ Retry / Timeout                                           │
│ Cache                                                     │
│ Cost Controller                                           │
│ Token Controller                                          │
│ Approval Queue                                            │
└──────────────────────────┬────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│                       WORKERS                              │
│                                                           │
│ ScoutWorker · NormalizerWorker · RankingWorker             │
│ ContentWorker · PublisherWorker · GrowthWorker             │
│ AnalyticsWorker · MonitorWorker                            │
└──────────────────────────┬────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│                      OPENCLAW                              │
│                                                           │
│ Agentes · Planejamento · Memória operacional               │
└──────────────────────────┬────────────────────────────────┘
                           │
                           ▼
              Skills → MCPs → SDKs Oficiais → APIs Oficiais
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│         MARKETPLACES / REDES SOCIAIS / IA PROVIDERS       │
│                                                           │
│ Marketplaces · Telegram · WhatsApp · Meta Ads · Google Ads │
│ TikTok · Pinterest · IA Providers · Analytics · Storage    │
│ Navegação                                                  │
└───────────────────────────────────────────────────────────┘
```

> **n8n não é mais um componente obrigatório da arquitetura** — ver [ADR 0001](architecture-decisions/0001-workflow-engine-proprio-em-vez-de-n8n.md). O Workflow Engine é **Activepieces** (self-hosted, licença MIT) — ver [ADR 0002](architecture-decisions/0002-activepieces-como-workflow-engine.md) e [comparação técnica completa](architecture/workflow-engine-decision.md). Regras de negócio permanecem em Workers TypeScript versionados, nunca dentro de flows do Activepieces.

---

## Camadas

### 1. Frontend

Responsável por:

* HTML
* UX
* Responsividade
* Dashboard
* Visualização dos agentes
* Ranking
* Fluxos
* Aprovação
* Configuração

Nunca deverá:

* executar lógica de negócio;
* acessar banco diretamente (fora do client oficial Supabase);
* armazenar segredos.

### 2. Supabase

Responsável por:

* autenticação;
* usuários;
* organizações;
* banco;
* realtime;
* storage;
* auditoria;
* permissões.

Será a única fonte oficial dos dados.

### 3. Workflow Engine (Activepieces, self-hosted)

Responsável por:

* iniciar jobs;
* controlar filas;
* distribuir tarefas;
* controlar retries e timeouts;
* emitir eventos (Event Bus);
* registrar logs;
* atualizar progresso;
* persistir estado no Supabase.

Activepieces (MIT, self-hosted via Docker) foi adotado em vez de n8n ([ADR 0001](architecture-decisions/0001-workflow-engine-proprio-em-vez-de-n8n.md)) e em vez de construção 100% própria ([ADR 0002](architecture-decisions/0002-activepieces-como-workflow-engine.md); comparação completa com Windmill em [`docs/architecture/workflow-engine-decision.md`](architecture/workflow-engine-decision.md)). **Regras de negócio nunca vivem dentro de flows do Activepieces** — Cost Controller e Token Controller são lógica de negócio e ficam nos Workers TypeScript, não no motor de execução.

Nenhuma IA deverá ser chamada diretamente pelo frontend.

### 4. Workers

Workers especializados, cada um com responsabilidade única, testável isoladamente, emitindo eventos e registrando progresso/custo/tokens/erros:

`ScoutWorker` · `NormalizerWorker` · `RankingWorker` · `ContentWorker` · `PublisherWorker` · `GrowthWorker` · `AnalyticsWorker` · `MonitorWorker`

### 5. OpenClaw

Responsável **exclusivamente** por:

* execução de agentes inteligentes;
* planejamento;
* Skills;
* MCPs;
* ferramentas;
* memória operacional.

**Não** será responsável por: autenticação, usuários, faturamento, banco principal, dashboards, regras comerciais.

### 6. n8n (opcional, não-core)

Desde o [ADR 0001](architecture-decisions/0001-workflow-engine-proprio-em-vez-de-n8n.md), n8n deixou de ser componente obrigatório. Uso pontual permanece aceitável apenas para automações verdadeiramente não críticas e desacopladas do core (ex.: uma notificação administrativa) — nunca para regra de negócio ou lógica crítica.

---

## Agentes

```
Scout → Normalizer → Deduplicator → Ranker → Copywriter → Designer → Video → Publisher → Growth → Analytics → Monitor
```

Cada agente:

* recebe entrada;
* produz saída;
* grava eventos;
* informa progresso;
* informa custo;
* informa tokens;
* informa erros.

## Fluxo Oficial

```
Captura → Normalização → Deduplicação → Ranking → Conteúdo → Aprovação → Publicação → Growth → Analytics → Aprendizado
```

## Event Bus

Toda comunicação entre Activepieces (Workflow Engine), Workers e OpenClaw ocorre por eventos — persistidos no Supabase e enviados ao frontend em tempo real via Supabase Realtime. Eventos mínimos:

`JobCreated` · `JobStarted` · `StepStarted` · `ProgressUpdated` · `AgentStarted` · `AgentFinished` · `Retry` · `Completed` · `Failed` · `Cancelled`

### O que o Frontend deve exibir (sempre orientado a evento real, nunca animação falsa)

Fila de jobs · timeline · progresso · workers · agentes · logs · métricas · custos · tokens · ROI.

---

## Ordem de reuso (tempo de desenvolvimento)

Antes de criar código: Skill → MCP → SDK Oficial → API Oficial → Biblioteca consolidada → Boilerplate/Template → Componente existente → Código próprio (com ADR, ver [`docs/architecture-decisions/`](architecture-decisions/)).

## Economia de Tokens (tempo de execução)

Antes de chamar qualquer LLM, verificar nesta ordem:

```
Cache → Resultado anterior → SQL → TypeScript → Skills → MCPs → SDKs oficiais → Modelo pequeno → Modelo grande
```

Nunca utilizar LLM para cálculos determinísticos (ordenar, filtrar, somar, comparar, validar, deduplicar). Toda chamada de IA que efetivamente ocorrer deve registrar: modelo, custo estimado, tokens, duração.

---

## Fases do Projeto

Fase 0 Fundação • Fase 1 Aplicação Online • Fase 2 Radar • Fase 3 Conteúdo • Fase 4 Publicações • Fase 5 Analytics • Fase 6 Growth • Fase 7 SaaS Comercial.

Detalhamento de cada fase em [`PROJECT_CHARTER.md`](../PROJECT_CHARTER.md#8-roadmap-por-fases). Nenhuma fase começa sem a anterior concluída e demonstrável.

---

## Definição de Pronto

Uma funcionalidade somente será considerada concluída quando:

* arquitetura respeitada;
* reutilização avaliada;
* código revisado;
* testes aprovados;
* build aprovado;
* documentação atualizada;
* custos registrados;
* consumo de tokens otimizado;
* interface HTML funcionando;
* eventos visíveis em tempo real.

Checklist completo em [`AGENTS.md`](../AGENTS.md).

---

## Objetivo Final

O CanalTopfy deverá se tornar uma plataforma SaaS capaz de:

* operar múltiplos clientes;
* executar agentes inteligentes;
* integrar diversos marketplaces e canais;
* acompanhar campanhas, custos e ROI;
* mostrar todas as operações em uma interface HTML moderna;
* reutilizar o máximo possível de componentes open source;
* manter baixo custo operacional e baixo consumo de tokens;
* ser facilmente extensível através de Skills, MCPs, SDKs e novos provedores.

---

## Decisões já tomadas (registradas para não serem re-perguntadas)

* **Monorepo:** `pnpm` workspaces (gratuito, sem overhead de Turborepo/Nx no tamanho atual).
* **Supabase:** reaproveitar o mesmo projeto Supabase já usado por **TopFY_retrogames** (não criar projeto novo). Isso implica **isolamento obrigatório por schema Postgres dedicado** (ex.: `canaltopfy`, não `public`) e RLS/policies escopadas por schema/app, para não colidir com as tabelas de TopFY_retrogames. Este isolamento é pré-requisito da primeira migration da Fase 0 — sem ele, não se cria nenhuma tabela.
* **GitHub:** já existe repositório remoto (aguardando URL exata para configurar `origin`).
* **Workflow Engine:** **Activepieces** (self-hosted, MIT), em vez de n8n e em vez de construção 100% própria — Windmill foi tecnicamente superior mas descartado por licença (AGPL + cláusula anti-embedding comercial). Ver [ADR 0002](architecture-decisions/0002-activepieces-como-workflow-engine.md) e [comparação técnica completa](architecture/workflow-engine-decision.md).

## Já scaffolded, aguardando credenciais/execução real

* **CI/CD:** `.github/workflows/ci.yml` escrito localmente (lint/typecheck/build do `apps/web`, pula automaticamente enquanto o app não existe) — **ainda não enviado ao repositório**: o PAT atual não tem permissão "Workflows", necessária pelo GitHub para criar/atualizar arquivos em `.github/workflows/`.
* **Activepieces:** `integrations/activepieces/docker-compose.yml` + `.env.example` — não testado neste ambiente (sem Docker disponível aqui).
* **Supabase:** `supabase/migrations/20260713120000_create_canaltopfy_schema.sql` (schema `canaltopfy`, `profiles`, `agent_runs`, RLS) e `supabase/seed.sql` (dados de dev da Fase 1) — não aplicados ainda (sem credenciais do projeto compartilhado nem Supabase CLI neste ambiente). Ver `supabase/README.md`.
* **OpenClaw:** confirmado via fonte oficial (`github.com/openclaw/openclaw`) o que é e como se instala — daemon Node.js (não Docker-first como o Activepieces), Skills em `~/.openclaw/workspace/skills/`. Ver `integrations/openclaw/README.md`.

## Decisões em aberto (bloqueiam execução real, não o scaffold de código)

Não são decisões que a arquitetura resolve sozinha — dependem de recursos/contas do usuário:

* Credenciais do projeto Supabase compartilhado (URL, anon key, service role key).
* Hospedagem do frontend Next.js (Vercel, self-host, outro), do Activepieces e do daemon OpenClaw (mesma VPS? serviços gerenciados separados?).
* OpenClaw: qual provedor/modelo de IA usar (`agent.model`) e quais chaves já existem.
* IA Providers: quais chaves/contas já existem (Claude, GPT, Gemini)?

Ver levantamento formal em [`docs/tasks/`](tasks/).
