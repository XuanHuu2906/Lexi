// Admin sidebar routes + per-screen header copy.

export interface AdminNavItem {
  href: string;
  label: string;
  glyph: string;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Tổng quan", glyph: "layout-dashboard" },
  { href: "/admin/words", label: "Word list TOEIC", glyph: "list-checks" },
  { href: "/admin/situations", label: "Tình huống hội thoại", glyph: "messages-square" },
  { href: "/admin/users", label: "Người dùng", glyph: "users" },
  { href: "/admin/audit", label: "Nhật ký thao tác", glyph: "scroll-text" },
];

/** `[title, subtitle]` shown in the admin top bar for each route. */
export const ADMIN_TITLES: Record<string, [string, string]> = {
  "/admin": ["Tổng quan Quản trị", "Sức khỏe hệ thống ở mức tổng hợp"],
  "/admin/words": [
    "Word list TOEIC",
    "Nguồn dữ liệu lọc từ đồng nghĩa do AI sinh",
  ],
  "/admin/situations": [
    "Tình huống hội thoại",
    "Ngân hàng tình huống luyện nói của người học",
  ],
  "/admin/users": ["Người dùng", "Giám sát metadata & khóa/mở khóa tài khoản"],
  "/admin/audit": ["Nhật ký thao tác", "Truy vết mọi hành động ghi của admin"],
};
