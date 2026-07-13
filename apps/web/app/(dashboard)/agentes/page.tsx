"use client";

import { Activity, Bot, CircleAlert, Inbox } from "lucide-react";
import { useMemo } from "react";

import { AgentRunTable } from "@/components/agents/agent-run-table";
import { statusDetails } from "@/components/agents/agent-status-badge";
import { useAgentRuns } from "@/lib/agent-runs/context";
import type { AgentRunStatus } from "@/lib/agent-runs/types";

const statuses: AgentRunStatus[] = [
  "running",
  "queued",
  "succeeded",
  "failed",
  "cancelled",
];

export default function AgentsPage() {
  const { runs, state, error } = useAgentRuns();
  const statusCounts = useMemo(
    () =>
      Object.fromEntries(
        statuses.map(status => [
          status,
          runs.filter(run => run.status === status).length,
        ])
      ) as Record<AgentRunStatus, number>,
    [runs]
  );

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-7xl" aria-busy="true" aria-live="polite">
        <div className="h-44 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
        <div className="mt-5 space-y-2 rounded-2xl border bg-card p-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl bg-muted/70 motion-reduce:animate-none"
            />
          ))}
        </div>
        <span className="sr-only">Carregando execuções de agentes.</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mx-auto grid min-h-[calc(100dvh-10rem)] max-w-7xl place-items-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <div className="max-w-md">
          <CircleAlert className="mx-auto size-8 text-destructive" />
          <h2 className="mt-4 font-display text-2xl font-bold">
            As execuções não foram carregadas.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {error ??
              "Verifique a conexão com a fonte de dados e recarregue a página."}
          </p>
        </div>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="mx-auto grid min-h-[calc(100dvh-10rem)] max-w-7xl place-items-center rounded-2xl border border-dashed bg-card/55 p-8 text-center">
        <div className="max-w-md">
          <Inbox className="mx-auto size-8 text-primary" />
          <h2 className="mt-4 font-display text-2xl font-bold">
            Nenhuma execução por aqui.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Quando um agente entrar na fila, seu status, progresso e consumo
            aparecerão nesta linha de operações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="grid gap-7 p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">
                Linha de operações
              </p>
              <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[.12em] text-amber-700 dark:text-amber-300">
                Simulação local
              </span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-.03em] md:text-4xl">
              Execuções em tempo real.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Acompanhe cada worker da fila ao resultado, com progresso, tokens
              e custo atualizados no mesmo fluxo.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-muted/35 px-3 py-2 text-xs text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-400 opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-sky-500" />
            </span>
            <Activity className="size-3.5" />
            Atualização a cada 2 segundos
          </div>
        </div>
        <div className="grid border-t sm:grid-cols-5">
          {statuses.map(status => {
            const details = statusDetails[status];
            const Icon = details.icon;
            return (
              <div
                key={status}
                className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <span
                  className={`grid size-8 place-items-center rounded-lg border ${details.className}`}
                >
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="font-mono text-lg font-bold tabular-nums">
                    {statusCounts[status]}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {details.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Feed de execuções</h3>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">
          {runs.length} registros visíveis
        </p>
      </div>
      <AgentRunTable runs={runs} />
    </div>
  );
}
