import { Ban, CircleCheck, CircleX, Clock3, Radio } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AgentRunStatus } from "@/lib/agent-runs/types";

const statusDetails = {
  queued: {
    label: "Na fila",
    icon: Clock3,
    className:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  running: {
    label: "Executando",
    icon: Radio,
    className: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  succeeded: {
    label: "Concluído",
    icon: CircleCheck,
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  failed: {
    label: "Falhou",
    icon: CircleX,
    className: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
  },
  cancelled: {
    label: "Cancelado",
    icon: Ban,
    className:
      "border-slate-500/25 bg-slate-500/10 text-slate-600 dark:text-slate-300",
  },
} satisfies Record<
  AgentRunStatus,
  { label: string; icon: typeof Clock3; className: string }
>;

export function AgentStatusBadge({
  status,
  className,
}: {
  status: AgentRunStatus;
  className?: string;
}) {
  const details = statusDetails[status];
  const Icon = details.icon;

  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        details.className,
        className
      )}
    >
      <span className="relative">
        <Icon className="size-3.5" />
        {status === "running" && (
          <span className="absolute inset-0 animate-ping rounded-full bg-sky-400/35 motion-reduce:hidden" />
        )}
      </span>
      {details.label}
    </span>
  );
}

export { statusDetails };
