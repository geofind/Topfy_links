import { cn } from "@/lib/utils";

export function AgentRunProgress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const progress = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("flex min-w-32 items-center gap-3", className)}>
      <div
        role="progressbar"
        aria-label={`Progresso: ${progress}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="w-9 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {progress}%
      </span>
    </div>
  );
}
