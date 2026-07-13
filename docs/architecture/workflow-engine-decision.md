# Decisão técnica: Workflow Engine — Windmill vs Activepieces

- **Data:** 2026-07-13
- **Decisão:** **Activepieces**
- **Ver também:** [ADR 0002](../architecture-decisions/0002-activepieces-como-workflow-engine.md), [ADR 0001](../architecture-decisions/0001-workflow-engine-proprio-em-vez-de-n8n.md) (n8n descartado), [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md).

## Processo

Conforme determinado pelo product owner: avaliar Windmill (preferencial) e Activepieces (segunda opção) nos critérios abaixo; adotar Windmill se atender plenamente aos requisitos; só escolher Activepieces havendo vantagem técnica clara e documentada.

## Comparação técnica

| Critério | Windmill | Activepieces |
|---|---|---|
| Maturidade | Fundado 2022 (YC S22), 300+ clientes enterprise, referências: Photoroom, Pave, Panther Labs, Investing.com, Athena Intelligence | Fundado 2022 (YC S22), lançado 2023, ~US$1,7M receita (2024), referência: Funding Societies |
| Comunidade | ~17,1k★, ~1k forks, 67% dos PRs de contribuidores externos, Discord ativo | ~23,3k★, ~3,9k forks, ~270+ contribuidores, Discord + fórum ativos |
| **Licença** | **AGPLv3** (core) + Apache-2.0 (libs/specs) + EE proprietária. O `LICENSE` do projeto proíbe explicitamente distribuir a Community Edition como parte de um produto vendido, revendido, servido como serviço gerenciado, ou embarcado/empacotado sem acordo comercial explícito | **MIT** em tudo exceto `packages/ee` (SSO/SCIM/RBAC/auditoria, que exige chave comercial só para esses recursos específicos). Núcleo MIT sem restrição para embarcar, rebrandear ou revender como SaaS |
| Frequência de releases | Muito alta — quase diária (v1.756.0 em 2026-07-12) | Regular — semanal/quinzenal (0.86.2 em 2026-07-08) |
| Documentação | Extensa, versionada, rica em exemplos de código | Extensa, mais fórum comunitário e índice DeepWiki |
| SDK TypeScript | **Nativo**: scripts podem ser escritos diretamente em TypeScript (runtime Deno/Bun) como passos de workflow, mais SDK `windmill-client` npm | Pieces são pacotes npm em TS, mas o passo de código ad-hoc é só JavaScript; sem SDK de API oficial dedicado em TS |
| API / criação programática | REST API, execução de flows via webhook (sync/async/SSE), spec OpenAPI | REST API + servidor MCP embutido por projeto para criação/orquestração programática/via IA |
| Docker | docker-compose oficial, k8s, Helm | docker-compose oficial, k8s, Helm |
| Scheduler | Cron nativo via UI/API | Piece "Schedule" com sintaxe Quartz cron |
| Workers/Filas | Workers stateless consultam **Postgres** diretamente (sem broker); benchmark 100+ workers, 981 jobs/s | Workers Node consultam **Redis/BullMQ**; Postgres para estado; benchmark ~95 exec/s por instância |
| Retry | Backoff fixo/exponencial por passo, continue-on-error, passo de tratamento de erro dedicado | Auto-retry (≤4x/~4min) + continue-on-failure por passo |
| Secrets | Criptografados no banco por padrão; EE integra HashiCorp Vault, Azure Key Vault, AWS Secrets Manager | Conexões criptografadas no banco; EE integra HashiCorp Vault/AWS Secrets Manager |
| Logs | stdout/stderr completo por job, armazenado em Postgres | Logs de execução por run, armazenados em Postgres |
| Webhooks | Webhook de entrada auto-gerado por script/flow + passos HTTP de saída | Piece de trigger webhook (entrada) + pieces HTTP/webhook (saída) |
| Observabilidade | Endpoint Prometheus `/metrics` nativo + OpenTelemetry (exportação via EE) | Sem integração nativa Prometheus/OTel documentada — **lacuna** |
| Performance | Core em Rust; ~100ms/job/worker, escala linear | Node/BullMQ; sólido para integrações, throughput bruto menor nos benchmarks disponíveis |
| Escalabilidade | Workers stateless, worker groups/tags, autoscaling K8s/ECS incl. scale-to-zero | Containers stateless; app/worker/Postgres/Redis escalam independentemente |
| Integração Supabase/Postgres | Parceria oficial Supabase + assistente nativo "Add a Supabase DB" | Piece dedicado Supabase (triggers de linha, storage, CRUD) + piece Postgres genérico |
| MCP / IA-agent / Skills | Servidor MCP nativo + OAuth Gateway (2026) | Servidor MCP embutido por projeto, maior biblioteca OSS de pieces MCP (400+) |

