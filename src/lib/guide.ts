export type DeskId = "lab" | "markets" | "research" | "network" | "logic" | "chat" | "home";

export type Term = {
  id: string;
  desk: DeskId;
  en: { term: string; means: string };
  fa: { term: string; means: string };
};

export const TERMS: Term[] = [
  {
    id: "nav",
    desk: "markets",
    en: {
      term: "Book value (NAV)",
      means:
        "Net asset value of the simulated book: each ticker’s last price × its QAOA weight, summed. It ticks every 0.9s. This is a demo book, not a real fund and not advice.",
    },
    fa: {
      term: "ارزش دفتر (NAV)",
      means:
        "ارزش خالص دارایی شبیه‌سازی‌شده: قیمت هر سهم × وزن QAOA، سپس جمع. هر ۰٫۹ ثانیه به‌روز می‌شود. صندوق واقعی نیست و توصیه سرمایه‌گذاری نیست.",
    },
  },
  {
    id: "tape",
    desk: "markets",
    en: {
      term: "Market chart / tape",
      means:
        "The last ~48 simulated prints for a name (IONQ on Home, NVDA vs IONQ on Markets). A random-walk tick with a slight drift — so the line moves while you present. Hover a point for the print.",
    },
    fa: {
      term: "نمودار بازار",
      means:
        "حدود ۴۸ قیمت شبیه‌سازی‌شده. یک گام تصادفی با کمی رانش است تا هنگام ارائه حرکت کند. روی نقطه بروید تا رقم را ببینید.",
    },
  },
  {
    id: "var",
    desk: "markets",
    en: {
      term: "VaR 95",
      means:
        "Value at Risk at 95%: a one-day loss that, under a Gaussian model of the book’s returns, is only exceeded 5% of the time. Higher = a more violent book. Still a toy.",
    },
    fa: {
      term: "VaR ۹۵",
      means:
        "ارزش در معرض ریسک در سطح ۹۵٪: زیان یک‌روزه که در مدل گاوسی فقط ۵٪ اوقات بدتر می‌شود. رقم بالاتر یعنی دفتر پرتلاطم‌تر. هنوز یک مدل آموزشی است.",
    },
  },
  {
    id: "qaoa",
    desk: "markets",
    en: {
      term: "QAOA weights",
      means:
        "A softmax mixer that tilts the book toward names with better short-horizon momentum versus volatility — the same idea as a quantum approximate optimizer, run classically here. Bars are percent of the book.",
    },
    fa: {
      term: "وزن‌های QAOA",
      means:
        "یک مخلوط‌کننده softmax که دفتر را به سمت سهم‌های با مومنتوم بهتر در برابر نوسان متمایل می‌کند — ایده بهینه‌ساز تقریبی کوانتومی، اینجا کلاسیک. میله‌ها درصد دفتر هستند.",
    },
  },
  {
    id: "mc",
    desk: "markets",
    en: {
      term: "Monte Carlo fan",
      means:
        "Sixteen geometric-Brownian paths of an underlying. The band is a typical range; the line is the median. Spot and vol sliders reseed the fan. The ‘MC call’ is the average ATM payoff of those paths — a toy option price.",
    },
    fa: {
      term: "پنکه مونت‌کارلو",
      means:
        "شانزده مسیر حرکت براونی هندسی. نوار محدوده معمول است؛ خط میانه است. لغزنده‌ها مسیر را از نو می‌سازند. «MC call» میانگین بازده اختیار ATM روی همان مسیرهاست.",
    },
  },
  {
    id: "cx",
    desk: "lab",
    en: {
      term: "Two-qubit (CX) error",
      means:
        "Chance a CNOT is wrong on the simulated backend (~0.19%). That is the expensive gate. The heat map is a 64-cell thermal analog — decorative, not a real chip.",
    },
    fa: {
      term: "خطای دوکیوبیتی (CX)",
      means:
        "احتمال غلط بودن یک CNOT روی بک‌اند شبیه‌سازی‌شده (حدود ۰٫۱۹٪). این گیت گران است. نقشه حرارت یک آنالوگ تزئینی ۶۴خانه‌ای است، نه یک تراشه واقعی.",
    },
  },
  {
    id: "ghz",
    desk: "lab",
    en: {
      term: "Lab · GHZ / Bell / Grover",
      means:
        "A statevector simulator in your browser. GHZ loads H then two CNOTs so |000⟩ and |111⟩ each hold ~50%. Click a cell to drop the selected gate. Teleport / Types / Hoare are the other tabs.",
    },
    fa: {
      term: "آزمایشگاه · GHZ / Bell / Grover",
      means:
        "شبیه‌ساز بردار حالت در مرورگر. GHZ یعنی H و دو CNOT تا |000⟩ و |111⟩ هر کدام حدود ۵۰٪ باشند. روی سلول کلیک کنید تا گیت گذاشته شود.",
    },
  },
  {
    id: "teleport",
    desk: "lab",
    en: {
      term: "Qudit teleportation",
      means:
        "Alice and Bob share an entangled pair. Alice measures her data + her half, sends two classical trits (m,n). Bob applies Weyl X and Z corrections and recovers the state. Fidelity 1.0000 here because the simulator is exact.",
    },
    fa: {
      term: "دوربری کیودیت",
      means:
        "آلیس و باب یک جفت درهم‌تنیده دارند. آلیس اندازه می‌گیرد و دو عدد کلاسیک (m,n) می‌فرستد. باب تصحیح وایل را اعمال می‌کند و حالت را بازمی‌سازد. وفاداری اینجا ۱ است چون شبیه‌ساز دقیق است.",
    },
  },
  {
    id: "types",
    desk: "lab",
    en: {
      term: "Linear types + Hoare",
      means:
        "Each qudit is owned by one context (no cloning). Entanglement cannot leak into a register you do not own — that is the frame rule. A Hoare triple {P} program {Q} is the contract; the statistical HybridCert stands in for Q.",
    },
    fa: {
      term: "انواع خطی + هوار",
      means:
        "هر کیودیت یک مالک دارد (بدون کپی). درهم‌تنیدگی به رجیستری که مال شما نیست نشت نمی‌کند — قاعده قاب. سه‌تایی هوار قرارداد است؛ گواهی ترکیبی جایگزین آماری Q است.",
    },
  },
  {
    id: "fidelity",
    desk: "network",
    en: {
      term: "Fidelity F̂ and HybridCert",
      means:
        "How close the measured state is to the ideal one (1 = perfect). A HybridCert is that number, plus an error bar, plus 5-of-7 node signatures over the same digest. ACCEPT means the lab result is both accurate and quorum-signed.",
    },
    fa: {
      term: "وفاداری F̂ و گواهی ترکیبی",
      means:
        "نزدیکی حالت اندازه‌گیری‌شده به حالت ایده‌آل (۱ = کامل). گواهی ترکیبی همان عدد به‌علاوه نوار خطا به‌علاوه امضای ۵ از ۷ گره است. ACCEPT یعنی هم دقیق است هم با اجماع امضا شده.",
    },
  },
  {
    id: "quorum",
    desk: "network",
    en: {
      term: "Honest nodes / quorum",
      means:
        "7 nodes, one of them Byzantine (red, node 2). You need 5 honest votes (2f+1). Packets on the canvas are reachability, not hacking. Press the experiment button to watch propose → vote → decide.",
    },
    fa: {
      term: "گره‌های صادق / حدنصاب",
      means:
        "۷ گره، یکی بیزانسی (قرمز، گره ۲). به ۵ رأی صادق نیاز است. بسته‌های روی بوم یعنی دسترس‌پذیری، نه نفوذ. دکمه آزمایش را بزنید تا propose → vote → decide را ببینید.",
    },
  },
  {
    id: "qec",
    desk: "research",
    en: {
      term: "Surface code · distillation · MPS",
      means:
        "How noisy physical qubits become one reliable logical qubit. Distance-3 patch, 15-to-1 magic-state distillation, and a tensor-network (MPS) compression slider. Educational analogs, not a device report.",
    },
    fa: {
      term: "کد سطح · تقطیر · MPS",
      means:
        "چگونه کیوبیت‌های نویزی یک کیوبیت منطقی قابل اعتماد می‌شوند. پچ فاصله ۳، تقطیر ۱۵-به-۱، و لغزنده فشرده‌سازی شبکه تانسوری. مدل آموزشی است نه گزارش دستگاه.",
    },
  },
  {
    id: "g2",
    desk: "logic",
    en: {
      term: "Logic · Gödel’s second theorem",
      means:
        "A consistent system cannot prove its own consistency. The toggle lets a node make that forbidden claim so you can watch it go from humble/sound to broken. Lean sketches, not a live kernel.",
    },
    fa: {
      term: "منطق · قضیه دوم گودل",
      means:
        "یک سیستم سازگار نمی‌تواند سازگاری خودش را ثابت کند. کلید، ادعای ممنوع را روشن می‌کند تا گره از متواضع/سالم به شکسته برود. طرح Lean است، نه هسته زنده.",
    },
  },
  {
    id: "chat",
    desk: "chat",
    en: {
      term: "Chat",
      means:
        "A research companion for this desk. It answers from the same local notes that power this glossary. Ask ‘what is book value?’ or tap a chip.",
    },
    fa: {
      term: "گفتگو",
      means:
        "همراه پژوهشی همین میز است و از همان یادداشت‌های محلی این واژه‌نامه جواب می‌دهد. بپرسید «book value چیست؟».",
    },
  },
  {
    id: "sim",
    desk: "home",
    en: {
      term: "Simulated · not live hardware",
      means:
        "Every backend (ibq_b, ibm_fez, …) is a named analog of public error budgets. No job is submitted to a real QPU. That is why this can run in a browser for a presentation.",
    },
    fa: {
      term: "شبیه‌سازی · نه سخت‌افزار زنده",
      means:
        "هر بک‌اند یک آنالوگ از بودجه‌های خطای عمومی است. هیچ کاری به QPU واقعی فرستاده نمی‌شود. برای همین در مرورگر برای ارائه اجرا می‌شود.",
    },
  },
];

