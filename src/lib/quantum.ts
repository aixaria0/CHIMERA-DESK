/** Small statevector simulator + classical-shadow fidelity (n ≤ 4). */

export type GateType = "H" | "X" | "Z" | "S" | "T" | "CNOT";

export type Gate = {
  id: string;
  type: GateType;
  qubit: number;
  target?: number;
  step: number;
};

export type Complex = { re: number; im: number };

const ZERO: Complex = { re: 0, im: 0 };
const ONE: Complex = { re: 1, im: 0 };

function cadd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}
function cmul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}
export function cabs2(a: Complex) {
  return a.re * a.re + a.im * a.im;
}

function apply1(state: Complex[], n: number, q: number, m00: Complex, m01: Complex, m10: Complex, m11: Complex) {
  const dim = 1 << n;
  const bit = 1 << q;
  const next = state.slice();
  for (let i = 0; i < dim; i++) {
    if (i & bit) continue;
    const j = i | bit;
    const a = state[i];
    const b = state[j];
    next[i] = cadd(cmul(m00, a), cmul(m01, b));
    next[j] = cadd(cmul(m10, a), cmul(m11, b));
  }
  return next;
}

function applyCnot(state: Complex[], n: number, c: number, t: number) {
  const dim = 1 << n;
  const next = state.slice();
  const cb = 1 << c;
  const tb = 1 << t;
  for (let i = 0; i < dim; i++) {
    if (i & cb && !(i & tb)) {
      const j = i | tb;
      const tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;
    }
  }
  return next;
}

export function ket0(n: number): Complex[] {
  const dim = 1 << n;
  const s = Array.from({ length: dim }, () => ({ ...ZERO }));
  s[0] = { ...ONE };
  return s;
}

const INV_SQRT2 = 1 / Math.sqrt(2);

export function applyGate(state: Complex[], n: number, g: Gate): Complex[] {
  switch (g.type) {
    case "H":
      return apply1(
        state,
        n,
        g.qubit,
        { re: INV_SQRT2, im: 0 },
        { re: INV_SQRT2, im: 0 },
        { re: INV_SQRT2, im: 0 },
        { re: -INV_SQRT2, im: 0 },
      );
    case "X":
      return apply1(state, n, g.qubit, ZERO, ONE, ONE, ZERO);
    case "Z":
      return apply1(state, n, g.qubit, ONE, ZERO, ZERO, { re: -1, im: 0 });
    case "S":
      return apply1(state, n, g.qubit, ONE, ZERO, ZERO, { re: 0, im: 1 });
    case "T":
      return apply1(state, n, g.qubit, ONE, ZERO, ZERO, { re: INV_SQRT2, im: INV_SQRT2 });
    case "CNOT":
      return applyCnot(state, n, g.qubit, g.target ?? (g.qubit + 1) % n);
    default:
      return state;
  }
}

export function runCircuit(n: number, gates: Gate[]): Complex[] {
  let s = ket0(n);
  const ordered = [...gates].sort((a, b) => a.step - b.step);
  for (const g of ordered) s = applyGate(s, n, g);
  return s;
}

export function probabilities(state: Complex[]) {
  return state.map((amp, i) => ({
    index: i,
    bits: i.toString(2).padStart(Math.log2(state.length), "0"),
    p: cabs2(amp),
  }));
}

export function sampleShots(state: Complex[], shots: number) {
  const probs = probabilities(state);
  const counts = new Array(state.length).fill(0);
  for (let s = 0; s < shots; s++) {
    let r = Math.random();
    for (const row of probs) {
      r -= row.p;
      if (r <= 0) {
        counts[row.index]++;
        break;
      }
    }
  }
  return counts;
}

export function fidelity(a: Complex[], b: Complex[]) {
  let re = 0;
  let im = 0;
  for (let i = 0; i < a.length; i++) {
    re += a[i].re * b[i].re + a[i].im * b[i].im;
    im += a[i].re * b[i].im - a[i].im * b[i].re;
  }
  return re * re + im * im;
}

/** Inverse-channel Pauli shadow estimate vs a target statevector. */
export function shadowFidelity(
  snapshots: { pauli: string; bits: string }[],
  target: Complex[],
  n: number,
) {
  const dim = 1 << n;
  const paulis = allPaulis(n);
  let fid = 0;
  let varAcc = 0;
  for (const p of paulis) {
    const chiT = pauliExpect(target, p);
    const vals = snapshots
      .filter((s) => s.pauli === p)
      .map((s) => snapshotPauli(s.bits, p) * inverseFactor(p));
    if (!vals.length) continue;
    const { med, se } = medianOfMeans(vals);
    fid += chiT * med;
    varAcc += (se * chiT) ** 2;
  }
  return {
    fidelity: clamp01(fid / dim),
    error: Math.sqrt(varAcc) / dim,
  };
}

export function makeSnapshots(state: Complex[], n: number, shots: number) {
  const bases = ["X", "Y", "Z"] as const;
  const out: { pauli: string; bits: string }[] = [];
  for (let s = 0; s < shots; s++) {
    const pauli = Array.from({ length: n }, () => bases[Math.floor(Math.random() * 3)]).join("");
    const rotated = rotateToPauli(state, n, pauli);
    const counts = sampleShots(rotated, 1);
    const idx = counts.findIndex((c) => c > 0);
    const bits = Math.max(0, idx).toString(2).padStart(n, "0");
    out.push({ pauli, bits });
  }
  return out;
}

