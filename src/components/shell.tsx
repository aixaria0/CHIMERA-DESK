import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Atom,
  BookOpen,
  Command,
  FlaskConical,
  Hexagon,
  LineChart,
  MessageSquare,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CommandPalette } from "@/components/command-palette";
import { ControlCenter } from "@/components/control-center";
import { copy } from "@/lib/i18n";
import { useChimera } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { to: "/", key: "command" as const, icon: Activity, note: "Overview" },
  { to: "/quantum", key: "quantum" as const, icon: Atom, note: "Circuits" },
  { to: "/finance", key: "finance" as const, icon: LineChart, note: "Risk & tape" },
  { to: "/research", key: "research" as const, icon: FlaskConical, note: "QEC & MPS" },
  { to: "/lattice", key: "lattice" as const, icon: Network, note: "Consensus" },
  { to: "/proofs", key: "proofs" as const, icon: BookOpen, note: "Logic" },
  { to: "/chat", key: "chat" as const, icon: MessageSquare, note: "Companion" },
];

const PAGE_META: Record<string, { eyebrow: string; title: string; note: string }> = {
  "/": { eyebrow: "CONTROL PLANE", title: "Command", note: "Live overview across the complete research desk" },
  "/quantum": { eyebrow: "LAB / 01", title: "Quantum", note: "Circuit simulation, qudits, teleportation and certification" },
  "/finance": { eyebrow: "MARKETS / 02", title: "Finance", note: "Simulated book, risk surface and Monte Carlo telemetry" },
  "/research": { eyebrow: "RESEARCH / 03", title: "Research", note: "Surface code, distillation and tensor-network studies" },
  "/lattice": { eyebrow: "NETWORK / 04", title: "Lattice", note: "Seven-node consensus, quorum and Byzantine behavior" },
  "/proofs": { eyebrow: "LOGIC / 05", title: "Proofs", note: "Types, Hoare contracts and consistency experiments" },
  "/chat": { eyebrow: "NOTES / 06", title: "Companion", note: "Local explanations grounded in this research desk" },
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang = useChimera((s) => s.lang);
  const setLang = useChimera((s) => s.setLang);
  const pulse = useChimera((s) => s.pulse);
  const phase = useChimera((s) => s.phase);
  const view = useChimera((s) => s.view);
  const seq = useChimera((s) => s.seq);
  const nodes = useChimera((s) => s.nodes);
  const backends = useChimera((s) => s.backends);
  const ui = useUiStore();
  const [controlsOpen, setControlsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const t = copy[lang];

  const meta = PAGE_META[pathname] ?? PAGE_META["/"];
  const honest = nodes.filter((node) => node.honest).length;
  const activeBackends = backends.filter((backend) => backend.status === "active").length;

  useEffect(() => {
    const id = window.setInterval(() => pulse(), ui.refreshMs);
    return () => window.clearInterval(id);
  }, [pulse, ui.refreshMs]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = ui.theme;
    root.dataset.accent = ui.accent;
    root.dataset.font = ui.font;
    root.dataset.density = ui.density;
    root.dataset.glass = ui.glass ? "on" : "off";
    root.dataset.grid = ui.grid ? "on" : "off";
    root.dataset.motion = ui.motion ? "on" : "off";
  }, [ui.theme, ui.accent, ui.font, ui.density, ui.glass, ui.grid, ui.motion]);

  useEffect(() => {
    const openPalette = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", openPalette);
    return () => window.removeEventListener("keydown", openPalette);
  }, []);

  const telemetry = useMemo(
    () => [
      { label: "VIEW", value: String(view).padStart(2, "0") },
      { label: "SEQ", value: String(seq) },
      { label: "QUORUM", value: `${honest}/${nodes.length}` },
      { label: "BACKENDS", value: `${activeBackends}/${backends.length}` },
    ],
    [view, seq, honest, nodes.length, activeBackends, backends.length],
  );

  return (
    <div
      className="app-shell flex min-h-dvh bg-background text-foreground"
      dir={lang === "fa" ? "rtl" : "ltr"}
    >
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-30 hidden shrink-0 flex-col border-e border-border/70 bg-sidebar/88 backdrop-blur-2xl transition-[width] duration-300 md:flex",
          ui.sidebarCollapsed ? "w-[76px]" : "w-[252px]",
        )}
      >
        <div className={cn("flex h-[76px] items-center border-b border-border/60", ui.sidebarCollapsed ? "justify-center px-3" : "px-4")}>
          <Link to="/" className="group flex min-w-0 items-center gap-3">
            <span className="brand-mark relative grid size-10 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/[0.07] text-primary shadow-[0_0_28px_rgba(var(--glow-rgb),0.1)]">
              <Hexagon className="size-5" strokeWidth={1.6} />
              <span className="absolute inset-[6px] rounded-lg border border-primary/15" />
            </span>
            {!ui.sidebarCollapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-[-0.02em]">CHIMERA</p>
                <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.2em] text-muted">Research desk</p>
              </div>
            ) : null}
          </Link>
        </div>

        {!ui.sidebarCollapsed ? (
          <div className="mx-3 mt-3 rounded-xl border border-border/60 bg-card/45 p-3 shadow-[var(--shadow-inner)]">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[11px] font-medium text-steel">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-30" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                Desk online
              </span>
              <Badge tone={phase === "idle" ? "ok" : "warn"}>{phase === "idle" ? "READY" : phase.toUpperCase()}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px] text-muted">
              <span>quorum <b className="text-foreground">{honest}/{nodes.length}</b></span>
              <span>pulse <b className="text-foreground">{ui.refreshMs}ms</b></span>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex justify-center">
            <span className="relative flex size-2" title="Desk online">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-30" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
          </div>
        )}

        <nav className={cn("scan-hide flex flex-1 flex-col gap-1 overflow-y-auto", ui.sidebarCollapsed ? "px-2 pt-5" : "px-3 pt-5")}>
          {!ui.sidebarCollapsed ? <p className="mb-1 px-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted/75">Workspaces</p> : null}
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={ui.sidebarCollapsed ? t[item.key] : undefined}
                className={cn(
                  "group relative flex min-h-11 items-center rounded-xl text-sm transition-all duration-150",
                  ui.sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3",
                  active
                    ? "bg-primary/[0.085] text-foreground shadow-[inset_0_0_0_1px_rgba(var(--glow-rgb),0.14)]"
                    : "text-muted hover:bg-card-2/70 hover:text-foreground",
                )}
              >
                {active ? <span className="absolute inset-y-2 start-0 w-[2px] rounded-full bg-primary shadow-[0_0_12px_rgba(var(--glow-rgb),0.55)]" /> : null}
                <Icon className={cn("size-[17px] shrink-0", active ? "text-primary" : "text-muted group-hover:text-steel")} strokeWidth={1.65} />
                {!ui.sidebarCollapsed ? (
                  <>
                    <span className="min-w-0 flex-1 font-medium">{t[item.key]}</span>
                    <span className="text-[9px] text-muted/65">{item.note}</span>
                  </>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/60 p-3">
          {!ui.sidebarCollapsed ? (
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="mb-2 flex h-10 w-full items-center gap-2 rounded-xl border border-border/60 bg-card/45 px-3 text-xs text-muted hover:bg-card-2 hover:text-foreground"
            >
              <Command className="size-3.5" />
              <span className="flex-1 text-start">Quick command</span>
              <kbd className="rounded border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[9px]">⌘K</kbd>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => ui.setSidebarCollapsed(!ui.sidebarCollapsed)}
            className={cn(
              "flex h-10 w-full items-center rounded-xl text-xs text-muted hover:bg-card-2 hover:text-foreground",
              ui.sidebarCollapsed ? "justify-center" : "gap-2 px-3",
            )}
          >
            {ui.sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!ui.sidebarCollapsed ? <span>Collapse sidebar</span> : null}
          </button>
        </div>
      </aside>

      <div className={cn("relative z-10 flex min-w-0 flex-1 flex-col transition-[padding] duration-300", ui.sidebarCollapsed ? "md:ps-[76px]" : "md:ps-[252px]")}>
        <header className="sticky top-0 z-20 border-b border-border/65 bg-background/78 backdrop-blur-2xl">
          <div className="flex h-[76px] items-center justify-between gap-3 px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex items-center gap-2 md:hidden">
                <span className="grid size-9 place-items-center rounded-xl border border-primary/20 bg-primary/[0.07] text-primary">
                  <Hexagon className="size-4" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary/75">{meta.eyebrow}</p>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <h1 className="truncate text-[17px] font-semibold tracking-[-0.025em]">{lang === "en" ? meta.title : t[NAV.find((item) => item.to === pathname)?.key ?? "command"]}</h1>
                  <span className="hidden truncate text-[11px] text-muted lg:inline">/ {meta.note}</span>
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-1.5 xl:flex">
              {telemetry.map((item) => (
                <div key={item.label} className="min-w-[72px] rounded-lg border border-border/55 bg-card/40 px-2.5 py-1.5">
                  <p className="font-mono text-[8px] tracking-[0.16em] text-muted">{item.label}</p>
                  <p className="mt-0.5 font-mono text-[11px] font-semibold text-steel">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="hidden h-9 items-center gap-2 rounded-lg border border-border/65 bg-card/45 px-2.5 text-[11px] text-muted hover:bg-card-2 hover:text-foreground sm:flex"
                title="Command palette"
              >
                <Command className="size-3.5" />
                <span className="hidden lg:inline">Command</span>
                <kbd className="hidden rounded border border-border bg-background/70 px-1 py-0.5 font-mono text-[8px] lg:inline">⌘K</kbd>
              </button>
              <button
                type="button"
                onClick={() => setLang(lang === "en" ? "fa" : "en")}
                className="grid h-9 min-w-10 place-items-center rounded-lg border border-border/65 bg-card/45 px-2 text-[10px] font-semibold text-muted hover:bg-card-2 hover:text-foreground"
                aria-label={lang === "en" ? "Switch to Persian" : "Switch to English"}
              >
                {lang === "en" ? "FA" : "EN"}
              </button>
              <ClockBadge />
              <button
                type="button"
                onClick={() => setControlsOpen(true)}
                className="grid size-9 place-items-center rounded-lg border border-border/65 bg-card/45 text-muted hover:border-primary/25 hover:bg-primary/[0.06] hover:text-primary"
                aria-label="Open control center"
                title="Control center"
              >
                <Settings2 className="size-4" />
              </button>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/18 to-transparent" />
        </header>

        <main className="min-h-0 flex-1 p-3 pb-24 sm:p-4 md:p-5 md:pb-6 xl:p-6">{children}</main>
      </div>

      <nav className="fixed inset-x-2 bottom-2 z-30 flex h-16 items-center gap-1 overflow-x-auto rounded-2xl border border-border/75 bg-background/90 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:hidden">
        {NAV.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex h-full min-w-[62px] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[9px] transition-colors",
                active ? "bg-primary/[0.09] text-primary" : "text-muted hover:bg-card-2 hover:text-foreground",
              )}
            >
              <Icon className="size-4" strokeWidth={1.7} />
              {t[item.key]}
            </Link>
          );
        })}
      </nav>

      <ControlCenter open={controlsOpen} onClose={() => setControlsOpen(false)} />
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onOpenControls={() => setControlsOpen(true)}
      />
    </div>
  );
}

function ClockBadge() {
  const [now, setNow] = useState("00:00:00");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const stamp = () => setNow(new Date().toISOString().slice(11, 19));
    stamp();
    setReady(true);
    const id = window.setInterval(stamp, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="hidden h-9 items-center rounded-lg border border-border/65 bg-card/45 px-2.5 font-mono text-[10px] tabular text-steel lg:inline-flex">
      {ready ? `${now} UTC` : "clock"}
    </span>
  );
}
