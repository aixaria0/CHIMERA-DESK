import { fidelity, ket0, makeSnapshots, runCircuit, shadowFidelity, type Gate } from "./quantum";
import type { Cert } from "./sim";

export function runHybridRound(input: {
  n: number;
  gates: Gate[];
  shots: number;
  backend: string;
  view: number;
  seq: number;
}): Omit<Cert, "id" | "ts"> & { qasmHint: string; shots: number } {
  const ideal = runCircuit(input.n, input.gates);
  const noisy = perturb(ideal, 0.04);
  const snaps = makeSnapshots(noisy, input.n, input.shots);
  const { fidelity: fid, error } = shadowFidelity(snaps, ideal, input.n);
  const exact = fidelity(noisy, ideal);
  const witness = -0.08 - (fid - 0.5) * 0.12;
  const accepted = fid > 0.7 && witness < 0;
  return {
    backend: input.backend,
    program: input.n === 3 ? "ghz3" : input.n === 2 ? "bell2" : `q${input.n}`,
    fidelity: fid,
    error,
    witness,
    accepted,
    view: input.view,
    seq: input.seq + 1,
    qasmHint: `F_exact=${exact.toFixed(4)}`,
    shots: input.shots,
    pre: "ρ on computational register",
    post: `F(ρ,|ψ⟩⟨ψ|) ≥ ${Math.max(0, fid - error).toFixed(3)}`,
    proof: "statistical-shadow + median-of-means",
  };
}

function perturb(state: { re: number; im: number }[], mix: number) {
  const out = state.map((a) => ({
    re: a.re * (1 - mix) + (Math.random() - 0.5) * mix * 0.4,
    im: a.im * (1 - mix) + (Math.random() - 0.5) * mix * 0.4,
  }));
  const nrm = Math.sqrt(out.reduce((s, a) => s + a.re * a.re + a.im * a.im, 0)) || 1;
  return out.map((a) => ({ re: a.re / nrm, im: a.im / nrm }));
}

export function emptyKet(n: number) {
  return ket0(n);
}
