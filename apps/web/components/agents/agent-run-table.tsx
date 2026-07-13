import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleAlert,
  Clock3,
} from "lucide-react";

import { AgentRunProgress } from "@/components/agents/agent-run-progress";
import { AgentStatusBadge } from "@/components/agents/agent-status-badge";
import type { AgentRun } from "@/lib/agent-runs/types";

const tokenFormatter = new Intl.NumberFormat("pt-BR");
const costFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});
const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatDuration(run: AgentRun) {
  if (!run.startedAt) return "Ainda não iniciou";
  const end = run.finishedAt ? new Date(run.finishedAt).getTime() : Date.now();
  const seconds = Math.max(
    0,
    Math.round((end - new Date(run.startedAt).getTime()) / 1_000)
  );
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0
    ? `${minutes}min ${remainingSeconds}s`
    : `${minutes}min`;
}

function TokenPair({ run }: { run: AgentRun }) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
      <span
        className="inline-flex items-center gap-1 text-muted-foreground"
        title="Tokens de entrada"
      >
        <ArrowDownToLine className="size-3.5" />
        {tokenFormatter.format(run.tokensInput)}
      </span>
      <span
        className="inline-flex items-center gap-1 text-foreground"
        title="Tokens de saída"
      >
        <ArrowUpFromLine className="size-3.5" />
        {tokenFormatter.format(run.tokensOutput)}
      </span>
    </div>
  );
}

function RunIdentity({ run }: { run: AgentRun }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold text-foreground">{run.agentName}</p>
      <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
        {run.id}
      </p>
      {run.error && (
        <p className="mt-2 flex max-w-sm items-start gap-1.5 text-xs leading-5 text-destructive">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
          {run.error}
        </p>
      )}
    </div>
  );
}

export function AgentRunTable({ runs }: { runs: AgentRun[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse text-left">
            <thead>
              <tr className="border-b bg-muted/45 font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">
                <th className="px-5 py-3.5 font-medium">Agente</th>
                <th className="px-4 py-3.5 font-medium">Estado</th>
                <th className="px-4 py-3.5 font-medium">Progresso</th>
                <th className="px-4 py-3.5 font-medium">Tokens E/S</th>
                <th className="px-4 py-3.5 font-medium">Custo</th>
                <th className="px-5 py-3.5 font-medium">Início / duração</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(run => (
                <tr
                  key={run.id}
                  className="border-b last:border-0 hover:bg-muted/25"
                >
                  <td className="max-w-xs px-5 py-4 align-top">
                    <RunIdentity run={run} />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <AgentStatusBadge status={run.status} />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <AgentRunProgress value={run.progress} />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <TokenPair run={run} />
                  </td>
                  <td className="px-4 py-4 align-top font-mono text-xs font-semibold tabular-nums">
                    {costFormatter.format(run.costUsd)}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <p className="text-sm">
                      {run.startedAt
                        ? timeFormatter.format(new Date(run.startedAt))
                        : "—"}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3 className="size-3.5" />
                      {formatDuration(run)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="space-y-3 md:hidden">
        {runs.map(run => (
          <article key={run.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <RunIdentity run={run} />
              <AgentStatusBadge status={run.status} className="shrink-0" />
            </div>
            <AgentRunProgress value={run.progress} className="mt-5" />
            <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground">
                  Tokens E/S
                </p>
                <div className="mt-1.5">
                  <TokenPair run={run} />
                </div>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground">
                  Custo
                </p>
                <p className="mt-1.5 font-mono text-xs font-semibold tabular-nums">
                  {costFormatter.format(run.costUsd)}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground">
                  Início
                </p>
                <p className="mt-1.5 text-xs">
                  {run.startedAt
                    ? timeFormatter.format(new Date(run.startedAt))
                    : "—"}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground">
                  Duração
                </p>
                <p className="mt-1.5 text-xs">{formatDuration(run)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
