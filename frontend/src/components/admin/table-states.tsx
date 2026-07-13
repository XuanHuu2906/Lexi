import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";

/** Loading placeholder card for admin tables. */
export function LoadingRows() {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-white p-[60px] font-bold text-ink-500">
      <Icon
        glyph="loader-circle"
        px={22}
        color="var(--grape-500)"
        className="animate-lx-spin"
      />
      Đang tải…
    </div>
  );
}

/** Error card with a retry action for admin tables. */
export function ErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-berry-400 bg-white px-5 py-[52px] text-center">
      <div className="font-display text-xl font-semibold">
        Không tải được dữ liệu
      </div>
      <div className="mt-1 mb-4 font-semibold text-ink-500">
        Kiểm tra kết nối rồi thử lại.
      </div>
      <ChunkyButton variant="secondary" iconLeft="refresh-cw" onClick={onRetry}>
        Thử lại
      </ChunkyButton>
    </div>
  );
}
