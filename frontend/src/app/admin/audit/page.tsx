"use client";

import { useState } from "react";
import type { AuditActionValue, AuditView } from "@/lib/api/admin";
import { useAdminAudit, useAuditAdmins } from "@/lib/hooks/use-admin";
import { ADMIN_PAGE_SIZE } from "@/lib/admin/constants";
import { actionMeta, fmtDateTime, nameFromEmail } from "@/lib/admin/format";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { Modal } from "@/components/lexi/modal";
import { AdminBadge } from "@/components/admin/badge";
import { AdminSelect } from "@/components/admin/select";
import { AdminIconButton } from "@/components/admin/icon-button";
import { Pagination } from "@/components/admin/pagination";
import { ErrorCard, LoadingRows } from "@/components/admin/table-states";

const ACTION_FILTER = [
  { value: "all", label: "Mọi hành động" },
  { value: "CREATE", label: "Thêm" },
  { value: "UPDATE", label: "Sửa" },
  { value: "DELETE", label: "Xóa" },
  { value: "LOCK", label: "Khóa" },
  { value: "UNLOCK", label: "Mở khóa" },
  { value: "TOGGLE", label: "Bật/Tắt" },
  { value: "IMPORT", label: "Nhập CSV" },
  { value: "EXPORT", label: "Xuất CSV" },
];

const COLS = "150px 132px 1.4fr 150px 1fr 52px";

export default function AdminAuditPage() {
  const [admin, setAdmin] = useState("all");
  const [action, setAction] = useState("all");
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<AuditView | null>(null);

  const admins = useAuditAdmins();
  const query = useAdminAudit({
    admin: admin === "all" ? undefined : admin,
    action: action === "all" ? undefined : (action as AuditActionValue),
    page: page + 1,
    limit: ADMIN_PAGE_SIZE,
  });

  const adminOpts = [
    { value: "all", label: "Mọi admin" },
    ...(admins.data ?? []).map((e) => ({ value: e, label: nameFromEmail(e) })),
  ];

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const from = total ? page * ADMIN_PAGE_SIZE + 1 : 0;
  const to = Math.min((page + 1) * ADMIN_PAGE_SIZE, total);

  return (
    <div className="animate-lx-fade mx-auto max-w-[1120px]">
      {/* Toolbar */}
      <div className="mb-[18px] flex flex-wrap items-center gap-3">
        <AdminSelect value={admin} onChange={(v) => { setAdmin(v); setPage(0); }} options={adminOpts} aria-label="Lọc theo admin" className="w-[180px]" />
        <AdminSelect value={action} onChange={(v) => { setAction(v); setPage(0); }} options={ACTION_FILTER} aria-label="Lọc theo hành động" className="w-[170px]" />
        <div className="hidden flex-1 sm:block" />
        <div className="inline-flex items-center gap-1.5 rounded-full bg-grape-50 px-3.5 py-2">
          <Icon glyph="history" px={16} color="var(--grape-600)" />
          <span className="text-[12.5px] font-extrabold text-grape-600">Chỉ đọc — mới nhất trước</span>
        </div>
      </div>

      {query.isPending ? (
        <LoadingRows />
      ) : query.isError ? (
        <ErrorCard onRetry={() => query.refetch()} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid items-center gap-3 bg-cloud-100 px-[18px] py-3 text-[11.5px] font-extrabold tracking-[0.04em] text-ink-400 uppercase" style={{ gridTemplateColumns: COLS }}>
                <div>Admin</div>
                <div>Hành động</div>
                <div>Đối tượng</div>
                <div>Thời điểm</div>
                <div>Lý do</div>
                <div />
              </div>
              {items.map((a) => {
                const meta = actionMeta(a.action);
                return (
                  <div key={a.id} className="grid items-center gap-3 border-t border-[var(--border-subtle)] px-[18px] py-3 text-[14px] hover:bg-cloud-50" style={{ gridTemplateColumns: COLS }}>
                    <div className="truncate font-extrabold text-ink-700">{nameFromEmail(a.adminEmail)}</div>
                    <div><AdminBadge tone={meta.tone}>{meta.label}</AdminBadge></div>
                    <div className="truncate text-[13px] font-bold text-ink-600">{a.target}</div>
                    <div className="text-[12.5px] font-bold text-ink-400">{fmtDateTime(a.time)}</div>
                    <div className="truncate text-[12.5px] font-semibold text-ink-500">{a.reason || "—"}</div>
                    <div className="flex justify-end">
                      <AdminIconButton icon="chevron-right" aria-label="Chi tiết" onClick={() => setDetail(a)} />
                    </div>
                  </div>
                );
              })}
              {total === 0 && (
                <div className="border-t border-[var(--border-subtle)] px-5 py-[50px] text-center">
                  <Icon glyph="scroll-text" px={38} color="var(--ink-200)" />
                  <div className="mt-2.5 font-bold text-ink-400">Không có bản ghi phù hợp bộ lọc.</div>
                </div>
              )}
            </div>
          </div>
          <Pagination
            info={`${from}–${to} / ${total} bản ghi`}
            page={page}
            pages={pages}
            onPrev={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => Math.min(pages - 1, p + 1))}
          />
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} maxWidth={460}>
        {detail && <AuditDetail entry={detail} onClose={() => setDetail(null)} />}
      </Modal>
    </div>
  );
}

function AuditDetail({ entry, onClose }: { entry: AuditView; onClose: () => void }) {
  const meta = actionMeta(entry.action);
  return (
    <>
      <div className="mb-[18px] flex items-center gap-2.5">
        <AdminBadge tone={meta.tone}>{meta.label}</AdminBadge>
        <div className="font-display text-[19px] font-semibold text-ink-900">{entry.target}</div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between px-4 py-2.5 text-[13.5px]">
          <span className="font-bold text-ink-400">Người thực hiện</span>
          <span className="font-extrabold text-ink-800">{nameFromEmail(entry.adminEmail)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-2.5 text-[13.5px]">
          <span className="font-bold text-ink-400">Thời điểm</span>
          <span className="font-extrabold text-ink-800">{fmtDateTime(entry.time)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] px-4 py-2.5 text-[13.5px]">
          <span className="font-bold text-ink-400">Lý do</span>
          <span className="text-right font-extrabold text-ink-800">{entry.reason || "—"}</span>
        </div>
      </div>
      <div className="mt-3.5 flex gap-2.5">
        <div className="flex-1 rounded-xl bg-cloud-100 px-3.5 py-3">
          <div className="mb-1.5 text-[11px] font-extrabold tracking-[0.04em] text-ink-400 uppercase">Trước</div>
          <div className="text-[13px] font-bold text-ink-700">{entry.before || "—"}</div>
        </div>
        <div className="flex-1 rounded-xl bg-leaf-100 px-3.5 py-3">
          <div className="mb-1.5 text-[11px] font-extrabold tracking-[0.04em] text-leaf-600 uppercase">Sau</div>
          <div className="text-[13px] font-bold text-ink-800">{entry.after || "—"}</div>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <ChunkyButton variant="secondary" onClick={onClose}>Đóng</ChunkyButton>
      </div>
    </>
  );
}
