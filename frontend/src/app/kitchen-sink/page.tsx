"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Icon } from "@/components/lexi/icon";
import { ChunkyButton } from "@/components/lexi/chunky-button";
import { ProgressBar } from "@/components/lexi/progress-bar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const SWATCHES: { name: string; token: string }[] = [
  { name: "grape-500", token: "--grape-500" },
  { name: "grape-700", token: "--grape-700" },
  { name: "coral-400", token: "--coral-400" },
  { name: "sun-400", token: "--sun-400" },
  { name: "leaf-500", token: "--leaf-500" },
  { name: "sky-500", token: "--sky-500" },
  { name: "berry-500", token: "--berry-500" },
  { name: "ink-900", token: "--ink-900" },
  { name: "ink-500", token: "--ink-500" },
  { name: "cloud-100", token: "--cloud-100" },
];

const GLYPHS = [
  "languages",
  "sparkles",
  "book-marked",
  "graduation-cap",
  "flame",
  "gem",
  "mic",
  "trophy",
  "loader-circle",
  "chevron-right",
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-extrabold tracking-[0.09em] text-ink-400 uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function KitchenSink() {
  const [notif, setNotif] = useState(true);

  return (
    <main className="mx-auto max-w-4xl space-y-12 px-6 py-12">
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-[11px] bg-grape-500 shadow-brand">
            <Icon glyph="languages" px={22} color="#fff" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink-900">
            Lexi — Design foundation
          </h1>
        </div>
        <p className="font-sans font-semibold text-ink-500">
          Phase 1 kitchen sink · tokens, fonts, icons &amp; core components.
        </p>
      </header>

      <Section title="Color tokens">
        <div className="flex flex-wrap gap-3">
          {SWATCHES.map((s) => (
            <div key={s.name} className="w-24">
              <div
                className="h-16 w-full rounded-2xl border border-[var(--border-subtle)] shadow-sm"
                style={{ background: `var(${s.token})` }}
              />
              <div className="mt-1 font-mono text-[11px] text-ink-500">
                {s.name}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-2">
          <p className="font-display text-4xl font-semibold text-ink-900">
            Fredoka display — Good morning 👋
          </p>
          <p className="font-sans text-lg font-extrabold text-ink-800">
            Nunito body ExtraBold — Learn English you&apos;ll actually use.
          </p>
          <p className="font-mono text-sm text-ink-500">
            Space Mono — /nɪˈɡoʊ.ʃi.eɪt/ · S + have/has + past participle
          </p>
        </div>
      </Section>

      <Section title="ChunkyButton — variants">
        <div className="flex flex-wrap items-center gap-3">
          <ChunkyButton variant="primary" iconLeft="play">
            Primary
          </ChunkyButton>
          <ChunkyButton variant="secondary" iconLeft="rotate-ccw">
            Secondary
          </ChunkyButton>
          <ChunkyButton variant="success" iconLeft="check">
            Success
          </ChunkyButton>
          <ChunkyButton variant="danger">Danger</ChunkyButton>
          <ChunkyButton variant="coral">Coral</ChunkyButton>
          <ChunkyButton variant="ghost" iconLeft="sparkles">
            Ghost
          </ChunkyButton>
          <ChunkyButton variant="primary" disabled>
            Disabled
          </ChunkyButton>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ChunkyButton size="sm">Small</ChunkyButton>
          <ChunkyButton size="md">Medium</ChunkyButton>
          <ChunkyButton size="lg" iconRight="arrow-right">
            Large
          </ChunkyButton>
        </div>
        <ChunkyButton variant="primary" size="lg" fullWidth iconLeft="sparkles">
          Full width
        </ChunkyButton>
      </Section>

      <Section title="ProgressBar">
        <div className="space-y-3">
          <ProgressBar value={64} tone="brand" />
          <ProgressBar value={40} tone="xp" />
          <ProgressBar value={3} max={5} tone="success" />
          <ProgressBar value={80} tone="coral" />
        </div>
      </Section>

      <Section title="Icons">
        <div className="flex flex-wrap gap-4">
          {GLYPHS.map((g) => (
            <div key={g} className="flex flex-col items-center gap-1 text-ink-500">
              <Icon glyph={g} px={24} color="var(--grape-500)" />
              <span className="font-mono text-[10px]">{g}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="shadcn — retinted to Lexi">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Card</CardTitle>
              <CardDescription>White surface, subtle border.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="you@example.com" />
              <Textarea placeholder="Write something in English…" rows={2} />
              <div className="flex items-center gap-3">
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-2 font-sans text-sm font-bold text-ink-600">
                  <Switch checked={notif} onCheckedChange={setNotif} /> Reminders
                </label>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Badges &amp; toast</CardTitle>
              <CardDescription>Feedback tones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Due</Badge>
                <Badge variant="outline">New</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <ChunkyButton
                  variant="success"
                  size="sm"
                  onClick={() =>
                    toast.success("Saved!", {
                      description: "“eloquent” added to your notebook.",
                    })
                  }
                >
                  Success toast
                </ChunkyButton>
                <ChunkyButton
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    toast.error("Empty input", {
                      description: "Type a word or a grammar rule.",
                    })
                  }
                >
                  Error toast
                </ChunkyButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Toaster position="bottom-right" richColors />
    </main>
  );
}
