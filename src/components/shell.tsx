import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Atom,
  BookOpen,
  FlaskConical,
  Hexagon,
  LineChart,
  MessageSquare,
  Network,
} from "lucide-react";

import { useEffect, useState } from "react";
import { copy } from "@/lib/i18n";
import { useChimera } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { to: "/", key: "command" as const, icon: Activity },
  { to: "/quantum", key: "quantum" as const, icon: Atom },
  { to: "/finance", key: "finance" as const, icon: LineChart },
  { to: "/research", key: "research" as const, icon: FlaskConical },
  { to: "/lattice", key: "lattice" as const, icon: Network },
  { to: "/proofs", key: "proofs" as const, icon: BookOpen },
  { to: "/chat", key: "chat" as const, icon: MessageSquare },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang = useChimera((s) => s.lang);
  const setLang = useChimera((s) => s.setLang);
  const pulse = useChimera((s) => s.pulse);
  const phase = useChimera((s) => s.phase);
  const t = copy[lang];

  useEffect(() => {
    const id = window.setInterval(() => pulse(), 900);
    return () => window.clearInterval(id);
  }, [pulse]);

  return (
    <div
      className="flex min-h-dvh flex-col bg-background text-foreground md:flex-row"
      dir={lang === "fa" ? "rtl" : "ltr"}
    >
      <aside className="hidden w-56 shrink-0 flex-col border-border bg-card/80 md:flex md:border-e">
        <div className="flex items-center gap-2.5 px-4 py-5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Hexagon className="size-4" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight">{t.brand}</p>
            <p className="text-[0.625rem] uppercase tracking-[0.16em] text-muted">{t.tag}</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-10 items-center gap-2.5 rounded-sm px-3 text-sm transition-colors duration-150",
                  active
                    ? "bg-card-2 text-foreground shadow-[var(--shadow-border)]"
                    : "text-muted hover:bg-card-2/70 hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                {t[item.key]}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4">
          <Badge tone={phase === "idle" ? "ok" : "warn"}>
            {phase === "idle" ? t.live : phase}
          </Badge>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border px-4">
          <div className="flex items-center gap-2 md:hidden">
            <Hexagon className="size-4 text-primary" />
            <span className="text-sm font-semibold">{t.brand}</span>
          </div>
          <p className="hidden text-xs text-muted md:block">{t.header}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "fa" : "en")}
              aria-label={lang === "en" ? "Switch to Persian" : "Switch to English"}
              title={lang === "en" ? "Switch to Persian" : "Switch to English"}
              className="h-10 min-w-16 rounded-sm px-3 text-xs text-muted shadow-[var(--shadow-border)] hover:text-foreground"
            >
              {t.langOther}
            </button>
            <ClockBadge />
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-3 pb-24 md:p-5 md:pb-5">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-7 border-t border-border bg-background/95 md:hidden">
        {NAV.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-0.5 text-[0.625rem]",
                active ? "text-primary" : "text-muted",
              )}
            >
              <Icon className="size-4" />
              {t[item.key]}
            </Link>
          );
        })}
      </nav>
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
    <span className="hidden h-10 items-center rounded-sm px-3 font-mono text-xs tabular text-steel shadow-[var(--shadow-border)] sm:inline-flex">
      {ready ? `${now} UTC` : "clock"}
    </span>
  );
}
