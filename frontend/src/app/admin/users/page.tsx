"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type {
  AdminUserRole,
  AdminUserStatus,
  AdminUserView,
} from "@/lib/api/admin";
import { useMe } from "@/lib/hooks/use-auth";
import { useAdminUsers, useLockUser, useUnlockUser } from "@/lib/hooks/use-admin";
import { ADMIN_PAGE_SIZE } from "@/lib/admin/constants";
import {
  avatarColor,
  fmtDate,
  initials,
  maskEmail,
  nameFromEmail,
  roleLabel,
} from "@/lib/admin/format";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { Modal } from "@/components/lexi/modal";
import { AdminBadge } from "@/components/admin/badge";
import { AdminSelect } from "@/components/admin/select";
import { AdminIconButton } from "@/components/admin/icon-button";
import { SearchInput } from "@/components/admin/search-input";
import { Pagination } from "@/components/admin/pagination";
import { ErrorCard, LoadingRows } from "@/components/admin/table-states";
import { FieldLabel } from "@/components/admin/form-fields";

/** Second confirmation before locking another admin account. */
const STRICT_ADMIN_LOCK = true;

const STATUS_FILTER = [
  { value: "all", label: "Mọi trạng thái" },
  { value: "active", label: "Hoạt động" },
  { value: "locked", label: "Bị khóa" },
];
const ROLE_FILTER = [
  { value: "all", label: "Mọi vai trò" },
  { value: "learner", label: "Người học" },
  { value: "admin", label: "Admin" },
];

const COLS = "1.5fr 120px 130px 118px 120px 160px";

function msg(e: unknown, fallback: string) {
  return e instanceof ApiError ? e.message : fallback;
}

function avatarInitial(email: string) {
  return initials(nameFromEmail(email));
}

type ModalState =
  | { kind: "detail"; user: AdminUserView }
  | { kind: "lock"; user: AdminUserView; reason: string; adminConfirmed: boolean }
  | null;

