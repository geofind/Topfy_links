# Ticket 0002 — Telas de Login e Dashboard shell

- **Fase:** 0 (Fundação) / prepara a Fase 1 (Dashboard real)
- **Responsável:** Codex
- **Depende de:** [0001](0001-frontend-nextjs-scaffold-design-system.md)

## Contexto

Este ticket constrói as **telas** de Login e do shell do Dashboard usando os primitivos de Design System do ticket 0001. A integração real com Supabase Auth (sessão, RLS, redirecionamento por usuário autenticado) é um ticket separado, feito por Claude em paralelo — por isso este ticket define um **contrato de dados mockado** para não bloquear o trabalho de UI esperando o backend.

Nenhum dado exibido pode ficar "fake" permanentemente (ver `PROJECT_CHARTER.md`, seção 5) — o mock aqui é só para desbloquear o desenvolvimento da UI; será substituído pela implementação real de auth sem exigir mudança nos componentes de tela, desde que a interface abaixo seja respeitada (inversão de dependência).

## Objetivo

Tela de login funcional (visualmente, com validação de formulário) e shell do Dashboard (layout autenticado com navegação lateral para as seções futuras: Central de Agentes, Radar, Estúdio de Conteúdo, Publicações, Growth, Analytics, Configurações) — todas usando dados mockados através da interface definida abaixo, nunca hardcoded direto nos componentes de tela.

## Contrato de dados (implementar como mock agora; Claude troca pela implementação real depois)

Criar `apps/web/lib/auth/types.ts`:

```ts
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: string; // ISO timestamp
}

export interface AuthClient {
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
}
```

Criar `apps/web/lib/auth/mock-client.ts` implementando `AuthClient` com dados em memória (aceitar qualquer email/senha não vazios, simular latência de ~300ms). Os componentes de tela devem depender apenas do tipo `AuthClient` (injetado via um provider/contexto simples), nunca da implementação mock diretamente — isso permite trocar por `apps/web/lib/auth/supabase-client.ts` depois sem tocar nas telas.

## Arquivos

- `apps/web/lib/auth/types.ts`, `apps/web/lib/auth/mock-client.ts`, `apps/web/lib/auth/context.tsx` (provider React simples expondo `useAuth()`).
- `apps/web/app/login/page.tsx` — formulário de login (email/senha, validação com `react-hook-form` + `zod`, já eram dependências do scaffold herdado).
- `apps/web/app/(dashboard)/layout.tsx` — layout autenticado usando `AppShell` do ticket 0001, navegação lateral com placeholders para: Dashboard, Central de Agentes, Radar, Estúdio de Conteúdo, Publicações, Growth, Analytics, Configurações (rotas podem ser páginas vazias/"em construção" por ora).
- `apps/web/app/(dashboard)/dashboard/page.tsx` — página inicial do dashboard (vazia/placeholder, real na Fase 1).
- `apps/web/middleware.ts` ou verificação client-side simples redirecionando `/(dashboard)/*` para `/login` quando `getSession()` retorna `null`.

## Riscos

- Não persistir a sessão mockada em nada além de memória/estado do provider — não usar `localStorage` para simular auth real (evita confusão futura com sessão de verdade do Supabase).
- Não implementar nenhuma chamada real ao Supabase neste ticket — isso é escopo de Claude num ticket futuro, para não duplicar trabalho de configuração de projeto/credenciais.
- Manter os textos das seções da navegação lateral alinhados aos nomes usados em `docs/ARCHITECTURE.md` (Dashboard, Central de Agentes, Radar de Produtos, Estúdio de Conteúdo, Publicações, Growth, Analytics, Configurações) para não divergir da nomenclatura oficial.

## Plano

1. Criar o contrato `AuthClient`/`AuthUser`/`AuthSession` e o `mock-client.ts`.
2. Criar `AuthProvider`/`useAuth()` em contexto React.
3. Construir a tela de login com validação de formulário.
4. Construir o layout autenticado (`AppShell` + navegação lateral com os placeholders de seção).
5. Adicionar redirecionamento simples: sem sessão → `/login`; com sessão → mantém em `/dashboard/*`.

## Critério de aceite

- [ ] `pnpm --filter web dev`: acessar `/login`, preencher email/senha válidos, é redirecionado ao dashboard shell.
- [ ] Acessar `/dashboard` sem sessão redireciona para `/login`.
- [ ] Navegação lateral lista todas as seções da Fase 1+ como placeholders (sem 404).
- [ ] Nenhum componente de tela importa `mock-client.ts` diretamente — apenas via `useAuth()`/`AuthClient`.
- [ ] `pnpm --filter web lint`, `pnpm --filter web build` passam sem erro.
