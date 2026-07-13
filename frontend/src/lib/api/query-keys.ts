// Centralized TanStack Query keys. One source of truth so queries and the
// mutations that invalidate them can't drift apart. Keys are hierarchical:
// invalidating a parent (`["words"]`) sweeps every child list/detail under it.

export const queryKeys = {
  me: ["me"] as const,

  words: {
    all: ["words"] as const,
    list: (params?: unknown) => ["words", "list", params ?? {}] as const,
    detail: (id: string) => ["words", "detail", id] as const,
  },

  grammar: {
    all: ["grammar"] as const,
    list: (params?: unknown) => ["grammar", "list", params ?? {}] as const,
    detail: (id: string) => ["grammar", "detail", id] as const,
  },

  review: {
    all: ["review"] as const,
    due: ["review", "due"] as const,
    flashcards: ["review", "flashcards"] as const,
  },

  quiz: {
    all: ["quiz"] as const,
    detail: (id: string) => ["quiz", "detail", id] as const,
  },

  stats: {
    all: ["stats"] as const,
    overview: ["stats", "overview"] as const,
    streak: ["stats", "streak"] as const,
    badges: ["stats", "badges"] as const,
  },

  conversation: {
    all: ["conversation"] as const,
    list: ["conversation", "list"] as const,
    detail: (id: string) => ["conversation", "detail", id] as const,
  },

  chat: {
    all: ["chat"] as const,
    list: (kind: string) => ["chat", "list", kind] as const,
    detail: (id: string) => ["chat", "detail", id] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    list: ["notifications", "list"] as const,
  },

  admin: {
    all: ["admin"] as const,
    overview: ["admin", "overview"] as const,
    words: (params?: unknown) => ["admin", "words", params ?? {}] as const,
    scenarios: (params?: unknown) =>
      ["admin", "scenarios", params ?? {}] as const,
    users: (params?: unknown) => ["admin", "users", params ?? {}] as const,
    audit: (params?: unknown) => ["admin", "audit", params ?? {}] as const,
    auditAdmins: ["admin", "audit", "admins"] as const,
  },
} as const;
