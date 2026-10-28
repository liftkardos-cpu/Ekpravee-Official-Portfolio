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

// In SSR, return a fresh router per request to avoid "router is already dehydrated" invariant errors
let clientRouterInstance: ReturnType<typeof createRouter> | undefined;

export function getRouter() {
  if (typeof window === "undefined") {
    return createRouter();
  }
  if (!clientRouterInstance) {
    clientRouterInstance = createRouter();
  }
  return clientRouterInstance;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
