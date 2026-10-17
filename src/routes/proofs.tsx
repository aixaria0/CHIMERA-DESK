import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Metric, Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { evaluateHumble, THEOREMS, type TheoremId } from "@/lib/logic";
import { RULES } from "@/lib/typesys";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/proofs")({ component: Proofs });

function Proofs() {
  const [id, setId] = useState<TheoremId>("g2");
  const [claim, setClaim] = useState(false);
  const th = THEOREMS.find((t) => t.id === id) ?? THEOREMS[0];
  const hum = evaluateHumble(claim);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Logic sketches</p>
        <h1 className="text-2xl font-semibold tracking-tight">Why a node must not claim it proved itself safe</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel">
          These are educational Lean sketches, not a live theorem prover. Gödel–Löb says a
          consistent system cannot prove its own consistency. Toggle the claim below to see the
          node go from humble (sound) to broken (G2).
        </p>
      </div>


      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Lock" value="on" hint="operational δ = 1" tone="ok" />
        <Metric
          label="Humble"
          value={hum.humble ? "yes" : "no"}
          hint="must not prove itself consistent"
          tone={hum.humble ? "ok" : "danger"}
        />
        <Metric label="Self-proof" value={claim ? "claimed" : "not claimed"} />

        <Metric label="Theorems" value={String(THEOREMS.length)} hint="machine-checkable sketches" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {THEOREMS.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={id === t.id ? "default" : "secondary"}
            onClick={() => setId(t.id)}
          >
            {t.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <Panel className="lg:col-span-7" kicker="Sketch" title={th.name}>
          <p className="font-mono text-sm text-primary">{th.statement}</p>
          <p className="mt-3 text-sm leading-relaxed text-steel">{th.informal}</p>
          <pre className="scan-hide mt-4 overflow-auto rounded-md bg-background p-3 font-mono text-xs leading-relaxed text-steel">
            {th.lean}
          </pre>
        </Panel>
        <Panel
          className="lg:col-span-5"
          kicker="Safety rule"
          title="Claim ‘I proved I am consistent’?"
          action={<Badge tone={hum.humble ? "ok" : "danger"}>{hum.humble ? "SOUND" : "BROKEN"}</Badge>}
        >
          <p className="text-sm text-muted">
            Off = the node stays humble (this is the correct stance). On = it asserts a proof of
            its own consistency, which Gödel’s second theorem forbids.
          </p>
          <button
            type="button"
            onClick={() => setClaim((v) => !v)}
            className={cn(
              "mt-4 h-11 w-full rounded-sm text-sm font-medium",
              claim ? "bg-destructive text-background" : "bg-primary text-primary-foreground",
            )}
          >
            {claim ? "Take the claim back" : "Make the forbidden claim"}
          </button>

          <p className="mt-3 text-sm text-steel">{hum.note}</p>
        </Panel>
      </div>

      <Panel kicker="Types" title="Linear calculus (owned registers)">
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {RULES.map((r) => (
            <li key={r.name} className="rounded-md bg-card-2 p-3">
              <p className="text-sm font-medium">{r.name}</p>
              <p className="mt-1 font-mono text-xs text-muted">{r.form}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
