"use client";

import { useState } from "react";
import { toast } from "sonner";
import { adminApi, ApiError } from "@/lib/api";
import type { AdminWordView, CsvRow } from "@/lib/api/admin";
import {
  useCreateWord,
  useDeleteWord,
  useExportWords,
  useImportWords,
  useUpdateWord,
  useAdminWords,
} from "@/lib/hooks/use-admin";
import { ADMIN_PAGE_SIZE, WORD_GROUPS } from "@/lib/admin/constants";
import { fmtDate } from "@/lib/admin/format";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { Modal } from "@/components/lexi/modal";
import { AdminBadge } from "@/components/admin/badge";
import { AdminSelect } from "@/components/admin/select";
import { AdminIconButton } from "@/components/admin/icon-button";
import { SearchInput } from "@/components/admin/search-input";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { ErrorCard, LoadingRows } from "@/components/admin/table-states";
import { FieldLabel, FormError, TextField } from "@/components/admin/form-fields";

const GROUP_FILTER_OPTS = [
  { value: "all", label: "Tất cả nhóm" },
  ...WORD_GROUPS.map((g) => ({ value: g, label: g })),
];
const GROUP_OPTS = WORD_GROUPS.map((g) => ({ value: g, label: g }));

const CSV_SAMPLE =
  "perseverance;sự kiên trì;Văn phòng\ninvoice;hóa đơn;Tài chính\n;thiếu từ;Du lịch\nrevenue;doanh thu;Tài chính\nbudget;ngân sách;Tài chính";

const COLS = "150px minmax(0,1fr) 150px 120px 92px";

function msg(e: unknown, fallback: string) {
  return e instanceof ApiError ? e.message : fallback;
}

type ModalState =
  | { kind: "form"; id: string | null; word: string; meaning: string; group: string; error: string }
  | { kind: "delete"; target: AdminWordView }
  | { kind: "csv"; text: string; rows: CsvRow[] | null }
  | null;

