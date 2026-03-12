"use client";

import { useEffect, useState } from "react";
import InfoTip from "./Tooltip";

interface Fighter {
  rank: number;
  name: string;
  elo: number;
  mu: number;
  phi: number;
}

interface RatingsData {
  as_of: string;
  total_rated: number;
  fighters: Fighter[];
}

export default function Ratings() {
  const [data, setData] = useState<RatingsData | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/data/ratings.json")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return <div className="text-[var(--muted)]">Loading...</div>;
  }

  const filtered = data.fighters.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Glicko-2 Fighter Ratings
            <InfoTip text="Glicko-2 is a rating system (like chess Elo but with uncertainty). Ratings are computed from 200K+ fights across all MMA promotions, not just the UFC. Higher rating = stronger fighter based on historical results." />
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Top 100 UFC fighters by rating.{" "}
            {data.total_rated.toLocaleString()} total fighters rated. As of{" "}
            {data.as_of}.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search fighters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[var(--card)] border border-[var(--border)] rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 text-[var(--muted)] font-medium w-16">
                #
              </th>
              <th className="text-left py-3 px-4 text-[var(--muted)] font-medium">
                Fighter
              </th>
              <th className="text-right py-3 px-4 text-[var(--muted)] font-medium">
                Rating<InfoTip text="Glicko-2 mu rating. 1500 = average newcomer. Top fighters are typically 2200+. Unlike simple Elo, Glicko-2 accounts for opponent strength and rating confidence." />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr
                key={f.rank}
                className="border-b border-[var(--border)]/50 hover:bg-white/[0.02]"
              >
                <td className="py-2.5 px-4 text-[var(--muted)] tabular-nums">
                  {f.rank}
                </td>
                <td className="py-2.5 px-4 font-medium">{f.name}</td>
                <td className="py-2.5 px-4 text-right tabular-nums">
                  {f.mu.toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-[var(--muted)]">
            No fighters match &quot;{search}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
