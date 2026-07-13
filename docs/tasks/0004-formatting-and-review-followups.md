# Ticket 0004 — Formatação real (Prettier) e fechamento da revisão dos tickets 0001–0003

- **Fase:** 0 (Fundação)
- **Responsável:** Codex
- **Depende de:** [0001](0001-frontend-nextjs-scaffold-design-system.md), [0002](0002-frontend-login-dashboard-shell.md), [0003](0003-frontend-central-de-agentes.md)

## Contexto (revisão do Claude, 2026-07-13)

Rodei os gates de qualidade em `apps/web` como parte da revisão contínua (papel de Claude em `AGENTS.md`):

- `pnpm --filter web lint` ✅ limpo.
- `pnpm --filter web test` ✅ passando.
- `pnpm --filter web typecheck` — havia 1 erro em `lib/agent-runs/mock-client.ts` (status widening para `string` em vez de `AgentRunStatus` dentro do array `this.runs = [...]`). **Já corrigido** — não precisa de ação.

**Pendente:** o repo tem `.prettierrc`/`.prettierignore` na raiz e um script `format` (`prettier --write .`) no `package.json` raiz, mas o pacote `prettier` **não está instalado** em nenhum `package.json` (root ou `apps/web`) — `pnpm format` falha ("command not found"). Como consequência, todo componente de tela (`login/page.tsx`, `app-shell.tsx`, `sidebar.tsx`, `topbar.tsx`, `(dashboard)/[section]/page.tsx`, etc.) está com o `return` inteiro em **uma única linha JSX de milhares de caracteres**, em vez de formatado — o `printWidth: 80` do `.prettierrc` não está sendo aplicado. Isso não é bug funcional, mas é uma dívida de legibilidade/manutenção real (viola "não aceite código ruim" do `AGENTS.md`) e provavelmente candidatos a extração de sub-componentes ficaram maiores do que deveriam por causa disso.

## Objetivo

Instalar Prettier de verdade, reformatar todo `apps/web`, e confirmar que os gates de qualidade continuam passando depois.

## Arquivos

- `package.json` (raiz) e/ou `apps/web/package.json` — adicionar `prettier` como devDependency (raiz faz mais sentido, já que `.prettierrc`/`.prettierignore`/script `format` já estão lá).
- Reformatar (sem mudar comportamento) todos os `.ts`/`.tsx` sob `apps/web/` via `pnpm format` (ou `prettier --write apps/web`).

## Riscos

- Só formatação — nenhuma mudança de comportamento. Se o Prettier reformatar algo de um jeito que quebre lint/typecheck (raro, mas confirme), corrija antes de commitar.
- Ao reformatar, aproveite para avaliar (sem obrigação de fazer neste ticket, mas anote se notar) se algum `page.tsx`/`app-shell.tsx` ficou grande demais de verdade (não só por causa da linha única) e merece quebrar em sub-componentes — registrar como próximo ticket se for o caso, não expandir escopo agora.

## Plano

1. Adicionar `prettier` (versão compatível com `.prettierrc` atual) como devDependency.
2. Rodar `pnpm format`.
3. Rodar `pnpm --filter web lint`, `pnpm --filter web typecheck`, `pnpm --filter web build`, `pnpm --filter web test` — confirmar que nada quebrou.
4. Commit único fechando os tickets 0001–0003 (scaffold + Design System + Login/Dashboard shell + Central de Agentes + esta formatação).

## Critério de aceite

- [ ] `pnpm format` executa sem erro "command not found".
- [ ] Nenhum arquivo `.tsx` em `apps/web` tem uma linha de JSX com centenas/milhares de caracteres (checagem simples: maior linha de cada arquivo bem abaixo de ~200 caracteres, salvo strings literais longas justificáveis).
- [ ] `pnpm --filter web lint`, `typecheck`, `build`, `test` passam depois da reformatação.