function rotateToPauli(state: Complex[], n: number, pauli: string) {
  let s = state;
  for (let q = 0; q < n; q++) {
    const p = pauli[q];
    if (p === "X") s = applyGate(s, n, { id: "r", type: "H", qubit: q, step: 0 });
    if (p === "Y") {
      s = applyGate(s, n, { id: "r", type: "S", qubit: q, step: 0 });
      s = applyGate(s, n, { id: "r2", type: "H", qubit: q, step: 1 });
    }
  }
  return s;
}

function allPaulis(n: number) {
  const letters = ["I", "X", "Y", "Z"];
  const out: string[] = [];
  const total = 4 ** n;
  for (let i = 0; i < total; i++) {
    let x = i;
    let s = "";
    for (let q = 0; q < n; q++) {
      s = letters[x % 4] + s;
      x = Math.floor(x / 4);
    }
    out.push(s);
  }
  return out;
}

function inverseFactor(pauli: string) {
  return 3 ** [...pauli].filter((c) => c !== "I").length;
}

function snapshotPauli(bits: string, pauli: string) {
  let v = 1;
  for (let i = 0; i < pauli.length; i++) {
    if (pauli[i] === "I") continue;
    v *= bits[i] === "0" ? 1 : -1;
  }
  return v;
}

function pauliExpect(state: Complex[], pauli: string) {
  const n = pauli.length;
  let s = state;
  for (let q = 0; q < n; q++) {
    const p = pauli[q];
    if (p === "X") s = applyGate(s, n, { id: "p", type: "H", qubit: q, step: 0 });
    if (p === "Y") {
      s = applyGate(s, n, { id: "p", type: "S", qubit: q, step: 0 });
      s = applyGate(s, n, { id: "p2", type: "H", qubit: q, step: 1 });
    }
    if (p === "Z" || p === "I") continue;
  }
  const probs = probabilities(s);
  let exp = 0;
  for (const row of probs) {
    let e = 1;
    for (let q = 0; q < n; q++) {
      if (pauli[q] === "I") continue;
      e *= row.bits[q] === "0" ? 1 : -1;
    }
    exp += e * row.p;
  }
  return exp;
}

function medianOfMeans(values: number[], batches = 8) {
  if (!values.length) return { med: 0, se: 1 };
  const nBatches = Math.min(batches, Math.max(1, Math.floor(values.length / 2)));
  const size = Math.floor(values.length / nBatches);
  const means: number[] = [];
  for (let i = 0; i < nBatches; i++) {
    const slice = values.slice(i * size, (i + 1) * size);
    if (!slice.length) continue;
    means.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  if (!means.length) {
    const m = values.reduce((a, b) => a + b, 0) / values.length;
    return { med: m, se: 0.05 };
  }
  const sorted = [...means].sort((a, b) => a - b);
  const med = sorted[Math.floor(sorted.length / 2)];
  const mad = sorted.reduce((a, b) => a + Math.abs(b - med), 0) / sorted.length + 1e-12;
  return { med, se: (1.4826 * mad) / Math.sqrt(nBatches) };
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

export function generateQasm(n: number, gates: Gate[]) {
  let qasm = `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[${n}];\ncreg c[${n}];\n`;
  const ordered = [...gates].sort((a, b) => a.step - b.step || a.qubit - b.qubit);
  for (const g of ordered) {
    if (g.type === "CNOT") qasm += `cx q[${g.qubit}],q[${g.target ?? g.qubit + 1}];\n`;
    else qasm += `${g.type.toLowerCase()} q[${g.qubit}];\n`;
  }
  qasm += `measure q -> c;\n`;
  return qasm;
}

export const PRESETS: Record<string, { n: number; gates: Omit<Gate, "id">[] }> = {
  bell: {
    n: 2,
    gates: [
      { type: "H", qubit: 0, step: 0 },
      { type: "CNOT", qubit: 0, target: 1, step: 1 },
    ],
  },
  ghz: {
    n: 3,
    gates: [
      { type: "H", qubit: 0, step: 0 },
      { type: "CNOT", qubit: 0, target: 1, step: 1 },
      { type: "CNOT", qubit: 1, target: 2, step: 2 },
    ],
  },
  grover: {
    n: 2,
    gates: [
      { type: "H", qubit: 0, step: 0 },
      { type: "H", qubit: 1, step: 0 },
      { type: "Z", qubit: 0, step: 1 },
      { type: "Z", qubit: 1, step: 1 },
      { type: "CNOT", qubit: 0, target: 1, step: 2 },
      { type: "Z", qubit: 1, step: 3 },
      { type: "CNOT", qubit: 0, target: 1, step: 4 },
      { type: "H", qubit: 0, step: 5 },
      { type: "H", qubit: 1, step: 5 },
    ],
  },
};

export function withIds(gates: Omit<Gate, "id">[]): Gate[] {
  return gates.map((g, i) => ({ ...g, id: `g${i}` }));
}

/** Grover amplitude on unmarked vs marked for visualization. */
export function groverAmplitudes(n: number, marked: number[], iteration: number) {
  const N = 1 << n;
  const M = marked.length;
  const theta = Math.asin(Math.sqrt(M / N));
  const aMarked = Math.sin((2 * iteration + 1) * theta) / Math.sqrt(M);
  const aRest = Math.cos((2 * iteration + 1) * theta) / Math.sqrt(N - M);
  return Array.from({ length: N }, (_, i) => (marked.includes(i) ? aMarked : aRest));
}
