"use client";

import { useState } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { AgentRunsProvider } from "@/lib/agent-runs/context";
import { MockAgentRunsClient } from "@/lib/agent-runs/mock-client";
import { AuthProvider } from "@/lib/auth/context";
import { MockAuthClient } from "@/lib/auth/mock-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [authClient] = useState(() => new MockAuthClient());
  const [agentRunsClient] = useState(() => new MockAgentRunsClient());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider client={authClient}>
        <AgentRunsProvider client={agentRunsClient}>
          {children}
        </AgentRunsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
