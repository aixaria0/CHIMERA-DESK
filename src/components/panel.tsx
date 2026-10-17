import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  kicker,
  action,
  className,
  bodyClassName,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  title?: string;
  kicker?: string;
  action?: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "panel-surface density-panel flex min-h-0 flex-col rounded-2xl",
        className,
      )}
      {...props}
    >
      {(title || action || kicker) && (
        <header className="relative z-[1] mb-3.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {kicker ? (
              <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-primary/65">
                {kicker}
              </p>
            ) : null}
            {title ? (
              <h2 className="truncate text-[13px] font-semibold tracking-[-0.015em] text-foreground">
                {title}
              </h2>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      )}
      <div className={cn("relative z-[1] min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Metric({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "ok" | "warn" | "danger";
}) {
  const tones = {
    default: "text-foreground",
    ok: "text-primary",
    warn: "text-warn",
    danger: "text-destructive",
  };
  const dots = {
    default: "bg-steel/55",
    ok: "bg-primary",
    warn: "bg-warn",
    danger: "bg-destructive",
  };
  return (
    <div className="metric-surface rounded-xl p-3.5">
      <div className="flex items-center gap-2">
        <span className={cn("size-1.5 rounded-full", dots[tone])} />
        <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-muted">{label}</p>
      </div>
      <p className={cn("mt-2 font-mono text-[1.35rem] font-semibold tabular tracking-[-0.04em]", tones[tone])}>
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[10px] leading-relaxed text-muted">{hint}</p> : null}
    </div>
  );
}
