"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import type { MentorAgentUIMessage } from "@/lib/agent/mentor-agent";
import { ScopeResult, SearchResults, ToolStatus } from "./tool-results";

const SUGGESTIONS = [
  "We want to build an app that helps university students find part-time jobs. Where do we start?",
  "Our team of 5 has 10 weeks. Must-haves: login, job feed, CV upload, AI matching, chat, admin panel. Too much?",
  "How do we check if our idea is a real problem?",
];

export function Chat() {
  const [input, setInput] = useState("");
  // The generic gives typed tool parts: part.type === "tool-checkScope" knows its input and output shapes.
  const { messages, sendMessage, status, stop, error, regenerate } = useChat<MentorAgentUIMessage>();
  const isBusy = status === "submitted" || status === "streaming";

  function send(text: string) {
    if (!text.trim() || isBusy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      {messages.length === 0 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => send(suggestion)}
              className="rounded-xl border border-black/10 p-3 text-left text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {messages.map((message) => (
          <div key={message.id} className={message.role === "user" ? "self-end max-w-[85%]" : "max-w-full"}>
            <div
              className={
                message.role === "user"
                  ? "rounded-2xl bg-foreground px-4 py-2 text-background"
                  : "flex flex-col gap-2"
              }
            >
              {message.parts.map((part, i) => {
                const key = `${message.id}-${i}`;
                switch (part.type) {
                  case "text":
                    return (
                      <p key={key} className="whitespace-pre-wrap leading-relaxed">
                        {part.text}
                      </p>
                    );
                  case "tool-searchPlaybook":
                    return part.state === "output-available" ? (
                      <SearchResults key={key} query={part.input.query} output={part.output} />
                    ) : (
                      <ToolStatus key={key} state={part.state} label="Searching the playbook" />
                    );
                  case "tool-checkScope":
                    return part.state === "output-available" ? (
                      <ScopeResult key={key} output={part.output} />
                    ) : (
                      <ToolStatus key={key} state={part.state} label="Checking scope" />
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        ))}
        {status === "submitted" && <p className="text-sm opacity-60">Thinking…</p>}
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm">
            Something went wrong. Is <code>AI_GATEWAY_API_KEY</code> set?{" "}
            <button className="underline" onClick={() => regenerate()}>
              Retry
            </button>
          </div>
        )}
      </div>

      <form
        className="sticky bottom-4 mt-auto flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Describe your project idea or ask a question…"
          className="flex-1 rounded-xl border border-black/15 bg-background px-4 py-3 shadow-sm outline-none focus:border-black/40 dark:border-white/20 dark:focus:border-white/50"
        />
        {isBusy ? (
          <button type="button" onClick={stop} className="rounded-xl border px-4 py-3 text-sm">
            Stop
          </button>
        ) : (
          <button type="submit" className="rounded-xl bg-foreground px-4 py-3 text-sm text-background disabled:opacity-40" disabled={!input.trim()}>
            Send
          </button>
        )}
      </form>
    </div>
  );
}
