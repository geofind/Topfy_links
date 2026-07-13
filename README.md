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
apps/                       # aplicações (frontend Next.js, etc.) — a criar na Fase 0
workers/                    # workers TypeScript (agentes, integrações) — a criar
supabase/                   # schema, migrations, RLS, edge functions — a criar
integrations/               # config de Activepieces, ferramentas OpenClaw — a criar
```

Ferramentas de scaffold já presentes na raiz (`package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `tsconfig*.json`, `components.json`, `.prettierrc`) vêm do scaffold Vite/shadcn herdado do Topfy Links — serão avaliadas/migradas para o app Next.js da Fase 0 (ver `docs/tasks/`).

As pastas `DESIGN/`, `PRODUTOS/`, `LOJA/`, `ROTEIROS/`, `TIKTOK_SHOP/`, `VIDEOS_*` e as planilhas na raiz são **ativos de conteúdo/operação do canal** (mídia, roteiros, planilhas de produto) — não fazem parte do código do produto e estão fora do controle de versão (`.gitignore`).

## Como rodar

Ainda não aplicável — aguardando scaffold executável da Fase 0 (Next.js + Supabase). Este README será atualizado assim que houver `apps/web` executável.

## Contribuindo

Toda tarefa segue o fluxo descrito em [`AGENTS.md`](AGENTS.md): objetivo → arquivos → riscos → plano → critério de aceite, implementação, e depois lint/build/typecheck/testes antes de considerar concluída.
