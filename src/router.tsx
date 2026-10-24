import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    context: {
      queryClient,
    },
  });

  return router;
}

let routerInstance: ReturnType<typeof createRouter> | undefined;

export function getRouter() {
  if (!routerInstance) {
    routerInstance = createRouter();
  }
  return routerInstance;
}

export const router = getRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
