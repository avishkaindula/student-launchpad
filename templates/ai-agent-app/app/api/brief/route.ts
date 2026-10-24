import { generateText, Output } from "ai";
import { defaultModel } from "@/lib/ai/model";
import { briefRequestSchema, projectBriefSchema } from "@/lib/brief/schema";

export const maxDuration = 60;

export async function POST(request: Request) {
  const parsed = briefRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  try {
    const { output } = await generateText({
      model: defaultModel,
      output: Output.object({ schema: projectBriefSchema }),
      system:
        "You turn rough student project ideas into honest, realistic project briefs. Keep the MVP small enough for a student team to ship in one semester. Prefer concrete wording over buzzwords.",
      prompt: parsed.data.idea,
    });
    return Response.json(output);
  } catch (error) {
    console.error("Brief generation failed", error);
    return Response.json({ error: "Could not generate a brief. Check the server logs and your API key." }, { status: 500 });
  }
}
