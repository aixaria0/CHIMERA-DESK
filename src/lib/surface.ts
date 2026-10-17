/** Educational surface-code patch: X-errors, Z-syndromes, greedy matching. */

export type SurfaceState = {
  size: number;
  data: boolean[][];
  zSynd: boolean[][];
  corrections: { x: number; y: number }[];
  logical: boolean;
};

export function emptySurface(size = 5): SurfaceState {
  const data = Array.from({ length: size }, () => Array.from({ length: size }, () => false));
  return computeSurface(data);
}

export function injectError(state: SurfaceState, x: number, y: number): SurfaceState {
  const data = state.data.map((row) => row.slice());
  if (x < 0 || y < 0 || x >= state.size || y >= state.size) return state;
  data[y][x] = !data[y][x];
  return computeSurface(data);
}

export function randomErrors(size: number, p: number, seed: number): SurfaceState {
  const data = Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => {
      const v = Math.sin((seed + 1) * 12.9 + x * 7.1 + y * 3.3) * 43758.5;
      return v - Math.floor(v) < p;
    }),
  );
  return computeSurface(data);
}

function xor4(a: boolean, b: boolean, c: boolean, d: boolean) {
  return Boolean(Number(a) ^ Number(b) ^ Number(c) ^ Number(d));
}

function computeSurface(data: boolean[][]): SurfaceState {
  const size = data.length;
  const zSynd: boolean[][] = [];
  for (let y = 0; y < size - 1; y++) {
    const zr: boolean[] = [];
    for (let x = 0; x < size - 1; x++) {
      zr.push(xor4(data[y][x], data[y][x + 1], data[y + 1][x], data[y + 1][x + 1]));
    }
    zSynd.push(zr);
  }

  const defects: { x: number; y: number }[] = [];
  zSynd.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v) defects.push({ x, y });
    }),
  );

  const used = new Set<number>();
  const corrections: { x: number; y: number }[] = [];
  for (let i = 0; i < defects.length; i++) {
    if (used.has(i)) continue;
    let best = -1;
    let bestD = Infinity;
    for (let j = i + 1; j < defects.length; j++) {
      if (used.has(j)) continue;
      const d = Math.abs(defects[i].x - defects[j].x) + Math.abs(defects[i].y - defects[j].y);
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    }
    if (best >= 0) {
      used.add(i);
      used.add(best);
      const a = defects[i];
      const b = defects[best];
      let cx = a.x;
      let cy = a.y;
      while (cx !== b.x) {
        const step = Math.sign(b.x - cx);
        corrections.push({ x: Math.min(cx, cx + step) + 1, y: cy + 1 });
        cx += step;
      }
      while (cy !== b.y) {
        const step = Math.sign(b.y - cy);
        corrections.push({ x: cx + 1, y: Math.min(cy, cy + step) + 1 });
        cy += step;
      }
    }
  }

  let logical = false;
  for (let x = 0; x < size; x++) logical = logical !== data[0][x];

  return { size, data, zSynd, corrections, logical };
}
