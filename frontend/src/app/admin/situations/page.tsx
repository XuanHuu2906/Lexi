"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { Difficulty, ScenarioView } from "@/lib/api/admin";
import {
  useAdminScenarios,
  useCreateScenario,
  useDeleteScenario,
  useDuplicateScenario,
  useToggleScenario,
  useUpdateScenario,
} from "@/lib/hooks/use-admin";
import { ADMIN_PAGE_SIZE, DIFFICULTY_OPTIONS } from "@/lib/admin/constants";
import { difficultyLabel, difficultyTone, fmtDate } from "@/lib/admin/format";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { Modal } from "@/components/lexi/modal";
import { AdminBadge } from "@/components/admin/badge";
import { AdminSelect } from "@/components/admin/select";
import { AdminToggle } from "@/components/admin/toggle";
import { AdminIconButton } from "@/components/admin/icon-button";
import { SearchInput } from "@/components/admin/search-input";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { ErrorCard, LoadingRows } from "@/components/admin/table-states";
import {
  FieldLabel,
  FormError,
  TextArea,
  TextField,
} from "@/components/admin/form-fields";

const DIFF_FILTER = [{ value: "all", label: "Mọi độ khó" }, ...DIFFICULTY_OPTIONS];
const STATUS_FILTER = [
  { value: "all", label: "Mọi trạng thái" },
  { value: "on", label: "Đang hiển thị" },
  { value: "off", label: "Đã ẩn" },
];

const COLS = "1.1fr 1.5fr 116px 150px 116px";

function msg(e: unknown, fallback: string) {
  return e instanceof ApiError ? e.message : fallback;
}

type ModalState =
  | { kind: "form"; id: string | null; name: string; description: string; roleHint: string; difficulty: Difficulty; error: string }
  | { kind: "delete"; target: ScenarioView }
  | null;

