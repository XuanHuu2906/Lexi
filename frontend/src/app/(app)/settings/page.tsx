"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { ApiSettings, CefrLevel } from "@/lib/api";
import { useMe } from "@/lib/hooks/use-auth";
import { useUpdateSettings } from "@/lib/hooks/use-settings";
import {
  getPushState,
  subscribeToPush,
  unsubscribeFromPush,
  type PushState,
} from "@/lib/push";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_TOPICS = [
  "Business",
  "Travel",
  "Technology",
  "Food",
  "Health",
  "Sports",
  "Movies",
  "Music",
];
const CEFR: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const DEFAULTS: ApiSettings = {
  dailyGoal: 10,
  cefrLevel: "B1",
  topics: [],
  reminderTime: "20:00",
  notifyEnabled: true,
  ttsVoice: "EN_US",
};

/** Per-device Web Push opt-in. Manages permission + subscription itself. */
function PushToggle() {
  const [state, setState] = useState<PushState | "loading">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPushState().then(setState);
  }, []);

  async function toggle(on: boolean) {
    setBusy(true);
    try {
      if (on) {
        await subscribeToPush();
        setState("subscribed");
        toast.success("Push enabled", {
          description: "You'll get reminders on this device.",
        });
      } else {
        await unsubscribeFromPush();
        setState("unsubscribed");
        toast.info("Push disabled on this device");
      }
    } catch (err) {
      setState(await getPushState());
      toast.error(
        err instanceof Error ? err.message : "Couldn't update push settings.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") {
    return <span className="text-[13px] font-bold text-ink-400">…</span>;
  }
  if (state === "unsupported") {
    return (
      <span className="text-[13px] font-bold text-ink-400">Not supported</span>
    );
  }
  if (state === "denied") {
    return (
      <span className="text-[13px] font-bold text-coral-500">
        Blocked in browser
      </span>
    );
  }
  return (
    <Switch
      checked={state === "subscribed"}
      disabled={busy}
      onCheckedChange={toggle}
    />
  );
}

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-5">
      <div>
        <div className="font-extrabold text-ink-800">{title}</div>
        <div className="text-[13px] font-semibold text-ink-500">{desc}</div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const me = useMe();

  if (me.isPending) {
    return (
      <div className="flex items-center justify-center gap-3 p-[80px] font-bold text-ink-500">
        <Icon
          glyph="loader-circle"
          px={24}
          color="var(--grape-500)"
          className="animate-lx-spin"
        />{" "}
        Loading settings…
      </div>
    );
  }

  // Remount the form when server settings arrive so its local state seeds cleanly.
  const initial = me.data?.setting ?? DEFAULTS;
  return <SettingsForm key={me.dataUpdatedAt} initial={initial} />;
}

