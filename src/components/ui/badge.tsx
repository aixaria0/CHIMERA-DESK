import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "steel",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "steel" | "ok" | "warn" | "danger" | "mute";
}) {
  const tones = {
    steel: "border-border/70 bg-card-2/70 text-steel",
    ok: "border-primary/20 bg-primary/[0.08] text-primary",
    warn: "border-warn/20 bg-warn/[0.08] text-warn",
    danger: "border-destructive/20 bg-destructive/[0.08] text-destructive",
    mute: "border-border/60 bg-card-2/45 text-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
