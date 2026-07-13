"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/lib/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { data: me, isError, isFetching } = useMe();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // No session → back to login. Only act once the query has settled to an
  // error and isn't mid-refetch: the me query is shared with /login (where it
  // errors while logged out), so a fresh login re-fetches through that stale
  // error state — redirecting then would bounce a valid session.
  // (The API client also hard-redirects on a failed refresh.)
  useEffect(() => {
    if (isError && !isFetching) router.replace("/login");
  }, [isError, isFetching, router]);

  // No data yet: show a spinner while we're still resolving auth, otherwise
  // render nothing (a redirect to /login is in flight).
  if (!me) {
    return isFetching ? (
      <div className="flex min-h-dvh items-center justify-center bg-cloud-100">
        <div className="size-8 animate-spin rounded-full border-3 border-cloud-300 border-t-grape-500" />
      </div>
    ) : null;
  }

  return (
    <div className="flex min-h-dvh bg-cloud-100">
      <Sidebar open={mobileOpen} onClose={closeMobile} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 pt-6 pb-12 sm:px-8 sm:pt-7">
          {children}
        </main>
      </div>
    </div>
  );
}
