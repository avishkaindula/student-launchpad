import { z } from "zod";

/**
 * Cheap guards that run BEFORE any tokens are spent.
 *
 * The AI SDK already validates message structure and tool parts against your
 * agent's tool schemas; these limits stop someone from sending a huge payload
 * to your endpoint and running up your bill. Sizes are measured on the whole
 * serialized message, so padding tool outputs, reasoning or file parts counts
 * too — not just the visible text. Tune the numbers to your app.
 */
export const CHAT_LIMITS = {
  maxBodyBytes: 100_000,
  maxMessages: 40,
  maxPartsPerMessage: 30,
  /** Visible text a user can type into one message. */
  maxUserTextChars: 4_000,
  /** Serialized size of any single message (assistant messages include tool results). */
  maxMessageChars: 12_000,
  /** Serialized size of the whole conversation. */
  maxTotalChars: 64_000,
};

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.looseObject({
        role: z.enum(["user", "assistant"]),
        parts: z.array(z.looseObject({ type: z.string() })).max(CHAT_LIMITS.maxPartsPerMessage),
      }),
    )
    .min(1)
    .max(CHAT_LIMITS.maxMessages),
});

export type ChatLimitResult = { ok: true; messages: unknown[] } | { ok: false; status: 400 | 413; error: string };

const tooLong = (error: string): ChatLimitResult => ({ ok: false, status: 413, error });

/** Reject obviously oversized requests before parsing the JSON body. */
export function checkContentLength(header: string | null): ChatLimitResult | null {
  const bytes = Number(header);
  return Number.isFinite(bytes) && bytes > CHAT_LIMITS.maxBodyBytes ? tooLong("Request too large.") : null;
}

export function checkChatRequest(body: unknown): ChatLimitResult {
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return parsed.error.issues.some((issue) => issue.code === "too_big")
      ? tooLong(`Conversation too long (max ${CHAT_LIMITS.maxMessages} messages). Start a new chat.`)
      : { ok: false, status: 400, error: "Expected { messages: UIMessage[] } with user/assistant messages." };
  }

  let total = 0;
  for (const message of parsed.data.messages) {
    const size = JSON.stringify(message).length;
    if (size > CHAT_LIMITS.maxMessageChars) return tooLong("Message too large.");
    total += size;

    if (message.role === "user") {
      const text = message.parts.reduce(
        (sum, part) => sum + (part.type === "text" && typeof part.text === "string" ? part.text.length : 0),
        0,
      );
      if (text > CHAT_LIMITS.maxUserTextChars) {
        return tooLong(`Message too long (max ${CHAT_LIMITS.maxUserTextChars} characters).`);
      }
    }
  }
  if (total > CHAT_LIMITS.maxTotalChars) return tooLong("Conversation too long. Start a new chat.");

  return { ok: true, messages: parsed.data.messages };
}
