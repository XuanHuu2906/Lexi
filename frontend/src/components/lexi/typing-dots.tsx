import { Icon } from "./icon";

export interface TypingDotsProps {
  glyph?: string;
  glyphPx?: number;
}

/** AI "typing…" indicator: avatar + three bouncing dots. */
export function TypingDots({ glyph = "bot", glyphPx = 20 }: TypingDotsProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-[34px] flex-none items-center justify-center rounded-full bg-grape-500">
        <Icon glyph={glyph} px={glyphPx} color="#fff" />
      </div>
      <div className="flex gap-1 rounded-2xl bg-cloud-100 px-4 py-3.5">
        {[0, 0.15, 0.3].map((d) => (
          <span
            key={d}
            className="size-[7px] rounded-full bg-ink-300"
            style={{ animation: `lx-dot 1s infinite ${d}s` }}
          />
        ))}
      </div>
    </div>
  );
}
