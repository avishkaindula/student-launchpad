import { createAgentUIStreamResponse } from "ai";
import { mentorAgent } from "@/lib/agent/mentor-agent";

// Agents can take several model + tool steps; give the function room to finish.
export const maxDuration = 60;

export async function POST(request: Request) {
  const { messages } = await request.json();

  if (!Array.isArray(messages)) {
    return Response.json({ error: "Expected { messages: UIMessage[] }" }, { status: 400 });
  }

  return createAgentUIStreamResponse({
    agent: mentorAgent,
    uiMessages: messages,
  });
}
