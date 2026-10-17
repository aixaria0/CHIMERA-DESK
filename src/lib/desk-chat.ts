import { formatPct, formatUsd, hash01 } from "./utils";

export type DeskSnap = {
  nav: number;
  risk: number;
  ionq: number;
  ionqChange: number;
  phase: string;
  honest: number;
  nodes: number;
  lastF: number | null;
  lastOk: boolean | null;
  nQubits: number;
  gates: number;
  lang: "en" | "fa";
};

export type Turn = { role: "user" | "assistant"; text: string };

type Topic =
  | "hi"
  | "who"
  | "feel"
  | "joke"
  | "next"
  | "nav"
  | "tape"
  | "var"
  | "qaoa"
  | "mc"
  | "lab"
  | "teleport"
  | "types"
  | "cert"
  | "network"
  | "qec"
  | "logic"
  | "thanks"
  | "open";

const KEYS: { topic: Topic; keys: string[] }[] = [
  { topic: "hi", keys: ["hi", "hey", "hello", "yo", "sup", "سلام", "درود"] },
  { topic: "who", keys: ["who are you", "what are you", "what is this", "your name", "این چیه", "کی هستی"] },
  { topic: "feel", keys: ["how are you", "how's it", "bored", "tired", "love you", "hate", "حالت"] },
  { topic: "joke", keys: ["joke", "funny", "laugh", "جوک"] },
  { topic: "next", keys: ["what should", "what do i", "next", "where do i", "چیکار"] },
  { topic: "nav", keys: ["nav", "book", "value", "ارزش", "دفتر"] },
  { topic: "tape", keys: ["chart", "tape", "price", "ionq", "نمودار", "قیمت"] },
  { topic: "var", keys: ["var", "risk", "loss", "ریسک"] },
  { topic: "qaoa", keys: ["qaoa", "weight", "allocation", "وزن"] },
  { topic: "mc", keys: ["monte", "carlo", "option", "call", "fan"] },
  { topic: "teleport", keys: ["teleport", "weyl", "دوربری", "qudit"] },
  { topic: "types", keys: ["type", "hoare", "frame", "ownership", "هوار"] },
  { topic: "cert", keys: ["hybrid", "cert", "fidelity", "shadow", "گواهی"] },
  { topic: "network", keys: ["network", "quorum", "bft", "node", "lattice", "شبکه", "honest"] },
  { topic: "qec", keys: ["surface", "qec", "magic", "distill", "mps"] },
  { topic: "logic", keys: ["godel", "g2", "humble", "löb", "lob", "گودل"] },
  { topic: "lab", keys: ["ghz", "lab", "circuit", "grover", "gate", "qasm", "آزمایش"] },
  { topic: "thanks", keys: ["thanks", "thank", "مرسی", "ممنون"] },
];

function faish(s: string) {
  return /[\u0600-\u06FF]/.test(s);
}

function seedOf(prompt: string, n: number) {
  let h = n * 17;
  for (let i = 0; i < prompt.length; i += 1) h = (h + prompt.charCodeAt(i) * (i + 3)) % 9973;
  return h;
}

function pick<T>(xs: T[], seed: number) {
  return xs[Math.floor(hash01(seed) * xs.length) % xs.length];
}

function matchTopic(q: string): Topic | null {
  const t = q.toLowerCase();
  let best: { topic: Topic; n: number } | null = null;
  for (const row of KEYS) {
    const n = row.keys.filter((k) => t.includes(k)).length;
    if (n && (!best || n > best.n)) best = { topic: row.topic, n };
  }
  return best?.topic ?? null;
}

function lastTopic(history: Turn[]): Topic | null {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i].role !== "user") continue;
    const t = matchTopic(history[i].text);
    if (t && t !== "hi" && t !== "thanks") return t;
  }
  return null;
}

function follow(q: string) {
  const t = q.trim().toLowerCase();
  if (t.length > 48) return false;
  return /^(why|how|and|more|continue|ok|okay|yes|yeah|go on|explain|what about|really|wait|خب|چرا|بیشتر|بعد|آره|خوبه)\b/.test(
    t,
  );
}

