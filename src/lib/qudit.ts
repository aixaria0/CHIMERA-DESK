/** Qudit Weyl–Heisenberg operators, Bell measurement, and teleportation. */

export type C = { re: number; im: number };

const ZERO: C = { re: 0, im: 0 };
const ONE: C = { re: 1, im: 0 };

function add(a: C, b: C): C {
  return { re: a.re + b.re, im: a.im + b.im };
}
function mul(a: C, b: C): C {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}
function scale(a: C, s: number): C {
  return { re: a.re * s, im: a.im * s };
}
export function cabs2(a: C) {
  return a.re * a.re + a.im * a.im;
}

export function omega(d: number, k: number): C {
  const th = (2 * Math.PI * k) / d;
  return { re: Math.cos(th), im: Math.sin(th) };
}

/** Generalized Pauli X: |k⟩ ↦ |k ⊕ 1⟩ */
export function xMatrix(d: number): C[][] {
  const m = Array.from({ length: d }, () => Array.from({ length: d }, () => ({ ...ZERO })));
  for (let j = 0; j < d; j++) m[(j + 1) % d][j] = { ...ONE };
  return m;
}

/** Generalized Pauli Z: |k⟩ ↦ ω^k |k⟩ */
export function zMatrix(d: number): C[][] {
  const m = Array.from({ length: d }, () => Array.from({ length: d }, () => ({ ...ZERO })));
  for (let i = 0; i < d; i++) m[i][i] = omega(d, i);
  return m;
}

/** W(m,n) = X^m Z^n */
export function wMatrix(d: number, m: number, n: number): C[][] {
  const X = xMatrix(d);
  const Z = zMatrix(d);
  let acc = identity(d);
  for (let i = 0; i < m; i++) acc = matMul(X, acc);
  for (let i = 0; i < n; i++) acc = matMul(acc, Z);
  return acc;
}

function identity(d: number): C[][] {
  return Array.from({ length: d }, (_, i) =>
    Array.from({ length: d }, (_, j) => (i === j ? { ...ONE } : { ...ZERO })),
  );
}

function matMul(a: C[][], b: C[][]): C[][] {
  const n = a.length;
  const out = Array.from({ length: n }, () => Array.from({ length: n }, () => ({ ...ZERO })));
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      if (a[i][k].re === 0 && a[i][k].im === 0) continue;
      for (let j = 0; j < n; j++) out[i][j] = add(out[i][j], mul(a[i][k], b[k][j]));
    }
  }
  return out;
}

export function matrixPreview(m: C[][], digits = 2) {
  return m.map((row) =>
    row.map((c) => {
      if (Math.abs(c.im) < 1e-9) return c.re.toFixed(digits);
      if (Math.abs(c.re) < 1e-9) return `${c.im.toFixed(digits)}i`;
      const sign = c.im >= 0 ? "+" : "−";
      return `${c.re.toFixed(digits)}${sign}${Math.abs(c.im).toFixed(digits)}i`;
    }),
  );
}

export function ket0n(d: number, n: number): C[] {
  const dim = d ** n;
  const s = Array.from({ length: dim }, () => ({ ...ZERO }));
  s[0] = { ...ONE };
  return s;
}

function applyLocal(state: C[], d: number, nQ: number, q: number, mat: C[][]): C[] {
  const dim = d ** nQ;
  const stride = d ** q;
  const block = stride * d;
  const next = Array.from({ length: dim }, () => ({ ...ZERO }));
  for (let base = 0; base < dim; base += block) {
    for (let r = 0; r < stride; r++) {
      for (let a = 0; a < d; a++) {
        const src = base + a * stride + r;
        for (let b = 0; b < d; b++) {
          const dst = base + b * stride + r;
          next[dst] = add(next[dst], mul(mat[b][a], state[src]));
        }
      }
    }
  }
  return next;
}

/** SUM_d^s : |x,y⟩ ↦ |x, y ⊕ s·x⟩ */
function applySum(state: C[], d: number, nQ: number, qC: number, qT: number, sign = 1): C[] {
  const dim = d ** nQ;
  const next = Array.from({ length: dim }, () => ({ ...ZERO }));
  for (let i = 0; i < dim; i++) {
    const digits = toDigits(i, d, nQ);
    digits[qT] = (digits[qT] + sign * digits[qC] + d * 8) % d;
    next[fromDigits(digits, d)] = add(next[fromDigits(digits, d)], state[i]);
  }
  return next;
}

function toDigits(idx: number, d: number, n: number) {
  const out: number[] = [];
  let x = idx;
  for (let i = 0; i < n; i++) {
    out.push(x % d);
    x = Math.floor(x / d);
  }
  return out;
}
function fromDigits(digits: number[], d: number) {
  return digits.reduce((s, v, i) => s + v * d ** i, 0);
}

/** Quantum Fourier transform on one qudit (generalized Hadamard). */
function fourier(d: number): C[][] {
  const s = 1 / Math.sqrt(d);
  return Array.from({ length: d }, (_, i) =>
    Array.from({ length: d }, (_, j) => scale(omega(d, i * j), s)),
  );
}

export function bellKet(d: number, m: number, n: number): { label: string; p: number }[] {
  const dim = d * d;
  const out = Array.from({ length: dim }, (_, i) => ({
    label: `${i % d}${Math.floor(i / d)}`,
    p: 0,
  }));
  const a = 1 / d;
  for (let k = 0; k < d; k++) {
    const left = k;
    const right = (k + m) % d;
    const idx = left + d * right;
    out[idx].p += a;
  }
  void n;
  return out;
}

export type TeleportResult = {
  d: number;
  m: number;
  n: number;
  fidelity: number;
  inputLabel: string;

  bobProbs: { label: string; p: number }[];
  aliceConsumed: true;
  hoare: { pre: string; prog: string; post: string };
};

