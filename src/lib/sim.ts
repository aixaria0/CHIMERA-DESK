import { clamp, hash01 } from "./utils";

export type BackendKind = "superconducting" | "trapped-ion" | "photonic" | "simulator";

export type Backend = {
  id: string;
  name: string;
  kind: BackendKind;
  qubits: number;
  cxError: number;
  readout: number;
  t1us: number;
  t2us: number;
  queue: number;
  status: "active" | "calibrating" | "idle";
  fidelity: number;
};

export type ClusterNode = {
  id: number;
  label: string;
  role: "leader" | "follower";
  honest: boolean;
  view: number;
  decided: number;
  load: number;
  x: number;
  y: number;
};

export type Asset = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  history: number[];
  weight: number;
};

export type Cert = {
  id: string;
  ts: number;
  backend: string;
  program: string;
  fidelity: number;
  error: number;
  witness: number;
  accepted: boolean;
  view: number;
  seq: number;
  pre: string;
  post: string;
  proof: string;
};

export type LogLine = {
  id: string;
  ts: number;
  level: "info" | "ok" | "warn" | "danger";
  source: string;
  message: string;
};

export const INITIAL_BACKENDS: Backend[] = [
  {
    id: "ibq_b",
    name: "ibq_b",
    kind: "simulator",
    qubits: 5,
    cxError: 0.0019,
    readout: 0.011,
    t1us: 74.7,
    t2us: 60.3,
    queue: 0,
    status: "active",
    fidelity: 0.984,
  },
  {
    id: "ibm_fez",
    name: "ibm_fez",
    kind: "superconducting",
    qubits: 156,
    cxError: 0.0048,
    readout: 0.018,
    t1us: 168,
    t2us: 112,
    queue: 14,
    status: "active",
    fidelity: 0.961,
  },
  {
    id: "h2_1",
    name: "Quantinuum H2",
    kind: "trapped-ion",
    qubits: 56,
    cxError: 0.0009,
    readout: 0.003,
    t1us: 1e6,
    t2us: 2e5,
    queue: 3,
    status: "active",
    fidelity: 0.997,
  },
  {
    id: "borealis",
    name: "Xanadu Borealis",
    kind: "photonic",
    qubits: 216,
    cxError: 0.012,
    readout: 0.04,
    t1us: 0,
    t2us: 0,
    queue: 1,
    status: "calibrating",
    fidelity: 0.812,
  },
  {
    id: "auto_t",
    name: "auto_t cluster",
    kind: "simulator",
    qubits: 12,
    cxError: 0.0004,
    readout: 0.002,
    t1us: 400,
    t2us: 280,
    queue: 0,
    status: "idle",
    fidelity: 0.999,
  },
];

export const INITIAL_ASSETS: Asset[] = [
  { symbol: "IONQ", name: "IonQ", price: 42.18, change: 1.4, history: [], weight: 0.18 },
  { symbol: "RGTI", name: "Rigetti", price: 11.62, change: -0.8, history: [], weight: 0.12 },
  { symbol: "QBTS", name: "D-Wave", price: 8.94, change: 2.1, history: [], weight: 0.1 },
  { symbol: "NVDA", name: "NVIDIA", price: 128.4, change: 0.6, history: [], weight: 0.28 },
  { symbol: "ETH", name: "Ether", price: 3420, change: -0.3, history: [], weight: 0.22 },
  { symbol: "IBM", name: "IBM", price: 196.2, change: 0.2, history: [], weight: 0.1 },
].map((a) => ({
  ...a,
  history: seedHistory(a.price, a.symbol.length * 17),
}));

function seedHistory(price: number, seed: number) {
  const h: number[] = [];
  let p = price * 0.92;
  for (let i = 0; i < 48; i++) {
    p *= 1 + (hash01(seed + i) - 0.48) * 0.03;
    h.push(p);
  }
  h[h.length - 1] = price;
  return h;
}

export function makeCluster(n = 7): ClusterNode[] {
  return Array.from({ length: n }, (_, i) => {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
    return {
      id: i,
      label: `n${i}`,
      role: i === 0 ? "leader" : "follower",
      honest: i !== 2,
      view: 4,
      decided: 128 + i,
      load: 0.2 + hash01(i + 3) * 0.5,
      x: 0.5 + Math.cos(ang) * 0.34,
      y: 0.5 + Math.sin(ang) * 0.34,
    };
  });
}

