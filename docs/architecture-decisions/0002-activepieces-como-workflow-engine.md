# ADR 0002 — Activepieces como Workflow Engine (em vez de Windmill ou construção própria)

- **Data:** 2026-07-13
- **Status:** aceita
- **Autor:** decisão do usuário (product owner) via processo de avaliação formal; pesquisa e registro por Claude

## Contexto

O ADR 0001 havia decidido descartar n8n e construir um Workflow Engine próprio em TypeScript. O product owner posteriormente revisou essa decisão: em vez de construir o motor de execução/scheduler/filas do zero, adotar uma ferramenta madura, escolhida entre Windmill (preferencial) e Activepieces (alternativa), via avaliação técnica formal.

## Por que não reutilizar (Windmill, apesar de preferencial)?

Windmill foi avaliado em detalhe (ver [`docs/architecture/workflow-engine-decision.md`](../architecture/workflow-engine-decision.md)) e é tecnicamente superior ao Activepieces na maioria dos critérios (fila só-Postgres, TypeScript nativo, observabilidade Prometheus/OTel nativa, benchmarks de throughput). Não foi descartado por falta de maturidade técnica, mas por **licença**: o `LICENSE` da Windmill Community Edition proíbe explicitamente vender, revender, servir como serviço gerenciado ou embarcar em produto comercial/distribuível sem acordo comercial com a Windmill Labs — o que descreve exatamente o uso pretendido (motor de execução dentro do CanalTopfy OS, um SaaS vendido a clientes).

## Alternativas avaliadas

| Alternativa | Motivo de rejeição |
|---|---|
| Windmill | Tecnicamente superior, mas licença (AGPL core + cláusula anti-embedding-comercial) incompatível com uso embarcado em SaaS comercial sem acordo pago com a Windmill Labs |
| Construção própria (ADR 0001) | Reavaliada pelo product owner: reimplementar scheduler/filas/retries/observabilidade do zero contraria o princípio "reutilizar antes de desenvolver" quando existe ferramenta madura com licença compatível |
| n8n | Ver ADR 0001 — complexidade operacional, lógica crítica não versionável como código |

## Decisão

Adotar **Activepieces** (licença MIT no núcleo) como Workflow Engine: scheduler, filas, retries, webhooks, workers, logs e observabilidade de execução. Self-hosted via Docker. Regras de negócio permanecem em Workers TypeScript do CanalTopfy — Activepieces não contém lógica de negócio, apenas orquestra sua execução.

## Vantagens da escolha

- Licença MIT sem restrição de embedding/revenda — zero risco legal para o modelo de negócio SaaS do CanalTopfy.
- Maduro o suficiente (~23k★, ~270 contribuidores, releases regulares) para não precisar reimplementar fila/scheduler/retry do zero.
- Servidor MCP embutido por projeto facilita integração futura com OpenClaw/agentes de IA.
- Piece dedicado para Supabase/Postgres reduz trabalho de integração.

## Impacto em manutenção

Baixo: self-hosting via Docker é operacionalmente simples (docker-compose oficial). Precisamos garantir que nenhuma regra de negócio vaze para dentro de flows do Activepieces (ver Camada 3 em `docs/ARCHITECTURE.md`), para manter a lógica crítica testável e versionada como código, conforme o princípio geral do charter.

## Impacto em consumo de tokens

Neutro — Activepieces não chama LLM por conta própria; a ordem de economia de tokens do charter é aplicada dentro dos Workers/steps, não no motor de execução.

## Possibilidade futura de substituir por solução pronta

Sim: se o Windmill Labs oferecer um acordo comercial viável (ou mudar a licença), revisitar a troca por Windmill dada sua superioridade técnica em fila (Postgres-only) e observabilidade nativa — desde que a interface de eventos do CanalTopfy (`docs/ARCHITECTURE.md`, seção Event Bus) permaneça estável, a troca do motor por baixo não deveria exigir mudança na camada de Workers.
