import { useEffect, useRef } from "react";
import { useChimera } from "@/lib/store";

export function LatticeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const nodes = useChimera((s) => s.nodes);
  const leader = useChimera((s) => s.leader);
  const phase = useChimera((s) => s.phase);
  const tick = useChimera((s) => s.tick);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const parent = canvas.parentElement;
      const w = Math.max(parent?.clientWidth ?? 0, canvas.clientWidth, 1);
      const h = Math.max(parent?.clientHeight ?? 0, canvas.clientHeight, 1);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "#08090b";
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.38, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(197,205,212,0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const pts = nodes.map((n) => ({ ...n, px: n.x * w, py: n.y * h }));

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];
          const dist = Math.hypot(a.px - b.px, a.py - b.py);
          if (dist > Math.max(w, h) * 0.7) continue;
          ctx.strokeStyle =
            a.honest && b.honest ? "rgba(94,234,212,0.28)" : "rgba(224,122,110,0.22)";
          ctx.beginPath();
          ctx.moveTo(a.px, a.py);
          ctx.lineTo(b.px, b.py);
          ctx.stroke();
        }
      }

      if (phase !== "idle") {
        const L = pts[leader] ?? pts[0];
        const t = (tick % 18) / 18;
        pts.forEach((p, i) => {
          if (i === leader) return;
          ctx.fillStyle = phase === "decide" ? "#5eead4" : "#c5cdd4";
          ctx.beginPath();
          ctx.arc(L.px + (p.px - L.px) * t, L.py + (p.py - L.py) * t, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      pts.forEach((p) => {
        const r = p.role === "leader" ? 12 : 9;
        ctx.beginPath();
        ctx.arc(p.px, p.py, r + 7, 0, Math.PI * 2);
        ctx.fillStyle = p.honest ? "rgba(94,234,212,0.12)" : "rgba(224,122,110,0.14)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
        ctx.fillStyle = p.role === "leader" ? "#5eead4" : p.honest ? "#c5cdd4" : "#e07a6e";
        ctx.fill();
        ctx.fillStyle = "#08090b";
        ctx.font = "600 10px 'IBM Plex Mono', ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(p.id), p.px, p.py + 0.5);
      });
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas.parentElement ?? canvas);
    return () => ro.disconnect();
  }, [nodes, leader, phase, tick]);

  return (
    <canvas
      ref={ref}
      className="block h-full w-full rounded-md"
      aria-label="Lattice topology"
    />
  );
}
