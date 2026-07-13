import { describe, expect, it } from "vitest";

import { runWorker } from "./run-worker";
import type { AgentRunRecord, AgentRunsRepository, WorkerDefinition } from "./types";

class InMemoryAgentRunsRepository implements AgentRunsRepository {
  records = new Map<string, AgentRunRecord>();
  private nextId = 0;

  async create(input: { userId: string; agentName: string }): Promise<AgentRunRecord> {
    const id = `run-${this.nextId++}`;
    const record: AgentRunRecord = {
      id,
      userId: input.userId,
      agentName: input.agentName,
      status: "queued",
      progress: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: 0,
      messages: [],
      error: null,
      result: null,
      startedAt: null,
      finishedAt: null,
      createdAt: new Date().toISOString(),
    };
    this.records.set(id, record);
    return record;
  }

  async update(id: string, patch: Partial<AgentRunRecord>): Promise<void> {
    const current = this.records.get(id);
    if (!current) throw new Error(`run ${id} não existe`);
    this.records.set(id, { ...current, ...patch });
  }
}

describe("runWorker", () => {
  it("leva o run de queued a succeeded reportando progresso/tokens/custo", async () => {
    const repo = new InMemoryAgentRunsRepository();
    const definition: WorkerDefinition<{ query: string }, { found: number }> = {
      name: "ScoutWorker",
      async run(input, ctx) {
        await ctx.reportProgress(50);
        await ctx.reportTokens(100, 20);
        await ctx.reportCost(0.01);
        await ctx.log(`buscando: ${input.query}`);
        return { found: 3 };
      },
    };

    const result = await runWorker(definition, repo, "user-1", { query: "roku stick" });

    expect(result).toEqual({ found: 3 });
    const record = [...repo.records.values()][0];
    expect(record.status).toBe("succeeded");
    expect(record.progress).toBe(100);
    expect(record.tokensInput).toBe(100);
    expect(record.tokensOutput).toBe(20);
    expect(record.costUsd).toBeCloseTo(0.01);
    expect(record.messages).toEqual(["buscando: roku stick"]);
    expect(record.result).toEqual({ found: 3 });
    expect(record.finishedAt).not.toBeNull();
  });

  it("marca o run como failed e propaga o erro quando o worker lança exceção", async () => {
    const repo = new InMemoryAgentRunsRepository();
    const definition: WorkerDefinition<void, void> = {
      name: "ContentWorker",
      async run() {
        throw new Error("provedor indisponível");
      },
    };

    await expect(runWorker(definition, repo, "user-1", undefined)).rejects.toThrow(
      "provedor indisponível"
    );

    const record = [...repo.records.values()][0];
    expect(record.status).toBe("failed");
    expect(record.error).toBe("provedor indisponível");
    expect(record.finishedAt).not.toBeNull();
  });

  it("satura o progresso reportado entre 0 e 100", async () => {
    const repo = new InMemoryAgentRunsRepository();
    let progressDuringRun: number | undefined;
    const definition: WorkerDefinition<void, null> = {
      name: "MonitorWorker",
      async run(_input, ctx) {
        await ctx.reportProgress(150);
        // Checar aqui, não depois do runWorker(): o passo final de sucesso
        // força progress=100 de qualquer forma, o que mascararia um clamp
        // quebrado em reportProgress.
        progressDuringRun = [...repo.records.values()][0].progress;
        return null;
      },
    };

    await runWorker(definition, repo, "user-1", undefined);

    expect(progressDuringRun).toBe(100);
  });
});
