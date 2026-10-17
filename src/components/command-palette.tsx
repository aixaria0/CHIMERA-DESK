import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Atom,
  BookOpen,
  Command,
  FlaskConical,
  LineChart,
  MessageSquare,
  MoonStar,
  Network,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useUiStore } from "@/lib/ui-store";

const ROUTES = [
  { to: "/", title: "Command", note: "System overview and launch surface", icon: Activity },
  { to: "/quantum", title: "Quantum", note: "Circuits, teleportation and qudit tools", icon: Atom },
  { to: "/finance", title: "Finance", note: "Portfolio, risk and simulated tape", icon: LineChart },
  { to: "/research", title: "Research", note: "Surface code, distillation and MPS", icon: FlaskConical },
  { to: "/lattice", title: "Lattice", note: "Consensus topology and quorum flow", icon: Network },
  { to: "/proofs", title: "Proofs", note: "Logic, types and Hoare experiments", icon: BookOpen },
  { to: "/chat", title: "Companion", note: "Local research notes and explanations", icon: MessageSquare },
] as const;

export function CommandPalette({
  open,
  onClose,
  onOpenControls,
}: {
  open: boolean;
  onClose: () => void;
  onOpenControls: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const density = useUiStore((s) => s.density);
  const setDensity = useUiStore((s) => s.setDensity);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ROUTES;
    return ROUTES.filter((item) => `${item.title} ${item.note}`.toLowerCase().includes(q));
  }, [query]);

  if (!open) return null;

  const go = (to: string) => {
    void navigate({ to });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[12vh] sm:px-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        aria-label="Close command palette"
      />
      <section className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border-strong bg-background/96 shadow-[0_32px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
        <header className="flex items-center gap-3 border-b border-border/70 px-4">
          <Search className="size-4 text-primary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jump to a workspace or command…"
            className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <kbd className="rounded-md border border-border bg-card-2 px-1.5 py-1 font-mono text-[10px] text-muted">ESC</kbd>
          <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-card-2 hover:text-foreground">
            <X className="size-4" />
          </button>
        </header>

        <div className="scan-hide max-h-[62vh] overflow-y-auto p-2">
          <p className="px-2 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Workspaces</p>
          <div className="space-y-1">
            {filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => go(item.to)}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start hover:bg-card-2"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card/70 text-steel group-hover:border-primary/30 group-hover:text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{item.title}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted">{item.note}</span>
                  </span>
                  <span className="font-mono text-[10px] text-muted opacity-0 transition-opacity group-hover:opacity-100">↵</span>
                </button>
              );
            })}
            {filtered.length === 0 ? (
              <div className="px-3 py-8 text-center text-xs text-muted">No workspace matches “{query}”.</div>
            ) : null}
          </div>

          {!query ? (
            <>
              <p className="px-2 pb-2 pt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Interface commands</p>
              <div className="grid gap-1 sm:grid-cols-2">
                <PaletteCommand
                  icon={SlidersHorizontal}
                  title="Open control center"
                  note="Theme, fonts, widgets, density"
                  onClick={() => {
                    onClose();
                    onOpenControls();
                  }}
                />
                <PaletteCommand
                  icon={Command}
                  title="Toggle density"
                  note={density === "compact" ? "Switch to comfortable" : "Switch to compact"}
                  onClick={() => {
                    setDensity(density === "compact" ? "comfortable" : "compact");
                    onClose();
                  }}
                />
                <PaletteCommand
                  icon={MoonStar}
                  title="Cycle environment"
                  note={`Current: ${theme}`}
                  onClick={() => {
                    setTheme(theme === "void" ? "nebula" : theme === "nebula" ? "graphite" : "void");
                    onClose();
                  }}
                />
              </div>
            </>
          ) : null}
        </div>

        <footer className="flex items-center justify-between border-t border-border/70 px-4 py-2.5 text-[10px] text-muted">
          <span className="flex items-center gap-1.5"><Command className="size-3" /> Keyboard-first navigation</span>
          <span>CHIMERA command surface</span>
        </footer>
      </section>
    </div>
  );
}

function PaletteCommand({
  icon: Icon,
  title,
  note,
  onClick,
}: {
  icon: typeof Command;
  title: string;
  note: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-xl px-3 py-3 text-start hover:bg-card-2">
      <span className="grid size-9 place-items-center rounded-lg border border-border bg-card/70 text-steel">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-xs font-medium text-foreground">{title}</span>
        <span className="mt-0.5 block text-[10px] text-muted">{note}</span>
      </span>
    </button>
  );
}
