"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// App-wide client providers. The QueryClient is created once per browser tab
// (lazy `useState` init) so it survives re-renders but never leaks between
// requests on the server.
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Server data is fresh for a short beat; avoids refetch storms on
            // navigation while staying live enough for a study app.
            staleTime: 30_000,
            // Keep cached data around for half an hour after a query goes
            // unused (default is 5 min). This is what lets you leave a page and
            // come back without a blank reload — the list reappears instantly
            // from cache while any stale data revalidates in the background.
            gcTime: 30 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
