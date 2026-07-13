import { icons } from "lucide-react";
import type { ComponentProps } from "react";

type LucideCmp = (typeof icons)["Circle"];
type LucideBaseProps = ComponentProps<LucideCmp>;

export interface IconProps extends Omit<LucideBaseProps, "ref"> {
  /** kebab-case Lucide glyph name, e.g. "book-marked", "chevron-right" */
  glyph: string;
  /** pixel size (width & height) */
  px?: number;
}

function toPascalCase(glyph: string): string {
  return glyph
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Thin wrapper over lucide-react so callers reference glyph names as strings
 * (matching the Lexi design), not raw imports.
 *
 * NOTE: imports the full `icons` record for ergonomic dynamic lookup. Phase 6
 * optimization: swap to per-icon imports or lucide's DynamicIcon to trim bundle.
 */
export function Icon({ glyph, px = 20, strokeWidth = 2.2, ...rest }: IconProps) {
  const key = toPascalCase(glyph) as keyof typeof icons;
  const Cmp = icons[key] ?? icons.Circle;
  return <Cmp size={px} strokeWidth={strokeWidth} {...rest} />;
}
