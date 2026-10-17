import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Explain } from "@/components/explain";
import { Metric, Panel } from "@/components/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { monteCarloPaths, portfolioNav, var95 } from "@/lib/sim";
import { useChimera } from "@/lib/store";
import { formatPct, formatUsd } from "@/lib/utils";

export const Route = createFileRoute("/finance")({ component: Finance });

function Finance() {
  const assets = useChimera((s) => s.assets);
  const tick = useChimera((s) => s.tick);
  const [spot, setSpot] = useState(100);
  const [vol, setVol] = useState(0.28);
  const nav = portfolioNav(assets);
  const risk = var95(assets);
  const paths = useMemo(() => monteCarloPaths(spot, vol, 36, 16, tick), [spot, vol, tick]);
  const fan = paths[0]?.map((_, i) => {
    const col = paths.map((p) => p[i]);
    const sorted = [...col].sort((a, b) => a - b);
    return {
      i,
      mid: sorted[Math.floor(sorted.length / 2)],
      lo: sorted[1],
      hi: sorted[sorted.length - 2],
    };
  });

  const call = useMemo(() => {
    const K = spot;
    const payoffs = paths.map((p) => Math.max(p[p.length - 1] - K, 0));
    return payoffs.reduce((s, x) => s + x, 0) / payoffs.length;
  }, [paths, spot]);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
      <div>
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-muted">
          Portfolio desk
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Markets and risk</h1>
        <p className="mt-1 max-w-2xl text-sm text-steel">
          Simulated quantum-tech names, a QAOA-style weight mixer, and a Monte Carlo fan. Not a
          broker. Not investment advice.
        </p>

      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric
          label="Book value (NAV)"
          value={formatUsd(nav)}
          hint="sum of price × QAOA weight · demo book"
        />
        <Metric
          label="VaR 95"
          value={`${risk.toFixed(2)}%`}
          hint="1-day loss exceeded only 5% of days"
          tone={risk > 3 ? "warn" : "ok"}
        />
        <Metric label="Names" value={String(assets.length)} hint="tickers in the simulated book" />
        <Metric
          label="MC call"
          value={formatUsd(call)}
          hint={`toy ATM option · spot ${spot} vol ${vol}`}
        />
      </div>


      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <Panel className="lg:col-span-7" kicker="Book" title="QAOA allocation — % of the book">

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assets.map((a) => ({ s: a.symbol, w: a.weight * 100 }))}>
                <XAxis dataKey="s" tick={{ fill: "#8b939c", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "#101216",
                    border: "1px solid #1c222b",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="w" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
            {assets.map((a) => (
              <li key={a.symbol} className="rounded-md bg-card-2 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{a.symbol}</span>
                  <Badge tone={a.change >= 0 ? "ok" : "danger"}>{formatPct(a.change, 1)}</Badge>
                </div>
                <p className="mt-1 font-mono text-xs tabular text-muted">
                  {formatUsd(a.price)} · {(a.weight * 100).toFixed(1)}%
                </p>
              </li>
            ))}
          </ul>
          <Explain id="qaoa" lang="en" />
        </Panel>


        <Panel
          className="lg:col-span-5"
          kicker="Pricing"
          title="Monte Carlo fan — 16 price paths"
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSpot((s) => (s === 100 ? 101 : 100))}
            >
              Resample
            </Button>
          }
        >
          <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted">
            <label className="flex items-center gap-2">
              spot
              <input
                type="range"
                min={40}
                max={200}
                value={spot}
                onChange={(e) => setSpot(Number(e.target.value))}
              />
              <span className="font-mono text-foreground">{spot}</span>
            </label>
            <label className="flex items-center gap-2">
              vol
              <input
                type="range"
                min={0.1}
                max={0.8}
                step={0.02}
                value={vol}
                onChange={(e) => setVol(Number(e.target.value))}
              />
              <span className="font-mono text-foreground">{vol.toFixed(2)}</span>
            </label>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fan}>
                <XAxis dataKey="i" hide />
                <YAxis hide domain={["auto", "auto"]} />
                <Area dataKey="hi" stroke="none" fill="var(--color-primary)" fillOpacity={0.08} />
                <Area dataKey="lo" stroke="none" fill="var(--color-background)" fillOpacity={1} />
                <Line dataKey="mid" stroke="var(--color-primary)" dot={false} strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <Explain id="mc" lang="en" />
        </Panel>

      </div>

      <Panel kicker="Tape" title="Price paths — NVDA vs IONQ (simulated prints)">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={assets[3]?.history.map((p, i) => ({ i, NVDA: p, IONQ: assets[0].history[i] }))}
            >
              <XAxis dataKey="i" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "#101216",
                  border: "1px solid #1c222b",
                  fontSize: 12,
                }}
              />
              <Line dataKey="NVDA" stroke="var(--color-steel)" dot={false} strokeWidth={1.25} />
              <Line dataKey="IONQ" stroke="var(--color-primary)" dot={false} strokeWidth={1.25} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