export default function AdminUsersPage() {
  const { data: me } = useMe();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<ModalState>(null);

  const query = useAdminUsers({
    search: q || undefined,
    status: status === "all" ? undefined : (status as AdminUserStatus),
    role: role === "all" ? undefined : (role.toUpperCase() as AdminUserRole),
    page: page + 1,
    limit: ADMIN_PAGE_SIZE,
  });

  const lockUser = useLockUser();
  const unlockUser = useUnlockUser();

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const from = total ? page * ADMIN_PAGE_SIZE + 1 : 0;
  const to = Math.min((page + 1) * ADMIN_PAGE_SIZE, total);

  async function confirmLock() {
    if (modal?.kind !== "lock") return;
    const { user, reason, adminConfirmed } = modal;
    if (!reason.trim()) return;
    const isLock = user.status !== "locked";
    if (isLock && user.role === "ADMIN" && STRICT_ADMIN_LOCK && !adminConfirmed) {
      setModal({ ...modal, adminConfirmed: true });
      return;
    }
    try {
      if (isLock) await lockUser.mutateAsync({ id: user.id, reason });
      else await unlockUser.mutateAsync({ id: user.id, reason });
      // A status change can drop the row from a status-filtered page — step back
      // if it was the last one on a non-first page.
      if (status !== "all" && items.length === 1 && page > 0) setPage((p) => p - 1);
      setModal(null);
      toast.success(isLock ? "Đã khóa tài khoản" : "Đã mở khóa", {
        description: `${maskEmail(user.email)} — lý do đã ghi vào nhật ký.`,
      });
    } catch (e) {
      toast.error(msg(e, "Không đổi được trạng thái tài khoản."));
    }
  }

  return (
    <div className="animate-lx-fade mx-auto max-w-[1120px]">
      {/* Toolbar */}
      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Tìm theo email…" className="min-w-[220px] flex-1 sm:max-w-[320px]" />
        <AdminSelect value={status} onChange={(v) => { setStatus(v); setPage(0); }} options={STATUS_FILTER} aria-label="Lọc trạng thái" className="w-[150px]" />
        <AdminSelect value={role} onChange={(v) => { setRole(v); setPage(0); }} options={ROLE_FILTER} aria-label="Lọc vai trò" className="w-[150px]" />
      </div>

      {/* Privacy notice */}
      <div className="mb-3.5 flex items-center gap-2 rounded-xl bg-sky-100 px-3.5 py-2.5">
        <Icon glyph="shield" px={17} color="var(--sky-600)" />
        <span className="text-[12.5px] font-bold text-sky-600">
          Chỉ hiển thị metadata phi nhạy cảm — không truy cập sổ từ, tiến độ hay bài viết của người học.
        </span>
      </div>

      {query.isPending ? (
        <LoadingRows />
      ) : query.isError ? (
        <ErrorCard onRetry={() => query.refetch()} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[880px]">
              <div className="grid items-center gap-3 bg-cloud-100 px-[18px] py-3 text-[11.5px] font-extrabold tracking-[0.04em] text-ink-400 uppercase" style={{ gridTemplateColumns: COLS }}>
                <div>Người dùng</div>
                <div>Đăng ký</div>
                <div>Hoạt động</div>
                <div>Vai trò</div>
                <div>Trạng thái</div>
                <div className="text-right">Thao tác</div>
              </div>
              {items.length === 0 ? (
                <div className="border-t border-[var(--border-subtle)] px-5 py-[50px] text-center">
                  <Icon glyph="users" px={38} color="var(--ink-200)" />
                  <div className="mt-2.5 font-bold text-ink-400">Không có người dùng khớp bộ lọc.</div>
                </div>
              ) : (
                items.map((u) => {
                  const self = !!me && u.id === me.id;
                  return (
                    <div key={u.id} className="grid items-center gap-3 border-t border-[var(--border-subtle)] px-[18px] py-3 text-[14px] hover:bg-cloud-50" style={{ gridTemplateColumns: COLS }}>
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex size-9 flex-none items-center justify-center rounded-full font-display text-[14px] font-semibold text-white" style={{ background: avatarColor(u.id) }}>
                          {avatarInitial(u.email)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-extrabold text-ink-800">{maskEmail(u.email)}</div>
                          {self && <div className="text-[11.5px] font-bold text-ink-300">Bạn đang đăng nhập</div>}
                        </div>
                      </div>
                      <div className="text-[13px] font-bold text-ink-500">{fmtDate(u.joined)}</div>
                      <div className="text-[13px] font-bold text-ink-500">{fmtDate(u.last)}</div>
                      <div><AdminBadge tone={u.role === "ADMIN" ? "brand" : "neutral"}>{roleLabel(u.role)}</AdminBadge></div>
                      <div><AdminBadge tone={u.status === "locked" ? "danger" : "success"} dot>{u.status === "locked" ? "Bị khóa" : "Hoạt động"}</AdminBadge></div>
                      <div className="flex items-center justify-end gap-1.5">
                        <AdminIconButton icon="eye" aria-label="Chi tiết" onClick={() => setModal({ kind: "detail", user: u })} />
                        {self ? (
                          <span className="pr-1.5 text-[12px] font-bold text-ink-300">Tài khoản của bạn</span>
                        ) : (
                          <ChunkyButton
                            size="sm"
                            variant={u.status === "locked" ? "success" : "secondary"}
                            iconLeft={u.status === "locked" ? "lock-open" : "lock"}
                            onClick={() => setModal({ kind: "lock", user: u, reason: "", adminConfirmed: false })}
                          >
                            {u.status === "locked" ? "Mở khóa" : "Khóa"}
                          </ChunkyButton>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <Pagination
            info={`${from}–${to} / ${total} người dùng`}
            page={page}
            pages={pages}
            onPrev={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => Math.min(pages - 1, p + 1))}
          />
        </div>
      )}

      {/* Detail modal */}
      <Modal open={modal?.kind === "detail"} onClose={() => setModal(null)} maxWidth={440}>
        {modal?.kind === "detail" && <UserDetail user={modal.user} onClose={() => setModal(null)} />}
      </Modal>

      {/* Lock / unlock modal */}
      <Modal open={modal?.kind === "lock"} onClose={() => setModal(null)} maxWidth={440}>
        {modal?.kind === "lock" && (
          <LockModalBody
            modal={modal}
            setReason={(reason) => setModal({ ...modal, reason })}
            pending={lockUser.isPending || unlockUser.isPending}
            onConfirm={confirmLock}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function MetaRow({ label, children, first }: { label: string; children: React.ReactNode; first?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 text-[13.5px] ${first ? "" : "border-t border-[var(--border-subtle)]"}`}>
      <span className="font-bold text-ink-400">{label}</span>
      {children}
    </div>
  );
}

function UserDetail({ user, onClose }: { user: AdminUserView; onClose: () => void }) {
  return (
    <>
      <div className="mb-5 flex items-center gap-3.5">
        <div className="flex size-[52px] flex-none items-center justify-center rounded-full font-display text-[20px] font-semibold text-white" style={{ background: avatarColor(user.id) }}>
          {avatarInitial(user.email)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[19px] font-semibold text-ink-900">{maskEmail(user.email)}</div>
          <div className="text-[12.5px] font-bold text-ink-400">Metadata tài khoản</div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <MetaRow label="Ngày đăng ký" first><span className="font-extrabold text-ink-800">{fmtDate(user.joined)}</span></MetaRow>
        <MetaRow label="Hoạt động gần nhất"><span className="font-extrabold text-ink-800">{fmtDate(user.last)}</span></MetaRow>
        <MetaRow label="Vai trò"><AdminBadge tone={user.role === "ADMIN" ? "brand" : "neutral"}>{roleLabel(user.role)}</AdminBadge></MetaRow>
        <MetaRow label="Trạng thái"><AdminBadge tone={user.status === "locked" ? "danger" : "success"} dot>{user.status === "locked" ? "Bị khóa" : "Hoạt động"}</AdminBadge></MetaRow>
      </div>
      {user.status === "locked" && user.disabledReason && (
        <div className="mt-3 rounded-xl bg-berry-100 px-3.5 py-2.5 text-[12.5px] font-bold text-berry-600">
          Lý do khóa: {user.disabledReason}
        </div>
      )}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-sky-100 px-3.5 py-3">
        <Icon glyph="lock" px={17} color="var(--sky-600)" className="mt-px flex-none" />
        <span className="text-[12px] leading-relaxed font-bold text-sky-600">
          Dữ liệu học tập cá nhân (sổ từ, tiến độ, bài viết, ghi âm) không hiển thị ở đây theo nguyên tắc least privilege.
        </span>
      </div>
      <div className="mt-5 flex justify-end">
        <ChunkyButton variant="secondary" onClick={onClose}>Đóng</ChunkyButton>
      </div>
    </>
  );
}

function LockModalBody({
  modal,
  setReason,
  pending,
  onConfirm,
  onCancel,
}: {
  modal: { kind: "lock"; user: AdminUserView; reason: string; adminConfirmed: boolean };
  setReason: (reason: string) => void;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { user, reason, adminConfirmed } = modal;
  const isLock = user.status !== "locked";
  const adminWarn = isLock && user.role === "ADMIN" && STRICT_ADMIN_LOCK && !adminConfirmed;
  const confirmLabel = adminWarn ? "Khóa admin" : isLock ? "Khóa tài khoản" : "Mở khóa";

  return (
    <>
      <div className="mb-2 flex items-center gap-3">
        <div className="flex size-[46px] flex-none items-center justify-center rounded-[13px]" style={{ background: isLock ? "var(--sun-100)" : "var(--leaf-100)" }}>
          <Icon glyph={isLock ? "lock" : "lock-open"} px={24} color={isLock ? "var(--sun-600)" : "var(--leaf-600)"} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-xl font-semibold whitespace-nowrap text-ink-900">
            {isLock ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}
          </div>
          <div className="truncate text-[13px] font-bold text-ink-400">{maskEmail(user.email)}</div>
        </div>
      </div>

      {adminWarn && (
        <div className="mt-3.5 mb-1 flex items-start gap-2.5 rounded-xl bg-sun-100 px-3.5 py-3">
          <Icon glyph="alert-triangle" px={18} color="var(--sun-600)" className="mt-px flex-none" />
          <span className="text-[12.5px] leading-relaxed font-extrabold text-sun-600">
            Đây là một tài khoản <b>Admin</b>. Nhấn &quot;Khóa admin&quot; lần nữa để xác nhận khóa quản trị viên khác.
          </span>
        </div>
      )}

      <div className="mt-4">
        <FieldLabel>Lý do (bắt buộc)</FieldLabel>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="ví dụ: Spam nội dung / lạm dụng gọi AI"
          className="w-full rounded-xl border-2 border-[var(--border-default)] bg-white px-3.5 py-3 text-[14px] font-bold text-ink-800 outline-none placeholder:text-ink-300 focus:border-grape-400"
        />
        <div className="mt-1.5 text-[11.5px] font-bold text-ink-300">
          Lý do sẽ được ghi vào nhật ký thao tác (ai, khi nào, vì sao).
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2.5">
        <ChunkyButton variant="ghost" onClick={onCancel}>Hủy</ChunkyButton>
        <ChunkyButton
          variant={isLock ? "danger" : "success"}
          iconLeft={isLock ? "lock" : "lock-open"}
          disabled={!reason.trim() || pending}
          onClick={onConfirm}
        >
          {confirmLabel}
        </ChunkyButton>
      </div>
    </>
  );
}
