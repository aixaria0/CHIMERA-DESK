import { useMemo, useState } from "react";
import { Explain } from "@/components/explain";
import { Metric, Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { runHybridRound } from "@/lib/hybrid";
import { generateQasm } from "@/lib/quantum";
import { QHL_RULES } from "@/lib/logic";
import { useChimera } from "@/lib/store";

export function HoarePanel() {
  const gates = useChimera((s) => s.gates);
  const n = useChimera((s) => s.nQubits);
  const shots = useChimera((s) => s.shots);
  const view = useChimera((s) => s.view);
  const seq = useChimera((s) => s.seq);
  const backends = useChimera((s) => s.backends);
  const pushCert = useChimera((s) => s.pushCert);
  const pushLog = useChimera((s) => s.pushLog);
  const lastCert = useChimera((s) => s.lastCert);
  const [eps, setEps] = useState(0.08);

  const [busy, setBusy] = useState(false);
  const qasm = useMemo(() => generateQasm(n, gates), [n, gates]);

  function certify() {
    if (busy) return;
    setBusy(true);
    const cert = runHybridRound({
      n,
      gates,
      shots,
      backend: backends[0].id,
      view,
      seq,
    });
    const ok = cert.fidelity >= 1 - eps && cert.accepted;
    pushCert({ ...cert, accepted: ok, post: `F ≥ ${ (1 - eps).toFixed(2) }` });
    pushLog({
      level: ok ? "ok" : "warn",
      source: "qhl",
      message: `{ρ} S {F≥${(1 - eps).toFixed(2)}}  ${ok ? "VALID" : "FAIL"}  F=${cert.fidelity.toFixed(3)}`,
    });
    window.setTimeout(() => setBusy(false), 400);
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <Panel
        className="lg:col-span-7"
        kicker="Triple"
        title="{P}  S  {Q}"
        action={
          <Badge tone={lastCert?.accepted ? "ok" : lastCert ? "danger" : "steel"}>
            {lastCert ? (lastCert.accepted ? "VALID" : "FAIL") : "statistical"}
          </Badge>
        }

      >
        <div className="space-y-3 rounded-md bg-card-2 p-3 font-mono text-sm">
          <p className="text-muted">P  ·  ρ on computational register</p>
          <p className="text-primary">S  ·  {n}q circuit · {gates.length} gates · {shots} shots</p>
          <p className="text-muted">Q  ·  F(ρ, |ψ⟩⟨ψ|) ≥ {(1 - eps).toFixed(2)}</p>
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-muted">
          ε
          <input
            type="range"
            min={0.01}
            max={0.3}
            step={0.01}
            value={eps}
            onChange={(e) => setEps(Number(e.target.value))}
          />
          <span className="font-mono text-foreground">{eps.toFixed(2)}</span>
        </label>
        <div className="mt-3">
          <Button onClick={certify} disabled={busy}>
            {busy ? "Estimating…" : "Check triple (shadow + bind)"}
          </Button>
        </div>
        {lastCert ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Metric label="F̂" value={lastCert.fidelity.toFixed(3)} tone={lastCert.accepted ? "ok" : "warn"} />
            <Metric label="ε_hat" value={lastCert.error.toFixed(3)} />
          </div>
        ) : null}
        <pre className="scan-hide mt-3 max-h-40 overflow-auto rounded-md bg-background p-3 font-mono text-xs text-steel">
          {qasm}
        </pre>
        <Explain id="types" lang="en" />
      </Panel>

      <Panel className="lg:col-span-5" kicker="Calculus" title="QHL rules">
        <ul className="space-y-2">
          {QHL_RULES.map((r) => (
            <li key={r.name} className="rounded-md bg-card-2 p-3">
              <p className="text-sm font-medium">{r.name}</p>
              <p className="mt-1 font-mono text-xs leading-relaxed text-muted">{r.form}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Metric label="Predicate" value="Hermitian" hint="0 ≤ P ≤ I" />
          <Metric label="Order" value="Löwner" hint="consequence" />
        </div>
      </Panel>
    </div>
  );
}