export default function AdminWordsPage() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<ModalState>(null);

  const query = useAdminWords({
    search: q || undefined,
    group: group === "all" ? undefined : group,
    page: page + 1,
    limit: ADMIN_PAGE_SIZE,
  });

  const createWord = useCreateWord();
  const updateWord = useUpdateWord();
  const deleteWord = useDeleteWord();
  const importWords = useImportWords();
  const exportWords = useExportWords();

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const from = total ? page * ADMIN_PAGE_SIZE + 1 : 0;
  const to = Math.min((page + 1) * ADMIN_PAGE_SIZE, total);

  function resetTo(first: boolean) {
    if (first) setPage(0);
  }

  function openAdd() {
    setModal({ kind: "form", id: null, word: "", meaning: "", group: WORD_GROUPS[0], error: "" });
  }
  function openEdit(w: AdminWordView) {
    setModal({ kind: "form", id: w.id, word: w.word, meaning: w.meaning, group: w.group, error: "" });
  }

  async function saveWord() {
    if (modal?.kind !== "form") return;
    const input = { word: modal.word, meaning: modal.meaning, group: modal.group };
    if (!input.word.trim() || !input.meaning.trim()) {
      setModal({ ...modal, error: "Vui lòng nhập đầy đủ từ và nghĩa." });
      return;
    }
    try {
      if (modal.id) {
        await updateWord.mutateAsync({ id: modal.id, input });
        toast.success("Đã lưu", { description: `Cập nhật từ "${input.word.trim()}".` });
      } else {
        await createWord.mutateAsync(input);
        setPage(0);
        toast.success("Đã thêm từ", { description: `"${input.word.trim()}" đã vào Word list.` });
      }
      setModal(null);
    } catch (e) {
      setModal({ ...modal, error: msg(e, "Không lưu được từ.") });
    }
  }

  async function confirmDelete() {
    if (modal?.kind !== "delete") return;
    const w = modal.target;
    try {
      await deleteWord.mutateAsync(w.id);
      // Stepping back if this was the last row on a non-first page.
      if (items.length === 1 && page > 0) setPage((p) => p - 1);
      setModal(null);
      toast.success("Đã xóa", { description: `Đã xóa "${w.word}" khỏi list lọc.` });
    } catch (e) {
      toast.error(msg(e, "Không xóa được từ."));
    }
  }

  async function runExport() {
    try {
      const { csv, count } = await exportWords.mutateAsync();
      downloadCsv(csv);
      toast.info("Đã xuất CSV", { description: `Sao lưu ${count} từ ra file.` });
    } catch (e) {
      toast.error(msg(e, "Không xuất được CSV."));
    }
  }

  async function confirmCsv() {
    if (modal?.kind !== "csv") return;
    try {
      const res = await importWords.mutateAsync({ text: modal.text, commit: true });
      if (!res.added) {
        toast.error("Không có dòng hợp lệ", { description: "Kiểm tra lại định dạng file." });
        return;
      }
      setModal(null);
      setPage(0);
      toast.success(`Đã nhập ${res.added} từ`, { description: `${res.skipped} dòng lỗi đã bỏ qua.` });
    } catch (e) {
      toast.error(msg(e, "Không nhập được CSV."));
    }
  }

  return (
    <div className="animate-lx-fade mx-auto max-w-[1080px]">
      {/* Toolbar */}
      <div className="mb-[18px] flex flex-wrap items-center gap-3">
        <SearchInput
          value={q}
          onChange={(v) => { setQ(v); resetTo(true); }}
          placeholder="Tìm từ hoặc nghĩa…"
          className="min-w-[220px] flex-1 sm:max-w-[340px]"
        />
        <AdminSelect
          value={group}
          onChange={(v) => { setGroup(v); resetTo(true); }}
          options={GROUP_FILTER_OPTS}
          aria-label="Lọc theo nhóm"
          className="w-[180px]"
        />
        <div className="hidden flex-1 sm:block" />
        <ChunkyButton variant="secondary" iconLeft="download" onClick={runExport} disabled={exportWords.isPending}>
          Xuất CSV
        </ChunkyButton>
        <ChunkyButton variant="secondary" iconLeft="upload" onClick={() => setModal({ kind: "csv", text: CSV_SAMPLE, rows: null })}>
          Nhập CSV
        </ChunkyButton>
        <ChunkyButton variant="primary" iconLeft="plus" onClick={openAdd}>
          Thêm từ
        </ChunkyButton>
      </div>

      {query.isPending ? (
        <LoadingRows />
      ) : query.isError ? (
        <ErrorCard onRetry={() => query.refetch()} />
      ) : total === 0 ? (
        <EmptyState
          glyph="list-plus"
          title={q || group !== "all" ? "Không có từ khớp bộ lọc" : "Chưa có từ nào"}
          desc="Thêm từ mới hoặc nhập hàng loạt từ file CSV."
        >
          <ChunkyButton variant="primary" iconLeft="plus" onClick={openAdd}>Thêm từ đầu tiên</ChunkyButton>
          <ChunkyButton variant="secondary" iconLeft="upload" onClick={() => setModal({ kind: "csv", text: CSV_SAMPLE, rows: null })}>
            Nhập CSV
          </ChunkyButton>
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid items-center gap-3 bg-cloud-100 px-[18px] py-3 text-[11.5px] font-extrabold tracking-[0.04em] text-ink-400 uppercase" style={{ gridTemplateColumns: COLS }}>
                <div>Từ</div>
                <div>Nghĩa gợi ý</div>
                <div>Nhóm</div>
                <div>Cập nhật</div>
                <div className="text-right">Thao tác</div>
              </div>
              {items.map((w) => (
                <div key={w.id} className="grid items-center gap-3 border-t border-[var(--border-subtle)] px-[18px] py-3 text-[14px] hover:bg-cloud-50" style={{ gridTemplateColumns: COLS }}>
                  <div className="truncate font-extrabold text-ink-900">{w.word}</div>
                  <div className="truncate font-semibold text-ink-600">{w.meaning}</div>
                  <div><AdminBadge tone="neutral">{w.group}</AdminBadge></div>
                  <div className="text-[13px] font-bold text-ink-400">{fmtDate(w.updated)}</div>
                  <div className="flex justify-end gap-1">
                    <AdminIconButton icon="pencil" aria-label="Sửa" onClick={() => openEdit(w)} />
                    <AdminIconButton icon="trash-2" aria-label="Xóa" onClick={() => setModal({ kind: "delete", target: w })} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Pagination
            info={`${from}–${to} / ${total} từ`}
            page={page}
            pages={pages}
            onPrev={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => Math.min(pages - 1, p + 1))}
          />
        </div>
      )}

      {/* Add / edit modal */}
      <Modal open={modal?.kind === "form"} onClose={() => setModal(null)} maxWidth={460}>
        {modal?.kind === "form" && (
          <>
            <div className="mb-[18px] font-display text-[21px] font-semibold text-ink-900">
              {modal.id ? "Sửa từ" : "Thêm từ mới"}
            </div>
            <FieldLabel>Từ (tiếng Anh)</FieldLabel>
            <TextField value={modal.word} onChange={(v) => setModal({ ...modal, word: v, error: "" })} placeholder="ví dụ: negotiate" />
            <FieldLabel>Nghĩa gợi ý</FieldLabel>
            <TextField value={modal.meaning} onChange={(v) => setModal({ ...modal, meaning: v, error: "" })} placeholder="ví dụ: đàm phán" />
            <FieldLabel>Nhóm</FieldLabel>
            <AdminSelect value={modal.group} onChange={(v) => setModal({ ...modal, group: v })} options={GROUP_OPTS} aria-label="Nhóm" className="w-full" />
            {modal.error && <FormError>{modal.error}</FormError>}
            <div className="mt-[22px] flex justify-end gap-2.5">
              <ChunkyButton variant="ghost" onClick={() => setModal(null)}>Hủy</ChunkyButton>
              <ChunkyButton variant="primary" iconLeft="check" onClick={saveWord} disabled={createWord.isPending || updateWord.isPending}>
                Lưu
              </ChunkyButton>
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
            <div className="font-display text-xl font-semibold text-ink-900">Xóa từ này?</div>
            <div className="mt-2 mb-1 text-[13.5px] font-semibold text-ink-500">
              Xóa <b className="text-ink-800">{modal.target.word}</b> khỏi list lọc. Từ người học đã lưu trong sổ cá nhân <b>không</b> bị ảnh hưởng.
            </div>
            <div className="mt-5 flex justify-center gap-2.5">
              <ChunkyButton variant="ghost" onClick={() => setModal(null)}>Hủy</ChunkyButton>
              <ChunkyButton variant="danger" iconLeft="trash-2" onClick={confirmDelete} disabled={deleteWord.isPending}>Xóa từ</ChunkyButton>
            </div>
          </>
        )}
      </Modal>

      {/* CSV import modal */}
      <Modal open={modal?.kind === "csv"} onClose={() => setModal(null)} maxWidth={560} className="max-h-[88vh] overflow-auto">
        {modal?.kind === "csv" && (
          <CsvModalBody
            modal={modal}
            setModal={setModal}
            confirming={importWords.isPending}
            onConfirm={confirmCsv}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function downloadCsv(csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "toeic-words.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function CsvModalBody({
  modal,
  setModal,
  confirming,
  onConfirm,
  onCancel,
}: {
  modal: { kind: "csv"; text: string; rows: CsvRow[] | null };
  setModal: (m: ModalState) => void;
  confirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [previewing, setPreviewing] = useState(false);
  const rows = modal.rows;
  const validCount = rows?.filter((r) => r.ok).length ?? 0;
  const errorCount = (rows?.length ?? 0) - validCount;

  async function preview() {
    setPreviewing(true);
    try {
      const res = await adminApi.importWords(modal.text, false);
      setModal({ ...modal, rows: res.rows });
    } catch (e) {
      toast.error(msg(e, "Không xem trước được."));
    } finally {
      setPreviewing(false);
    }
  }

  return (
    <>
      <div className="mb-1 font-display text-[21px] font-semibold text-ink-900">Nhập từ CSV</div>
      <div className="mb-3.5 text-[12.5px] font-bold text-ink-400">
        Mỗi dòng: <code className="rounded-md bg-cloud-100 px-1.5 py-px font-mono">từ;nghĩa;nhóm</code>
      </div>
      <textarea
        value={modal.text}
        onChange={(e) => setModal({ ...modal, text: e.target.value, rows: null })}
        spellCheck={false}
        className="h-[130px] w-full resize-y rounded-xl border-2 border-[var(--border-default)] bg-white px-3.5 py-3 font-mono text-[13px] leading-relaxed text-ink-800 outline-none focus:border-grape-400"
      />

      {rows && (
        <div className="mt-4">
          <div className="mb-3 flex gap-2.5">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-leaf-100 px-3.5 py-2.5">
              <Icon glyph="check-circle-2" px={20} color="var(--leaf-600)" />
              <span className="text-[13.5px] font-extrabold text-leaf-600">{validCount} dòng hợp lệ</span>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-berry-100 px-3.5 py-2.5">
              <Icon glyph="x-circle" px={20} color="var(--berry-600)" />
              <span className="text-[13.5px] font-extrabold text-berry-600">{errorCount} dòng lỗi</span>
            </div>
          </div>
          <div className="max-h-[190px] overflow-y-auto rounded-xl border border-[var(--border-subtle)]">
            {rows.map((r) => (
              <div key={r.line} className="flex items-center gap-2.5 border-t border-[var(--border-subtle)] px-3.5 py-2.5 text-[13px] first:border-t-0" style={{ background: r.ok ? "#fff" : "var(--berry-100)" }}>
                <span className="w-6 flex-none font-mono text-[11.5px] text-ink-300">{r.line}</span>
                <Icon glyph={r.ok ? "check-circle-2" : "x-circle"} px={16} color={r.ok ? "var(--leaf-600)" : "var(--berry-600)"} />
                <span className="min-w-0 flex-1 truncate font-bold text-ink-700">{r.raw}</span>
                <span className="flex-none text-[12px] font-bold" style={{ color: r.ok ? "var(--leaf-600)" : "var(--berry-600)" }}>{r.ok ? "Hợp lệ" : r.err}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-[22px] flex justify-end gap-2.5">
        <ChunkyButton variant="ghost" onClick={onCancel}>Hủy</ChunkyButton>
        {!rows ? (
          <ChunkyButton variant="secondary" iconLeft="eye" onClick={preview} disabled={previewing}>
            {previewing ? "Đang kiểm tra…" : "Xem trước"}
          </ChunkyButton>
        ) : (
          <ChunkyButton variant="success" iconLeft="download" onClick={onConfirm} disabled={confirming || validCount === 0}>
            Nhập {validCount} từ
          </ChunkyButton>
        )}
      </div>
    </>
  );
}