export function prepareData(d: number, kind: "zero" | "one" | "plus" | "w"): C[] {
  const s = ket0n(d, 1);
  if (kind === "zero") return s;
  if (kind === "one") {
    const X = xMatrix(d);
    return applyLocal(s, d, 1, 0, X);
  }
  if (kind === "plus") {
    return applyLocal(s, d, 1, 0, fourier(d));
  }
  const w = ket0n(d, 1);
  const a = 1 / Math.sqrt(d);
  for (let k = 0; k < d; k++) w[k] = { re: a, im: 0 };
  return w;
}

/**
 * Qudit teleportation on 3 registers: 0 = data, 1 = Alice EPR, 2 = Bob EPR.
 * Returns the reconstructed Bob state vs the intended data (post-selected on one Bell outcome,
 * then corrected — we average fidelity over all outcomes by applying the matching correction).
 */
export function teleportQudit(d: number, dataKind: "zero" | "one" | "plus"): TeleportResult {
  const data = prepareData(d, dataKind);
  // |ψ⟩_0 |Φ00⟩_{12}
  let state = ket0n(d, 3);
  // write data onto qudit 0
  for (let i = 0; i < d ** 3; i++) state[i] = { ...ZERO };
  for (let k = 0; k < d; k++) {
    // |k⟩_0 |00⟩_{12}  then later entangle 1,2
    state[k] = { ...data[k] };
  }
  // Create |Φ00⟩ on 1,2: F on 1, SUM 1→2
  state = applyLocal(state, d, 3, 1, fourier(d));
  state = applySum(state, d, 3, 1, 2, 1);

  // Bell: inverse SUM data→Alice, F on data
  state = applySum(state, d, 3, 0, 1, -1);
  state = applyLocal(state, d, 3, 0, fourier(d));

  // Measure qudits 0,1 (computational). For each (m,n), correct Bob with X^m Z^n
  // and compute overlap with original data.
  let best: TeleportResult | null = null;
  let fidSum = 0;
  let pSum = 0;
  const outcomes: { m: number; n: number; p: number; fid: number; bob: C[] }[] = [];

  for (let m = 0; m < d; m++) {
    for (let n = 0; n < d; n++) {
      const proj = project01(state, d, m, n);
      const p = proj.prob;
      if (p < 1e-12) continue;
      let bob = proj.bob;
      // X^{-n} Z^{-m} after inverse-SUM Bell measurement
      bob = applyLocal(bob, d, 1, 0, wMatrix(d, (d - n) % d, 0));
      bob = applyLocal(bob, d, 1, 0, wMatrix(d, 0, (d - m) % d));
      const fid = stateFidelity(bob, data);
      fidSum += fid * p;
      pSum += p;
      outcomes.push({ m, n, p, fid, bob });
    }
  }

  outcomes.sort((a, b) => b.p - a.p);
  const pick = outcomes[0];
  const bobProbs = pick.bob.map((amp, i) => ({ label: String(i), p: cabs2(amp) }));
  best = {
    d,
    m: pick.m,
    n: pick.n,
    fidelity: pSum > 0 ? fidSum / pSum : 0,
    inputLabel: dataKind,
    bobProbs,
    aliceConsumed: true,
    hoare: {
      pre: `{ ρ_data ⊗ |Φ₀₀⟩⟨Φ₀₀| }`,
      prog: `teleport_${d}`,
      post: `{ ρ_data  on Bob }`,
    },
  };
  return best;
}

function zeros(dim: number): C[] {
  return Array.from({ length: dim }, () => ({ ...ZERO }));
}

function project01(state: C[], d: number, m: number, n: number) {
  const dim = d ** 3;
  const bob = zeros(d);
  let prob = 0;
  for (let i = 0; i < dim; i++) {
    const digits = toDigits(i, d, 3);
    if (digits[0] !== m || digits[1] !== n) continue;
    const amp = state[i];
    const p = cabs2(amp);
    prob += p;
    bob[digits[2]] = add(bob[digits[2]], amp);
  }
  const nrm = Math.sqrt(prob) || 1;
  return { prob, bob: bob.map((a) => scale(a, 1 / nrm)) };
}

function stateFidelity(a: C[], b: C[]) {
  let re = 0;
  let im = 0;
  for (let i = 0; i < a.length; i++) {
    re += a[i].re * b[i].re + a[i].im * b[i].im;
    im += a[i].re * b[i].im - a[i].im * b[i].re;
  }
  return re * re + im * im;
}

/** 3-qudit bit-flip / trit-shift code: |k⟩ ↦ |kkk⟩, syndrome of X errors. */
export function bitFlipDemo(d: number, errorPos: number | null) {
  const logical = 0;
  const digits = [logical, logical, logical];
  if (errorPos !== null) digits[errorPos] = (digits[errorPos] + 1) % d;
  const s01 = (digits[0] - digits[1] + d) % d;
  const s12 = (digits[1] - digits[2] + d) % d;
  const corrected = [...digits];
  // majority-style: if s01≠0 and s12=0 → error on q0; s01=0 s12≠0 → q2; both ≠0 → q1
  if (s01 !== 0 && s12 === 0) corrected[0] = (corrected[0] - s01 + d) % d;
  else if (s01 === 0 && s12 !== 0) corrected[2] = (corrected[2] + s12) % d;
  else if (s01 !== 0 && s12 !== 0) corrected[1] = (corrected[1] - s01 + d) % d;
  const recovered = corrected[0] === logical && corrected[1] === logical && corrected[2] === logical;
  return {
    encoded: [logical, logical, logical],
    afterError: digits,
    syndrome: [s01, s12],
    corrected,
    recovered,
  };
}
