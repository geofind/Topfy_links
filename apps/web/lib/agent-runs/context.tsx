"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { AgentRun, AgentRunsClient } from "./types";

type AgentRunsState = "loading" | "ready" | "empty" | "error";

interface AgentRunsContextValue {
  runs: AgentRun[];
  state: AgentRunsState;
  error: string | null;
}

const AgentRunsContext = createContext<AgentRunsContextValue | null>(null);

export function AgentRunsProvider({
  client,
  children,
}: {
  client: AgentRunsClient;
  children: React.ReactNode;
}) {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [state, setState] = useState<AgentRunsState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribe: () => void = () => undefined;

    void client
      .list()
      .then(initialRuns => {
        if (!active) return;
        setRuns(initialRuns);
        setState(initialRuns.length > 0 ? "ready" : "empty");
        setError(null);

        unsubscribe = client.subscribe(nextRuns => {
          if (!active) return;
          setRuns(nextRuns);
          setState(nextRuns.length > 0 ? "ready" : "empty");
        });
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setState("error");
        setError(
          reason instanceof Error
            ? reason.message
            : "Não foi possível carregar as execuções."
        );
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [client]);

  const value = useMemo(() => ({ runs, state, error }), [runs, state, error]);
  return (
    <AgentRunsContext.Provider value={value}>
      {children}
    </AgentRunsContext.Provider>
  );
}

export function useAgentRuns() {
  const context = useContext(AgentRunsContext);
  if (!context)
    throw new Error("useAgentRuns deve ser usado dentro de AgentRunsProvider.");
  return context;
}
