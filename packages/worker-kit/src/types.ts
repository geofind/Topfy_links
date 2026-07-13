export type AgentRunStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

/**
 * Espelha exatamente as colunas de `canaltopfy.agent_runs`
 * (supabase/migrations/20260713120000_create_canaltopfy_schema.sql).
 */
export interface AgentRunRecord {
  id: string;
  userId: string;
  agentName: string;
  status: AgentRunStatus;
  progress: number;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  messages: string[];
  error: string | null;
  result: unknown | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

/**
 * Abstrai a persistência de agent_runs. `runWorker` depende só desta
 * interface — a implementação real (Supabase) fica em
 * `supabase-agent-runs-repository.ts`, e testes usam um fake em memória.
 */
export interface AgentRunsRepository {
  create(input: { userId: string; agentName: string }): Promise<AgentRunRecord>;
  update(id: string, patch: Partial<AgentRunRecord>): Promise<void>;
}

/**
 * O que um Worker recebe para relatar status durante a execução — nunca
 * escreve direto no banco, só através destes métodos (ver "Todo agente é
 * observável" em docs/ARCHITECTURE.md).
 */
export interface WorkerContext {
  reportProgress(percent: number): Promise<void>;
  reportTokens(input: number, output: number): Promise<void>;
  reportCost(usd: number): Promise<void>;
  log(message: string): Promise<void>;
}

export interface WorkerDefinition<Input, Output> {
  name: string;
  run(input: Input, ctx: WorkerContext): Promise<Output>;
}
