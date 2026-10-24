import { describe, expect, it } from "vitest";
import { CHAT_LIMITS, checkChatRequest } from "@/lib/chat/limits";

const userMessage = (text: string) => ({ id: "1", role: "user", parts: [{ type: "text", text }] });

describe("checkChatRequest", () => {
  it("accepts a normal conversation", () => {
    expect(checkChatRequest({ messages: [userMessage("How big should our MVP be?")] }).ok).toBe(true);
  });

  it("rejects malformed bodies with 400", () => {
    for (const body of [null, {}, { messages: [] }, { messages: [{ role: "system", parts: [] }] }]) {
      const result = checkChatRequest(body);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    }
  });

  it("rejects oversized messages and conversations with 413", () => {
    const huge = checkChatRequest({ messages: [userMessage("x".repeat(CHAT_LIMITS.maxCharsPerMessage + 1))] });
    expect(huge).toMatchObject({ ok: false, status: 413 });

    const tooMany = checkChatRequest({ messages: Array.from({ length: CHAT_LIMITS.maxMessages + 1 }, () => userMessage("hi")) });
    expect(tooMany).toMatchObject({ ok: false, status: 413 });

    const tooMuchTotal = checkChatRequest({ messages: Array.from({ length: 8 }, () => userMessage("x".repeat(3_500))) });
    expect(tooMuchTotal).toMatchObject({ ok: false, status: 413 });
  });
});
