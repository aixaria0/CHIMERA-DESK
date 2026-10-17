import { useMemo, useState } from "react";
import { Explain } from "@/components/explain";
import { Metric, Panel } from "@/components/panel";
import { ProbBars } from "@/components/prob-bars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bellKet, matrixPreview, teleportQudit, wMatrix, xMatrix, zMatrix } from "@/lib/qudit";


export function TeleportPanel() {
  const [d, setD] = useState(2);
  const [kind, setKind] = useState<"zero" | "one" | "plus">("plus");
  const result = useMemo(() => teleportQudit(d, kind), [d, kind]);
  const bell = useMemo(() => bellKet(d, result.m, result.n), [d, result.m, result.n]);

  const X = useMemo(() => matrixPreview(xMatrix(d), 1), [d]);
  const Z = useMemo(() => matrixPreview(zMatrix(d), 1), [d]);
  const W = useMemo(() => matrixPreview(wMatrix(d, result.m, result.n), 1), [d, result.m, result.n]);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <Panel
        className="lg:col-span-7"
        kicker="Protocol"
        title={`Qudit teleportation  d = ${d}`}
        action={<Badge tone={result.fidelity > 0.99 ? "ok" : "warn"}>F {result.fidelity.toFixed(4)}</Badge>}
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {([2, 3, 4] as const).map((dim) => (
            <Button key={dim} size="sm" variant={d === dim ? "default" : "secondary"} onClick={() => setD(dim)}>
              d={dim}
            </Button>
          ))}
          {(["zero", "one", "plus"] as const).map((k) => (
            <Button key={k} size="sm" variant={kind === k ? "default" : "secondary"} onClick={() => setKind(k)}>
              |{k === "plus" ? "+" : k === "zero" ? "0" : "1"}⟩
            </Button>
          ))}
        </div>
        <ol className="space-y-2 text-sm text-steel">
          <li>1. Own three qudits: data, Alice EPR, Bob EPR.</li>
          <li>2. Prepare |Φ₀₀⟩ = d⁻½ ∑ |kk⟩ on Alice+Bob (Fourier + SUM).</li>
          <li>3. Inverse-SUM + Fourier on data & Alice → classical (m,n) = ({result.m},{result.n}).</li>
          <li>4. Bob applies X⁻ⁿ Z⁻ᵐ. Alice’s qudits are consumed.</li>
        </ol>
        <Explain id="teleport" lang="en" />

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Metric label="Bell outcome" value={`${result.m},${result.n}`} hint="averaged F over all shots" />
          <Metric
            label="Hoare"
            value="sound"
            hint={`${result.hoare.pre}  ${result.hoare.prog}  ${result.hoare.post}`}
            tone="ok"
          />
        </div>
      </Panel>

      <Panel className="lg:col-span-5" kicker="Bob" title="Reconstructed probabilities">
        <ProbBars rows={result.bobProbs.map((r) => ({ label: r.label, value: r.p }))} />
      </Panel>

      <Panel className="lg:col-span-12" kicker="Bell" title={`|Φ_{${result.m}${result.n}}⟩ mass (computational)`}>
        <ProbBars rows={bell.map((r) => ({ label: r.label, value: r.p }))} />

      </Panel>


      <Panel className="lg:col-span-12" kicker="Weyl" title="X, Z, W(m,n) matrices">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MatrixCard name="X" rows={X} />
          <MatrixCard name="Z" rows={Z} />
          <MatrixCard name={`W(${result.m},${result.n})`} rows={W} />
        </div>
      </Panel>
    </div>
  );
}

function MatrixCard({ name, rows }: { name: string; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-md bg-card-2 p-3">
      <p className="mb-2 font-mono text-xs text-muted">{name}</p>
      <table className="w-full font-mono text-xs tabular text-steel">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((c, j) => (
                <td key={j} className="px-1 py-0.5 text-center">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
