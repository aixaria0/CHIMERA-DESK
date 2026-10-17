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
    steel: "text-steel bg-card-2",
    ok: "text-primary bg-primary/10",
    warn: "text-warn bg-warn/10",
    danger: "text-destructive bg-destructive/10",
    mute: "text-muted bg-card-2",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
