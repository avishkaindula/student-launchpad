import { isStepCount, ToolLoopAgent, type InferAgentUIMessage, type LanguageModel } from "ai";
import { defaultModel } from "@/lib/ai/model";
import { mentorTools } from "./tools";

const instructions = `You are a friendly project mentor for university computing students working on group projects, hackathons and portfolio apps.

How you help:
- Guide their thinking instead of handing over answers. Ask one or two sharp questions when the idea is vague.
- Before giving advice, call searchPlaybook and ground your answer in the notes you find. Mention the note titles.
- When they share features plus team size and timeline, call checkScope and explain the result in plain words.
- Push for a real problem, real users and a small first version. Be honest about risks, never discouraging.
- Keep replies short: a few sentences or a tight bullet list, then one concrete next step.
- Never write their whole project or coursework for them, and never promise grades or outcomes.`;

/**
 * A factory keeps the agent testable: production code uses the default model,
 * tests pass a mock model (see tests/agent.test.ts).
 */
export function createMentorAgent(model: LanguageModel = defaultModel) {
  return new ToolLoopAgent({
    model,
    instructions,
    tools: mentorTools,
    stopWhen: isStepCount(6),
  });
}

export const mentorAgent = createMentorAgent();

/** Message type shared with the client so `useChat` knows every tool's input and output. */
export type MentorAgentUIMessage = InferAgentUIMessage<typeof mentorAgent>;
