import { describe, expect, it } from "vitest";
import { knowledgeDocs } from "@/lib/knowledge/docs";
import { searchDocs, tokenize } from "@/lib/knowledge/search";

describe("tokenize", () => {
  it("lowercases, strips punctuation and drops stop words", () => {
    expect(tokenize("How do we scope the MVP?!")).toEqual(["scope", "mvp"]);
  });
});

describe("searchDocs", () => {
  it("ranks the most relevant note first", () => {
    const [top] = searchDocs(knowledgeDocs, "how many features should our MVP have");
    expect(top.id).toBe("mvp-scoping");
  });

  it("finds notes through their tags", () => {
    const results = searchDocs(knowledgeDocs, "viva demo");
    expect(results[0].id).toBe("demo-viva");
  });

  it("respects the limit", () => {
    expect(searchDocs(knowledgeDocs, "team risk users data", { limit: 2 })).toHaveLength(2);
  });

  it("returns nothing for unrelated or empty queries", () => {
    expect(searchDocs(knowledgeDocs, "quantum spaghetti")).toEqual([]);
    expect(searchDocs(knowledgeDocs, "the and of")).toEqual([]);
  });
});
