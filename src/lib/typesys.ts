/** Linear quantum type system: ownership, frame rule, Hoare embedding. */

export type QType =
  | { k: "bit"; d: number }
  | { k: "qudit"; d: number }
  | { k: "tensor"; left: QType; right: QType }
  | { k: "hoare"; pre: string; post: string };

export type Binding = { name: string; type: QType; owned: boolean };

export type Judgement = {
  ctx: Binding[];
  expr: string;
  type: QType;
  rule: string;
  note: string;
};

export function typeLabel(t: QType): string {
  if (t.k === "bit") return `Bit ${t.d}`;
  if (t.k === "qudit") return `Qudit ${t.d}`;
  if (t.k === "tensor") return `${typeLabel(t.left)} ⊗ ${typeLabel(t.right)}`;
  return `{${t.pre}} ⊸ {${t.post}}`;
}

export function teleportDerivation(d: number): Judgement[] {
  const Q: QType = { k: "qudit", d };
  const B: QType = { k: "bit", d };
  return [
    {
      ctx: [
        { name: "data", type: Q, owned: true },
        { name: "alice", type: Q, owned: true },
        { name: "bob", type: Q, owned: true },
      ],
      expr: "new / EPR",
      type: { k: "tensor", left: Q, right: Q },
      rule: "New + Fourier + SUM",
      note: "Three linearly owned qudits. Entanglement stays inside Alice+Bob ownership.",
    },
    {
      ctx: [
        { name: "data", type: Q, owned: true },
        { name: "alice", type: Q, owned: true },
        { name: "bob", type: Q, owned: true },
      ],
      expr: "bellMeas(data, alice)",
      type: { k: "tensor", left: B, right: B },
      rule: "Meas-Cont",
      note: "Consumes Alice's two qudits. Frame on bob remains valid (disjoint ownership).",
    },
    {
      ctx: [
        { name: "data", type: Q, owned: false },
        { name: "alice", type: Q, owned: false },
        { name: "bob", type: Q, owned: true },
        { name: "m", type: B, owned: true },
        { name: "n", type: B, owned: true },
      ],
      expr: "correct(W(m,n)) bob",
      type: Q,
      rule: "Unitary",
      note: "Bob applies Weyl correction. Ownership of the reconstructed qudit stays with Bob.",
    },
    {
      ctx: [{ name: "bob", type: Q, owned: true }],
      expr: "teleport_d",
      type: { k: "hoare", pre: "ρ ⊗ Φ₀₀", post: "ρ on Bob" },
      rule: "Hoare + Frame",
      note: "Γ ⊢ teleport : {P} ⊸ {P}. Extra independent registers may be framed.",
    },
  ];
}

export const RULES = [
  { name: "New", form: "∅ ⊢ new_d : Qudit d" },
  { name: "Unitary", form: "Γ ⊢ e : Qudit d    ⇒    Γ ⊢ U e : Qudit d" },
  { name: "Meas", form: "Γ ⊢ e : Qudit d    ⇒    Γ ⊢ meas_d e : Bit d" },
  { name: "Frame", form: "Γ ⊢ e : τ  and  disjoint(Γ,Δ)    ⇒    Γ,Δ ⊢ e : τ" },
  { name: "Hoare", form: "Γ ⊢ e : {P} ⊸ {Q}    (QHL embedding)" },
];
