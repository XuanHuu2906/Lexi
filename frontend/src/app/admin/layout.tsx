"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/lib/hooks/use-auth";
import { nameFromEmail } from "@/lib/admin/format";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { data: me, isError, isFetching } = useMe();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const isAdmin = me?.role === "ADMIN";
  const adminName = useMemo(
    () => (me ? nameFromEmail(me.email) : "Quản trị viên"),
    [me],
  );

  // No session → back to login (same settle-before-redirect logic as the
  // learner layout: the `me` query is shared with /login where it errors while
  // logged out, so only redirect once it's an error and not mid-refetch).
  useEffect(() => {
    if (isError && !isFetching) router.replace("/login");
  }, [isError, isFetching, router]);

  // Authenticated but not an admin → bounce to the learner app.
  useEffect(() => {
    if (me && !isAdmin) router.replace("/dashboard");
  }, [me, isAdmin, router]);

  if (!me || !isAdmin) {
    return isFetching || (me && !isAdmin) ? (
      <div className="flex min-h-dvh items-center justify-center bg-cloud-100">
        <div className="size-8 animate-spin rounded-full border-3 border-cloud-300 border-t-grape-500" />
      </div>
    ) : null;
  }

  return (
    <div className="flex min-h-dvh bg-cloud-100">
      <AdminSidebar open={mobileOpen} onClose={closeMobile} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onMenu={() => setMobileOpen(true)} adminName={adminName} />
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 pt-7 pb-12 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
