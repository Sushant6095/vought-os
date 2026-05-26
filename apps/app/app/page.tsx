/**
 * Cyrano · Persona Picker (home screen)
 * Mobile-first. Lets the user choose a persona and start a session.
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const personas = [
  { id: "first-date", title: "First Date", subtitle: "Warm, curious, playful" },
  { id: "job-interview", title: "Job Interview", subtitle: "Confident, structured, succinct" },
  { id: "hard-conversation", title: "Hard Conversation", subtitle: "Steady, empathetic, calm" },
  { id: "salary-negotiation", title: "Salary Negotiation", subtitle: "Firm, anchored, friendly" },
  { id: "medical-visit", title: "Medical Visit", subtitle: "Decodes jargon, advocates" },
];

export default function Home() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("first-date");

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10 max-w-md mx-auto">
      <header className="mb-10">
        <div className="text-[10px] uppercase tracking-widest text-amber-400/70 font-bold mb-1">
          Good evening
        </div>
        <h1 className="text-3xl font-bold leading-tight">
          What kind of<br />conversation?
        </h1>
      </header>

      <div className="space-y-3 mb-8">
        {personas.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`w-full text-left rounded-2xl p-4 border transition ${
              selected === p.id
                ? "bg-amber-400 text-black border-amber-400"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <div className="font-semibold">{p.title}</div>
            <div className={`text-xs mt-0.5 ${selected === p.id ? "text-black/70" : "text-white/50"}`}>
              {p.subtitle}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push(`/live?persona=${selected}`)}
        className="w-full bg-amber-400 text-black font-semibold py-4 rounded-2xl"
      >
        Begin
      </button>

      <p className="text-[11px] text-white/40 text-center mt-4">
        Live coaching · no audio recorded
      </p>
    </main>
  );
}
