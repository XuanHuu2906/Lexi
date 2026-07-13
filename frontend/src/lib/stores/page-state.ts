"use client";

import { useCallback, useState } from "react";
import { create } from "zustand";

// In-memory bag of per-page UI state. It lives as long as the browser tab does,
// so it survives client-side navigation (leaving a page unmounts its component,
// but this store stays put) yet resets on a full refresh — exactly the "keep my
// place while I'm using the app" behaviour we want, without touching the URL or
// localStorage.
//
// Keys are namespaced strings like "vocab:filter". Values are stored opaquely;
// `usePageState` re-applies the caller's type.
type PageStateStore = {
  values: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  /** Drop every key under a namespace, e.g. reset("vocab:"). */
  reset: (prefix: string) => void;
};

export const usePageStateStore = create<PageStateStore>((set) => ({
  values: {},
  set: (key, value) =>
    set((s) => ({ values: { ...s.values, [key]: value } })),
  reset: (prefix) =>
    set((s) => {
      const values: Record<string, unknown> = {};
      for (const k of Object.keys(s.values)) {
        if (!k.startsWith(prefix)) values[k] = s.values[k];
      }
      return { values };
    }),
}));

/**
 * A drop-in replacement for `useState` whose value is kept in the shared
 * in-memory store above, so it persists across navigation and resets on
 * refresh. The signature mirrors `useState` — including lazy initialisers and
 * functional updates — so converting a page is just swapping the hook and
 * giving it a stable, unique `key`.
 *
 *   const [filter, setFilter] = usePageState<Filter>("vocab:filter", "all");
 */
export function usePageState<T>(
  key: string,
  initial: T | (() => T),
): [T, (next: T | ((prev: T) => T)) => void] {
  const has = usePageStateStore((s) => key in s.values);
  const stored = usePageStateStore((s) => s.values[key]) as T | undefined;

  // Resolve the caller's initial exactly once — useState's own lazy init gives
  // us "run at most once" without touching a ref during render.
  const [initialValue] = useState(() =>
    typeof initial === "function" ? (initial as () => T)() : initial,
  );

  const value = has ? (stored as T) : initialValue;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const state = usePageStateStore.getState();
      const prev = (
        key in state.values ? state.values[key] : initialValue
      ) as T;
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      state.set(key, resolved);
    },
    [key, initialValue],
  );

  return [value, setValue];
}
