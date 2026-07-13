# PROJECT CHARTER — CanalTopfy OS

## 1. O que é

CanalTopfy OS é um **Sistema Operacional para Marketing com IA**: uma plataforma SaaS comercial (não um script, não um MVP descartável) capaz de:

- descobrir oportunidades de produto;
- analisar produtos;
- calcular score de oportunidade;
- gerar conteúdo;
- publicar em canais/marketplaces;
- acompanhar campanhas e ROI;
- acompanhar agentes de IA (status, progresso, custo, tokens) em tempo real.

Todo o produto é apresentado ao usuário final como **um único sistema, em HTML** (Next.js/React/Tailwind/TypeScript). O usuário final nunca vê Supabase, OpenClaw, o Workflow Engine ou qualquer peça interna — isso é infraestrutura, não produto.

## 2. Princípio fundador: orquestrar, não reinventar

> CanalTopfy é um **orquestrador de tecnologias existentes**. Desenvolvemos apenas o que constitui diferencial competitivo. Todo o resto é integrado, reutilizado e encapsulado.

Antes de implementar qualquer funcionalidade, é **obrigatório** verificar se já existe:

Skill • MCP / MCP Server • SDK oficial • API oficial • boilerplate • template • biblioteca consolidada • componente React pronto • componente shadcn/ui • ferramenta OpenClaw • projeto GitHub maduro • exemplo oficial • CLI oficial • OpenAPI/GraphQL • middleware • sistema de filas • sistema de autenticação • dashboard • logs • analytics • observabilidade.

Se existir solução madura: **não reescrever** — adaptar, integrar, encapsular, padronizar, documentar.

Quando, mesmo assim, decidirmos construir algo próprio, isso é uma **decisão arquitetural** e deve ser registrada em `docs/architecture-decisions/` respondendo:

1. Por que não reutilizamos algo existente?
2. Quais alternativas foram avaliadas?
3. Quais as vantagens da implementação própria?
4. Qual o impacto em manutenção?
5. Qual o impacto em consumo de tokens?
6. Existe possibilidade futura de substituir por uma solução pronta?

### Ordem de prioridade de recursos (antes de codar)

1. Skill nativa
2. Skill instalada
3. MCP oficial
4. MCP aprovado pelo projeto
5. SDK oficial
6. API oficial
7. Biblioteca consolidada
8. Template / boilerplate
9. Componente reutilizável existente
10. Implementação própria (última opção, com ADR)

### Componentes preferenciais (avaliar sempre primeiro)

Supabase • OpenClaw • Metabase • Evolution API • Redis • Qdrant • Playwright • Docker • GitHub Actions • shadcn/ui.

> n8n deixou de ser componente obrigatório — ver [ADR 0001](docs/architecture-decisions/0001-workflow-engine-proprio-em-vez-de-n8n.md). O Workflow Engine adotado é **Activepieces** (self-hosted, MIT) — ver [ADR 0002](docs/architecture-decisions/0002-activepieces-como-workflow-engine.md). Regras de negócio ficam em Workers TypeScript, nunca dentro de flows do Activepieces.

## 3. Economia de tokens

IA (LLM) é o recurso mais caro e menos determinístico do sistema. Ordem obrigatória de resolução de qualquer problema, da mais barata para a mais cara:

1. **SQL** (ordenar, filtrar, somar, comparar, agregar no banco)
2. **TypeScript** (lógica determinística no backend/worker)
3. **Templates** (conteúdo pré-formatado, preenchido por dados)
4. **Cache** (resultado já computado)
5. **Modelo pequeno** (classificação/tarefas simples)
6. **Modelo grande** (Claude / GPT / Gemini) — somente quando a tarefa exige raciocínio, linguagem natural ou julgamento que os passos anteriores não resolvem.

**Nunca usar LLM para:** ordenar, filtrar, somar, calcular, comparar, validar, deduplicar. Essas são operações determinísticas — resolver em SQL/TypeScript.