export default function AdminSituationsPage() {
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<ModalState>(null);

  const query = useAdminScenarios({
    search: q || undefined,
    difficulty: diff === "all" ? undefined : (diff as Difficulty),
    status: status === "all" ? undefined : (status as "on" | "off"),
    page: page + 1,
    limit: ADMIN_PAGE_SIZE,
  });

  const createScenario = useCreateScenario();
  const updateScenario = useUpdateScenario();
  const deleteScenario = useDeleteScenario();
  const toggleScenario = useToggleScenario();
  const duplicateScenario = useDuplicateScenario();

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const from = total ? page * ADMIN_PAGE_SIZE + 1 : 0;
  const to = Math.min((page + 1) * ADMIN_PAGE_SIZE, total);

  function openAdd() {
    setModal({ kind: "form", id: null, name: "", description: "", roleHint: "", difficulty: "EASY", error: "" });
  }
  function openEdit(s: ScenarioView) {
    setModal({ kind: "form", id: s.id, name: s.name, description: s.description, roleHint: s.roleHint, difficulty: s.difficulty, error: "" });
  }

  async function save() {
    if (modal?.kind !== "form") return;
    const input = { name: modal.name, description: modal.description, roleHint: modal.roleHint, difficulty: modal.difficulty };
    if (!input.name.trim() || !input.description.trim()) {
      setModal({ ...modal, error: "Vui lòng nhập tên và mô tả tình huống." });
      return;
    }
    try {
      if (modal.id) {
        await updateScenario.mutateAsync({ id: modal.id, input });
        toast.success("Đã lưu", { description: `Cập nhật tình huống "${input.name.trim()}".` });
      } else {
        await createScenario.mutateAsync(input);
        setPage(0);
        toast.success("Đã thêm", { description: `"${input.name.trim()}" đã sẵn sàng cho người học.` });
      }
      setModal(null);
    } catch (e) {
      setModal({ ...modal, error: msg(e, "Không lưu được tình huống.") });
    }
  }

  async function confirmDelete() {
    if (modal?.kind !== "delete") return;
    const s = modal.target;
    try {
      await deleteScenario.mutateAsync(s.id);
      if (items.length === 1 && page > 0) setPage((p) => p - 1);
      setModal(null);
      toast.success("Đã xóa", { description: `Đã xóa tình huống "${s.name}".` });
    } catch (e) {
      toast.error(msg(e, "Không xóa được tình huống."));
    }
  }

  async function toggle(s: ScenarioView) {
    try {
      const res = await toggleScenario.mutateAsync(s.id);
      toast.info(res.enabled ? "Đã bật hiển thị" : "Đã ẩn", {
        description: `"${s.name}" ${res.enabled ? "hiện trong danh sách chọn của người học." : "không còn hiện với người học."}`,
      });
    } catch (e) {
      toast.error(msg(e, "Không đổi được trạng thái."));
    }
  }

  async function duplicate(s: ScenarioView) {
    try {
      const res = await duplicateScenario.mutateAsync(s.id);
      setPage(0);
      toast.success("Đã sao chép", { description: `Bản sao "${res.name}" đang ẩn — bật lên khi sẵn sàng.` });
    } catch (e) {
      toast.error(msg(e, "Không sao chép được."));
    }
  }

  return (
    <div className="animate-lx-fade mx-auto max-w-[1080px]">
      {/* Toolbar */}
      <div className="mb-[18px] flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Tìm tình huống…" className="min-w-[220px] flex-1 sm:max-w-[320px]" />
        <AdminSelect value={diff} onChange={(v) => { setDiff(v); setPage(0); }} options={DIFF_FILTER} aria-label="Lọc độ khó" className="w-[150px]" />
        <AdminSelect value={status} onChange={(v) => { setStatus(v); setPage(0); }} options={STATUS_FILTER} aria-label="Lọc trạng thái" className="w-[150px]" />
        <div className="hidden flex-1 sm:block" />
        <ChunkyButton variant="primary" iconLeft="plus" onClick={openAdd}>Thêm tình huống</ChunkyButton>
      </div>

      {query.isPending ? (
        <LoadingRows />
      ) : query.isError ? (
        <ErrorCard onRetry={() => query.refetch()} />
      ) : total === 0 ? (
        <EmptyState
          glyph="messages-square"
          title={q || diff !== "all" || status !== "all" ? "Không có tình huống khớp bộ lọc" : "Chưa có tình huống nào"}
          desc="Thêm tình huống đầu tiên để người học luyện nói."
        >
          <ChunkyButton variant="primary" iconLeft="plus" onClick={openAdd}>Thêm tình huống</ChunkyButton>
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              <div className="grid items-center gap-3 bg-cloud-100 px-[18px] py-3 text-[11.5px] font-extrabold tracking-[0.04em] text-ink-400 uppercase" style={{ gridTemplateColumns: COLS }}>
                <div>Tên tình huống</div>
                <div>Mô tả</div>
                <div>Độ khó</div>
                <div>Hiển thị</div>
                <div className="text-right">Thao tác</div>
              </div>
              {items.map((s) => (
                <div key={s.id} className="grid items-center gap-3 border-t border-[var(--border-subtle)] px-[18px] py-[13px] text-[14px] hover:bg-cloud-50" style={{ gridTemplateColumns: COLS }}>
                  <div className="min-w-0">
                    <div className="truncate font-extrabold text-ink-900">{s.name}</div>
                    <div className="truncate text-[12px] font-bold text-ink-300">Cập nhật {fmtDate(s.updated)}</div>
                  </div>
                  <div className="truncate text-[13px] font-semibold text-ink-600">{s.description}</div>
                  <div><AdminBadge tone={difficultyTone(s.difficulty)}>{difficultyLabel(s.difficulty)}</AdminBadge></div>
                  <div className="flex items-center gap-2.5">
                    <AdminToggle checked={s.enabled} onChange={() => toggle(s)} aria-label={`Bật/tắt ${s.name}`} />
                    <span className="text-[12.5px] font-bold" style={{ color: s.enabled ? "var(--leaf-600)" : "var(--ink-300)" }}>
                      {s.enabled ? "Hiển thị" : "Đã ẩn"}
                    </span>
                  </div>
                  <div className="flex justify-end gap-0.5">
                    <AdminIconButton icon="pencil" aria-label="Sửa" onClick={() => openEdit(s)} />
                    <AdminIconButton icon="copy" aria-label="Sao chép" onClick={() => duplicate(s)} />
                    <AdminIconButton icon="trash-2" aria-label="Xóa" onClick={() => setModal({ kind: "delete", target: s })} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Pagination
            info={`${from}–${to} / ${total} tình huống`}
            page={page}
            pages={pages}
            onPrev={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => Math.min(pages - 1, p + 1))}
          />
        </div>
      )}

      {/* Add / edit modal */}
      <Modal open={modal?.kind === "form"} onClose={() => setModal(null)} maxWidth={500} className="max-h-[88vh] overflow-auto">
        {modal?.kind === "form" && (
          <>
            <div className="mb-[18px] font-display text-[21px] font-semibold text-ink-900">
              {modal.id ? "Sửa tình huống" : "Thêm tình huống"}
            </div>
            <FieldLabel>Tên tình huống</FieldLabel>
            <TextField value={modal.name} onChange={(v) => setModal({ ...modal, name: v, error: "" })} placeholder="ví dụ: Phỏng vấn xin việc" />
            <FieldLabel>Mô tả ngắn</FieldLabel>
            <TextField value={modal.description} onChange={(v) => setModal({ ...modal, description: v, error: "" })} placeholder="ví dụ: Trả lời câu hỏi phỏng vấn vị trí nhân viên" />
            <FieldLabel>Gợi ý vai trò / ngữ cảnh mở đầu cho AI</FieldLabel>
            <TextArea value={modal.roleHint} onChange={(v) => setModal({ ...modal, roleHint: v })} placeholder="ví dụ: Bạn là nhà tuyển dụng, bắt đầu bằng câu chào và hỏi ứng viên giới thiệu bản thân." />
            <FieldLabel>Độ khó</FieldLabel>
            <AdminSelect value={modal.difficulty} onChange={(v) => setModal({ ...modal, difficulty: v as Difficulty })} options={DIFFICULTY_OPTIONS} aria-label="Độ khó" className="w-full" />
            {modal.error && <FormError>{modal.error}</FormError>}
            <div className="mt-[22px] flex justify-end gap-2.5">
              <ChunkyButton variant="ghost" onClick={() => setModal(null)}>Hủy</ChunkyButton>
              <ChunkyButton variant="primary" iconLeft="check" onClick={save} disabled={createScenario.isPending || updateScenario.isPending}>Lưu</ChunkyButton>
            </div>
          </>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal open={modal?.kind === "delete"} onClose={() => setModal(null)} maxWidth={420} className="text-center">
        {modal?.kind === "delete" && (
          <>
            <div className="mx-auto mb-3.5 flex size-[52px] items-center justify-center rounded-2xl bg-berry-100">
              <Icon glyph="trash-2" px={26} color="var(--berry-600)" />
            </div>
            <div className="font-display text-xl font-semibold text-ink-900">Xóa tình huống này?</div>
            <div className="mt-2 mb-1 text-[13.5px] font-semibold text-ink-500">
              Xóa <b className="text-ink-800">{modal.target.name}</b>. Nếu chỉ muốn tạm ẩn khỏi người học, hãy dùng công tắc bật/tắt thay vì xóa.
            </div>
            <div className="mt-5 flex justify-center gap-2.5">
              <ChunkyButton variant="ghost" onClick={() => setModal(null)}>Hủy</ChunkyButton>
              <ChunkyButton variant="danger" iconLeft="trash-2" onClick={confirmDelete} disabled={deleteScenario.isPending}>Xóa</ChunkyButton>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
