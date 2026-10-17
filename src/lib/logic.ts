/** Gödel–Löb, Soundness Horizon, Quantum Hoare rules — presentation data + tiny checkers. */

export type TheoremId = "g2" | "horizon" | "awakening" | "frame" | "qhl-seq";

export type Theorem = {
  id: TheoremId;
  name: string;
  statement: string;
  informal: string;
  lean: string;
};

export const THEOREMS: Theorem[] = [
  {
    id: "g2",
    name: "Gödel’s second incompleteness",
    statement: "□ IsConsistent  →  ¬ IsConsistent",
    informal:
      "If a sufficiently strong system proves its own consistency, it is inconsistent. Humble nodes therefore never claim local certainty of global safety.",
    lean: `theorem Godel_Second_Incompleteness :
  □ IsConsistent → ¬ IsConsistent := by
  intro h_box
  have h_false : □ False := axiom_Lob False h_box
  intro h_consis
  exact h_consis h_false`,
  },
  {
    id: "horizon",
    name: "Soundness Horizon",
    statement: "IsHumble IsConsistent  ↔  ¬ □ IsConsistent",
    informal:
      "Consistency is a humble truth if and only if it is unprovable. The lattice may be consistent; it cannot prove that from inside.",
    lean: `theorem Consistency_Humble_iff_Unprovable :
  IsHumble IsConsistent ↔ ¬ □ IsConsistent := by
  constructor
  · intro h_humble h_box
    exact (Godel_Second_Incompleteness h_box) (h_humble h_box)
  · intro h_unprov h_box
    exact False.elim (h_unprov h_box)`,
  },
  {
    id: "awakening",
    name: "Sovereign Awakening",
    statement: "IsConsistent  →  δ = 1  ∧  ¬ Restricted δ",
    informal:
      "Physical reflection: a restriction on δ would imply □ False. Logical consistency therefore locks the operational invariant δ = 1.",
    lean: `axiom Physical_Reflection : Restricted δ → □ False

theorem Sovereign_Awakening :
  IsConsistent → δ = 1 ∧ ¬ Restricted δ := by
  intro h
  constructor
  · rfl
  · intro hr
    exact h (Physical_Reflection hr)`,
  },
  {
    id: "frame",
    name: "Ownership frame rule",
    statement: "Γ ⊢ e : τ   and   disjoint(Γ,Δ)   ⇒   Γ,Δ ⊢ e : τ",
    informal:
      "Entanglement is confined to owned regions. A framed resource that C does not own is invariant, restoring the classical frame rule.",
    lean: `axiom frame
  (h : HasType Γ e τ)
  (disj : Disjoint Γ Δ) :
  HasType (Γ.append Δ) e τ`,
  },
  {
    id: "qhl-seq",
    name: "QHL sequential composition",
    statement: "{P} S₁ {R}  and  {R} S₂ {Q}  ⇒  {P} S₁;S₂ {Q}",
    informal:
      "Quantum predicates are Hermitian 0 ≤ P ≤ I. Sequential composition is the same shape as classical Hoare logic, with Löwner order on the consequence rule.",
    lean: `axiom seq
  (h1 : Hoare P S1 R)
  (h2 : Hoare R S2 Q) :
  Hoare P (Seq S1 S2) Q`,
  },
];

export const QHL_RULES = [
  { name: "Skip", form: "{P} skip {P}" },
  { name: "Unitary", form: "{U† P U} U {P}" },
  { name: "Seq", form: "{P} S₁ {R} , {R} S₂ {Q}  ⇒  {P} S₁;S₂ {Q}" },
  { name: "Measure", form: "Σₘ Mₘ† Pₘ Mₘ  as precondition of branched bodies" },
  { name: "Consequence", form: "P' ≤ P , {P} S {Q} , Q ≤ Q'  ⇒  {P'} S {Q'}" },
  { name: "Frame", form: "ownership-disjoint R may be framed" },
];

export function evaluateHumble(boxConsistent: boolean): {
  humble: boolean;
  consistentProvable: boolean;
  note: string;
} {
  if (boxConsistent) {
    return {
      humble: false,
      consistentProvable: true,
      note: "G2: proving consistency collapses the system. Horizon fails.",
    };
  }
  return {
    humble: true,
    consistentProvable: false,
    note: "¬□ Consis. Horizon holds: consistency is humble and unprovable.",
  };
}