export function tickBackends(list: Backend[], t: number): Backend[] {
  return list.map((b, i) => {
    const jitter = (hash01(t * 0.01 + i) - 0.5) * 0.0004;
    const fid = clamp(b.fidelity + (hash01(t + i * 9) - 0.5) * 0.002, 0.72, 0.999);
    const queue =
      b.status === "idle" ? 0 : Math.max(0, Math.round(b.queue + (hash01(t + i) - 0.55) * 2));
    return {
      ...b,
      cxError: clamp(b.cxError + jitter, 0.0002, 0.03),
      fidelity: fid,
      queue,
    };
  });
}

export function tickAssets(list: Asset[], t: number): Asset[] {
  return list.map((a, i) => {
    const shock = (hash01(t * 0.07 + i * 1.7) - 0.5) * 0.006;
    const price = Math.max(0.2, a.price * (1 + shock));
    const history = [...a.history.slice(-47), price];
    const prev = history[0] ?? price;
    const change = ((price - prev) / prev) * 100;
    return { ...a, price, change, history };
  });
}

export function tickCluster(nodes: ClusterNode[], t: number, leader: number): ClusterNode[] {
  return nodes.map((n) => ({
    ...n,
    role: n.id === leader ? "leader" : "follower",
    load: clamp(n.load + (hash01(t + n.id) - 0.5) * 0.04, 0.05, 0.95),
  }));
}

export function portfolioNav(assets: Asset[]) {
  return assets.reduce((s, a) => s + a.price * a.weight * 10, 0);
}

export function var95(assets: Asset[]) {
  const rets = assets.map((a) => a.change / 100);
  const mu = rets.reduce((s, r) => s + r, 0) / rets.length;
  const v = rets.reduce((s, r) => s + (r - mu) ** 2, 0) / rets.length;
  return Math.abs(mu - 1.65 * Math.sqrt(v)) * 100;
}

export function qaoaWeights(assets: Asset[], t: number) {
  const scores = assets.map((a, i) => {
    const mom = a.change;
    const vol =
      a.history.length > 2
        ? Math.abs(a.history[a.history.length - 1] - a.history[a.history.length - 2]) /
          a.history[a.history.length - 1]
        : 0.01;
    return Math.exp((mom * 0.15 - vol * 8 + hash01(t + i) * 0.2) / 4);
  });
  const z = scores.reduce((s, x) => s + x, 0);
  return assets.map((a, i) => ({ ...a, weight: scores[i] / z }));
}

export function monteCarloPaths(spot: number, vol: number, steps = 32, paths = 18, seed = 1) {
  const out: number[][] = [];
  const dt = 1 / 252;
  for (let p = 0; p < paths; p++) {
    const path = [spot];
    let s = spot;
    for (let i = 1; i < steps; i++) {
      const z = hash01(seed * 19 + p * 97 + i) * 2 - 1;
      s = s * Math.exp((-0.5 * vol * vol) * dt + vol * Math.sqrt(dt) * z * 1.7);
      path.push(s);
    }
    out.push(path);
  }
  return out;
}

export function discardedWeight(chi: number) {
  const max = 64;
  const w = Math.exp(-chi / 10) * 0.22 + 0.002;
  return { chi, discarded: w, kept: 1 - w, max };
}

export const QEC_CODES = [
  {
    id: "surface",
    name: "Rotated surface",
    params: "[[d², 1, d]]",
    threshold: "~0.7–1.0%",
    fit: "Superconducting",
    note: "Local stabilizers, lattice surgery, workhorse for IBM / Google.",
  },
  {
    id: "color",
    name: "2-D color code",
    params: "[[n, k, d]]",
    threshold: "~0.3–0.5%",
    fit: "Trapped ion",
    note: "Transversal Cliffords. Strong Quantinuum results.",
  },
  {
    id: "qldpc",
    name: "Bivariate bicycle qLDPC",
    params: "growing n, k",
    threshold: "code-dependent",
    fit: "Future / IBM",
    note: "Constant rate + growing distance. Non-local checks.",
  },
  {
    id: "steane",
    name: "Steane",
    params: "[[7, 1, 3]]",
    threshold: "experimental",
    fit: "Early logical demos",
    note: "CSS code, transversal Clifford, teaching staple.",
  },
];

export const PLATFORMS = [
  {
    id: "ion",
    name: "Trapped ion",
    score: 92,
    latency: "slow gates, high fidelity",
    viz: "excellent mid-circuit measure",
    use: "HybridCert gold path — H2-class",
  },
  {
    id: "sc",
    name: "Superconducting",
    score: 84,
    latency: "fast, cloud-native",
    viz: "best shot throughput",
    use: "Shadow tomography at scale",
  },
  {
    id: "ph",
    name: "Photonic",
    score: 71,
    latency: "room-temp, networkable",
    viz: "CV / GBS native",
    use: "Distributed entanglement + sensors",
  },
];
