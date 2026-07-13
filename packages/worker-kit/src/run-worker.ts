import type { AgentRunsRepository, WorkerContext, WorkerDefinition } from "./types";

/**
 * Ciclo de vida comum a todo Worker (ScoutWorker, NormalizerWorker, ...):
 * cria o agent_run (queued) -> running -> succeeded/failed, reportando
 * progresso/tokens/custo/mensagens a cada passo. Isto é o "Event Bus" do
 * charter na prática: cada `repo.update` é uma mudança de linha que o
 * Supabase Realtime propaga ao frontend, sem precisar de um barramento à parte.
 *
 * Nenhuma lógica de negócio vive aqui — só o envelope de observabilidade.
 * A lógica de cada agente vive em `definition.run`.
 */
export async function runWorker<Input, Output>(
  definition: WorkerDefinition<Input, Output>,
  repo: AgentRunsRepository,
  userId: string,
  input: Input
): Promise<Output> {
  const record = await repo.create({ userId, agentName: definition.name });

  await repo.update(record.id, {
    status: "running",
    startedAt: new Date().toISOString(),
  });

  let tokensInput = 0;
  let tokensOutput = 0;
  let costUsd = 0;
  const messages: string[] = [];

  const ctx: WorkerContext = {
    async reportProgress(percent) {
      const clamped = Math.max(0, Math.min(100, Math.round(percent)));
      await repo.update(record.id, { progress: clamped });
    },
    async reportTokens(inputTokens, outputTokens) {
      tokensInput += inputTokens;
      tokensOutput += outputTokens;
      await repo.update(record.id, { tokensInput, tokensOutput });
    },
    async reportCost(usd) {
      costUsd += usd;
      await repo.update(record.id, { costUsd });
    },
    async log(message) {
      messages.push(message);
      await repo.update(record.id, { messages: [...messages] });
    },
  };

  try {
    const result = await definition.run(input, ctx);
    await repo.update(record.id, {
      status: "succeeded",
      progress: 100,
      result: result ?? null,
      finishedAt: new Date().toISOString(),
    });
    return result;
  } catch (error) {
    await repo.update(record.id, {
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
      finishedAt: new Date().toISOString(),
    });
    throw error;
  }
}
