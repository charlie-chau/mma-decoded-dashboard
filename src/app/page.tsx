"use client";

import { useState } from "react";
import TrackRecord from "@/components/TrackRecord";
import Ratings from "@/components/Ratings";
import Methodology from "@/components/Methodology";
import About from "@/components/About";
import LiveBets from "@/components/LiveBets";

const TABS = ["Track Record", "Live Bets", "Ratings", "Methodology", "About"] as const;
type Tab = (typeof TABS)[number];

export default function Home() {
  const [tab, setTab] = useState<Tab>("Track Record");

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            MMA Decoded
          </h1>
          <nav className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  tab === t
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {tab === "Track Record" && <TrackRecord />}
        {tab === "Live Bets" && <LiveBets />}
        {tab === "Ratings" && <Ratings />}
        {tab === "Methodology" && <Methodology />}
        {tab === "About" && <About />}
      </main>
    </div>
  );
}
