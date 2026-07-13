"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { useLogin, useMe, useRegister } from "@/lib/hooks/use-auth";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";

const STATS = [
  { value: "32M", label: "learners" },
  { value: "2.4×", label: "retention" },
  { value: "4.9★", label: "app rating" },
];

export default function LoginPage() {
  const router = useRouter();
  const { data: me } = useMe();
  const loginMut = useLogin();
  const registerMut = useRegister();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  // Already signed in (e.g. landed here with a live session) → skip the form.
  useEffect(() => {
    if (me) router.replace("/dashboard");
  }, [me, router]);

  const isLogin = mode === "login";
  const busy = loginMut.isPending || registerMut.isPending;

  function doAuth() {
    if (busy) return;
    const trimmed = email.trim();
    if (!trimmed || !pass) {
      toast.error("Enter your email and password.");
      return;
    }

    const mutation = isLogin ? loginMut : registerMut;
    mutation.mutate(
      { email: trimmed, password: pass },
      {
        onSuccess: () => {
          toast.success(isLogin ? "Welcome back!" : "Account created!", {
            description: "Let's go! Ready to learn.",
          });
          router.replace("/dashboard");
        },
        onError: (err) => {
          const msg =
            err instanceof ApiError
              ? err.message
              : "Something went wrong. Please try again.";
          toast.error(msg);
        },
      },
    );
  }

  function comingSoon() {
    toast.info("Google sign-in is coming soon.");
  }

  return (
    <div className="flex min-h-dvh items-stretch">
      {/* Brand panel */}
      <div
        className="relative hidden flex-1 flex-col justify-between overflow-hidden p-14 lg:flex"
        style={{ background: "var(--grape-500)" }}
      >
        <div className="absolute -top-[120px] -right-[120px] size-[420px] rounded-full bg-white/10" />
        <div className="absolute -bottom-[90px] -left-[60px] size-[300px] rounded-full bg-[rgba(255,201,60,0.18)]" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white">
            <Icon glyph="languages" px={24} color="var(--grape-600)" />
          </div>
          <span className="font-display text-[28px] font-semibold text-white">
            Lexi
          </span>
        </div>

        <div className="relative">
          <div className="font-display text-[46px] leading-[1.1] font-semibold tracking-tight text-white">
            Learn English
            <br />
            you&apos;ll actually use.
          </div>
          <div className="mt-4 max-w-[420px] text-lg leading-relaxed text-white/85">
            Your AI tutor for vocabulary, grammar, real conversations and TOEIC —
            five focused minutes a day.
          </div>
          <div className="mt-8 flex gap-7">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl font-semibold text-white">
                  {s.value}
                </div>
                <div className="text-[13px] font-bold text-white/75">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-[13px] font-bold text-white/70">
          Well done! · Powered by AI
        </div>
      </div>

      {/* Form panel */}
      <div
        className="flex flex-1 items-center justify-center p-8"
        style={{ background: "var(--cloud-50)" }}
      >
        <div className="w-full max-w-[400px]">
          <div className="mb-7 flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-[11px] bg-grape-500">
              <Icon glyph="languages" px={22} color="#fff" />
            </div>
            <span className="font-display text-2xl font-semibold text-ink-900">
              Lexi
            </span>
          </div>

          <div className="font-display text-3xl font-semibold text-ink-900">
            {isLogin ? "Welcome back" : "Create your account"}
          </div>
          <div className="mt-1.5 mb-6 font-semibold text-ink-500">
            {isLogin
              ? "Log in to keep your streak going."
              : "Start learning in under a minute."}
          </div>

          <button
            onClick={comingSoon}
            className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[14px] border-2 border-[var(--border-default)] bg-white p-3 text-[15px] font-extrabold text-ink-700 hover:bg-cloud-100"
          >
            <Icon glyph="chrome" px={20} color="var(--grape-500)" /> Continue with
            Google
          </button>

          <div className="my-[18px] flex items-center gap-3 text-[13px] font-bold text-ink-400">
            <div className="h-px flex-1 bg-[var(--border-default)]" />
            or
            <div className="h-px flex-1 bg-[var(--border-default)]" />
          </div>

          <label className="mb-1.5 block text-[13px] font-extrabold text-ink-700">
            Email
          </label>
          <div className="relative mb-3.5">
            <span className="absolute top-1/2 left-3.5 -translate-y-1/2">
              <Icon glyph="mail" px={18} color="var(--ink-400)" />
            </span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-[14px] border-2 border-[var(--border-default)] py-[13px] pr-3.5 pl-[42px] text-[15px] font-semibold outline-none focus:border-grape-500"
            />
          </div>

          <label className="mb-1.5 block text-[13px] font-extrabold text-ink-700">
            Password
          </label>
          <div className="relative mb-1.5">
            <span className="absolute top-1/2 left-3.5 -translate-y-1/2">
              <Icon glyph="lock" px={18} color="var(--ink-400)" />
            </span>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-[14px] border-2 border-[var(--border-default)] py-[13px] pr-3.5 pl-[42px] text-[15px] font-semibold outline-none focus:border-grape-500"
            />
          </div>

          {!isLogin && (
            <>
              <div className="my-2.5 flex gap-1.5">
                <div className="h-[5px] flex-1 rounded-full bg-leaf-400" />
                <div className="h-[5px] flex-1 rounded-full bg-leaf-400" />
                <div className="h-[5px] flex-1 rounded-full bg-sun-400" />
                <div className="h-[5px] flex-1 rounded-full bg-cloud-200" />
              </div>
              <div className="mb-2 text-xs font-bold text-ink-500">
                Password strength: good
              </div>
            </>
          )}

          {isLogin && (
            <div className="my-2.5 mb-[18px] flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-ink-600">
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-4 accent-grape-500"
                />{" "}
                Remember me
              </label>
              <a className="cursor-pointer text-sm font-extrabold text-grape-600">
                Forgot password?
              </a>
            </div>
          )}

          <div className="mt-3.5">
            <ChunkyButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={doAuth}
              disabled={busy}
            >
              {busy
                ? isLogin
                  ? "Logging in…"
                  : "Creating account…"
                : isLogin
                  ? "Log in"
                  : "Create account"}
            </ChunkyButton>
          </div>

          <div className="mt-5 text-center text-sm font-bold text-ink-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(isLogin ? "register" : "login")}
              className="cursor-pointer font-extrabold text-grape-600"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
