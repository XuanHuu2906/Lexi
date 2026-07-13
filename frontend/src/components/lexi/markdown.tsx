import { Fragment, type ReactNode } from "react";

/**
 * Tiny, dependency-free Markdown renderer for AI answers (grammar coach etc.).
 * Handles the subset the model actually emits: headings, **bold**, *italic*,
 * `inline code`, and unordered / ordered lists. Everything else falls back to
 * plain paragraphs with line breaks preserved. Not a full CommonMark parser —
 * deliberately small so we avoid a heavy dependency.
 */

// ── Inline: **bold**, *italic* / _italic_, `code` ──
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Match the first of: bold, code, italic. Ordered so ** wins over *.
  const re = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\*([^*]+)\*)|(_([^_]+)_)/;
  let rest = text;
  let i = 0;
  while (rest.length > 0) {
    const m = re.exec(rest);
    if (!m) {
      nodes.push(<Fragment key={`${keyPrefix}-t${i}`}>{rest}</Fragment>);
      break;
    }
    if (m.index > 0) {
      nodes.push(
        <Fragment key={`${keyPrefix}-t${i}`}>
          {rest.slice(0, m.index)}
        </Fragment>,
      );
    }
    if (m[2] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-extrabold">
          {m[2]}
        </strong>,
      );
    } else if (m[4] !== undefined) {
      nodes.push(
        <code
          key={`${keyPrefix}-c${i}`}
          className="rounded bg-cloud-200 px-1 py-px font-mono text-[0.9em] text-ink-800"
        >
          {m[4]}
        </code>,
      );
    } else {
      const italic = m[6] ?? m[8];
      nodes.push(
        <em key={`${keyPrefix}-i${i}`} className="italic">
          {italic}
        </em>,
      );
    }
    rest = rest.slice(m.index + m[0].length);
    i++;
  }
  return nodes;
}

interface Block {
  type: "h" | "ul" | "ol" | "p";
  level?: number;
  items?: string[];
  text?: string;
}

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join("\n") });
      para = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      flushPara();
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    const bullet = /^[-*+]\s+(.*)$/.exec(trimmed);
    const ordered = /^\d+[.)]\s+(.*)$/.exec(trimmed);

    if (heading) {
      flushPara();
      blocks.push({ type: "h", level: heading[1].length, text: heading[2] });
    } else if (bullet) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last?.type === "ul") last.items!.push(bullet[1]);
      else blocks.push({ type: "ul", items: [bullet[1]] });
    } else if (ordered) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last?.type === "ol") last.items!.push(ordered[1]);
      else blocks.push({ type: "ol", items: [ordered[1]] });
    } else {
      para.push(trimmed);
    }
  }
  flushPara();
  return blocks;
}

export function Markdown({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  return (
    <div className="flex flex-col gap-2">
      {blocks.map((b, i) => {
        if (b.type === "h") {
          const size =
            b.level === 1 ? "text-lg" : b.level === 2 ? "text-base" : "text-[15px]";
          return (
            <div key={i} className={`font-extrabold text-ink-900 ${size}`}>
              {renderInline(b.text ?? "", `h${i}`)}
            </div>
          );
        }
        if (b.type === "ul" || b.type === "ol") {
          const List = b.type === "ul" ? "ul" : "ol";
          return (
            <List
              key={i}
              className={
                b.type === "ul"
                  ? "list-disc pl-5 flex flex-col gap-1"
                  : "list-decimal pl-5 flex flex-col gap-1"
              }
            >
              {b.items!.map((it, j) => (
                <li key={j}>{renderInline(it, `l${i}-${j}`)}</li>
              ))}
            </List>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {renderInline(b.text ?? "", `p${i}`)}
          </p>
        );
      })}
    </div>
  );
}
