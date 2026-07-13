# ADR 0001 — Workflow Engine próprio em TypeScript em vez de n8n

- **Data:** 2026-07-13
- **Status:** substituída parcialmente por [ADR 0002](0002-windmill-como-workflow-engine.md) — a rejeição do n8n permanece válida, mas a camada de execução/scheduler/filas deixou de ser construída do zero e passou a adotar uma ferramenta madura (Windmill/Activepieces).
- **Autor:** decisão do usuário (product owner), registrada por Claude

## Contexto

A arquitetura inicial (`docs/ARCHITECTURE.md`) definia n8n como camada de automação/integração, em paralelo ao OpenClaw, abaixo do Orquestrador. n8n é uma ferramenta madura e é o primeiro item da lista de "componentes preferenciais" do charter — ou seja, esta decisão é uma exceção explícita à regra geral de reuso, e por isso precisa deste ADR.

## Por que não reutilizar (n8n)?

n8n foi avaliado e descartado como componente obrigatório da plataforma pelos seguintes motivos, definidos pelo product owner:

- adiciona complexidade operacional (mais um serviço para versionar, deployar e monitorar);
- adiciona dependência de infraestrutura própria (instância n8n rodando, banco próprio do n8n, atualização de versão);
- aumenta consumo de memória/recursos do ambiente;
- lógica crítica de negócio em editor visual é mais difícil de testar, revisar em PR e versionar de forma granular do que código TypeScript;
- aumenta pontos de falha (mais um sistema que pode cair) e dificulta deploy e testes automatizados de ponta a ponta.

## Alternativas avaliadas

| Alternativa | Motivo de rejeição |
|---|---|
| n8n (workflow engine visual) | Complexidade/dependência operacional; lógica crítica não deve viver em editor visual não versionado como código |
| Manter n8n só para integrações não críticas | Rejeitado por simplicidade: um único mecanismo (Workflow Engine em código) é mais fácil de raciocinar, testar e operar do que dois mecanismos de orquestração coexistindo |

## Decisão

Construir um **Workflow Engine próprio em TypeScript**, versionado como código, responsável por: iniciar jobs, controlar filas, distribuir tarefas, controlar retries/timeouts, controlar orçamento e consumo de tokens, emitir eventos, registrar logs, atualizar progresso e persistir estado no Supabase.

Nova cadeia oficial: `Frontend → Supabase → Workflow Engine (TypeScript) → Workers → OpenClaw → Skills → MCPs → SDKs oficiais → APIs oficiais → Marketplaces/Redes sociais/IA`.

n8n deixa de ser um componente obrigatório da arquitetura. Não é proibido pontualmente para automações verdadeiramente não críticas e desacopladas do core (ex.: uma notificação administrativa), mas qualquer uso desse tipo é opcional e não deve carregar regra de negócio.

## Vantagens da implementação própria

- Lógica crítica 100% versionada, revisável em PR e testável (unit/integration) como qualquer outro código TypeScript do repo.
- Um único runtime de orquestração para operar e monitorar, em vez de dois.
- Sem dependência de disponibilidade/versão de um serviço externo adicional.
- Modelo de eventos (`JobCreated`, `JobStarted`, `StepStarted`, `ProgressUpdated`, `AgentStarted`, `AgentFinished`, `Retry`, `Completed`, `Failed`, `Cancelled`) desenhado sob medida para o requisito de observabilidade de agentes do charter (status/progresso/tokens/custo em tempo real via Supabase Realtime).

## Impacto em manutenção

Positivo a médio prazo: menos serviços para manter no ambiente. Custo inicial: o Workflow Engine (filas, retries, timeouts) precisa ser construído e testado — não vem pronto. Mitigar reutilizando bibliotecas consolidadas de fila/job (avaliar antes de escrever do zero: ex. bibliotecas de job queue sobre Postgres/Redis) em vez de implementar controle de fila do zero.

## Impacto em consumo de tokens

Neutro a positivo: o Workflow Engine em si não usa LLM (é TypeScript determinístico). Ao concentrar o controle de orçamento/tokens num único lugar (Cost Controller / Token Controller), fica mais fácil aplicar a ordem de economia de tokens (cache → resultado anterior → SQL → TypeScript → Skills → MCPs → SDKs → IA) de forma consistente do que teria sido com lógica espalhada entre workers e workflows visuais do n8n.

## Possibilidade futura de substituir por solução pronta

Sim, condicional: se o Workflow Engine próprio crescer a ponto de reimplementar features de uma fila/job runner madura (retries exponenciais, dead-letter queue, agendamento cron robusto), avaliar adotar uma biblioteca de filas consolidada (ex. sobre Redis/Postgres) por baixo do Workflow Engine, mantendo a mesma interface/eventos — isso não reintroduziria n8n, apenas trocaria a implementação interna da camada de filas.
