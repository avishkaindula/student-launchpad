"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProjectBrief } from "@/lib/brief/schema";

export default function BriefPage() {
  const [idea, setIdea] = useState("");
  const [brief, setBrief] = useState<ProjectBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Request failed");
      setBrief(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Idea → project brief</h1>
          <p className="text-sm opacity-70">Structured output: the model must return JSON that matches a zod schema.</p>
        </div>
        <Link href="/" className="shrink-0 rounded-xl border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5">
          Back to chat
        </Link>
      </header>

      <form onSubmit={generate} className="flex flex-col gap-3">
        <textarea
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          rows={5}
          placeholder="e.g. Lots of first-years don't know which clubs or societies fit them, so they miss out on the community side of uni…"
          className="rounded-xl border border-black/15 bg-background p-3 outline-none focus:border-black/40 dark:border-white/20 dark:focus:border-white/50"
        />
        <button
          type="submit"
          disabled={loading || idea.trim().length < 10}
          className="self-start rounded-xl bg-foreground px-4 py-2 text-sm text-background disabled:opacity-40"
        >
          {loading ? "Generating…" : "Generate brief"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {brief && (
        <article className="flex flex-col gap-4 rounded-2xl border border-black/10 p-5 dark:border-white/15">
          <h2 className="text-xl font-semibold">{brief.title}</h2>
          <p>{brief.problemStatement}</p>
          <Section title="Target users" items={brief.targetUsers} />
          <Section title="Assumptions to validate first" items={brief.assumptionsToValidate} />
          <Section title="MVP features" items={brief.mvpFeatures} />
          <Section title="Later (not in v1)" items={brief.laterFeatures} />
          <Section title="Risks" items={brief.risks.map((r) => `${r.risk} → ${r.mitigation}`)} />
          <Section title="First week" items={brief.firstWeekActions} />
        </article>
      )}
    </main>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">{title}</h3>
      <ul className="mt-1 list-disc pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
