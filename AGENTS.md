# AGENTS.md — Como trabalhamos neste repositório

Este documento é o contrato operacional entre **Claude** (CTO / Arquiteto / Reviewer) e **Codex** (implementação de frontend), e vale para qualquer outro agente que venha a tocar este código.

## Papéis

### Claude — CTO / Arquiteto / Reviewer
Arquitetura • banco de dados (Supabase, schema, RLS) • segurança • eventos/realtime • workers • integrações (Activepieces, OpenClaw, marketplaces) • review de todo código produzido • performance • documentação.

### Codex — Implementação de Frontend
Componentes • HTML • React • telas • gráficos • UX • responsividade • integrações de frontend (consumo de API/Supabase client).

Claude define arquitetura e tickets; Codex implementa a UI sobre a arquitetura definida; Claude revisa tudo antes de considerar concluído.

## Ordem de prioridade de recursos (antes de escrever qualquer código)

1. Skill nativa do ambiente
2. Skill instalada no projeto
3. MCP oficial
4. MCP aprovado pelo projeto
5. SDK oficial
6. API oficial
7. Biblioteca consolidada
8. Template / boilerplate
9. Componente reutilizável já existente no repo
10. Implementação própria — **somente com ADR em `docs/architecture-decisions/`**

Componentes preferenciais a avaliar primeiro: Supabase, OpenClaw, Activepieces, Metabase, Evolution API, Redis, Qdrant, Playwright, Docker, GitHub Actions, shadcn/ui.

Documente sempre qual recurso foi escolhido e por quê — mesmo quando a escolha for óbvia, uma linha no PR/commit basta.

## Economia de tokens

Ordem de resolução, da mais barata para a mais cara: **SQL → TypeScript → Templates → Cache → Modelo pequeno → Modelo grande**. Nunca usar LLM para ordenar, filtrar, somar, calcular, comparar, validar ou deduplicar — isso é SQL/TypeScript.

Antes de chamar um LLM, pergunte: existe cache? existe template? existe Skill/MCP/SDK que resolve? posso reduzir o contexto enviado ou a saída esperada?

## Fluxo obrigatório por tarefa

### Antes de começar, produzir:
1. **Objetivo** — o que muda e por quê.
2. **Arquivos** — quais serão criados/alterados.
3. **Riscos** — o que pode quebrar, dados sensíveis envolvidos, migrações irreversíveis.
4. **Plano** — passos concretos.
5. **Critério de aceite** — como saber que terminou.

Use o template em [`docs/tasks/_TEMPLATE.md`](docs/tasks/_TEMPLATE.md).

### Depois de implementar, executar:
Lint → Build → Typecheck → Testes → Documentação atualizada.

Nenhuma tarefa é considerada concluída com lint, build, typecheck ou testes falhando. Nenhuma fase do roadmap começa sem a anterior estável (ver `PROJECT_CHARTER.md`, seção Roadmap).

## Checklist de "definição de pronto" (obrigatório antes de fechar qualquer tarefa)

- [ ] Arquitetura respeitada (separação de responsabilidades, baixo acoplamento, alta coesão; nenhum módulo depende de implementação concreta quando existe interface).
- [ ] Reuso avaliado antes de criar algo novo (skills, MCPs, SDKs, bibliotecas, componentes existentes).
- [ ] Implementação própria, se houver, registrada em `docs/architecture-decisions/`.
- [ ] Código revisado: sem duplicação, sem código morto, sem imports não usados, sem componentes repetidos.
- [ ] Sem consultas ineficientes (N+1, falta de índice, falta de paginação).
- [ ] Segurança verificada: sem segredos expostos ao frontend/prompt, RLS ativo onde há dados multiusuário, autenticação/autorização corretas, entrada validada e sanitizada (XSS/CSRF/SQL injection), logs sem dados sensíveis.
- [ ] Acessibilidade básica verificada em telas novas/alteradas.
- [ ] Performance verificada: renderizações desnecessárias, memoização quando apropriado, lazy loading/virtualização em listas grandes, cache aplicado.
- [ ] Lint sem erros.
- [ ] Typecheck sem erros.
- [ ] Build concluído.
- [ ] Testes executados e passando.
- [ ] Documentação atualizada (README, `docs/ARCHITECTURE.md`, ADR, changelog quando aplicável).
- [ ] Consumo de tokens minimizado (nenhuma chamada a LLM para tarefa determinística).
- [ ] Nenhuma implementação desnecessária (sem feature especulativa, sem abstração prematura).

## Dados e realtime — regras rígidas

- Supabase é a fonte oficial. Todo agente grava status, progresso, tempo, tokens, custo, mensagens, erros e resultado.
- Nenhum dado exibido no frontend pode ser fake. Progresso/status vêm do banco via realtime, nunca simulados no client. Dados de seed para desenvolvimento são explícitos e claramente identificados como tal — nunca aparecem como se fossem produção.

## Onde registrar o quê

| Tipo de informação | Onde |
|---|---|
| Visão de produto, princípios, roadmap | `PROJECT_CHARTER.md` |
| Arquitetura técnica, stack, contratos entre camadas | `docs/ARCHITECTURE.md` |
| Decisão de implementar algo próprio em vez de reusar | `docs/architecture-decisions/NNNN-titulo.md` |
| Ticket de trabalho (objetivo/arquivos/riscos/plano/aceite) | `docs/tasks/` |
