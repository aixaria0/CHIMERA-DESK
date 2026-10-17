import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Explain } from "@/components/explain";
import { LatticeCanvas } from "@/components/lattice-canvas";
import { Metric, Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { runHybridRound } from "@/lib/hybrid";
import { useChimera } from "@/lib/store";

export const Route = createFileRoute("/lattice")({ component: Lattice });

function Lattice() {
  const nodes = useChimera((s) => s.nodes);
  const leader = useChimera((s) => s.leader);
  const phase = useChimera((s) => s.phase);
  const view = useChimera((s) => s.view);
  const seq = useChimera((s) => s.seq);
  const lastCert = useChimera((s) => s.lastCert);
  const gates = useChimera((s) => s.gates);
  const nQubits = useChimera((s) => s.nQubits);
  const shots = useChimera((s) => s.shots);
  const backends = useChimera((s) => s.backends);
  const setPhase = useChimera((s) => s.setPhase);
  const pushCert = useChimera((s) => s.pushCert);
  const pushLog = useChimera((s) => s.pushLog);
  const [busy, setBusy] = useState(false);

  const honest = nodes.filter((n) => n.honest).length;
  const quorum = 2 * Math.floor((nodes.length - 1) / 3) + 1;

  function round() {
    if (busy) return;
    setBusy(true);
    const nextLeader = (leader + 1) % nodes.length;
    setPhase("propose", nextLeader);
    window.setTimeout(() => setPhase("vote", nextLeader), 800);
    window.setTimeout(() => {
      const cert = runHybridRound({
        n: nQubits,
        gates,
        shots,
        backend: backends[0].id,
        view,
        seq,
      });
      pushCert(cert);
      pushLog({
        level: cert.accepted ? "ok" : "warn",
        source: "bft",
        message: `view-change → leader n${nextLeader}; HybridCert ${cert.accepted ? "committed" : "aborted"}`,
      });
      setPhase("decide", nextLeader);
    }, 1600);
    window.setTimeout(() => {
      setPhase("idle", nextLeader);
      setBusy(false);
    }, 2600);
  }

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-muted">
            Consensus network
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">7 nodes certify a lab result</h1>
          <p className="mt-1 max-w-xl text-sm text-steel">
            HotStuff-style quorum. Node 2 is Byzantine (red) and does not count. “Influence” here
            is reachability of honest packets — not intrusion.
          </p>

        </div>
        <Button onClick={round} disabled={busy}>
          {busy ? "Round in flight" : "View-change + hybrid round"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="View" value={String(view)} />
        <Metric label="Sequence" value={String(seq)} />
        <Metric label="Quorum" value={`${quorum} of ${nodes.length}`} hint={`${honest} honest`} />
        <Metric
          label="Phase"
          value={phase}
          tone={phase === "decide" ? "ok" : phase === "idle" ? "default" : "warn"}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <Panel
          className="lg:col-span-8"
          kicker="Topology"
          title="Honest-path mesh"
          action={<Badge tone={phase === "idle" ? "ok" : "warn"}>{phase}</Badge>}
        >
          <div className="h-72 md:h-80">
            <LatticeCanvas />
          </div>
          <p className="mt-2 text-xs text-muted">
            Packets follow the leader during propose / vote / decide. Node 2 is Byzantine (red)
            and does not count toward the quorum.
          </p>
          <Explain id="quorum" lang="en" />

        </Panel>

        <Panel className="lg:col-span-4" kicker="Nodes" title="Cluster">
          <ul className="space-y-2">
            {nodes.map((n) => (
              <li
                key={n.id}
                className="flex items-center justify-between rounded-md bg-card-2 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {n.label}{" "}
                    <span className="text-xs text-muted">
                      {n.role}
                      {!n.honest ? " · byz" : ""}
                    </span>
                  </p>
                  <p className="font-mono text-[0.625rem] text-muted">
                    load {(n.load * 100).toFixed(0)}%
                  </p>
                </div>
                <Badge tone={!n.honest ? "danger" : n.role === "leader" ? "ok" : "steel"}>
                  {n.id === leader ? "LEAD" : n.honest ? "OK" : "BYZ"}
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel kicker="QuantumHoareCert" title="Last binding">
        {!lastCert ? (
          <p className="text-sm text-muted">
            Run a round to bind a classical quorum certificate to a shadow fidelity witness.
          </p>
        ) : (
          <pre className="scan-hide overflow-auto rounded-md bg-background p-3 font-mono text-xs leading-relaxed text-steel">
            {JSON.stringify(
              {
                version: 1,
                program: lastCert.program,
                backend: lastCert.backend,
                view: lastCert.view,
                seq: lastCert.seq,
                precondition: lastCert.pre,
                postcondition: lastCert.post,
                proof_object: lastCert.proof,
                fidelity: Number(lastCert.fidelity.toFixed(4)),
                fidelity_error: Number(lastCert.error.toFixed(4)),
                entanglement_witness: Number(lastCert.witness.toFixed(4)),
                accepted: lastCert.accepted,
                binding: "threshold-BLS-over-digest",
              },
              null,
              2,
            )}
          </pre>
        )}
      </Panel>
    </div>
  );
}
