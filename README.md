# CHIMERA Desk

CHIMERA is a self-contained browser research desk that combines quantum-circuit simulation,
proof-oriented experiments, a seven-node consensus lattice, quantitative finance views,
and an interactive local research companion.

## Modules

- **Command** — live system overview and certified experiment launcher.
- **Quantum** — circuit workspace, probability views, teleportation and qudit experiments.
- **Finance** — simulated quantum-technology book, tape, risk and Monte Carlo views.
- **Research** — surface-code, distillation and tensor-network explorations.
- **Lattice** — seven-node consensus and Byzantine behavior visualization.
- **Proofs** — type, Hoare-style and logic experiments.
- **Chat** — deterministic, local desk companion grounded in the current simulation state.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:8080`.

## Quality checks

```bash
npm run build
npm run lint
```

The project is client-side and does not require private API keys.