Toda decisão técnica deve minimizar tokens: reutilizar resultado existente, usar cache, reduzir contexto enviado, reduzir saída, evitar chamar LLM quando não necessário.

## 4. Arquitetura (visão macro)

Frontend (Next.js/React/Tailwind/TS) → Supabase (dados, auth, realtime, RLS) → Workflow Engine (Activepieces: jobs, filas, scheduler, retries) → Workers TypeScript (regras de negócio, custo/tokens) → OpenClaw (agentes) → Skills/MCPs/SDKs oficiais → Marketplaces / Canais de publicação.

O diagrama completo, papel de cada camada, pipeline de agentes (Scout → … → Monitor) e fluxo oficial de dados (Captura → … → Aprendizado) estão em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — **fonte da verdade técnica**.

## 5. Dados e tempo real

Supabase é a fonte oficial de dados. Todo agente deve gravar, de forma auditável:

status • progresso • tempo de execução • tokens consumidos • custo • mensagens • erros • resultado.

Toda atualização relevante deve aparecer **imediatamente** na interface via realtime. Nada pode ser fake: barras de progresso, contadores e status refletem estado real do banco, nunca valores simulados no frontend (dados simulados só existem como *seed* explícito de desenvolvimento, nunca em produção).

## 6. Qualidade — não negociável

- Não aceitar código ruim, duplicado ou com lógica repetida.
- Sempre refatorar, modularizar, documentar e testar.
- Respeitar arquitetura definida: separação de responsabilidades, inversão de dependência, baixo acoplamento, alta coesão.
- Nenhum módulo depende de implementação concreta quando existe interface disponível.
- Nenhuma implementação desnecessária: sem features especulativas, sem abstração prematura, sem código morto.

O checklist completo de "definição de pronto" para qualquer tarefa está em [`AGENTS.md`](AGENTS.md).

## 7. Divisão de responsabilidades

| Claude (CTO / Arquiteto / Reviewer) | Codex (Implementação de Frontend) |
|---|---|
| Arquitetura | Componentes |
| Banco (Supabase, schema, RLS) | HTML |
| Segurança | React |
| Eventos / Realtime | Telas |
| Workers | Gráficos |
| Integrações (Activepieces, OpenClaw, marketplaces) | UX |
| Review de todo código produzido | Responsividade |
| Performance | Integrações de frontend (consumo de API/Supabase client) |
| Documentação | |

Detalhamento operacional (fluxo por tarefa, template de ticket, gates de qualidade) em [`AGENTS.md`](AGENTS.md).

## 8. Roadmap por fases

**Regra rígida: nenhuma fase começa antes da anterior estar concluída e demonstrável.** Cada fase deve ser funcional, utilizável e demonstrável — não apenas código, mas algo que se possa mostrar rodando.

### Fase 0 — Fundação
Arquitetura • CI/CD • Next.js • Supabase • Login • Design System.

### Fase 1 — Aplicação Online
Dashboard • Central de Agentes • dados simulados persistidos (seed real no banco, não mock no front) • Realtime.

### Fase 2 — Radar
Produtos • Ranking • Score • Histórico.

### Fase 3 — Conteúdo
Textos • Templates • Aprovação.

### Fase 4 — Publicação
Telegram • WhatsApp • Agendamento.

### Fase 5 — Analytics
Cliques • Conversões • ROI • Custos.

### Fase 6 — Growth
Campanhas • Recomendações • Automações.

### Fase 7 — SaaS
Multiempresa • Assinaturas • Administração • White Label.

## 9. Não-objetivos

- Não construir scripts isolados e descartáveis.
- Não construir um MVP que precise ser reescrito para virar produto.
- Não expor infraestrutura interna (Supabase, Activepieces, OpenClaw) ao usuário final.
- Não avançar de fase sem estabilidade (lint, build, typecheck e testes passando).
