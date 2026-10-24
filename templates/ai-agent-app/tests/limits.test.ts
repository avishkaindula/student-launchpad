import { describe, expect, it } from "vitest";
import { CHAT_LIMITS, checkChatRequest, checkContentLength } from "@/lib/chat/limits";

const userMessage = (text: string) => ({ id: "1", role: "user", parts: [{ type: "text", text }] });

describe("checkChatRequest", () => {
  it("accepts a normal conversation", () => {
    expect(checkChatRequest({ messages: [userMessage("How big should our MVP be?")] }).ok).toBe(true);
  });

  it("rejects malformed bodies with 400", () => {
    for (const body of [null, {}, { messages: [] }, { messages: [{ role: "system", parts: [] }] }]) {
      expect(checkChatRequest(body)).toMatchObject({ ok: false, status: 400 });
    }
  });

  it("rejects oversized user text, conversations and message counts with 413", () => {
    expect(checkChatRequest({ messages: [userMessage("x".repeat(CHAT_LIMITS.maxUserTextChars + 1))] })).toMatchObject({
      ok: false,
      status: 413,
    });
    expect(
      checkChatRequest({ messages: Array.from({ length: CHAT_LIMITS.maxMessages + 1 }, () => userMessage("hi")) }),
    ).toMatchObject({ ok: false, status: 413 });
    expect(
      checkChatRequest({ messages: Array.from({ length: 20 }, () => userMessage("x".repeat(3_900))) }),
    ).toMatchObject({ ok: false, status: 413 });
  });

  it("counts non-text parts too, so padding tool output or reasoning can't bypass the limits", () => {
    const padded = {
      id: "2",
      role: "assistant",
      parts: [{ type: "tool-searchPlaybook", state: "output-available", output: "x".repeat(CHAT_LIMITS.maxMessageChars) }],
    };
    expect(checkChatRequest({ messages: [userMessage("hi"), padded] })).toMatchObject({ ok: false, status: 413 });

    const manyParts = { id: "3", role: "user", parts: Array.from({ length: CHAT_LIMITS.maxPartsPerMessage + 1 }, () => ({ type: "reasoning", text: "" })) };
    expect(checkChatRequest({ messages: [manyParts] })).toMatchObject({ ok: false, status: 413 });
  });
});

describe("checkContentLength", () => {
  it("rejects bodies over the byte limit and ignores missing headers", () => {
    expect(checkContentLength(String(CHAT_LIMITS.maxBodyBytes + 1))).toMatchObject({ ok: false, status: 413 });
    expect(checkContentLength("512")).toBeNull();
    expect(checkContentLength(null)).toBeNull();
  });
});
