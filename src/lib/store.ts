import { create } from "zustand";
import type { Lang } from "./i18n";
import {
  INITIAL_ASSETS,
  INITIAL_BACKENDS,
  makeCluster,
  qaoaWeights,
  tickAssets,
  tickBackends,
  tickCluster,
  type Asset,
  type Backend,
  type Cert,
  type ClusterNode,
  type LogLine,
} from "./sim";
import { PRESETS, withIds, type Gate } from "./quantum";

type ChatMsg = { id: string; role: "user" | "assistant"; text: string };

type ChimeraState = {
  lang: Lang;
  tick: number;
  leader: number;
  view: number;
  seq: number;
  phase: "idle" | "propose" | "vote" | "decide";
  backends: Backend[];
  assets: Asset[];
  nodes: ClusterNode[];
  certs: Cert[];
  logs: LogLine[];
  qubits: number[];
  gates: Gate[];
  nQubits: number;
  shots: number;
  lastCert: Cert | null;
  chat: ChatMsg[];
  setLang: (l: Lang) => void;
  pulse: () => void;
  setGates: (g: Gate[]) => void;
  setNQubits: (n: number) => void;
  setShots: (n: number) => void;
  loadPreset: (key: keyof typeof PRESETS) => void;
  pushLog: (line: Omit<LogLine, "id" | "ts">) => void;
  pushCert: (c: Omit<Cert, "id" | "ts">) => void;
  setPhase: (p: ChimeraState["phase"], leader?: number) => void;
  addChat: (m: ChatMsg) => void;
  clearChat: () => void;
};

let seqId = 1;
function nid() {
  seqId += 1;
  return `id${seqId}`;
}

export const useChimera = create<ChimeraState>()((set, get) => ({
  lang: "en",
  tick: 0,
  leader: 0,
  view: 4,
  seq: 128,
  phase: "idle",
  backends: INITIAL_BACKENDS,
  assets: INITIAL_ASSETS,
  nodes: makeCluster(7),
  certs: [],
  logs: [
    {
      id: "boot",
      ts: 0,
      level: "ok",
      source: "lattice",
      message: "Desk ready. 5 of 7 honest nodes. Simulator only.",

    },
  ],
  qubits: Array.from({ length: 64 }, (_, i) => 38 + ((i * 17) % 40)),
  gates: withIds(PRESETS.ghz.gates),
  nQubits: 3,
  shots: 256,
  lastCert: null,
  chat: [],
  setLang: (lang) => set({ lang }),
  pulse: () => {
    const t = get().tick + 1;
    const leader = get().leader;
    set({
      tick: t,
      backends: tickBackends(get().backends, t),
      assets: qaoaWeights(tickAssets(get().assets, t), t),
      nodes: tickCluster(get().nodes, t, leader),
      qubits: get().qubits.map((v, i) => {
        const n = v + Math.sin(t * 0.05 + i) * 1.4;
        return Math.min(108, Math.max(32, n));
      }),
    });
  },
  setGates: (gates) => set({ gates }),
  setNQubits: (nQubits) => set({ nQubits }),
  setShots: (shots) => set({ shots }),
  loadPreset: (key) => {
    const p = PRESETS[key];
    set({ nQubits: p.n, gates: withIds(p.gates) });
  },
  pushLog: (line) =>
    set({
      logs: [{ id: nid(), ts: Date.now(), ...line }, ...get().logs].slice(0, 80),
    }),
  pushCert: (c) => {
    const cert: Cert = { id: nid(), ts: Date.now(), ...c };
    set({
      lastCert: cert,
      certs: [cert, ...get().certs].slice(0, 24),
      seq: get().seq + 1,
    });
  },
  setPhase: (phase, leader) =>
    set({
      phase,
      leader: leader ?? get().leader,
      view: phase === "propose" && leader !== undefined ? get().view + 1 : get().view,
    }),
  addChat: (m) => set({ chat: [...get().chat, m].slice(-40) }),
  clearChat: () => set({ chat: [] }),
}));
