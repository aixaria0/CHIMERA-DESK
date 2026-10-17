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
        "flex min-h-0 flex-col rounded-lg bg-card p-3 shadow-[var(--shadow-border)]",
        className,
      )}
      {...props}
    >
      {(title || action || kicker) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {kicker ? (
              <p className="mb-0.5 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
                {kicker}
              </p>
            ) : null}
            {title ? (
              <h2 className="truncate text-sm font-medium tracking-tight text-foreground">
                {title}
              </h2>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      )}
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
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
  return (
    <div className="rounded-md bg-card-2 p-3 shadow-[var(--shadow-border)]">
      <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className={cn("mt-1 font-mono text-xl font-medium tabular tracking-tight", tones[tone])}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
