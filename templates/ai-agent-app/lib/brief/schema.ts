import { z } from "zod";

/**
 * Structured output: the model must return JSON matching this schema.
 * `.describe()` text is sent to the model, so treat it as part of the prompt.
 */
export const projectBriefSchema = z.object({
  title: z.string().describe("A short working title"),
  problemStatement: z
    .string()
    .describe("One or two sentences: who has what problem, why it matters. No mention of the solution."),
  targetUsers: z.array(z.string()).min(1).max(4).describe("Specific user groups, not 'everyone'"),
  assumptionsToValidate: z.array(z.string()).max(5).describe("Beliefs to test by talking to users before building"),
  mvpFeatures: z.array(z.string()).min(1).max(5).describe("The smallest set of features that solves the core problem end-to-end"),
  laterFeatures: z.array(z.string()).max(6).describe("Nice-to-haves deliberately left out of the first version"),
  risks: z
    .array(z.object({ risk: z.string(), mitigation: z.string() }))
    .max(5),
  firstWeekActions: z.array(z.string()).max(5).describe("Concrete actions for the team's first week"),
});

export type ProjectBrief = z.infer<typeof projectBriefSchema>;

export const briefRequestSchema = z.object({
  idea: z.string().trim().min(10, "Describe the idea in at least a sentence.").max(4000),
});
