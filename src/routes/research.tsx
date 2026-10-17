import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Explain } from "@/components/explain";
import { Metric, Panel } from "@/components/panel";
import { MagicPanel } from "@/components/magic-panel";
import { SurfacePanel } from "@/components/surface-panel";

import { Badge } from "@/components/ui/badge";
import { discardedWeight, PLATFORMS, QEC_CODES } from "@/lib/sim";
import { useChimera } from "@/lib/store";

export const Route = createFileRoute("/research")({ component: Research });

function Research() {
  const backends = useChimera((s) => s.backends);
  const [chi, setChi] = useState(16);
  const ibq = backends[0];
  const mps = discardedWeight(chi);
  const curve = useMemo(
    () => Array.from({ length: 24 }, (_, i) => discardedWeight((i + 1) * 2)),
    [],
  );

  const budget = [
    { k: "CX (2 gates)", v: 0.36, note: "0.0019 ± 0.0003" },
    { k: "Single-qubit", v: 0.05, note: "5 gates" },
    { k: "Readout", v: 3.0, note: "dominant residual" },
  ];

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Error correction</p>
        <h1 className="text-2xl font-semibold tracking-tight">Surface code, distillation, MPS</h1>
        <p className="mt-1 max-w-2xl text-sm text-steel">
          Toy models of how noisy physical qubits become a logical qubit. Numbers are educational
          analogs, not a real device report.
        </p>
        <Explain id="qec" lang="en" className="mt-2 max-w-2xl text-xs leading-relaxed text-muted" />


      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Backend" value={ibq.name} hint="custom alias" />
        <Metric label="CX error" value={ibq.cxError.toFixed(4)} tone="ok" />
        <Metric label="T1 mean" value={`${ibq.t1us.toFixed(1)} µs`} />
        <Metric label="T2 mean" value={`${ibq.t2us.toFixed(1)} µs`} />
      </div>

      <SurfacePanel />

      <MagicPanel />


      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <Panel className="lg:col-span-7" kicker="ibq_b" title="Error-budget report">
          <ul className="space-y-3">
            {budget.map((b) => (
              <li key={b.k}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{b.k}</span>
                  <span className="font-mono tabular text-muted">
                    {b.v.toFixed(2)}% · {b.note}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-xs bg-card-2">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min(100, b.v * 18)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Combined gate-error ≈ 0.47%. Readout dominates. Dynamical decoupling on
            measurement qubits is the first lever; recalibrate if T1 drops under 60 µs.
          </p>
        </Panel>

        <Panel
          className="lg:col-span-5"
          kicker="Tensor network"
          title="Variational MPS compression"
          action={<Badge tone="steel">χ = {chi}</Badge>}
        >
          <label className="mb-3 flex items-center gap-2 text-xs text-muted">
            bond dimension
            <input
              type="range"
              min={4}
              max={48}
              value={chi}
              onChange={(e) => setChi(Number(e.target.value))}
            />
          </label>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curve}>
                <XAxis dataKey="chi" tick={{ fill: "#8b939c", fontSize: 10 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "#101216",
                    border: "1px solid #1c222b",
                    fontSize: 12,
                  }}
                />
                <Area
                  dataKey="discarded"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 font-mono text-xs text-muted">
            discarded weight {mps.discarded.toFixed(4)} · kept {mps.kept.toFixed(4)}
          </p>
        </Panel>
      </div>

      <Panel kicker="QEC" title="Code families">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {QEC_CODES.map((c) => (
            <article key={c.id} className="rounded-md bg-card-2 p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">{c.name}</h3>
                <Badge tone="mute">{c.params}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted">{c.note}</p>
              <p className="mt-2 font-mono text-xs uppercase tracking-wider text-steel">
                {c.fit} · threshold {c.threshold}
              </p>
            </article>
          ))}
        </div>
      </Panel>

      <Panel kicker="Prototype" title="Hardware ranking for HybridCert">
        <ul className="space-y-2">
          {PLATFORMS.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-1 rounded-md bg-card-2 px-3 py-2 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted">{p.use}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted">{p.viz}</span>
                <span className="font-mono text-sm tabular text-primary">{p.score}</span>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
