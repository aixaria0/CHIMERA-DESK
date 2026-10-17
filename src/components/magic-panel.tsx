import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Metric, Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { distillCurve, distillLevel } from "@/lib/distill";

export function MagicPanel() {
  const [p, setP] = useState(0.05);
  const [levels, setLevels] = useState(3);
  const curve = useMemo(() => distillCurve(levels, p), [levels, p]);
  const step = distillLevel(p);
  const last = curve[curve.length - 1];

  return (
    <Panel
      kicker="Non-Clifford"
      title="Bravyi–Kitaev 15-to-1 distillation"
      action={<Badge tone={last.p < p ? "ok" : "warn"}>p → p³</Badge>}
    >
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted">
        <label className="flex items-center gap-2">
          input p
          <input
            type="range"
            min={0.01}
            max={0.12}
            step={0.005}
            value={p}
            onChange={(e) => setP(Number(e.target.value))}
          />
          <span className="font-mono text-foreground">{p.toFixed(3)}</span>
        </label>
        <label className="flex items-center gap-2">
          levels
          <input
            type="range"
            min={1}
            max={5}
            value={levels}
            onChange={(e) => setLevels(Number(e.target.value))}
          />
          <span className="font-mono text-foreground">{levels}</span>
        </label>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={curve}>
            <XAxis dataKey="level" tick={{ fill: "#8b939c", fontSize: 10 }} />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip
              contentStyle={{
                background: "#101216",
                border: "1px solid #1c222b",
                fontSize: 12,
              }}
            />
            <Area
              dataKey="p"
              stroke="var(--color-primary)"
              fill="var(--color-primary)"
              fillOpacity={0.15}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Metric label="p in" value={p.toFixed(3)} />
        <Metric label="p out (1 round)" value={step.pout.toExponential(2)} tone="ok" />
        <Metric label="after levels" value={last.p.toExponential(2)} />
        <Metric label="post-select" value={`${(step.yieldP * 100).toFixed(0)}%`} />
      </div>
      <p className="mt-3 text-xs text-muted">
        Leading-order 15-to-1: p′ ≈ 35 p³. T states remain the expensive resource; Cliffords are
        cheap once a code supports them.
      </p>
    </Panel>
  );
}
