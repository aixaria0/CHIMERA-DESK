export function ProbBars({
  rows,
}: {
  rows: { label: string; value: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.value), 0.05);
  const shown = rows.length <= 8 ? rows : rows.filter((r) => r.value > 0.02);
  return (
    <ul className="space-y-1.5">
      {shown.map((r) => (
        <li key={r.label} className="flex items-center gap-2">
          <span className="w-12 shrink-0 font-mono text-xs text-muted">|{r.label}⟩</span>
          <div className="h-2 flex-1 overflow-hidden rounded-xs bg-card-2">
            <div
              className="h-full rounded-xs bg-primary"
              style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right font-mono text-xs tabular text-steel">
            {r.value.toFixed(3)}
          </span>
        </li>
      ))}
    </ul>
  );
}
