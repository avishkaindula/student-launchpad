import type { LanguageModel } from "ai";

/**
 * One place to choose the model.
 *
 * A plain "provider/model" string goes through the Vercel AI Gateway (set
 * AI_GATEWAY_API_KEY), so you can switch between OpenAI, Anthropic, Google...
 * by changing AI_MODEL — no code changes. List models with:
 *   curl -s https://ai-gateway.vercel.sh/v1/models | jq -r '.data[].id'
 *
 * Prefer a provider's own SDK instead (e.g. a free Google AI Studio key)?
 *   pnpm add @ai-sdk/google
 *   import { google } from "@ai-sdk/google";
 *   export const defaultModel: LanguageModel = google("gemini-3.8-flash");
 */
export const defaultModel: LanguageModel = process.env.AI_MODEL ?? "anthropic/claude-haiku-5.5";
