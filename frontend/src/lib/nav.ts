export interface NavItem {
  href: string;
  label: string;
  glyph: string;
  /** when true, show the "due" count badge (Review) */
  dueBadge?: boolean;
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Learn",
    items: [
      { href: "/dashboard", label: "Home", glyph: "layout-dashboard" },
      { href: "/lookup", label: "Look up", glyph: "search" },
      { href: "/vocab", label: "Vocabulary", glyph: "book-marked" },
      { href: "/context", label: "Context reading", glyph: "newspaper" },
    ],
  },
  {
    heading: "Practice",
    items: [
      { href: "/review", label: "Review (SRS)", glyph: "repeat", dueBadge: true },
      { href: "/flashcards", label: "Flashcards", glyph: "layers" },
      { href: "/quiz", label: "Quiz", glyph: "list-checks" },
      { href: "/dictation", label: "Dictation", glyph: "headphones" },
    ],
  },
  {
    heading: "AI coach",
    items: [
      { href: "/conversation", label: "Conversation", glyph: "messages-square" },
      { href: "/tutor", label: "Ask Lexi", glyph: "lightbulb" },
      { href: "/pronunciation", label: "Pronunciation", glyph: "mic" },
      { href: "/writing", label: "Writing", glyph: "pen-line" },
      { href: "/grammar", label: "Grammar Q&A", glyph: "graduation-cap" },
    ],
  },
  {
    heading: "Library",
    items: [
      { href: "/vault", label: "Grammar vault", glyph: "library-big" },
      { href: "/settings", label: "Settings", glyph: "settings" },
    ],
  },
];