function facts(s: DeskSnap) {
  return {
    nav: formatUsd(s.nav),
    risk: `${s.risk.toFixed(2)}%`,
    ionq: formatUsd(s.ionq),
    ch: formatPct(s.ionqChange, 1),
    phase: s.phase,
    honest: `${s.honest}/${s.nodes}`,
    lab: `${s.nQubits}q / ${s.gates} gates`,
    cert:
      s.lastF == null
        ? "no certificate yet"
        : `F=${s.lastF.toFixed(3)} ${s.lastOk ? "ACCEPT" : "REJECT"}`,
  };
}

function bank(s: DeskSnap, fa: boolean): Record<Topic, string[]> {
  const f = facts(s);
  if (fa) {
    return {
      hi: [
        `سلام. دفتر ${f.nav} است، آزمایشگاه ${f.lab}، شبکه ${f.phase}. بگو کجا را نگاه می‌کنی.`,
        `هی. همین‌جا کنار میزم. کتاب ${f.nav} می‌زند. از دفتر شروع کنیم یا از GHZ؟`,
      ],
      who: [
        `من همکار همین میزم، نه منوی راهنما. مدار، دفتر، هفت گره — هرچه روی شیشه است را با هم حرف می‌زنیم.`,
      ],
      feel: [
        `خوبم. دفتر دارد نفس می‌کشد و شبکه ${f.phase} است. تو چطور؟ اگر حوصله‌ات سر رفته برو آزمایشگاه و یک گیت بینداز.`,
      ],
      joke: [
        `گره ۲ می‌گوید صادق است. بقیه می‌گویند حدنصاب ۵ از ۷ است. پایان جوک بیزانسی.`,
        `کیوبیت می‌رود پیش روانشناس. می‌گوید هم ۰ هستم هم ۱. روانشناس می‌گوید اندازه‌گیری‌ات تمام است.`,
      ],
      next: [
        s.lastF == null
          ? `خانه را باز کن و «اجرای آزمایش گواهی‌شده» را بزن. دو ثانیه بعد ACCEPT یا REJECT می‌بینی.`
          : `گواهی قبلی ${f.cert} بود. برو آزمایشگاه، گیت عوض کن، دوباره گواهی بگیر.`,
      ],
      nav: [
        `دفتر الان ${f.nav} است. جمعِ قیمت × وزن QAOA. زنده است چون نوار راه می‌رود، نه چون صندوقی معامله شد.`,
      ],
      tape: [`IONQ روی نوار ${f.ionq} است (${f.ch}). چاپ‌های شبیه‌سازی‌شده تا خط هنگام حرف زدن نخوابد.`],
      var: [`VaR ۹۵ الان ${f.risk} است — دم ۵٪ یک مدل گاوسی روی همین دفتر. آموزشی است، نه VaR بانک.`],
      qaoa: [`وزن‌ها softmaxاند. سهمی که تمیزتر از نوسان خودش حرکت کند تکه بزرگ‌تری از دفتر می‌گیرد.`],
      mc: [`شانزده مسیر براونی. خط میانه است، نوار محدوده. اختیار MC میانگین بازده ATM روی همان مسیرهاست.`],
      lab: [`آزمایشگاه ${f.lab} است. GHZ یعنی H و دو CNOT، پس |000⟩ و |111⟩ نصف‌نصف. روی سلول کلیک کن.`],
      teleport: [
        `آلیس اندازه می‌گیرد، دو عدد می‌فرستد، باب X و Z وایل را می‌زند. حالت می‌رسد؛ اطلاعات کوانتومی از سیم کلاسیک رد نمی‌شود.`,
      ],
      types: [`هر کیودیت یک مالک. کپی ممنوع. درهم‌تنیدگی از مرز مالکیت بیرون نمی‌رود. هوار همان قرارداد است.`],
      cert: [`گواهی ترکیبی وفاداری را به امضای ۵ از ۷ می‌بندد. وضعیت: ${f.cert}.`],
      network: [`هفت گره، یکی قرمز و دروغ‌گو. حدنصاب ۵. فاز ${f.phase}، صادق ${f.honest}. بسته یعنی دسترس، نه نفوذ.`],
      qec: [`پژوهش یعنی کیوبیت نویزی چطور منطقی می‌شود: پچ سطح، تقطیر ۱۵به‌۱، لغزنده MPS.`],
      logic: [`گودل: سیستم سازگار نمی‌تواند سازگاری خودش را ثابت کند. کلید صفحه منطق همان ادعا را روشن می‌کند.`],
      thanks: [`خواهش. هر وقت خواستی برمی‌گردیم سر دفتر یا آزمایشگاه.`],
      open: [],
    };
  }
  return {
    hi: [
      `Hey. Book's at ${f.nav}, lab is ${f.lab}, network is ${f.phase}. What are you looking at?`,
      `I'm here. The tape is twitching and GHZ is sitting pretty. Want the book or the lab first?`,
    ],
    who: [
      `I'm the person on this desk, not a help menu. Same screens as you — circuit, book, seven nodes. Point at something and I'll talk.`,
    ],
    feel: [
      `I'm good. The book's breathing and the network is ${f.phase}. You bored? Drop a gate in the lab or we can pick apart VaR.`,
    ],
    joke: [
      `Node 2 swears it's honest. The other six say 5-of-7. That's the Byzantine joke. I'll be here all night.`,
      `A qubit walks into a bar. Bartender says we don't serve superpositions. It collapses.`,
    ],
    next: [
      s.lastF == null
        ? `Home, then Run a certified experiment. Two seconds later you get ACCEPT or REJECT. That's the demo beat.`
        : `Last round was ${f.cert}. Change a gate in the lab and certify again — watch F move.`,
    ],
    nav: [
      `Book is ${f.nav} right now. Price times QAOA weight, summed. It moves because the tape is a live walk, not because a fund traded.`,
      `${f.nav}. That's the whole book in one number. If IONQ rips, this ticks up. None of it is a real portfolio.`,
    ],
    tape: [
      `IONQ is ${f.ionq} on the tape (${f.ch}). Simulated prints so the line stays alive while we talk. Not a broker.`,
    ],
    var: [
      `VaR 95 is ${f.risk}. Gaussian 5% tail on this book's returns. Toy risk, not a bank number.`,
    ],
    qaoa: [
      `Weights are a softmax mixer. Clean momentum versus own-vol gets a bigger slice. That's why the bars drift.`,
    ],
    mc: [
      `Sixteen Brownian paths. Median line, band around it. MC call is the average ATM payoff — a toy price.`,
    ],
    lab: [
      `Lab is ${f.lab}. GHZ is H then two CNOTs, so |000⟩ and |111⟩ split the mass. Click a cell, drop a gate, watch the bars.`,
    ],
    teleport: [
      `Alice measures, sends two classical numbers, Bob hits Weyl X and Z. The state shows up on his side. Fidelity is 1 here because the sim is exact.`,
    ],
    types: [
      `One owner per qudit. No cloning. Entanglement can't leak into a register you don't own. Hoare is just that contract: {P} program {Q}.`,
    ],
    cert: [
      `A HybridCert is fidelity plus 5-of-7 signatures on the same digest. Right now: ${f.cert}.`,
    ],
    network: [
      `Seven nodes, one red liar on purpose. Need five honest votes. Phase ${f.phase}, honest ${f.honest}. Packets are reachability, not hacking.`,
    ],
    qec: [
      `Research is noisy qubits becoming one logical — surface patch, 15-to-1 distillation, MPS slider. Analog, not a device report.`,
    ],
    logic: [
      `Gödel: a consistent system can't prove itself consistent. The switch on Logic lets a node make that claim so you can watch it break.`,
    ],
    thanks: [`Anytime. Book or lab, your call.`],
    open: [],
  };
}

