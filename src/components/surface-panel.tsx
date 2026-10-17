import { useState } from "react";
import { Metric, Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bitFlipDemo } from "@/lib/qudit";
import { emptySurface, injectError, randomErrors, type SurfaceState } from "@/lib/surface";
import { cn } from "@/lib/utils";

export function SurfacePanel() {
  const [surf, setSurf] = useState<SurfaceState>(() => emptySurface(5));
  const [seed, setSeed] = useState(1);
  const [err, setErr] = useState<number | null>(null);
  const d = 3;
  const flip = bitFlipDemo(d, err);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <Panel
        className="lg:col-span-7"
        kicker="Surface"
        title="Z-syndrome patch · greedy matching"
        action={<Badge tone={surf.logical ? "warn" : "ok"}>{surf.logical ? "logical X" : "trivial"}</Badge>}
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setSurf(emptySurface(5))}>
            Reset
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const s = seed + 1;
              setSeed(s);
              setSurf(randomErrors(5, 0.12, s));
            }}
          >
            Random errors
          </Button>
        </div>
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${surf.size}, minmax(0, 1fr))` }}
        >
          {surf.data.map((row, y) =>
            row.map((on, x) => {
              const marked = surf.corrections.some((c) => c.x === x && c.y === y);
              return (
                <button
                  key={`${x}-${y}`}
                  type="button"
                  onClick={() => setSurf(injectError(surf, x, y))}
                  className={cn(
                    "aspect-square rounded-sm font-mono text-xs",
                    on ? "bg-destructive/80 text-background" : "bg-card-2 text-muted",
                    marked && "ring-1 ring-primary",
                  )}
                  aria-label={`data ${x},${y}`}
                >
                  {on ? "X" : "·"}
                </button>
              );
            }),
          )}
        </div>
        <p className="mt-2 text-xs text-muted">
          Click a data qubit to flip an X error. Teal ring = decoder chain. This is an educational
          patch, not a full distance-3 MWPM decoder.
        </p>
      </Panel>

      <Panel className="lg:col-span-5" kicker="qLDPC-lite" title={`d=${d} shift code`}>
        <p className="mb-3 text-sm text-muted">Encode |0⟩ → |000⟩. Inject a single Weyl-X, read syndrome, correct.</p>
        <div className="mb-3 flex flex-wrap gap-2">
          <Button size="sm" variant={err === null ? "default" : "secondary"} onClick={() => setErr(null)}>
            No error
          </Button>
          {[0, 1, 2].map((q) => (
            <Button key={q} size="sm" variant={err === q ? "default" : "secondary"} onClick={() => setErr(q)}>
              X on q{q}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Metric label="After error" value={flip.afterError.join("")} />
          <Metric label="Syndrome" value={flip.syndrome.join(",")} />
          <Metric label="Corrected" value={flip.corrected.join("")} />
          <Metric
            label="Logical"
            value={flip.recovered ? "recovered" : "fail"}
            tone={flip.recovered ? "ok" : "danger"}
          />
        </div>
      </Panel>
    </div>
  );
}
