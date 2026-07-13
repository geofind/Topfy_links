# Tickets de trabalho

Cada ticket segue o template em [`_TEMPLATE.md`](_TEMPLATE.md): Objetivo, Arquivos, Riscos, Plano, Critério de aceite. Nomeie `NNNN-titulo-curto.md`, sequencial a partir de `0001`, compartilhado entre Claude e Codex (não numeração separada por responsável).

Antes de abrir um ticket como concluído, rodar o checklist de "Definição de Pronto" em [`../../AGENTS.md`](../../AGENTS.md).

## Tickets ativos

| # | Título | Responsável | Depende de | Status |
|---|---|---|---|---|
| [0001](0001-frontend-nextjs-scaffold-design-system.md) | Scaffold Next.js + Design System | Codex | — | concluído |
| [0002](0002-frontend-login-dashboard-shell.md) | Telas de Login e Dashboard shell | Codex | 0001 | concluído |
| [0003](0003-frontend-central-de-agentes.md) | Central de Agentes (feed de execuções, tempo real mockado) | Codex | 0001, 0002 | concluído |
| [0004](0004-formatting-and-review-followups.md) | Formatação real (Prettier) e fechamento da revisão 0001–0003 | Codex | 0001, 0002, 0003 | concluído |

Verificado por Claude em 2026-07-13: `lint`, `typecheck`, `test` (5/5) e `build` de produção passam limpos após o commit `df3fa5a`.
