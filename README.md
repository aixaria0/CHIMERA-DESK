# CHIMERA Desk

CHIMERA is a browser-based research control surface for quantum simulation, proof experiments, seven-node consensus, quantitative research, and local technical notes.

**Live:** https://aixaria0.github.io/CHIMERA-DESK/

## What is inside

- **Command** — dense mission-control dashboard, live telemetry, certificates, backend health and system events.
- **Quantum** — circuit workspace, probability views, qudit teleportation, type and Hoare experiments.
- **Finance** — simulated technology book, live tape, portfolio weights, VaR and Monte Carlo views.
- **Research** — surface-code, magic-state distillation and tensor-network explorations.
- **Lattice** — seven-node consensus, quorum flow and Byzantine behavior visualization.
- **Proofs** — consistency, type-system and logic experiments.
- **Companion** — deterministic local research notes grounded in the same desk glossary.

## Interface controls

The control center lets you change environment palette, accent color, typography, information density, telemetry rate, visual effects, sidebar density, and individual dashboard modules. `Ctrl/Cmd + K` opens the command palette.

Preferences are stored locally in the browser and do not change the research state.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:8080`.

## Quality gates

```bash
npm run lint
npm run build
```

The project is client-side and does not require private API keys.
