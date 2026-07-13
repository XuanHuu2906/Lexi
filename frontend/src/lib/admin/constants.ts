import type { Difficulty } from "@/lib/api/admin";

/** Rows per page for admin tables (matches the design + backend default). */
export const ADMIN_PAGE_SIZE = 7;

/**
 * Common word groups offered in the filter + add-word form. `toeic_words.group`
 * is free-form (CSV import can introduce others), so this is a convenience list,
 * not an exhaustive enum.
 */
export const WORD_GROUPS = [
  "Kinh doanh",
  "Văn phòng",
  "Du lịch",
  "Kỹ thuật",
  "Tài chính",
] as const;

/** Difficulty options for form selects (enum value + Vietnamese label). */
export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "EASY", label: "Dễ" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HARD", label: "Khó" },
];
