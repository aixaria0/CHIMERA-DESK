import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreset = "void" | "nebula" | "graphite";
export type AccentPreset = "cyan" | "violet" | "amber" | "rose";
export type FontPreset = "sora" | "manrope" | "space";
export type DensityPreset = "comfortable" | "compact";
export type WidgetKey =
  | "workspaces"
  | "market"
  | "qpu"
  | "backends"
  | "certificates"
  | "events"
  | "glossary";

export const WIDGET_LABELS: Record<WidgetKey, string> = {
  workspaces: "Workspace launcher",
  market: "Market telemetry",
  qpu: "QPU heat map",
  backends: "Backend matrix",
  certificates: "Certificates",
  events: "Event stream",
  glossary: "Research glossary",
};

const defaultWidgets: Record<WidgetKey, boolean> = {
  workspaces: true,
  market: true,
  qpu: true,
  backends: true,
  certificates: true,
  events: true,
  glossary: true,
};

const defaults = {
  theme: "void" as ThemePreset,
  accent: "cyan" as AccentPreset,
  font: "sora" as FontPreset,
  density: "comfortable" as DensityPreset,
  sidebarCollapsed: false,
  glass: true,
  grid: true,
  motion: true,
  refreshMs: 900,
  widgets: defaultWidgets,
};

type UiState = typeof defaults & {
  setTheme: (theme: ThemePreset) => void;
  setAccent: (accent: AccentPreset) => void;
  setFont: (font: FontPreset) => void;
  setDensity: (density: DensityPreset) => void;
  setSidebarCollapsed: (sidebarCollapsed: boolean) => void;
  setGlass: (glass: boolean) => void;
  setGrid: (grid: boolean) => void;
  setMotion: (motion: boolean) => void;
  setRefreshMs: (refreshMs: number) => void;
  toggleWidget: (key: WidgetKey) => void;
  reset: () => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      ...defaults,
      widgets: { ...defaultWidgets },
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setFont: (font) => set({ font }),
      setDensity: (density) => set({ density }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setGlass: (glass) => set({ glass }),
      setGrid: (grid) => set({ grid }),
      setMotion: (motion) => set({ motion }),
      setRefreshMs: (refreshMs) => set({ refreshMs }),
      toggleWidget: (key) =>
        set((state) => ({ widgets: { ...state.widgets, [key]: !state.widgets[key] } })),
      reset: () => set({ ...defaults, widgets: { ...defaultWidgets } }),
    }),
    {
      name: "chimera-ui-v2",
      partialize: (state) => ({
        theme: state.theme,
        accent: state.accent,
        font: state.font,
        density: state.density,
        sidebarCollapsed: state.sidebarCollapsed,
        glass: state.glass,
        grid: state.grid,
        motion: state.motion,
        refreshMs: state.refreshMs,
        widgets: state.widgets,
      }),
    },
  ),
);
