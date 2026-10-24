import { z } from "zod";

/**
 * Cheap guards that run BEFORE any tokens are spent.
 *
 * The AI SDK already validates message structure and tool parts against your
 * agent's tool schemas; these limits stop someone from sending a huge payload
 * to your endpoint and running up your bill. Tune them to your app.
 */
export const CHAT_LIMITS = {
  maxMessages: 40,
  maxCharsPerMessage: 4_000,
  maxTotalChars: 24_000,
};

const textPart = z.object({ type: z.literal("text"), text: z.string() });

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.looseObject({
        role: z.enum(["user", "assistant"]),
        parts: z.array(z.looseObject({ type: z.string() })),
      }),
    )
    .min(1)
    .max(CHAT_LIMITS.maxMessages),
});

export type ChatLimitResult = { ok: true; messages: unknown[] } | { ok: false; status: 400 | 413; error: string };

export function checkChatRequest(body: unknown): ChatLimitResult {
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    const tooMany = parsed.error.issues.some((issue) => issue.code === "too_big");
    return tooMany
      ? { ok: false, status: 413, error: `Conversation too long (max ${CHAT_LIMITS.maxMessages} messages). Start a new chat.` }
      : { ok: false, status: 400, error: "Expected { messages: UIMessage[] } with user/assistant messages." };
  }

  let total = 0;
  for (const message of parsed.data.messages) {
    let messageChars = 0;
    for (const part of message.parts) {
      const text = textPart.safeParse(part);
      if (text.success) messageChars += text.data.text.length;
    }
    if (messageChars > CHAT_LIMITS.maxCharsPerMessage) {
      return { ok: false, status: 413, error: `Message too long (max ${CHAT_LIMITS.maxCharsPerMessage} characters).` };
    }
    total += messageChars;
  }
  if (total > CHAT_LIMITS.maxTotalChars) {
    return { ok: false, status: 413, error: "Conversation too long. Start a new chat." };
  }

  return { ok: true, messages: parsed.data.messages };
}
