import type { AgentRun, AgentRunsClient } from "./types";

const LIST_DELAY_MS = 180;
const UPDATE_INTERVAL_MS = 2_000;
const MAX_RUNS = 12;

const AGENT_NAMES = [
  "ScoutWorker",
  "NormalizerWorker",
  "RankingWorker",
  "ContentWorker",
  "PublisherWorker",
  "GrowthWorker",
  "AnalyticsWorker",
  "MonitorWorker",
] as const;

function isoAtOffset(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

function cloneRun(run: AgentRun): AgentRun {
  return { ...run, messages: [...run.messages] };
}

function cloneRuns(runs: AgentRun[]) {
  return runs.map(cloneRun);
}

function createInitialRuns(): AgentRun[] {
  return [
    {
      id: "mock-run-monitor",
      agentName: "MonitorWorker",
      status: "queued",
      progress: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: 0,
      messages: ["Aguardando capacidade disponível."],
      error: null,
      result: null,
      startedAt: null,
      finishedAt: null,
      createdAt: isoAtOffset(1),
    },
    {
      id: "mock-run-analytics",
      agentName: "AnalyticsWorker",
      status: "running",
      progress: 31,
      tokensInput: 846,
      tokensOutput: 215,
      costUsd: 0.0062,
      messages: ["Consolidando sinais de desempenho."],
      error: null,
      result: null,
      startedAt: isoAtOffset(2),
      finishedAt: null,
      createdAt: isoAtOffset(2),
    },
    {
      id: "mock-run-growth",
      agentName: "GrowthWorker",
      status: "succeeded",
      progress: 100,
      tokensInput: 1204,
      tokensOutput: 487,
      costUsd: 0.0118,
      messages: ["Recomendações geradas."],
      error: null,
      result: { recommendations: 4 },
      startedAt: isoAtOffset(9),
      finishedAt: isoAtOffset(7),
      createdAt: isoAtOffset(9),
    },
    {
      id: "mock-run-publisher",
      agentName: "PublisherWorker",
      status: "cancelled",
      progress: 42,
      tokensInput: 312,
      tokensOutput: 86,
      costUsd: 0.0021,
      messages: ["Execução cancelada pelo operador."],
      error: null,
      result: null,
      startedAt: isoAtOffset(16),
      finishedAt: isoAtOffset(15),
      createdAt: isoAtOffset(16),
    },
    {
      id: "mock-run-content",
      agentName: "ContentWorker",
      status: "failed",
      progress: 68,
      tokensInput: 1830,
      tokensOutput: 622,
      costUsd: 0.0154,
      messages: ["A geração foi interrompida."],
      error: "O provedor não respondeu dentro do limite configurado.",
      result: null,
      startedAt: isoAtOffset(24),
      finishedAt: isoAtOffset(21),
      createdAt: isoAtOffset(24),
    },
    {
      id: "mock-run-ranking",
      agentName: "RankingWorker",
      status: "queued",
      progress: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: 0,
      messages: ["Aguardando normalização dos produtos."],
      error: null,
      result: null,
      startedAt: null,
      finishedAt: null,
      createdAt: isoAtOffset(28),
    },
    {
      id: "mock-run-normalizer",
      agentName: "NormalizerWorker",
      status: "running",
      progress: 64,
      tokensInput: 538,
      tokensOutput: 174,
      costUsd: 0.0047,
      messages: ["Normalizando atributos de produto."],
      error: null,
      result: null,
      startedAt: isoAtOffset(34),
      finishedAt: null,
      createdAt: isoAtOffset(34),
    },
    {
      id: "mock-run-scout",
      agentName: "ScoutWorker",
      status: "succeeded",
      progress: 100,
      tokensInput: 942,
      tokensOutput: 301,
      costUsd: 0.0089,
      messages: ["Oportunidades capturadas."],
      error: null,
      result: { productsFound: 18 },
      startedAt: isoAtOffset(42),
      finishedAt: isoAtOffset(39),
      createdAt: isoAtOffset(42),
    },
  ];
}

export class MockAgentRunsClient implements AgentRunsClient {
  private runs = createInitialRuns();
  private listeners = new Set<(runs: AgentRun[]) => void>();
  private interval: ReturnType<typeof setInterval> | null = null;
  private tickCount = 0;
  private completionCount = 0;
  private nextAgentIndex = 0;

  async list(): Promise<AgentRun[]> {
    await new Promise<void>(resolve => setTimeout(resolve, LIST_DELAY_MS));
    return cloneRuns(this.runs);
  }

  subscribe(onChange: (runs: AgentRun[]) => void): () => void {
    this.listeners.add(onChange);
    this.start();

    return () => {
      this.listeners.delete(onChange);
      if (this.listeners.size === 0) this.stop();
    };
  }

  private start() {
    if (this.interval) return;
    this.interval = setInterval(() => this.advance(), UPDATE_INTERVAL_MS);
  }

  private stop() {
    if (!this.interval) return;
    clearInterval(this.interval);
    this.interval = null;
  }

  private advance() {
    this.tickCount += 1;
    const now = new Date().toISOString();

    this.runs = this.runs.map(run => {
      if (run.status !== "running") return run;

      const progress = Math.min(
        100,
        run.progress + 8 + (this.tickCount % 3) * 3
      );
      const tokensInput = run.tokensInput + 72 + this.tickCount * 3;
      const tokensOutput = run.tokensOutput + 24 + this.tickCount;
      const costUsd = Number((run.costUsd + 0.0007).toFixed(4));

      if (progress < 100) {
        return { ...run, progress, tokensInput, tokensOutput, costUsd };
      }

      this.completionCount += 1;
      const failed = this.completionCount % 4 === 0;
      return {
        ...run,
        status: failed ? "failed" : "succeeded",
        progress: 100,
        tokensInput,
        tokensOutput,
        costUsd,
        finishedAt: now,
        error: failed
          ? "A execução simulada terminou com uma falha transitória."
          : null,
        result: failed ? null : { completed: true },
        messages: [
          ...run.messages,
          failed ? "Falha registrada." : "Execução concluída.",
        ],
      };
    });

    if (!this.runs.some(run => run.status === "running")) {
      const queuedIndex = this.runs.findIndex(run => run.status === "queued");
      if (queuedIndex >= 0) {
        this.runs[queuedIndex] = {
          ...this.runs[queuedIndex],
          status: "running",
          progress: 4,
          startedAt: now,
          messages: [...this.runs[queuedIndex].messages, "Execução iniciada."],
        };
      }
    }

    if (this.tickCount % 3 === 0) {
      const agentName = AGENT_NAMES[this.nextAgentIndex % AGENT_NAMES.length];
      this.nextAgentIndex += 1;
      const queuedRun: AgentRun = {
        id: `mock-run-${this.tickCount}-${this.nextAgentIndex}`,
        agentName,
        status: "queued",
        progress: 0,
        tokensInput: 0,
        tokensOutput: 0,
        costUsd: 0,
        messages: ["Execução adicionada à fila simulada."],
        error: null,
        result: null,
        startedAt: null,
        finishedAt: null,
        createdAt: now,
      };
      this.runs = [queuedRun, ...this.runs].slice(0, MAX_RUNS);
    }

    const snapshot = cloneRuns(this.runs);
    this.listeners.forEach(listener => listener(snapshot));
  }
}
