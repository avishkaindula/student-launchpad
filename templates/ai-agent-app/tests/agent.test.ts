import { MockLanguageModelV4 } from "ai/test";
import { describe, expect, it } from "vitest";
import { createMentorAgent } from "@/lib/agent/mentor-agent";
import { assessScope } from "@/lib/agent/scope";

const usage = {
  inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 10, text: 10, reasoning: undefined },
};

describe("assessScope", () => {
  it("flags an overloaded plan", () => {
    const result = assessScope({
      mustHaveFeatures: ["login", "feed", "cv upload", "ai matching", "chat", "admin panel"],
      teamSize: 2,
      weeksAvailable: 6,
      needsTrainedModel: true,
      hasDataSource: false,
    });
    expect(result.verdict).toBe("overloaded");
    expect(result.flags.some((flag) => flag.includes("data source"))).toBe(true);
  });

  it("is comfortable with a small plan and a realistic timeline", () => {
    const result = assessScope({
      mustHaveFeatures: ["sign in", "create listing", "search"],
      teamSize: 5,
      weeksAvailable: 12,
      needsTrainedModel: false,
      hasDataSource: true,
    });
    expect(result.verdict).toBe("comfortable");
    expect(result.flags).toEqual([]);
  });
});

describe("mentor agent loop (mock model, no API key needed)", () => {
  it("calls a tool, feeds the result back, then answers", async () => {
    // Step 1: the "model" asks for the searchPlaybook tool. Step 2: it answers in text.
    const model = new MockLanguageModelV4({
      doGenerate: [
        {
          content: [
            {
              type: "tool-call",
              toolCallId: "call-1",
              toolName: "searchPlaybook",
              input: JSON.stringify({ query: "mvp features" }),
            },
          ],
          finishReason: { unified: "tool-calls", raw: undefined },
          usage,
          warnings: [],
        },
        {
          content: [{ type: "text", text: "Keep your MVP to 3–5 must-haves." }],
          finishReason: { unified: "stop", raw: undefined },
          usage,
          warnings: [],
        },
      ],
    });

    const result = await createMentorAgent(model).generate({ prompt: "How big should our MVP be?" });

    expect(result.steps).toHaveLength(2);
    const toolResult = result.steps[0].toolResults[0];
    expect(toolResult.toolName).toBe("searchPlaybook");
    expect(JSON.stringify(toolResult.output)).toContain("mvp-scoping");
    expect(result.text).toBe("Keep your MVP to 3–5 must-haves.");
    // The second model call must have received the tool result in its prompt.
    expect(JSON.stringify(model.doGenerateCalls[1].prompt)).toContain("mvp-scoping");
  });
});