export const DESKS: {
  to: string;
  id: DeskId;
  n: string;
  en: { label: string; pitch: string };
  fa: { label: string; pitch: string };
}[] = [
  {
    to: "/quantum",
    id: "lab",
    n: "1",
    en: { label: "Lab", pitch: "Build GHZ, teleport a qudit, inspect types and Hoare triples." },
    fa: { label: "آزمایشگاه", pitch: "GHZ بسازید، کیودیت را دور ببرید، انواع و هوار را ببینید." },
  },
  {
    to: "/finance",
    id: "markets",
    n: "2",
    en: { label: "Markets", pitch: "Book value, live tape, QAOA weights, VaR, Monte Carlo option." },
    fa: { label: "بازار", pitch: "ارزش دفتر، نوار قیمت، وزن QAOA، VaR، اختیار مونت‌کارلو." },
  },
  {
    to: "/research",
    id: "research",
    n: "3",
    en: { label: "Research", pitch: "Surface-code patch, magic distillation, MPS compression." },
    fa: { label: "پژوهش", pitch: "پچ کد سطح، تقطیر جادویی، فشرده‌سازی MPS." },
  },
  {
    to: "/lattice",
    id: "network",
    n: "4",
    en: { label: "Network", pitch: "Seven nodes. Five must sign. One is Byzantine on purpose." },
    fa: { label: "شبکه", pitch: "هفت گره. پنج باید امضا کنند. یکی عمداً بیزانسی است." },
  },
  {
    to: "/proofs",
    id: "logic",
    n: "5",
    en: { label: "Logic", pitch: "Gödel–Löb sketch: a node must not prove itself consistent." },
    fa: { label: "منطق", pitch: "طرح گودل–لوب: گره نباید سازگاری خودش را ثابت کند." },
  },
  {
    to: "/chat",
    id: "chat",
    n: "6",
    en: { label: "Chat", pitch: "Ask any of these words. The desk companion answers from the same notes." },
    fa: { label: "گفتگو", pitch: "هر کدام از این واژه‌ها را بپرسید. کمک‌پژوهش از همین یادداشت‌ها جواب می‌دهد." },
  },
];

export function termById(id: string) {
  return TERMS.find((t) => t.id === id);
}
