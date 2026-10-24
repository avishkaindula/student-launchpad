import { tool } from "ai";
import { z } from "zod";
import { knowledgeDocs } from "@/lib/knowledge/docs";
import { searchDocs } from "@/lib/knowledge/search";
import { assessScope } from "./scope";

/**
 * Tools are typed functions the model may decide to call.
 * - `description` tells the model WHEN to use it — write it like a docstring for a colleague.
 * - `inputSchema` (zod) is validated before `execute` runs, so `execute` gets typed, safe input.
 * - Whatever `execute` returns is sent back to the model and streamed to the UI.
 */

export const searchPlaybook = tool({
  description:
    "Search the project playbook for guidance on problem statements, user research, feasibility, risks, MVP scoping, teamwork, demos and vivas. Call this before giving advice and mention the note titles you used.",
  inputSchema: z.object({
    query: z.string().min(2).describe("What to look up, in plain words"),
  }),
  execute: async ({ query }) => {
    const results = searchDocs(knowledgeDocs, query, { limit: 3 });
    if (results.length === 0) {
      return { results, note: "No matching notes. Answer from general knowledge and say so." };
    }
    return { results };
  },
});

export const checkScope = tool({
  description:
    "Estimate whether a student project plan fits the team's time. Use when the user shares their features together with team size and timeline.",
  inputSchema: z.object({
    mustHaveFeatures: z.array(z.string()).min(1).describe("Features the team considers essential for the first version"),
    teamSize: z.number().int().min(1).max(10),
    weeksAvailable: z.number().int().min(1).max(52),
    needsTrainedModel: z.boolean().describe("Whether the project depends on training or fine-tuning an ML model"),
    hasDataSource: z.boolean().describe("Whether the team already has the data it needs"),
  }),
  execute: async (plan) => assessScope(plan),
});

export const mentorTools = { searchPlaybook, checkScope };
