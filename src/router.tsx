import { createHashHistory, createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const history = import.meta.env.PROD ? createHashHistory() : undefined;

  return createRouter({
    routeTree,
    ...(history ? { history } : {}),
    defaultErrorComponent: AppErrorComponent,
    defaultPreload: "intent",
    scrollRestoration: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
