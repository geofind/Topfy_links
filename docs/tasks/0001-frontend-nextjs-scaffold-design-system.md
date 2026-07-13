# Ticket 0001 — Scaffold Next.js + Design System

- **Fase:** 0 (Fundação)
- **Responsável:** Codex
- **Depende de:** —

## Contexto (leia antes de começar)

Leia `PROJECT_CHARTER.md`, `AGENTS.md` e `docs/ARCHITECTURE.md` na raiz do repo primeiro — este ticket segue as regras de lá (ordem de reuso, checklist de definição de pronto, etc.).

Este repositório (`Topfy_links`) herdou de um projeto anterior um scaffold **Vite** (não Next.js) gerado por uma ferramenta chamada Manus, sem nenhuma tela real implementada — apenas config (`vite.config.ts`, `tsconfig.node.json`, `components.json`, `package.json` com dependências Radix/shadcn, `pnpm-lock.yaml`). O charter do CanalTopfy OS exige **Next.js** como framework de frontend (não Vite). Como não existe nenhuma tela real construída em cima do Vite, a decisão é substituir o scaffold, não migrá-lo tela por tela.

## Objetivo

Estabelecer o monorepo pnpm e o app Next.js (`apps/web`) que será a única superfície visível do CanalTopfy OS, com o Design System base (shadcn/ui) pronto para as telas dos próximos tickets.

## Arquivos

**Criar:**
- `pnpm-workspace.yaml` (raiz) — declarar `apps/*` e `packages/*` (mesmo que `packages/` fique vazio por enquanto).
- `apps/web/` — app Next.js (App Router, TypeScript estrito, sem `src/` extra — usar `apps/web/app`).
- `apps/web/components/ui/` — primitivos shadcn/ui (button, card, input, dialog, dropdown-menu, avatar, tabs, tooltip, separator, sheet — os que já estavam nas dependências do `package.json` herdado).
- `apps/web/components/layout/` — `AppShell`, `Sidebar`, `Topbar`, `ThemeToggle`.
- `apps/web/lib/utils.ts` — helper `cn()` (clsx + tailwind-merge, padrão shadcn).
- `apps/web/app/globals.css`, `apps/web/tailwind.config.ts`, `apps/web/components.json` (recriar `components.json` apontando para `apps/web`, mantendo `style: "new-york"`, `baseColor: "neutral"`, `cssVariables: true` do scaffold anterior).
- `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.ts`.

**Remover** (substituídos pelo scaffold Next.js — não manter os dois em paralelo, isso seria duplicação):
- `vite.config.ts`, `tsconfig.node.json`, `tsconfig.json` (raiz), `components.json` (raiz), `package.json` (raiz — vira o `package.json` do workspace), `pnpm-lock.yaml` (raiz — será regenerado).

**Manter intocados:** `requirements.txt`, `config.example.json`, `.prettierrc`, `.prettierignore`, `docs/`, `PROJECT_CHARTER.md`, `AGENTS.md`, `README.md`, `.gitignore` (não são escopo deste ticket).

## Riscos

- Não apagar `docs/legacy/topfy-links-README.md` nem `requirements.txt`/`config.example.json` — pertencem a um escopo futuro (Fase 2 — Radar/ScoutWorker), não a este ticket.
- `.gitignore` já ignora `DESIGN/`, `PRODUTOS/`, etc. e arquivos `.xlsx` — não remover essas regras.
- Reutilizar `.prettierrc`/`.prettierignore` já existentes na raiz em vez de recriar configuração de formatação.
- Não é necessário decidir hospedagem (Vercel/self-host) neste ticket — isso é uma decisão em aberto separada (ver `docs/ARCHITECTURE.md`, seção "Decisões em aberto"), não bloqueia o scaffold local.

## Plano

1. Rodar `pnpm dlx create-next-app@latest apps/web` com TypeScript, Tailwind, App Router, ESLint — sem `src/` directory.
2. Criar `pnpm-workspace.yaml` na raiz e um `package.json` de raiz mínimo (scripts `dev`/`build`/`lint`/`typecheck` delegando para `apps/web` via `pnpm --filter web ...`).
3. Rodar `pnpm dlx shadcn@latest init` dentro de `apps/web`, escolhendo estilo "new-york", base color "neutral", CSS variables — igual ao `components.json` herdado.
4. Adicionar os componentes shadcn/ui necessários (`button card input dialog dropdown-menu avatar tabs tooltip separator sheet`).
5. Construir `AppShell` (layout com `Sidebar` + `Topbar`), `ThemeToggle` (usar `next-themes`, já era dependência do scaffold anterior).
6. Remover os arquivos legados do Vite listados acima.
7. Garantir que `pnpm install` na raiz resolve o workspace inteiro sem erro.

## Critério de aceite

- [ ] `pnpm install` na raiz funciona sem erro.
- [ ] `pnpm --filter web dev` sobe o Next.js em `localhost:3000` mostrando o `AppShell` (Sidebar + Topbar) com pelo menos uma rota placeholder.
- [ ] `pnpm --filter web lint` e `pnpm --filter web build` passam sem erro.
- [ ] `ThemeToggle` alterna claro/escuro corretamente.
- [ ] Nenhum arquivo Vite legado (`vite.config.ts`, `tsconfig.node.json`) permanece no repo.
- [ ] `requirements.txt`, `config.example.json` e `docs/legacy/` permanecem intocados.
- [ ] Documentação atualizada: `README.md` — seção "Como rodar" preenchida com os comandos reais (`pnpm install`, `pnpm --filter web dev`).