function deepen(topic: Topic, s: DeskSnap, fa: boolean, seed: number) {
  const f = facts(s);
  const en: Partial<Record<Topic, string[]>> = {
    nav: [
      `It's a live sum, not a parked cell. Tape wanders, weights chase clean momentum, ${f.nav} twitches. That's the pulse for a presentation, not a fund.`,
      `Think of it as a heartbeat. If the line froze, you'd think the demo died. The math is just Σ price × weight.`,
    ],
    tape: [`If it sat still it would look like a slide. Tiny drift on purpose.`],
    var: [`Mean minus 1.65 sigma of this book's returns. Names jump together, VaR climbs.`],
    lab: [`H opens every path. CNOTs lock them. Two survivors: all zeros, all ones. Fifty-fifty.`],
    teleport: [
      `The quantum state never rides the classical wire. Only the correction does. That's the whole trick.`,
    ],
    cert: [`Fidelity alone is cheap to fake. Five signatures on one digest is the point of ACCEPT.`],
    network: [`Trust all seven and one liar sinks you. The red node is there so the 5-of-7 rule is visible.`],
    feel: [`Then go break GHZ. One X on qubit 0 and the pretty bars die. That's more fun than Home.`],
  };
  const faBank: Partial<Record<Topic, string[]>> = {
    nav: [`جمع زنده است نه عدد پارک‌شده. نوار می‌رود، وزن‌ها دنبال مومنتوم، ${f.nav} می‌لرزد.`],
    lab: [`H همه مسیر را باز می‌کند، CNOT قفل می‌کند. فقط همه صفر یا همه یک می‌ماند.`],
  };
  const xs = (fa ? faBank[topic] : en[topic]) ?? [];
  return xs.length ? pick(xs, seed) : null;
}