function SettingsForm({ initial }: { initial: ApiSettings }) {
  const [form, setForm] = useState<ApiSettings>(initial);
  const [sound, setSound] = useState(true); // client-only; no server field
  const update = useUpdateSettings();

  const dirty = (Object.keys(form) as (keyof ApiSettings)[]).some((k) =>
    Array.isArray(form[k])
      ? JSON.stringify(form[k]) !== JSON.stringify(initial[k])
      : form[k] !== initial[k],
  );

  function set<K extends keyof ApiSettings>(key: K, value: ApiSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleTopic(t: string) {
    set(
      "topics",
      form.topics.includes(t)
        ? form.topics.filter((x) => x !== t)
        : [...form.topics, t],
    );
  }

  // Capture the device's timezone so reminders fire at the user's real local
  // time (the backend interprets reminderTime in this zone).
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function save() {
    // Send only the editable fields — `form` may carry server-only props
    // (id/userId/createdAt/updatedAt) that the backend DTO rejects.
    const patch: Partial<ApiSettings> = {
      dailyGoal: form.dailyGoal,
      cefrLevel: form.cefrLevel,
      topics: form.topics,
      reminderTime: form.reminderTime,
      notifyEnabled: form.notifyEnabled,
      ttsVoice: form.ttsVoice,
      timeZone: browserTz,
    };
    update.mutate(
      patch,
      {
        onSuccess: () =>
          toast.success("Settings saved", {
            description: "Applied to your recommendations and reminders.",
          }),
        onError: (err) =>
          toast.error("Couldn't save settings", {
            description: err instanceof ApiError ? err.message : undefined,
          }),
      },
    );
  }

  const accentPill = (active: boolean) =>
    cn(
      "cursor-pointer rounded-full px-4 py-2 text-sm font-extrabold",
      active ? "bg-white text-grape-600 shadow-xs" : "text-ink-500",
    );

  return (
    <div className="animate-lx-rise mx-auto max-w-[680px]">
      <div className="font-display text-[28px] font-semibold text-ink-900">
        Settings
      </div>
      <div className="mt-1 mb-[22px] font-semibold text-ink-500">
        Personalize goals, level and reminders.
      </div>

      <div className="flex flex-col gap-[22px] rounded-[20px] border border-[var(--border-subtle)] bg-white p-6 shadow-sm">
        <Row title="Daily goal" desc="New words to learn per day">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={500}
              value={form.dailyGoal}
              onChange={(e) =>
                set(
                  "dailyGoal",
                  Math.min(500, Math.max(1, parseInt(e.target.value || "1"))),
                )
              }
              className="w-20 rounded-xl border-2 border-[var(--border-default)] px-3 py-2.5 text-center text-base font-extrabold outline-none focus:border-grape-500"
            />
            <span className="font-bold text-ink-500">words</span>
          </div>
        </Row>
        <div className="h-px bg-[var(--border-subtle)]" />

        <Row title="Level (CEFR)" desc="Tunes word difficulty">
          <Select
            value={form.cefrLevel}
            onValueChange={(v) => set("cefrLevel", v as CefrLevel)}
          >
            <SelectTrigger className="w-28 font-extrabold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CEFR.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
        <div className="h-px bg-[var(--border-subtle)]" />

        <div>
          <div className="font-extrabold text-ink-800">Favorite topics</div>
          <div className="mb-3 text-[13px] font-semibold text-ink-500">
            AI personalizes examples around these
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_TOPICS.map((t) => {
              const on = form.topics.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTopic(t)}
                  className={cn(
                    "cursor-pointer rounded-full border-[1.5px] px-3.5 py-[7px] text-[13.5px] font-extrabold",
                    on
                      ? "border-grape-500 bg-grape-500 text-white"
                      : "border-[var(--border-default)] bg-white text-ink-600",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        <div className="h-px bg-[var(--border-subtle)]" />

        <Row
          title="Reminder time"
          desc={`A gentle nudge to keep your streak · ${browserTz}`}
        >
          <input
            type="time"
            value={form.reminderTime}
            onChange={(e) => set("reminderTime", e.target.value)}
            className="rounded-xl border-2 border-[var(--border-default)] px-3 py-2.5 text-[15px] font-extrabold outline-none focus:border-grape-500"
          />
        </Row>
        <div className="h-px bg-[var(--border-subtle)]" />

        <Row title="Study reminders" desc="Email & in-app notifications">
          <Switch
            checked={form.notifyEnabled}
            onCheckedChange={(v) => set("notifyEnabled", v)}
          />
        </Row>
        <Row
          title="Push on this device"
          desc="Browser notifications for due reviews & streaks"
        >
          <PushToggle />
        </Row>
        <Row title="Sound effects" desc="Celebrations and feedback sounds">
          <Switch checked={sound} onCheckedChange={setSound} />
        </Row>
        <div className="h-px bg-[var(--border-subtle)]" />

        <Row title="Default accent" desc="Pronunciation voice">
          <div className="flex rounded-full bg-cloud-100 p-1">
            <button
              onClick={() => set("ttsVoice", "EN_GB")}
              className={accentPill(form.ttsVoice === "EN_GB")}
            >
              British
            </button>
            <button
              onClick={() => set("ttsVoice", "EN_US")}
              className={accentPill(form.ttsVoice === "EN_US")}
            >
              American
            </button>
          </div>
        </Row>
      </div>

      <div className="mt-[18px] flex justify-end gap-2.5">
        <ChunkyButton
          variant="ghost"
          disabled={!dirty || update.isPending}
          onClick={() => {
            setForm(initial);
            toast.info("Reverted", { description: "Unsaved changes discarded." });
          }}
        >
          Discard changes
        </ChunkyButton>
        <ChunkyButton
          variant="primary"
          iconLeft="check"
          disabled={!dirty || update.isPending}
          onClick={save}
        >
          {update.isPending ? "Saving…" : "Save changes"}
        </ChunkyButton>
      </div>
    </div>
  );
}
