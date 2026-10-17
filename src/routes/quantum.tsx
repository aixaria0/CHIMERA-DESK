import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Explain } from "@/components/explain";
import { Metric, Panel } from "@/components/panel";
import { ProbBars } from "@/components/prob-bars";
import { HoarePanel } from "@/components/hoare-panel";
import { TeleportPanel } from "@/components/teleport-panel";
import { TypesPanel } from "@/components/types-panel";

import { Button } from "@/components/ui/button";
import {
  generateQasm,
  groverAmplitudes,
  probabilities,
  runCircuit,
  type GateType,
} from "@/lib/quantum";
import { useChimera } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quantum")({ component: QuantumLab });

const PALETTE: GateType[] = ["H", "X", "Z", "S", "T", "CNOT"];
const TABS = ["circuit", "teleport", "types", "hoare"] as const;

type Tab = (typeof TABS)[number];

function QuantumLab() {
  const gates = useChimera((s) => s.gates);
  const setGates = useChimera((s) => s.setGates);
  const n = useChimera((s) => s.nQubits);
  const setN = useChimera((s) => s.setNQubits);
  const shots = useChimera((s) => s.shots);
  const setShots = useChimera((s) => s.setShots);
  const loadPreset = useChimera((s) => s.loadPreset);
  const [iter, setIter] = useState(1);
  const [pending, setPending] = useState<GateType>("H");
  const [tab, setTab] = useState<Tab>("circuit");

  const steps = 8;
  const state = useMemo(() => runCircuit(n, gates), [n, gates]);
  const probs = useMemo(() => probabilities(state), [state]);
  const qasm = useMemo(() => generateQasm(n, gates), [n, gates]);
  const grover = useMemo(
    () =>
      groverAmplitudes(2, [3], iter).map((a, i) => ({
        label: i.toString(2).padStart(2, "0"),
        value: a * a,
      })),
    [iter],
  );

  function place(qubit: number, step: number) {
    const rest = gates.filter((g) => !(g.qubit === qubit && g.step === step));
    if (pending === "CNOT") {
      const target = (qubit + 1) % n;
      setGates([...rest, { id: `g${Date.now()}`, type: "CNOT", qubit, target, step }]);
      return;
    }
    setGates([...rest, { id: `g${Date.now()}`, type: pending, qubit, step }]);
  }

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Quantum lab</p>
          <h1 className="text-2xl font-semibold tracking-tight">Circuits, teleportation, types</h1>
          <p className="mt-1 max-w-xl text-sm text-steel">
            A local statevector simulator. GHZ is loaded. Drop gates, or open Teleport / Types /
            Hoare.
          </p>


        </div>
        <div className="flex gap-1 rounded-sm bg-card-2 p-1">
          {TABS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={cn(
                "h-10 rounded-sm px-3 text-xs capitalize",
                tab === k ? "bg-primary text-primary-foreground" : "text-muted",
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {tab === "teleport" ? <TeleportPanel /> : null}
      {tab === "types" ? <TypesPanel /> : null}
      {tab === "hoare" ? <HoarePanel /> : null}

      {tab !== "circuit" ? null : (
        <>
          <div className="flex flex-wrap gap-2">
            {(["bell", "ghz", "grover"] as const).map((k) => (
              <Button key={k} size="sm" variant="secondary" onClick={() => loadPreset(k)}>
                {k.toUpperCase()}
              </Button>
            ))}
            <label className="flex h-8 items-center gap-2 rounded-sm px-2 text-xs text-muted shadow-[var(--shadow-border)]">
              qubits
              <input
                type="range"
                min={2}
                max={4}
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
              />
              <span className="font-mono text-foreground">{n}</span>
            </label>
            <label className="flex h-8 items-center gap-2 rounded-sm px-2 text-xs text-muted shadow-[var(--shadow-border)]">
              shots
              <input
                type="range"
                min={64}
                max={1024}
                step={64}
                value={shots}
                onChange={(e) => setShots(Number(e.target.value))}
              />
              <span className="font-mono text-foreground">{shots}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <Panel className="lg:col-span-7" kicker="Composer" title="Gate grid — click a cell to place">

              <div className="mb-3 flex flex-wrap gap-1.5">
                {PALETTE.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setPending(g)}
                    className={cn(
                      "h-8 rounded-sm px-2.5 font-mono text-xs",
                      pending === g
                        ? "bg-primary text-primary-foreground"
                        : "bg-card-2 text-muted shadow-[var(--shadow-border)]",
                    )}
                  >
                    {g}
                  </button>
                ))}
                <Button size="sm" variant="ghost" onClick={() => setGates([])}>
                  Clear
                </Button>
              </div>
              <div className="overflow-x-auto">
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `48px repeat(${steps}, minmax(40px,1fr))` }}
                >
                  <div />
                  {Array.from({ length: steps }, (_, s) => (
                    <div key={s} className="text-center font-mono text-xs text-muted">
                      t{s}
                    </div>
                  ))}
                  {Array.from({ length: n }, (_, q) => (
                    <Row key={q} q={q} steps={steps} gates={gates} onPlace={(s) => place(q, s)} />
                  ))}
                </div>
              </div>
              <Explain id="ghz" lang="en" />
            </Panel>

            <Panel className="lg:col-span-5" kicker="State" title="Probability mass — |bitstring⟩">

              <ProbBars rows={probs.map((p) => ({ label: p.bits, value: p.p }))} />
            </Panel>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <Panel className="lg:col-span-6" kicker="IR" title="OpenQASM 2.0">
              <pre className="scan-hide max-h-56 overflow-auto rounded-md bg-background p-3 font-mono text-xs leading-relaxed text-steel">
                {qasm}
              </pre>
            </Panel>
            <Panel
              className="lg:col-span-6"
              kicker="Grover"
              title="Marked |11⟩"
              action={
                <label className="flex items-center gap-2 font-mono text-xs text-muted">
                  iter
                  <input
                    type="range"
                    min={0}
                    max={4}
                    value={iter}
                    onChange={(e) => setIter(Number(e.target.value))}
                  />
                  {iter}
                </label>
              }
            >
              <ProbBars rows={grover} />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Metric label="Optimal iter" value="1" hint="π/4 √(N/M) for N=4" />
                <Metric
                  label="P(marked)"
                  value={grover[3] ? grover[3].value.toFixed(3) : "—"}
                  tone="ok"
                />
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function Row({
  q,
  steps,
  gates,
  onPlace,
}: {
  q: number;
  steps: number;
  gates: { qubit: number; step: number; type: string; target?: number }[];
  onPlace: (step: number) => void;
}) {
  return (
    <>
      <div className="flex items-center font-mono text-xs text-muted">q{q}</div>
      {Array.from({ length: steps }, (_, s) => {
        const g = gates.find((x) => x.step === s && (x.qubit === q || x.target === q));
        const label = !g ? "" : g.type === "CNOT" ? (g.qubit === q ? "•" : "⊕") : g.type;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onPlace(s)}
            className={cn(
              "h-10 rounded-sm font-mono text-xs",
              g ? "bg-primary/15 text-primary" : "bg-card-2 text-muted",
            )}
          >
            {label}
          </button>
        );
      })}
    </>
  );
}
