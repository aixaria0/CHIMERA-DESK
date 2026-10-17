import { createFileRoute, Link } from "@tanstack/react-router";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
import { formatPct, formatUsd } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Command });

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
  const pushCert = useChimera((s) => s.pushCert);
  const pushLog = useChimera((s) => s.pushLog);
  const setPhase = useChimera((s) => s.setPhase);
  const t = copy[lang];

  const ibq = backends[0];
  const nav = portfolioNav(assets);
  const risk = var95(assets);
  const honest = nodes.filter((n) => n.honest).length;
  const tape = assets[0]?.history.map((p, i) => ({ i, p })) ?? [];

  function launch() {
    setPhase("propose", 0);
    window.setTimeout(() => setPhase("vote"), 700);
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
    }, 1400);
    window.setTimeout(() => setPhase("idle"), 2400);
  }

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-muted">
            {t.brand} briefing
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t.whatTitle}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-steel">{t.whatBody}</p>
        </div>
        <Button onClick={launch}>{t.launch}</Button>
      </div>

      <Panel kicker={t.howTitle} title={lang === "fa" ? "شش میز" : "Six desks — tap any"}>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          {DESKS.map((s) => {
            const d = s[lang];
            return (
              <Link
                key={s.to}
                to={s.to}
                className="rounded-md bg-card-2 px-3 py-3 hover:text-foreground"
              >
                <p className="font-mono text-[0.625rem] text-muted">{s.n}</p>
                <p className="text-sm font-medium">{d.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{d.pitch}</p>
              </Link>
            );
          })}
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric
          label={lang === "fa" ? "خطای دوکیوبیتی" : "Two-qubit error"}
          value={ibq.cxError.toFixed(4)}
          hint={lang === "fa" ? "احتمال غلط بودن CNOT · شبیه‌سازی" : "Chance a CNOT is wrong · simulated"}
          tone={ibq.cxError < 0.002 ? "ok" : "warn"}
        />
        <Metric
          label={lang === "fa" ? "خطای خوانش" : "Readout error"}
          hint={lang === "fa" ? "اندازه‌گیری از حالت پرنویزتر است" : "Measuring is noisier than a gate"}
          value={ibq.readout.toFixed(3)}
        />
        <Metric
          label={lang === "fa" ? "ارزش دفتر" : "Book value"}
          value={formatUsd(nav)}
          hint={
            lang === "fa"
              ? `VaR۹۵ ${risk.toFixed(2)}٪ · مجموع قیمت×وزن`
              : `VaR 95 ${risk.toFixed(2)}% · sum of price × weight`
          }
          tone={risk > 3 ? "warn" : "default"}
        />
        <Metric
          label={lang === "fa" ? "گره‌های صادق" : "Honest nodes"}
          value={`${honest}/${nodes.length}`}
          hint={lang === "fa" ? "برای گواهی به ۵ از ۷ نیاز است" : "5 of 7 must sign a certificate"}
          tone={honest >= 5 ? "ok" : "danger"}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <Panel
          className="lg:col-span-4"
          kicker={lang === "fa" ? "آنالوگ تراشه" : "Chip analog"}
          title={lang === "fa" ? "نقشه حرارت (QPU واقعی نیست)" : "Heat map (not a real QPU)"}
          action={<Badge tone="warn">{lang === "fa" ? "شبیه‌سازی" : "simulated"}</Badge>}
        >
          <QpuGrid />
          <p className="mt-3 text-xs text-muted">
            {lang === "fa"
              ? "۶۴ خانه اشغال. رنگ یعنی گرمای شبیه‌سازی‌شده. دستگاهی وصل نیست."
              : "64 occupancy cells. Color is simulated heat. No device is attached."}
          </p>
        </Panel>

        <Panel
          className="lg:col-span-5"
          kicker={lang === "fa" ? "نوار بازار" : "Live tape"}
          title={`${assets[0]?.symbol ?? "IONQ"} · ${lang === "fa" ? "قیمت شبیه‌سازی" : "simulated price"}`}
        >
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tape}>
                <defs>
                  <linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    background: "#101216",
                    border: "1px solid #1c222b",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="p"
                  stroke="var(--color-primary)"
                  fill="url(#navFill)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted">
            {lang === "fa"
              ? "هر تیک یک چاپ تصادفی با کمی رانش است تا نمودار هنگام ارائه زنده بماند."
              : "Each tick is a random print with slight drift so the line stays alive while you present."}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {assets.slice(0, 6).map((a) => (
              <span key={a.symbol} className="font-mono text-xs tabular text-muted">
                {a.symbol}{" "}
                <span className={a.change >= 0 ? "text-primary" : "text-destructive"}>
                  {formatPct(a.change, 1)}
                </span>
              </span>
            ))}
          </div>
        </Panel>

        <Panel
          className="lg:col-span-3"
          kicker={lang === "fa" ? "بک‌اندها" : "Named analogs"}
          title={lang === "fa" ? "صف" : "Queue"}
        >
          <ul className="space-y-2">
            {backends.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{b.name}</p>
                  <p className="font-mono text-[0.625rem] uppercase tracking-wider text-muted">
                    {b.kind} · {b.qubits}q
                  </p>
                </div>
                <Badge
                  tone={
                    b.status === "active" ? "ok" : b.status === "calibrating" ? "warn" : "mute"
                  }
                >
                  {b.queue}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">
            {lang === "fa"
              ? "نام‌ها از بودجه‌های خطای عمومی‌اند. شغلی به ابر فرستاده نمی‌شود."
              : "Names echo public error budgets. No job is sent to a cloud QPU."}
          </p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel
          kicker={lang === "fa" ? "گواهی‌ها" : "Certificates"}
          title={lang === "fa" ? "آزمایش‌های گواهی‌شده" : "Certified experiments"}
          action={
            <Link to="/lattice" className="text-xs text-muted hover:text-foreground">
              {lang === "fa" ? "شبکه" : "Open network"}
            </Link>
          }
        >
          {certs.length === 0 ? (
            <p className="text-sm text-muted">
              {lang === "fa"
                ? `هنوز هیچ. «${t.launch}» را بزنید — حالت آزمایشگاه با ۵ از ۷ گره امضا می‌شود.`
                : `None yet. Press “${t.launch}” — the lab state is signed by 5 of 7 nodes.`}
            </p>
          ) : (
            <ul className="space-y-2">
              {certs.slice(0, 6).map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-md bg-card-2 px-3 py-2 text-sm"
                >
                  <span className="font-mono text-xs text-muted">
                    v{c.view}/s{c.seq} · {c.program}
                  </span>
                  <span className="font-mono tabular">F {c.fidelity.toFixed(3)}</span>
                  <Badge tone={c.accepted ? "ok" : "danger"}>
                    {c.accepted ? "ACCEPT" : "REJECT"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel kicker={lang === "fa" ? "پایش" : "Monitor"} title={lang === "fa" ? "رویدادها" : "Event log"}>
          <ul className="scan-hide max-h-56 space-y-1.5 overflow-y-auto font-mono text-xs">
            {logs.slice(0, 12).map((l) => (
              <li key={l.id} className="flex gap-2 text-muted">
                <span className="text-steel">
                  {l.ts === 0 ? "boot" : new Date(l.ts).toISOString().slice(11, 19)}
                </span>
                <span
                  className={
                    l.level === "ok"
                      ? "text-primary"
                      : l.level === "warn"
                        ? "text-warn"
                        : l.level === "danger"
                          ? "text-destructive"
                          : ""
                  }
                >
                  {l.source}
                </span>
                <span className="text-foreground">{l.message}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        kicker={lang === "fa" ? "واژه‌نامه ارائه" : "Presentation glossary"}
        title={lang === "fa" ? "هر رقم یعنی چه" : "What every number means"}
      >
        <Glossary lang={lang} />
      </Panel>
    </div>
  );
}
