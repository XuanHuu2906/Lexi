// Display helpers for the admin area: date/email formatting and the
// enum→label/tone maps that turn backend values into UI copy.

import type {
  AdminUserRole,
  AuditActionValue,
  Difficulty,
} from "@/lib/api/admin";
import type { Tone } from "./types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** ISO datetime → `DD/MM/YYYY` (local). */
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** ISO datetime → `DD/MM/YYYY · HH:mm` (local). */
export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** `minhtran@gmail.com` → `mi***@gmail.com`. */
export function maskEmail(e: string): string {
  const i = e.indexOf("@");
  if (i < 0) return e;
  return `${e.slice(0, 2)}***${e.slice(i)}`;
}

/** Friendly display name from an email (`minh.tran@x` → `Minh Tran`). */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] || email;
  return (
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ") || email
  );
}

/** Two-letter initials from a display name. */
export function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  return (p[0][0] + (p[p.length - 1][0] ?? "")).toUpperCase();
}

const AVATAR_COLORS = [
  "var(--grape-500)",
  "var(--coral-400)",
  "var(--sky-500)",
  "var(--leaf-500)",
  "var(--sun-500)",
];

/** Deterministic avatar background from a stable id. */
export function avatarColor(id: string): string {
  let h = 0;
  for (let k = 0; k < id.length; k++) h += id.charCodeAt(k);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ── Enum → UI copy ──────────────────────────────────────────
const DIFF_LABEL: Record<Difficulty, string> = {
  EASY: "Dễ",
  MEDIUM: "Trung bình",
  HARD: "Khó",
};
const DIFF_TONE: Record<Difficulty, Tone> = {
  EASY: "success",
  MEDIUM: "warning",
  HARD: "danger",
};

export function difficultyLabel(d: Difficulty): string {
  return DIFF_LABEL[d] ?? d;
}
export function difficultyTone(d: Difficulty): Tone {
  return DIFF_TONE[d] ?? "neutral";
}

export function roleLabel(r: AdminUserRole): string {
  return r === "ADMIN" ? "Admin" : "Người học";
}

const ACTION_META: Record<AuditActionValue, { label: string; tone: Tone }> = {
  CREATE: { label: "Thêm", tone: "success" },
  UPDATE: { label: "Sửa", tone: "info" },
  DELETE: { label: "Xóa", tone: "danger" },
  LOCK: { label: "Khóa", tone: "warning" },
  UNLOCK: { label: "Mở khóa", tone: "success" },
  TOGGLE: { label: "Bật/Tắt", tone: "neutral" },
  IMPORT: { label: "Nhập CSV", tone: "brand" },
  EXPORT: { label: "Xuất CSV", tone: "neutral" },
};

export function actionMeta(a: AuditActionValue): { label: string; tone: Tone } {
  return ACTION_META[a] ?? { label: a, tone: "neutral" };
}
