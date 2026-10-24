import Link from "next/link";
import { Chat } from "@/components/chat";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Project Mentor</h1>
          <p className="text-sm opacity-70">An AI agent with tools: playbook search (RAG) and a scope checker.</p>
        </div>
        <Link href="/brief" className="shrink-0 rounded-xl border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5">
          Idea → brief
        </Link>
      </header>
      <Chat />
    </main>
  );
}
