import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Atom,
  BookOpen,
  CheckCircle2,
  Cpu,
  FlaskConical,
  Gauge,
  Hexagon,
  LineChart as LineChartIcon,
  MessageSquare,
  Network,
  Play,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Glossary } from "@/components/explain";
import { Metric, Panel } from "@/components/panel";
import { QpuGrid } from "@/components/qpu-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DESKS } from "@/lib/guide";
import { runHybridRound } from "@/lib/hybrid";
import { copy } from "@/lib/i18n";
import { portfolioNav, var95 } from "@/lib/sim";
import { useChimera } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { cn, formatPct, formatUsd } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Command });

const DESK_ICONS: Record<string, LucideIcon> = {
  lab: Atom,
  markets: LineChartIcon,
  research: FlaskConical,
  network: Network,
  logic: BookOpen,
  chat: MessageSquare,
};

function Command() {
  const lang = useChimera((s) => s.lang);
  const backends = useChimera((s) => s.backends);
  const assets = useChimera((s) => s.assets);
  const certs = useChimera((s) => s.certs);
  const logs = useChimera((s) => s.logs);
  const nodes = useChimera((s) => s.nodes);
  const gates = useChimera((s) => s.gates);
  const nQubits = useChimera((s) => s.nQubits);
  const shots = useChimera((s) => s.shots);
  const view = useChimera((s) => s.view);
  const seq = useChimera((s) => s.seq);
  const phase = useChimera((s) => s.phase);
  const pushCert = useChimera((s) => s.pushCert);
  const pushLog = useChimera((s) => s.pushLog);
  const setPhase = useChimera((s) => s.setPhase);
  const loadPreset = useChimera((s) => s.loadPreset);
  const setShots = useChimera((s) => s.setShots);
  const widgets = useUiStore((s) => s.widgets);
  const refreshMs = useUiStore((s) => s.refreshMs);
  const [preset, setPreset] = useState<"ghz" | "bell" | "grover">("ghz");
  const t = copy[lang];

  const ibq = backends[0];
  const nav = portfolioNav(assets);
  const risk = var95(assets);
  const honest = nodes.filter((n) => n.honest).length;
  const activeBackends = backends.filter((b) => b.status === "active").length;
  const avgFidelity = backends.reduce((sum, b) => sum + b.fidelity, 0) / backends.length;
  const avgLoad = nodes.reduce((sum, n) => sum + n.load, 0) / nodes.length;
  const queueDepth = backends.reduce((sum, b) => sum + b.queue, 0);
  const lastCert = certs[0] ?? null;
  const tape = assets[0]?.history.map((p, i) => ({ i, p })) ?? [];
  const visibleWidgetCount = Object.values(widgets).filter(Boolean).length;

  function launch() {
    if (phase !== "idle") return;
    setPhase("propose", 0);
    window.setTimeout(() => setPhase("vote"), 520);
    window.setTimeout(() => {
      const cert = runHybridRound({
        n: nQubits,
        gates,
        shots,
        backend: ibq.id,
        view,
        seq,
      });
      pushCert(cert);
      pushLog({
        level: cert.accepted ? "ok" : "warn",
        source: "hybrid",
        message: `Experiment ${cert.seq}: fidelity ${cert.fidelity.toFixed(3)} ± ${cert.error.toFixed(3)} → ${cert.accepted ? "ACCEPT" : "REJECT"}`,
      });
      setPhase("decide");
    }, 1040);
    window.setTimeout(() => setPhase("idle"), 1680);
  }

  function choosePreset(next: "ghz" | "bell" | "grover") {
    setPreset(next);
    loadPreset(next);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3.5">
      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-12">
        <Panel className="hero-panel min-h-[360px] xl:col-span-8" bodyClassName="h-full">
          <div className="grid h-full min-h-[330px] grid-cols-1 gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-center">
            <div className="relative z-[2] flex h-full flex-col justify-between py-1 md:py-3">
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <Badge tone="ok">
                    <span className="size-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--glow-rgb),0.75)]" />
                    SYSTEM READY
                  </Badge>
                  <Badge tone="steel">v{view} / s{seq}</Badge>
                  <Badge tone={honest >= 5 ? "ok" : "danger"}>{honest}/{nodes.length} QUORUM</Badge>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70">
                  {lang === "fa" ? "سطح کنترل پژوهش" : "RESEARCH CONTROL SURFACE"}
                </p>
                <h2 className="text-gradient mt-3 max-w-3xl text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-[2.8rem] lg:text-[3.25rem]">
                  {lang === "fa" ? "یک میز برای دیدن کل سیستم." : "One desk. Every system in view."}
                </h2>
                <p className="mt-4 max-w-xl text-[13px] leading-6 text-muted sm:text-sm">
                  {lang === "fa"
                    ? "کوانتوم، اجماع، منطق، ریسک و پژوهش را در یک سطح زنده کنترل کن. وضعیت، گواهی‌ها و جریان رویدادها همیشه در دسترس‌اند."
                    : "Operate quantum experiments, consensus, formal logic, risk and research from one live surface. State, certificates and telemetry stay visible without breaking focus."}
                </p>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <Button onClick={launch} size="lg" disabled={phase !== "idle"}>
                  {phase === "idle" ? <Play className="size-4 fill-current" /> : <Zap className="size-4" />}
                  {phase === "idle" ? t.launch : phase.toUpperCase()}
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link to="/quantum">
                    Open laboratory
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <HeroStat label="Fidelity" value={avgFidelity.toFixed(3)} detail="backend mean" />
                <HeroStat label="Cluster" value={`${Math.round(avgLoad * 100)}%`} detail="mean load" />
                <HeroStat label="Queue" value={String(queueDepth)} detail="pending jobs" />
                <HeroStat label="Pulse" value={`${refreshMs}ms`} detail="telemetry" />
              </div>
            </div>

            <SystemCore
              phase={phase}
              honest={honest}
              total={nodes.length}
              fidelity={avgFidelity}
              certAccepted={lastCert?.accepted ?? null}
            />
          </div>
        </Panel>

        <Panel
          className="xl:col-span-4"
          kicker={lang === "fa" ? "کنترل جلسه" : "Session control"}
          title={lang === "fa" ? "آزمایش فعال" : "Active experiment"}
          action={<Badge tone={phase === "idle" ? "ok" : "warn"}>{phase.toUpperCase()}</Badge>}
        >
          <div className="rounded-xl border border-border/65 bg-card-2/45 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold">Circuit preset</p>
                <p className="mt-0.5 text-[10px] text-muted">Changes the local statevector program.</p>
              </div>
              <Atom className="size-4 text-primary" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-border/60 bg-background/45 p-1">
              {(["ghz", "bell", "grover"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => choosePreset(key)}
                  className={cn(
                    "rounded-lg px-2 py-2 text-[10px] font-semibold uppercase transition-colors",
                    preset === key ? "bg-primary/[0.1] text-primary" : "text-muted hover:bg-card-2 hover:text-foreground",
                  )}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2.5 rounded-xl border border-border/65 bg-card-2/45 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold">Sampling budget</p>
                <p className="mt-0.5 text-[10px] text-muted">Higher shots tighten the statistical estimate.</p>
              </div>
              <TimerReset className="size-4 text-steel" />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1">
              {[128, 256, 512, 1024].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setShots(value)}
                  className={cn(
                    "rounded-lg border px-2 py-2 font-mono text-[10px] transition-colors",
                    shots === value
                      ? "border-primary/25 bg-primary/[0.08] text-primary"
                      : "border-border/55 bg-background/35 text-muted hover:bg-card-2 hover:text-foreground",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <MiniMetric icon={Cpu} label="Register" value={`${nQubits} qubits`} />
            <MiniMetric icon={Gauge} label="Program" value={`${gates.length} gates`} />
            <MiniMetric icon={ShieldCheck} label="Certificates" value={String(certs.length)} />
            <MiniMetric icon={Sparkles} label="Widgets" value={`${visibleWidgetCount}/7`} />
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-border/55 bg-background/30 px-3 py-2.5">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Last verdict</p>
              <p className="mt-1 text-xs font-medium">
                {lastCert ? `F ${lastCert.fidelity.toFixed(3)} · ${lastCert.accepted ? "accepted" : "rejected"}` : "No certificate yet"}
              </p>
            </div>
            {lastCert ? (
              <CheckCircle2 className={cn("size-4", lastCert.accepted ? "text-primary" : "text-destructive")} />
            ) : (
              <Hexagon className="size-4 text-muted" />
            )}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        <Metric
          label={lang === "fa" ? "وفاداری میانگین" : "Mean fidelity"}
          value={avgFidelity.toFixed(3)}
          hint={`${activeBackends}/${backends.length} backends active`}
          tone={avgFidelity > 0.95 ? "ok" : "warn"}
        />
        <Metric
          label={lang === "fa" ? "خطای CX" : "CX error"}
          value={ibq.cxError.toFixed(4)}
          hint="Two-qubit gate error"
          tone={ibq.cxError < 0.0025 ? "ok" : "warn"}
        />
        <Metric
          label={lang === "fa" ? "عمق صف" : "Queue depth"}
          value={String(queueDepth)}
          hint="Across named backends"
          tone={queueDepth > 20 ? "warn" : "default"}
        />
        <Metric
          label={lang === "fa" ? "حد نصاب" : "Consensus"}
          value={`${honest}/${nodes.length}`}
          hint="5 signatures required"
          tone={honest >= 5 ? "ok" : "danger"}
        />
        <Metric
          label={lang === "fa" ? "ارزش دفتر" : "Book value"}
          value={formatUsd(nav)}
          hint={`${assets.length} simulated instruments`}
        />
        <Metric
          label="VaR 95"
          value={`${risk.toFixed(2)}%`}
          hint="One-day Gaussian estimate"
          tone={risk > 3 ? "warn" : "default"}
        />
      </div>

      {widgets.workspaces ? (
        <Panel
          kicker={lang === "fa" ? "فضاهای کاری" : "Workspace launcher"}
          title={lang === "fa" ? "شش سطح تخصصی" : "Six specialized surfaces"}
          action={<span className="font-mono text-[9px] text-muted">01 — 06</span>}
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {DESKS.map((desk) => {
              const d = desk[lang];
              const Icon = DESK_ICONS[desk.id] ?? Hexagon;
              return (
                <Link
                  key={desk.to}
                  to={desk.to}
                  className="group relative overflow-hidden rounded-xl border border-border/65 bg-card-2/45 p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card-2/75"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent transition-colors group-hover:via-primary/35" />
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-9 place-items-center rounded-lg border border-border/70 bg-background/45 text-steel transition-colors group-hover:border-primary/20 group-hover:text-primary">
                      <Icon className="size-4" strokeWidth={1.65} />
                    </span>
                    <span className="font-mono text-[9px] text-muted">0{desk.n}</span>
                  </div>
                  <p className="mt-4 text-[13px] font-semibold">{d.label}</p>
                  <p className="mt-1.5 min-h-10 text-[10px] leading-[1.55] text-muted">{d.pitch}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-muted transition-colors group-hover:text-primary">
                    Enter workspace <ArrowUpRight className="size-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Panel>
      ) : null}

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-12">
        {widgets.market ? (
          <Panel
            className="xl:col-span-7"
            kicker={lang === "fa" ? "تله‌متری بازار" : "Market telemetry"}
            title={`${assets[0]?.symbol ?? "IONQ"} · ${formatUsd(assets[0]?.price ?? 0)}`}
            action={
              <span className={cn("font-mono text-[10px] font-semibold", (assets[0]?.change ?? 0) >= 0 ? "text-primary" : "text-destructive")}>
                {formatPct(assets[0]?.change ?? 0, 2)}
              </span>
            }
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_150px]">
              <div className="h-[260px] min-w-0 rounded-xl border border-border/45 bg-background/28 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tape} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
                    <defs>
                      <linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.26} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="i" hide />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip
                      cursor={{ stroke: "rgba(255,255,255,0.12)", strokeDasharray: "3 3" }}
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border-strong)",
                        borderRadius: 10,
                        fontSize: 11,
                        boxShadow: "0 14px 40px rgba(0,0,0,.35)",
                      }}
                      labelStyle={{ color: "var(--color-muted)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="p"
                      stroke="var(--color-primary)"
                      fill="url(#navFill)"
                      strokeWidth={1.7}
                      dot={false}
                      activeDot={{ r: 3, fill: "var(--color-primary)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {assets.map((asset) => (
                  <div key={asset.symbol} className="rounded-xl border border-border/55 bg-card-2/40 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-semibold text-steel">{asset.symbol}</span>
                      <span className={cn("font-mono text-[9px]", asset.change >= 0 ? "text-primary" : "text-destructive")}>
                        {formatPct(asset.change, 1)}
                      </span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-background/70">
                      <div className="h-full rounded-full bg-primary/70" style={{ width: `${Math.max(8, asset.weight * 100)}%` }} />
                    </div>
                    <p className="mt-1.5 font-mono text-[9px] text-muted">w {(asset.weight * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        ) : null}

        {widgets.backends ? (
          <Panel
            className={cn(widgets.market ? "xl:col-span-5" : "xl:col-span-12")}
            kicker={lang === "fa" ? "ماتریس اجرا" : "Backend matrix"}
            title={lang === "fa" ? "سلامت و صف" : "Health, fidelity and queue"}
            action={<Badge tone="steel">{backends.length} TARGETS</Badge>}
          >
            <div className="space-y-2.5">
              {backends.map((backend) => {
                const quality = Math.round(backend.fidelity * 100);
                return (
                  <div key={backend.id} className="rounded-xl border border-border/55 bg-card-2/40 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("size-1.5 rounded-full", backend.status === "active" ? "bg-primary" : backend.status === "calibrating" ? "bg-warn" : "bg-muted")} />
                          <p className="truncate text-xs font-semibold">{backend.name}</p>
                        </div>
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{backend.kind} · {backend.qubits}q</p>
                      </div>
                      <div className="text-end">
                        <p className="font-mono text-[11px] font-semibold tabular text-steel">{backend.fidelity.toFixed(3)}</p>
                        <p className="mt-0.5 font-mono text-[8px] text-muted">q {backend.queue}</p>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/70">
                      <div
                        className={cn("h-full rounded-full", quality > 95 ? "bg-primary" : quality > 88 ? "bg-warn" : "bg-destructive")}
                        style={{ width: `${quality}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between font-mono text-[8px] text-muted">
                      <span>CX {backend.cxError.toFixed(4)}</span>
                      <span>RO {backend.readout.toFixed(3)}</span>
                      <span>{quality}% health</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-12">
        {widgets.qpu ? (
          <Panel
            className="xl:col-span-4"
            kicker={lang === "fa" ? "آنالوگ حرارتی" : "QPU analog"}
            title={lang === "fa" ? "نقشه اشغال ۶۴ خانه" : "64-cell occupancy heat map"}
            action={<Badge tone="warn">SIMULATED</Badge>}
          >
            <div className="rounded-xl border border-border/50 bg-background/30 p-2.5">
              <QpuGrid />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <MiniDatum label="CX" value={ibq.cxError.toFixed(4)} />
              <MiniDatum label="READOUT" value={ibq.readout.toFixed(3)} />
              <MiniDatum label="T1" value={`${ibq.t1us.toFixed(0)}μs`} />
            </div>
          </Panel>
        ) : null}

        {widgets.certificates ? (
          <Panel
            className={cn(widgets.qpu ? "xl:col-span-4" : "xl:col-span-6")}
            kicker={lang === "fa" ? "گواهی" : "Certificates"}
            title={lang === "fa" ? "آخرین verdictها" : "Recent experiment verdicts"}
            action={<Link to="/lattice" className="text-[10px] text-muted hover:text-primary">Open lattice ↗</Link>}
          >
            {certs.length === 0 ? (
              <EmptyState icon={ShieldCheck} title="No certificate yet" body="Launch an experiment to produce a signed fidelity verdict." />
            ) : (
              <div className="space-y-2">
                {certs.slice(0, 6).map((cert) => (
                  <div key={cert.id} className="flex items-center gap-3 rounded-xl border border-border/55 bg-card-2/40 p-3">
                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg border", cert.accepted ? "border-primary/20 bg-primary/[0.07] text-primary" : "border-destructive/20 bg-destructive/[0.07] text-destructive")}>
                      {cert.accepted ? <CheckCircle2 className="size-4" /> : <Hexagon className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold">{cert.program}</p>
                      <p className="mt-0.5 font-mono text-[8px] text-muted">v{cert.view} · s{cert.seq} · {cert.backend}</p>
                    </div>
                    <div className="text-end">
                      <p className="font-mono text-[11px] font-semibold tabular">F {cert.fidelity.toFixed(3)}</p>
                      <p className={cn("mt-0.5 font-mono text-[8px]", cert.accepted ? "text-primary" : "text-destructive")}>
                        {cert.accepted ? "ACCEPT" : "REJECT"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        ) : null}

        {widgets.events ? (
          <Panel
            className={cn(widgets.qpu || widgets.certificates ? "xl:col-span-4" : "xl:col-span-6")}
            kicker={lang === "fa" ? "جریان زنده" : "Event stream"}
            title={lang === "fa" ? "رویدادهای سیستم" : "System events"}
            action={<Badge tone="steel">{logs.length} LINES</Badge>}
          >
            <ul className="scan-hide max-h-[330px] space-y-1.5 overflow-y-auto pe-1 font-mono text-[9px]">
              {logs.slice(0, 18).map((log) => (
                <li key={log.id} className="grid grid-cols-[48px_58px_1fr] gap-2 rounded-lg px-2 py-2 hover:bg-card-2/55">
                  <span className="text-muted">{log.ts === 0 ? "boot" : new Date(log.ts).toISOString().slice(11, 19)}</span>
                  <span className={cn(log.level === "ok" ? "text-primary" : log.level === "warn" ? "text-warn" : log.level === "danger" ? "text-destructive" : "text-steel")}>
                    {log.source}
                  </span>
                  <span className="leading-relaxed text-steel/85">{log.message}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}
      </div>

      {widgets.glossary ? (
        <Panel
          kicker={lang === "fa" ? "مرجع سریع" : "Research glossary"}
          title={lang === "fa" ? "هر عدد دقیقاً چه می‌گوید" : "What every signal actually means"}
          action={<Badge tone="mute">LOCAL NOTES</Badge>}
        >
          <Glossary lang={lang} />
        </Panel>
      ) : null}
    </div>
  );
}

function HeroStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-border/55 bg-background/28 px-3 py-2.5">
      <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-1 font-mono text-[12px] font-semibold tabular text-steel">{value}</p>
      <p className="mt-0.5 text-[8px] text-muted/75">{detail}</p>
    </div>
  );
}

function MiniMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/55 bg-card-2/38 p-2.5">
      <div className="flex items-center gap-1.5 text-muted">
        <Icon className="size-3" />
        <span className="font-mono text-[8px] uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="mt-1.5 text-[11px] font-semibold text-steel">{value}</p>
    </div>
  );
}

function MiniDatum({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/55 bg-card-2/38 px-2 py-2.5 text-center">
      <p className="font-mono text-[8px] text-muted">{label}</p>
      <p className="mt-1 font-mono text-[10px] font-semibold tabular text-steel">{value}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/20 px-5 text-center">
      <span className="grid size-10 place-items-center rounded-xl border border-border/70 bg-card-2/55 text-muted">
        <Icon className="size-4" />
      </span>
      <p className="mt-3 text-xs font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-[10px] leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function SystemCore({
  phase,
  honest,
  total,
  fidelity,
  certAccepted,
}: {
  phase: "idle" | "propose" | "vote" | "decide";
  honest: number;
  total: number;
  fidelity: number;
  certAccepted: boolean | null;
}) {
  return (
    <div className="system-core-wrap relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-border/45 bg-background/20">
      <div className="absolute inset-0 grid-fade opacity-70" />
      <div className="system-core" aria-hidden="true">
        <div className="core-orbit core-orbit-1">
          <span className="core-satellite core-satellite-a" />
          <span className="core-satellite core-satellite-b" />
        </div>
        <div className="core-orbit core-orbit-2">
          <span className="core-satellite core-satellite-c" />
        </div>
        <div className="core-orbit core-orbit-3" />
        <div className="core-axis core-axis-x" />
        <div className="core-axis core-axis-y" />
        <div className="core-center">
          <span className="core-center-glow" />
          <Hexagon className="relative z-10 size-9 text-primary" strokeWidth={1.35} />
        </div>
      </div>
      <div className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-1.5">
        <div className="rounded-lg border border-border/55 bg-background/65 px-2 py-2 text-center backdrop-blur-lg">
          <p className="font-mono text-[7px] text-muted">STATE</p>
          <p className="mt-1 font-mono text-[9px] font-semibold text-primary">{phase.toUpperCase()}</p>
        </div>
        <div className="rounded-lg border border-border/55 bg-background/65 px-2 py-2 text-center backdrop-blur-lg">
          <p className="font-mono text-[7px] text-muted">QUORUM</p>
          <p className="mt-1 font-mono text-[9px] font-semibold text-steel">{honest}/{total}</p>
        </div>
        <div className="rounded-lg border border-border/55 bg-background/65 px-2 py-2 text-center backdrop-blur-lg">
          <p className="font-mono text-[7px] text-muted">CERT</p>
          <p className={cn("mt-1 font-mono text-[9px] font-semibold", certAccepted === null ? "text-muted" : certAccepted ? "text-primary" : "text-destructive")}>
            {certAccepted === null ? "—" : certAccepted ? `${fidelity.toFixed(2)}` : "FAIL"}
          </p>
        </div>
      </div>
    </div>
  );
}
