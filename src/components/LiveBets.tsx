"use client";

import { useEffect, useState } from "react";
import InfoTip from "./Tooltip";

interface Bet {
  fighter: string;
  opponent: string;
  odds: number;
  decimal_odds: number;
  stake_pct: number;
  edge: number;
  model_prob: number;
  market_prob: number;
  tier: string;
  status: string;
  profit_pct: number | null;
  clv: number | null;
}

interface EventGroup {
  event_date: string;
  event: string;
  bets: Bet[];
}

interface BetsData {
  events: EventGroup[];
  summary: {
    total_bets: number;
    pending: number;
    settled: number;
    won: number;
    lost: number;
    total_staked_pct: number;
    total_profit_pct: number;
    roi_pct: number;
  };
}

function formatOdds(american: number): string {
  if (american > 0) return `+${american}`;
  return `${american}`;
}

function formatDecimal(dec: number): string {
  return dec.toFixed(2);
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    won: "bg-green-500/20 text-green-400",
    lost: "bg-red-500/20 text-red-400",
    void: "bg-gray-500/20 text-gray-400",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${colors[status] || colors.pending}`}
    >
      {status}
    </span>
  );
}

function tierBadge(tier: string) {
  const isHigh = tier.includes("HIGH");
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${
        isHigh
          ? "bg-[var(--accent)]/20 text-[var(--accent)]"
          : "bg-[var(--muted)]/20 text-[var(--muted)]"
      }`}
    >
      {tier}
    </span>
  );
}

export default function LiveBets() {
  const [data, setData] = useState<BetsData | null>(null);

  useEffect(() => {
    fetch("/data/bets.json")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((d) => setData(d))
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="text-[var(--muted)] text-center py-12">
        <p className="text-lg font-medium">No bets recorded yet</p>
        <p className="text-sm mt-1">
          Bets will appear here once predictions are placed.
        </p>
      </div>
    );
  }

  const { summary, events } = data;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-xs text-[var(--muted)] uppercase tracking-wide">
            Total Bets
          </div>
          <div className="text-2xl font-bold mt-1">{summary.total_bets}</div>
          <div className="text-xs text-[var(--muted)] mt-1">
            {summary.pending} pending
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
            Record
            <InfoTip text="Win-loss record of settled bets" />
          </div>
          <div className="text-2xl font-bold mt-1">
            {summary.won}W - {summary.lost}L
          </div>
          <div className="text-xs text-[var(--muted)] mt-1">
            {summary.settled > 0
              ? `${((summary.won / summary.settled) * 100).toFixed(0)}% win rate`
              : "No settled bets"}
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
            P&L
            <InfoTip text="Total profit/loss as % of bankroll from settled bets" />
          </div>
          <div
            className={`text-2xl font-bold mt-1 ${
              summary.total_profit_pct >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {summary.total_profit_pct >= 0 ? "+" : ""}{summary.total_profit_pct.toFixed(1)}%
          </div>
          <div className="text-xs text-[var(--muted)] mt-1">
            {summary.total_staked_pct.toFixed(1)}% staked
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-xs text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
            ROI
            <InfoTip text="Return on investment = profit / total staked. Needs 100+ bets for statistical significance." />
          </div>
          <div
            className={`text-2xl font-bold mt-1 ${
              summary.roi_pct >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {summary.roi_pct >= 0 ? "+" : ""}{summary.roi_pct.toFixed(1)}%
          </div>
          <div className="text-xs text-[var(--muted)] mt-1">
            {summary.settled > 0
              ? `${summary.settled} settled`
              : "No settled bets"}
          </div>
        </div>
      </div>

      {/* Events */}
      {events.map((event) => (
        <div
          key={event.event_date}
          className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{event.event}</h3>
              <span className="text-xs text-[var(--muted)]">
                {event.event_date}
              </span>
            </div>
            <div className="text-xs text-[var(--muted)]">
              {event.bets.length} bet{event.bets.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[var(--muted)] uppercase tracking-wide border-b border-[var(--border)]">
                  <th className="px-4 py-2 text-left">Fighter</th>
                  <th className="px-4 py-2 text-left">vs</th>
                  <th className="px-4 py-2 text-right">Odds</th>
                  <th className="px-4 py-2 text-right">
                    <span className="flex items-center justify-end gap-1">
                      Edge
                      <InfoTip text="Model probability minus market implied probability. Higher = more value." />
                    </span>
                  </th>
                  <th className="px-4 py-2 text-right">Stake</th>
                  <th className="px-4 py-2 text-center">Tier</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-right">P&L</th>
                </tr>
              </thead>
              <tbody>
                {event.bets.map((bet, i) => (
                  <tr
                    key={i}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--border)]/30"
                  >
                    <td className="px-4 py-2.5 font-medium">{bet.fighter}</td>
                    <td className="px-4 py-2.5 text-[var(--muted)]">
                      {bet.opponent}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs">
                      {formatOdds(bet.odds)} / {formatDecimal(bet.decimal_odds)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-[var(--accent)]">
                      +{(bet.edge * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs">
                      {bet.stake_pct}%
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {tierBadge(bet.tier)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {statusBadge(bet.status)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-mono text-xs ${
                        bet.profit_pct !== null
                          ? bet.profit_pct >= 0
                            ? "text-green-400"
                            : "text-red-400"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      {bet.profit_pct !== null
                        ? `${bet.profit_pct >= 0 ? "+" : ""}${bet.profit_pct.toFixed(1)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
