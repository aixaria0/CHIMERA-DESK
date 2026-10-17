import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/shell";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
