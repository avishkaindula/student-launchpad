import type { KnowledgeDoc } from "./docs";

/**
 * Tiny BM25 keyword search — the "R" in RAG without any infrastructure.
 *
 * Good enough for a few hundred short notes. When you outgrow it, swap this
 * function for embeddings + a vector store (e.g. Supabase pgvector) and keep
 * the tool's input/output shape the same so the agent doesn't notice.
 */

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "do", "for", "from",
  "how", "i", "in", "is", "it", "my", "of", "on", "or", "our", "so", "that",
  "the", "this", "to", "we", "what", "when", "with", "you", "your",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

export type SearchResult = {
  id: string;
  title: string;
  score: number;
  content: string;
};

const K1 = 1.5;
const B = 0.75;

export function searchDocs(
  docs: KnowledgeDoc[],
  query: string,
  { limit = 3 }: { limit?: number } = {},
): SearchResult[] {
  const queryTerms = [...new Set(tokenize(query))];
  if (queryTerms.length === 0 || docs.length === 0) return [];

  // Titles and tags are repeated so a match there outweighs a passing mention in the body.
  const docTokens = docs.map((doc) =>
    tokenize(`${doc.title} ${doc.title} ${doc.tags.join(" ")} ${doc.tags.join(" ")} ${doc.body}`),
  );
  const avgLength = docTokens.reduce((sum, tokens) => sum + tokens.length, 0) / docs.length;

  const documentFrequency = new Map<string, number>();
  for (const term of queryTerms) {
    documentFrequency.set(term, docTokens.filter((tokens) => tokens.includes(term)).length);
  }

  return docs
    .map((doc, i) => {
      const tokens = docTokens[i];
      let score = 0;
      for (const term of queryTerms) {
        const df = documentFrequency.get(term) ?? 0;
        if (df === 0) continue;
        const tf = tokens.filter((token) => token === term).length;
        const idf = Math.log(1 + (docs.length - df + 0.5) / (df + 0.5));
        score += (idf * tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * tokens.length) / avgLength));
      }
      return { id: doc.id, title: doc.title, score: Math.round(score * 100) / 100, content: doc.body };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
