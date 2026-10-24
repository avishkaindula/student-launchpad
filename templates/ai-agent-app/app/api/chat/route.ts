import { createAgentUIStreamResponse } from "ai";
import { mentorAgent } from "@/lib/agent/mentor-agent";
import { checkChatRequest, checkContentLength } from "@/lib/chat/limits";

// Agents can take several model + tool steps; give the function room to finish.
export const maxDuration = 60;

// Before deploying publicly, put this route behind sign-in and/or a rate limit —
// see "Before you deploy publicly" in the README.
export async function POST(request: Request) {
  const check =
    checkContentLength(request.headers.get("content-length")) ??
    checkChatRequest(await request.json().catch(() => null));
  if (!check.ok) {
    return Response.json({ error: check.error }, { status: check.status });
  }

  return createAgentUIStreamResponse({
    agent: mentorAgent,
    uiMessages: check.messages,
    // Stop the agent (and token spend) if the user closes the tab or presses Stop.
    abortSignal: request.signal,
  });
}
