export type AgentRunStatus =
  "queued" | "running" | "succeeded" | "failed" | "cancelled";

export interface AgentRun {
  id: string;
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

export interface AgentRunsClient {
  list(): Promise<AgentRun[]>;
  subscribe(onChange: (runs: AgentRun[]) => void): () => void;
}
