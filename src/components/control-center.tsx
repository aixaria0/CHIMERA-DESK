import {
  Gauge,
  Grid3X3,
  LayoutDashboard,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Type,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WIDGET_LABELS,
  useUiStore,
  type AccentPreset,
  type DensityPreset,
  type FontPreset,
  type ThemePreset,
} from "@/lib/ui-store";

const THEMES: { id: ThemePreset; label: string; note: string }[] = [
  { id: "void", label: "Void", note: "Deep neutral" },
  { id: "nebula", label: "Nebula", note: "Blue-black" },
  { id: "graphite", label: "Graphite", note: "Soft carbon" },
];

const ACCENTS: { id: AccentPreset; label: string; swatch: string }[] = [
  { id: "cyan", label: "Cyan", swatch: "#66f4d5" },
  { id: "violet", label: "Violet", swatch: "#a78bfa" },
  { id: "amber", label: "Amber", swatch: "#f8c66d" },
  { id: "rose", label: "Rose", swatch: "#fb8da8" },
];

const FONTS: { id: FontPreset; label: string; sample: string }[] = [
  { id: "sora", label: "Sora", sample: "Research" },
  { id: "manrope", label: "Manrope", sample: "Research" },
  { id: "space", label: "Space Grotesk", sample: "Research" },
];

export function ControlCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ui = useUiStore();

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        aria-label="Interface control center"
        className={cn(
          "fixed inset-y-0 end-0 z-50 flex w-[min(420px,94vw)] flex-col border-s border-border/80 bg-background/95 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-[var(--ease-out-soft)]",
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary shadow-[var(--shadow-border)]">
              <SlidersHorizontal className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Control center</p>
              <p className="text-[11px] text-muted">Tune the desk without touching the research state.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg text-muted hover:bg-card-2 hover:text-foreground"
            aria-label="Close control center"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="scan-hide flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <SettingSection icon={Palette} title="Environment" note="Surface and accent palette">
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => ui.setTheme(theme.id)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-start transition-all",
                    ui.theme === theme.id
                      ? "border-primary/45 bg-primary/[0.08] shadow-[0_0_22px_rgba(var(--glow-rgb),0.09)]"
                      : "border-border/70 bg-card/55 hover:border-border-strong hover:bg-card-2",
                  )}
                >
                  <span className="block text-xs font-semibold">{theme.label}</span>
                  <span className="mt-1 block text-[10px] text-muted">{theme.note}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-border/70 bg-card/50 px-3 py-3">
              <span className="text-xs text-muted">Accent</span>
              <div className="flex items-center gap-2">
                {ACCENTS.map((accent) => (
                  <button
                    key={accent.id}
                    type="button"
                    onClick={() => ui.setAccent(accent.id)}
                    aria-label={`${accent.label} accent`}
                    title={accent.label}
                    className={cn(
                      "size-6 rounded-full border-2 transition-transform hover:scale-110",
                      ui.accent === accent.id ? "border-white/80 scale-110" : "border-transparent",
                    )}
                    style={{ backgroundColor: accent.swatch }}
                  />
                ))}
              </div>
            </div>
          </SettingSection>

          <SettingSection icon={Type} title="Typography" note="Choose the interface voice">
            <div className="space-y-2">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => ui.setFont(font.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-start",
                    ui.font === font.id
                      ? "border-primary/45 bg-primary/[0.07]"
                      : "border-border/70 bg-card/50 hover:bg-card-2",
                  )}
                >
                  <span className="text-xs text-muted">{font.label}</span>
                  <span className={`ui-font-${font.id} text-sm font-semibold`}>{font.sample}</span>
                </button>
              ))}
            </div>
          </SettingSection>

          <SettingSection icon={Gauge} title="Information density" note="Compact or breathable">
            <Segmented<DensityPreset>
              value={ui.density}
              onChange={ui.setDensity}
              options={[
                ["comfortable", "Comfortable"],
                ["compact", "Compact"],
              ]}
            />
            <div className="mt-3">
              <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted">Telemetry pulse</p>
              <Segmented<number>
                value={ui.refreshMs}
                onChange={ui.setRefreshMs}
                options={[
                  [1800, "Calm"],
                  [900, "Live"],
                  [450, "Fast"],
                ]}
              />
            </div>
          </SettingSection>

          <SettingSection icon={Sparkles} title="Surface effects" note="Visual atmosphere">
            <div className="space-y-2">
              <SwitchLine label="Glass surfaces" checked={ui.glass} onChange={ui.setGlass} />
              <SwitchLine label="Technical grid" checked={ui.grid} onChange={ui.setGrid} />
              <SwitchLine label="Ambient motion" checked={ui.motion} onChange={ui.setMotion} />
            </div>
          </SettingSection>

          <SettingSection icon={LayoutDashboard} title="Dashboard modules" note="Show only what matters">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(WIDGET_LABELS).map(([key, label]) => {
                const widget = key as keyof typeof ui.widgets;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => ui.toggleWidget(widget)}
                    className={cn(
                      "flex min-h-16 flex-col items-start justify-between rounded-xl border p-3 text-start transition-colors",
                      ui.widgets[widget]
                        ? "border-primary/25 bg-primary/[0.055] text-foreground"
                        : "border-border/60 bg-card/40 text-muted",
                    )}
                  >
                    <Grid3X3 className="size-3.5" />
                    <span className="text-[11px] font-medium leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>
          </SettingSection>
        </div>

        <footer className="border-t border-border/70 p-4">
          <button
            type="button"
            onClick={ui.reset}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border/70 bg-card/50 text-xs text-muted hover:bg-card-2 hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Reset interface
          </button>
        </footer>
      </aside>
    </>
  );
}

function SettingSection({
  icon: Icon,
  title,
  note,
  children,
}: {
  icon: typeof Palette;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-3.5 text-primary" />
        <div>
          <h3 className="text-xs font-semibold">{title}</h3>
          <p className="text-[10px] text-muted">{note}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid grid-flow-col rounded-xl border border-border/70 bg-card/50 p-1">
      {options.map(([id, label]) => (
        <button
          type="button"
          key={String(id)}
          onClick={() => onChange(id)}
          className={cn(
            "rounded-lg px-2 py-2 text-[11px] font-medium transition-colors",
            value === id ? "bg-card-2 text-foreground shadow-[var(--shadow-border)]" : "text-muted hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SwitchLine({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card/45 px-3 py-2.5 text-xs"
    >
      <span className="text-steel">{label}</span>
      <span className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-primary" : "bg-card-2") }>
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[18px] rtl:-translate-x-[18px]" : "translate-x-0.5 rtl:-translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
