# worker-kit

Kit compartilhado que todo Worker (`ScoutWorker`, `NormalizerWorker`, `RankingWorker`, `ContentWorker`, `PublisherWorker`, `GrowthWorker`, `AnalyticsWorker`, `MonitorWorker` — ver `docs/ARCHITECTURE.md`) usa para reportar status/progresso/tokens/custo em `canaltopfy.agent_runs`, sem duplicar essa lógica em cada worker.

**Isto não implementa nenhum Worker de verdade** (isso é escopo de cada fase — ex.: `ScoutWorker` na Fase 2/Radar). É só o envelope de observabilidade: `runWorker(definition, repo, userId, input)` cria o `agent_run`, chama `definition.run(input, ctx)`, e `ctx` deixa o worker reportar progresso/tokens/custo/mensagens sem tocar direto no banco.

Cada `repo.update(...)` é uma escrita em `canaltopfy.agent_runs` — o Supabase Realtime propaga isso ao frontend automaticamente. É assim que o "Event Bus" do charter funciona na prática: não existe (nem precisa existir) um barramento de eventos separado.

## Uso

```ts
import { runWorker, SupabaseAgentRunsRepository } from "worker-kit";
import { createClient } from "@supabase/supabase-js";

const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const repo = new SupabaseAgentRunsRepository(client);

await runWorker(
  {
    name: "ScoutWorker",
    async run(input: { query: string }, ctx) {
      await ctx.reportProgress(10);
      // ... lógica real do Fase 2 aqui ...
      await ctx.reportTokens(120, 30);
      await ctx.reportCost(0.004);
      return { found: 12 };
    },
  },
  repo,
  userId,
  { query: "roku stick" }
);
```

Em testes, use um fake `AgentRunsRepository` em memória (ver `src/run-worker.test.ts`) em vez do Supabase real — `runWorker` depende só da interface, nunca da implementação concreta (inversão de dependência).

## Pendências

- Instalado e verificado: `pnpm --filter worker-kit typecheck` e `pnpm --filter worker-kit test` passam (3/3 testes). A primeira tentativa de `pnpm install` falhou neste ambiente por um erro de TLS (`UNABLE_TO_VERIFY_LEAF_SIGNATURE` ao buscar `@supabase/supabase-js` em `registry.npmjs.org`) — resolvido rodando com `NODE_OPTIONS=--use-system-ca` (o Node não estava usando o truststore de CA do sistema operacional).
- `SupabaseAgentRunsRepository` ainda não foi validado contra um projeto Supabase real (sem credenciais ainda — ver `supabase/README.md`) — só o typecheck/tipos foram verificados, não uma chamada de verdade.