Fontes: [windmill-labs/windmill](https://github.com/windmill-labs/windmill), [LICENSE Windmill](https://github.com/windmill-labs/windmill/blob/main/LICENSE), [issue #4514](https://github.com/windmill-labs/windmill/issues/4514), [docs Windmill](https://www.windmill.dev/docs), [activepieces/activepieces](https://github.com/activepieces/activepieces), [licença Activepieces](https://www.activepieces.com/docs/about/license), [LICENSE Activepieces](https://github.com/activepieces/activepieces/blob/main/LICENSE), [hardware/scaling Activepieces](https://www.activepieces.com/docs/install/configuration/hardware).

## Análise

Em quase todos os critérios de engenharia, o Windmill é tecnicamente superior: fila só em Postgres (uma peça a menos que Postgres+Redis/BullMQ do Activepieces), execução nativa em TypeScript, melhor história de observabilidade (Prometheus/OTel nativos) e benchmarks publicados de maior throughput.

Porém, o critério **licença** — um dos critérios explicitamente pedidos na avaliação — é onde o Windmill tem uma limitação clara e documentada para o nosso caso de uso específico: embarcar o motor de execução dentro de um **SaaS comercial vendido a clientes**. O próprio `LICENSE` do Windmill declara que a Community Edition não pode ser vendida, revendida, servida como serviço gerenciado, ou embarcada em produto comercial/distribuível sem um acordo comercial explícito com a Windmill Labs — exatamente o que o CanalTopfy OS faria. O núcleo MIT do Activepieces não tem essa restrição; apenas os módulos opcionais de SSO/SCIM/RBAC exigem chave paga.

## Decisão final

**Adotar Activepieces** como Workflow Engine padrão, por ser a alternativa legalmente inequívoca para uso embarcado em produto comercial — a "vantagem técnica clara e documentada" exigida pela regra de decisão do product owner para preterir o Windmill, já que licença estava entre os critérios formais de avaliação.

**Reavaliação futura:** se as vantagens de engenharia do Windmill (Postgres-only, TS nativo, Prometheus/OTel) se tornarem determinantes, revisitar mediante negociação de licença comercial com a Windmill Labs (sales@windmill.dev) — não adotar a Community Edition do Windmill embarcada sem esse acordo.

## Impacto na arquitetura

Ver `docs/ARCHITECTURE.md`, camada "Workflow Engine": Activepieces substitui a camada anteriormente descrita como "código próprio" — usar Activepieces (self-hosted via Docker) para scheduler/filas/retries/webhooks/logs/observabilidade; regras de negócio permanecem em Workers TypeScript do CanalTopfy, nunca dentro de flows do Activepieces.

## Impacto no consumo de tokens

Neutro: Activepieces não introduz chamadas a LLM por si só; a ordem de economia de tokens definida no charter (cache → resultado anterior → SQL → TypeScript → Skills → MCPs → SDKs → modelo pequeno → modelo grande) continua a ser aplicada dentro dos Workers/steps, independentemente do motor de execução.
