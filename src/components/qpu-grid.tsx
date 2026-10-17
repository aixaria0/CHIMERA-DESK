import { useChimera } from "@/lib/store";
import { cn } from "@/lib/utils";

export function QpuGrid() {
  const temps = useChimera((s) => s.qubits);
  return (
    <div className="grid grid-cols-8 gap-1">
      {temps.map((t, i) => (
        <div
          key={i}
          title={`Q${i}  ${t.toFixed(0)}`}
          className={cn(
            "aspect-square rounded-xs transition-colors duration-500",
            t < 55 && "bg-primary/25",
            t >= 55 && t < 78 && "bg-primary/55",
            t >= 78 && t < 92 && "bg-warn/70",
            t >= 92 && "bg-destructive",
          )}
        />
      ))}
    </div>
  );
}
