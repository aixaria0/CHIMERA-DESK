/** Bravyi–Kitaev 15-to-1 magic-state distillation (leading-order model). */

export function distillLevel(p: number) {
  const pout = Math.min(0.5, 35 * p ** 3);
  const yieldP = Math.max(0.02, 1 - 15 * p);
  return { pin: p, pout, yieldP, ratio: p > 0 ? pout / p : 0 };
}

export function distillCurve(levels: number, p0: number) {
  const rows: { level: number; p: number; yieldCum: number }[] = [];
  let p = p0;
  let y = 1;
  for (let i = 0; i <= levels; i++) {
    rows.push({ level: i, p, yieldCum: y });
    const step = distillLevel(p);
    p = step.pout;
    y *= step.yieldP / 15;
  }
  return rows;
}
