import type { ScopeAssessment } from "@/lib/agent/scope";
import type { SearchResult } from "@/lib/knowledge/search";

export function ToolStatus({ state, label }: { state: string; label: string }) {
  if (state === "output-error") {
    return <p className="text-sm text-red-600">{label} failed.</p>;
  }
  return <p className="animate-pulse text-sm opacity-60">{label}…</p>;
}

export function SearchResults({ query, output }: { query: string; output: { results: SearchResult[] } }) {
  return (
    <details className="rounded-xl border border-black/10 px-3 py-2 text-sm dark:border-white/15">
      <summary className="cursor-pointer opacity-70">
        Searched playbook for “{query}” · {output.results.length} note{output.results.length === 1 ? "" : "s"}
      </summary>
      <ul className="mt-2 list-disc pl-5 opacity-80">
        {output.results.map((result) => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </details>
  );
}

const VERDICT_STYLES: Record<ScopeAssessment["verdict"], string> = {
  comfortable: "bg-green-500/15 text-green-700 dark:text-green-300",
  tight: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  overloaded: "bg-red-500/15 text-red-700 dark:text-red-300",
};

export function ScopeResult({ output }: { output: ScopeAssessment }) {
  return (
    <div className="rounded-xl border border-black/10 p-3 text-sm dark:border-white/15">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 font-medium ${VERDICT_STYLES[output.verdict]}`}>{output.verdict}</span>
        <span className="opacity-70">
          ~{output.estimatedPersonWeeks} person-weeks needed · ~{output.availablePersonWeeks} available
        </span>
      </div>
      {output.flags.length > 0 && (
        <ul className="mt-2 list-disc pl-5">
          {output.flags.map((flag) => (
            <li key={flag}>{flag}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