function openReply(prompt: string, s: DeskSnap, fa: boolean, seed: number) {
  const f = facts(s);
  const clip = prompt.trim().replace(/\s+/g, " ").slice(0, 80);
  if (fa) {
    return pick(
      [
        `شنیدم: «${clip}». روی این میز الان دفتر ${f.nav} است و شبکه ${f.phase}. بگو به کدام صفحه خیره شده‌ای تا همان را باز کنم.`,
        `با توام. اگر سؤال فنی است بگو؛ اگر نه، برو آزمایشگاه و یک گیت بینداز. GHZ منتظر است.`,
        `اوکی. من اینجام. دفتر، دوربری، هفت گره، گودل — هر کدام را می‌خواهی با زبان آدمیزاد می‌گویم.`,
      ],
      seed,
    );
  }
  return pick(
    [
      `I heard you. "${clip}" — on this desk the book is ${f.nav} and the network is ${f.phase}. Point at a screen and I'll talk like a person, not a manual.`,
      `Okay. I'm not a search box. Ask messy. If you want something to happen, run the experiment on Home or wreck GHZ with an X.`,
      `Yeah. We can do the book, teleport, the liar node, Gödel, or just sit with the tape. What are you actually curious about?`,
      `Got it. Short version: this whole place is a simulator with a pulse. Tell me what looked fake or confusing and I'll unpack that, not a FAQ.`,
    ],
    seed,
  );
}

export function talk(prompt: string, history: Turn[], snap: DeskSnap): string {
  const fa = snap.lang === "fa" || faish(prompt);
  const q = prompt.trim();
  const seed = seedOf(q, history.length + Math.round(snap.nav));
  const rows = bank(snap, fa);

  if (!q) return pick(rows.hi, seed);

  let topic = matchTopic(q);
  const trailing = follow(q);
  if ((!topic || topic === "hi") && trailing) topic = lastTopic(history) ?? "open";
  if (!topic) topic = "open";

  if (trailing) {
    const extra = deepen(topic, snap, fa, seed + 3);
    if (extra) return extra;
  }

  if (topic === "open") return openReply(q, snap, fa, seed);

  const variants = rows[topic];
  let line = variants.length ? pick(variants, seed) : openReply(q, snap, fa, seed);

  const prev = [...history].reverse().find((t) => t.role === "assistant")?.text;
  if (prev && prev === line && variants.length > 1) {
    line = pick(variants, seed + 9);
  }
  return line;
}

export function localDeskReply(prompt: string, snap?: DeskSnap, history: Turn[] = []) {
  return talk(
    prompt,
    history,
    snap ?? {
      nav: 0,
      risk: 0,
      ionq: 0,
      ionqChange: 0,
      phase: "idle",
      honest: 7,
      nodes: 7,
      lastF: null,
      lastOk: null,
      nQubits: 3,
      gates: 3,
      lang: "en",
    },
  );
}
