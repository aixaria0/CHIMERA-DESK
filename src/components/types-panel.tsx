import { useState } from "react";
import { Explain } from "@/components/explain";
import { Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RULES, teleportDerivation, typeLabel } from "@/lib/typesys";
import { cn } from "@/lib/utils";

export function TypesPanel() {

  const [d, setD] = useState(2);
  const steps = teleportDerivation(d);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <Panel
        className="lg:col-span-8"
        kicker="Linear types"
        title="Ownership derivation · teleport"
        action={
          <div className="flex gap-1">
            {([2, 3, 4] as const).map((dim) => (
              <Button key={dim} size="sm" variant={d === dim ? "default" : "secondary"} onClick={() => setD(dim)}>
                d={dim}
              </Button>
            ))}
          </div>
        }
      >
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={s.expr} className="rounded-md bg-card-2 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xs text-primary">
                  {i + 1}. {s.rule}
                </p>
                <Badge tone="steel">{typeLabel(s.type)}</Badge>
              </div>
              <p className="font-mono text-sm text-foreground">{s.expr}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.ctx.map((b) => (
                  <span
                    key={b.name}
                    className={cn(
                      "rounded-sm px-2 py-1 font-mono text-xs",
                      b.owned ? "bg-primary/15 text-primary" : "bg-background text-muted",
                    )}
                  >
                    {b.name}:{typeLabel(b.type)}
                    {b.owned ? "" : " consumed"}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">{s.note}</p>
            </li>
          ))}
        </ol>
        <Explain id="types" lang="en" />
      </Panel>

      <Panel className="lg:col-span-4" kicker="Rules" title="Core calculus">
        <ul className="space-y-2">
          {RULES.map((r) => (
            <li key={r.name} className="rounded-md bg-card-2 p-3">
              <p className="text-sm font-medium">{r.name}</p>
              <p className="mt-1 font-mono text-xs leading-relaxed text-muted">{r.form}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Entanglement is allowed only inside an owned region. The frame rule is the classical one
          because ownership forbids cross-boundary EPR pairs.
        </p>
      </Panel>
    </div>
  );
}
