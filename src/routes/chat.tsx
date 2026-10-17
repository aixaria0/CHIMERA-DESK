import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { talk, type DeskSnap } from "@/lib/desk-chat";
import { copy } from "@/lib/i18n";
import { portfolioNav, var95 } from "@/lib/sim";
import { useChimera } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({ component: Chat });

const STARTERS = {
  en: ["What's the book doing?", "Walk me through teleport.", "I'm bored.", "Tell me a joke."],
  fa: ["دفتر الان چطوره؟", "دوربری را برایم بگو.", "حوصله‌ام سر رفته.", "یک جوک بگو."],
};

function nid() {
  try {
    return crypto.randomUUID();
  } catch {
    return `m${Date.now()}${Math.random().toString(16).slice(2)}`;
  }
}

function snapNow(): DeskSnap {
  const s = useChimera.getState();
  const ionq = s.assets[0];
  return {
    nav: portfolioNav(s.assets),
    risk: var95(s.assets),
    ionq: ionq?.price ?? 0,
    ionqChange: ionq?.change ?? 0,
    phase: s.phase,
    honest: s.nodes.filter((n) => n.honest).length,
    nodes: s.nodes.length,
    lastF: s.lastCert?.fidelity ?? null,
    lastOk: s.lastCert?.accepted ?? null,
    nQubits: s.nQubits,
    gates: s.gates.length,
    lang: s.lang,
  };
}

function Chat() {
  const lang = useChimera((s) => s.lang);
  const chat = useChimera((s) => s.chat);
  const addChat = useChimera((s) => s.addChat);
  const clearChat = useChimera((s) => s.clearChat);
  const [input, setInput] = useState("");
  const [hello, setHello] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const t = copy[lang];

  useEffect(() => {
    setHello(talk(lang === "fa" ? "سلام" : "hey", [], snapNow()));
  }, [lang]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat, hello, draft]);

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  function stream(full: string) {
    if (timer.current) window.clearInterval(timer.current);
    setDraft("");
    let i = 0;
    timer.current = window.setInterval(() => {
      i += 3;
      setDraft(full.slice(0, i));
      if (i >= full.length) {
        if (timer.current) window.clearInterval(timer.current);
        timer.current = null;
        setDraft(null);
        addChat({ id: nid(), role: "assistant", text: full });
        setPending(false);
      }
    }, 16);
  }

  async function send(text: string) {
    const prompt = text.trim();
    if (!prompt || pending) return;
    setPending(true);
    setInput("");
    addChat({ id: nid(), role: "user", text: prompt });
    const snap = snapNow();
    const history = [...useChimera.getState().chat];
    const reply = talk(prompt, history, snap);
    stream(reply);
  }

  const empty = chat.length === 0 && !pending && !draft;

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-muted">
            {lang === "fa" ? "همکار میز" : "On the desk"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{t.ask}</h1>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (timer.current) window.clearInterval(timer.current);
            setDraft(null);
            setPending(false);
            clearChat();
            setHello(talk(lang === "fa" ? "سلام" : "hey", [], snapNow()));
          }}
        >
          <Eraser className="size-3.5" />
          {lang === "fa" ? "از نو" : "New"}
        </Button>
      </div>

      <section className="flex min-h-[28rem] flex-1 flex-col rounded-lg bg-card p-3 shadow-[var(--shadow-border)]">
        <div className="scan-hide min-h-64 flex-1 space-y-3 overflow-y-auto px-1 py-1">
          {empty && hello ? <Bubble role="assistant" text={hello} /> : null}
          {chat.map((m) => (
            <Bubble key={m.id} role={m.role} text={m.text} />
          ))}
          {draft != null ? <Bubble role="assistant" text={draft || " "} live /> : null}
          {empty ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {STARTERS[lang].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="min-h-10 rounded-full bg-card-2 px-3 text-xs text-steel shadow-[var(--shadow-border)] hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}
          <div ref={bottom} />
        </div>
        <form
          className="mt-3 flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <Textarea
            rows={2}
            value={input}
            placeholder={lang === "fa" ? "هرچه می‌خواهی بگو…" : "Say anything…"}
            className="min-h-12"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={pending || !input.trim()} aria-label="Send">
            <ArrowUp className="size-4" />
          </Button>
        </form>
      </section>
    </div>
  );
}

function Bubble({
  role,
  text,
  live,
}: {
  role: "user" | "assistant";
  text: string;
  live?: boolean;
}) {
  const mine = role === "user";
  return (
    <article
      className={cn("flex max-w-[92%] flex-col gap-1", mine ? "ms-auto items-end" : "items-start")}
    >
      {!mine ? (
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">CHIMERA</p>
      ) : null}
      <p
        className={cn(
          "rounded-md px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
          mine ? "bg-primary text-primary-foreground" : "bg-card-2 text-foreground",
          live ? "after:ms-0.5 after:inline-block after:h-3 after:w-px after:animate-pulse after:bg-primary after:align-[-1px] after:content-['']" : "",
        )}
      >
        {text}
      </p>
    </article>
  );
}
