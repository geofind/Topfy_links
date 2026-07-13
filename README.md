# CanalTopfy OS

Sistema Operacional para Marketing com IA — SaaS comercial para descobrir oportunidades de produto, analisar, pontuar, gerar conteúdo, publicar e acompanhar campanhas/ROI/agentes em tempo real.

> Para visão de produto, princípios de reuso, economia de tokens e roadmap por fases, veja [`PROJECT_CHARTER.md`](PROJECT_CHARTER.md).
> Para como Claude e Codex trabalham juntos neste repo, veja [`AGENTS.md`](AGENTS.md).
> Para arquitetura técnica detalhada, veja [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Status

🚧 **Fase 0 — Fundação** (em andamento). Ver seção "Fases" no charter.

## Origem deste repositório

Este repositório (`github.com/geofind/Topfy_links`) começou como um projeto anterior, "Topfy Links" (bot de afiliados Mercado Livre/Amazon + dashboard). Na prática só havia um scaffold vazio (Vite + React + TypeScript + shadcn/ui, gerado pela ferramenta Manus) e um `requirements.txt` mínimo — nenhum código de aplicação real. Foi adotado como base do CanalTopfy OS; o README e a visão original do Topfy Links foram preservados em [`docs/legacy/topfy-links-README.md`](docs/legacy/topfy-links-README.md) como referência para a Fase 2 (Radar/ScoutWorker).

## Estrutura do repositório

```
PROJECT_CHARTER.md          # visão de produto, princípios, roadmap
AGENTS.md                   # workflow Claude/Codex, gates de qualidade
docs/
  ARCHITECTURE.md           # arquitetura técnica, stack, contratos entre camadas
  architecture/             # documentos de decisão técnica detalhados (ex.: workflow engine)
  architecture-decisions/   # ADRs — toda implementação própria justificada aqui
  tasks/                    # tickets de trabalho (template + tickets ativos)
  legacy/                   # documentação de projetos anteriores herdados neste repo
apps/
  web/                      # frontend Next.js (App Router, Design System e telas)
workers/                    # workers TypeScript (agentes, integrações) — a criar
supabase/                   # schema, migrations, RLS, edge functions — a criar
integrations/               # config de Activepieces, ferramentas OpenClaw — a criar
```

O frontend reutiliza Next.js, Tailwind CSS e os primitivos shadcn/ui/Radix para manter o Design System substituível e evitar componentes básicos proprietários.

As pastas `DESIGN/`, `PRODUTOS/`, `LOJA/`, `ROTEIROS/`, `TIKTOK_SHOP/`, `VIDEOS_*` e as planilhas na raiz são **ativos de conteúdo/operação do canal** (mídia, roteiros, planilhas de produto) — não fazem parte do código do produto e estão fora do controle de versão (`.gitignore`).

## Como rodar

Requisitos: Node.js 20.9+ e pnpm 11.

```bash
pnpm install
pnpm --filter web dev
```

Abra `http://localhost:3000`. A aplicação redireciona para `/login`; durante o desenvolvimento da interface, qualquer email válido e senha não vazia criam uma sessão mockada somente em memória. Recarregar a página encerra essa sessão. Nenhuma credencial ou dado é enviado ao Supabase neste estágio.

A rota `/agentes` usa um feed de desenvolvimento explicitamente identificado como **simulação local**. O `MockAgentRunsClient` atualiza progresso, tokens, custos e estados em memória pelo mesmo contrato que será implementado pelo Supabase Realtime; esses registros não representam dados de produção.

Gates de qualidade:

```bash
pnpm lint
pnpm build
pnpm typecheck
pnpm test
```

## Contribuindo

Toda tarefa segue o fluxo descrito em [`AGENTS.md`](AGENTS.md): objetivo → arquivos → riscos → plano → critério de aceite, implementação, e depois lint/build/typecheck/testes antes de considerar concluída.
