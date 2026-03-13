"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ReferenceLine,
  Cell,
} from "recharts";
import InfoTip from "./Tooltip";

interface Metrics {
  model_version: string;
  total_predictions: number;
  date_range: { start: string; end: string };
  brier_scores: {
    model_lr: number;
    closing_line: number;
    clv_gap: number;
    beats_closing: boolean;
  };
  line_movement: {
    toward_model_pct: number;
    avg_move_toward: number;
    n_with_closing: number;
  };
  calibration: {
    bin_low: number;
    bin_high: number;
    mean_predicted: number;
    actual_win_rate: number;
    count: number;
  }[];
  roi: {
    threshold: number;
    n_bets: number;
    roi_pct: number;
    win_rate: number;
    profit_units: number;
  }[];
  segments: {
    segment: string;
    n_fights: number;
    n_bets: number;
    roi_pct: number;
    profit_units: number;
  }[];
}

interface YearlyRow {
  year: number;
  n_fights: number;
  model_brier: number;
  closing_brier: number;
  beats_closing: boolean;
  accuracy: number;
}

interface Prediction {
  date: string;
  fighter_a: string;
  fighter_b: string;
  weight_class: string;
  event: string;
  model_prob_a: number | null;
  market_prob_a: number | null;
  closing_prob_a: number | null;
  winner: string;
  result: string;
  correct: boolean | null;
}

function MetricCard({
  label,
  value,
  sub,
  positive,
  tip,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  tip?: string;
}) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
      <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">
        {label}
        {tip && <InfoTip text={tip} />}
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      {sub && (
        <div
          className={`text-xs mt-1 ${
            positive === true
              ? "text-[var(--green)]"
              : positive === false
              ? "text-[var(--red)]"
              : "text-[var(--muted)]"
          }`}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export default function TrackRecord() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [yearly, setYearly] = useState<YearlyRow[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [page, setPage] = useState(0);
  const perPage = 20;

  useEffect(() => {
    Promise.all([
      fetch("/data/metrics.json").then((r) => r.json()),
      fetch("/data/yearly.json").then((r) => r.json()),
      fetch("/data/predictions.json").then((r) => r.json()),
    ]).then(([m, y, p]) => {
      setMetrics(m);
      setYearly(y);
      setPredictions(p);
    });
  }, []);

  if (!metrics) {
    return <div className="text-[var(--muted)]">Loading...</div>;
  }

  const bs = metrics.brier_scores;
  const pageSlice = predictions.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(predictions.length / perPage);

  // Calibration data for scatter
  const calData = metrics.calibration.map((c) => ({
    predicted: c.mean_predicted,
    actual: c.actual_win_rate,
    count: c.count,
  }));

  return (
    <div className="space-y-8">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard
          label="Model Brier"
          value={bs.model_lr.toFixed(4)}
          sub={`vs closing ${bs.closing_line.toFixed(4)}`}
          positive={bs.beats_closing}
          tip="Brier score measures prediction accuracy. Ranges 0 (perfect) to 1 (worst). Lower is better. Compared against the closing betting line — the market's final consensus."
        />
        <MetricCard
          label="CLV Gap"
          value={bs.clv_gap.toFixed(4)}
          sub={bs.beats_closing ? "Beats closing line" : "Below closing line"}
          positive={bs.beats_closing}
          tip="Closing Line Value gap — the difference between model and closing line Brier scores. Negative means the model is more accurate than the market. This is the gold standard for betting model evaluation."
        />
        <MetricCard
          label="Line Confirms"
          value={`${metrics.line_movement.toward_model_pct}%`}
          sub={`avg ${metrics.line_movement.avg_move_toward}pp when confirmed`}
          positive={metrics.line_movement.toward_model_pct > 50}
          tip="How often the closing line moved toward the model's prediction vs the opening line. Above 50% means the market is consistently validating the model's read — the line sharpens in the direction the model already pointed."
        />
        <MetricCard
          label="ROI (5% edge)"
          value={`${metrics.roi[1]?.roi_pct ?? "—"}%`}
          sub={`${metrics.roi[1]?.n_bets ?? 0} bets, +${metrics.roi[1]?.profit_units ?? 0}u`}
          positive={(metrics.roi[1]?.roi_pct ?? 0) > 0}
          tip="Simulated return on investment when betting only on fights where the model's probability differs from the market by at least 5%. Flat 1-unit stakes. Based on historical backtest, not live bets."
        />
        <MetricCard
          label="Predictions"
          value={metrics.total_predictions.toLocaleString()}
          sub={`${metrics.date_range.start} — ${metrics.date_range.end}`}
          tip="Total number of fight predictions in the walk-forward backtest. Each prediction uses only data available before that fight — no future information leakage."
        />
      </div>

      {/* Yearly Brier chart */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h3 className="text-sm font-semibold mb-4 text-[var(--muted)] uppercase tracking-wider">
          Brier Score by Year (lower is better)
          <InfoTip text="Each year's Brier score for the model (blue) vs the closing betting line (dashed). When the blue line is below the dashed line, the model was more accurate than the market that year." />
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={yearly.filter((y) => y.n_fights >= 50)}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="year" stroke="var(--muted)" fontSize={12} />
            <YAxis
              domain={[0.19, 0.25]}
              stroke="var(--muted)"
              fontSize={12}
              tickFormatter={(v: number) => v.toFixed(3)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="model_brier"
              stroke="var(--accent)"
              strokeWidth={2}
              name="Model"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="closing_brier"
              stroke="var(--muted)"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Closing Line"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calibration chart */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
          <h3 className="text-sm font-semibold mb-4 text-[var(--muted)] uppercase tracking-wider">
            Calibration
            <InfoTip text="A well-calibrated model's predictions match reality. If it says 70% chance, the fighter should win ~70% of the time. Points on the diagonal line = perfect calibration." />
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="predicted"
                domain={[0, 1]}
                stroke="var(--muted)"
                fontSize={12}
                name="Predicted"
                label={{
                  value: "Predicted",
                  position: "bottom",
                  fill: "var(--muted)",
                  fontSize: 11,
                }}
              />
              <YAxis
                dataKey="actual"
                domain={[0, 1]}
                stroke="var(--muted)"
                fontSize={12}
                name="Actual"
                label={{
                  value: "Actual",
                  angle: -90,
                  position: "left",
                  fill: "var(--muted)",
                  fontSize: 11,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => value.toFixed(3)}
              />
              <ReferenceLine
                segment={[
                  { x: 0, y: 0 },
                  { x: 1, y: 1 },
                ]}
                stroke="var(--muted)"
                strokeDasharray="3 3"
              />
              <Scatter data={calData} fill="var(--accent)" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* ROI by threshold */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
          <h3 className="text-sm font-semibold mb-4 text-[var(--muted)] uppercase tracking-wider">
            ROI by Edge Threshold
            <InfoTip text="Simulated ROI at different minimum edge thresholds. Higher thresholds mean fewer but higher-conviction bets. 3% = bet when model differs from market by 3%+." />
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metrics.roi}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="threshold"
                stroke="var(--muted)"
                fontSize={12}
                tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
              />
              <YAxis
                stroke="var(--muted)"
                fontSize={12}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => [
                  name === "roi_pct" ? `${value}%` : value,
                  name === "roi_pct" ? "ROI" : name,
                ]}
              />
              <Bar dataKey="roi_pct" fill="var(--green)" radius={[4, 4, 0, 0]} name="ROI %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment analysis — where does the edge live? */}
      {metrics.segments && metrics.segments.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
          <h3 className="text-sm font-semibold mb-4 text-[var(--muted)] uppercase tracking-wider">
            Where the Edge Lives
            <InfoTip text="Backtest ROI segmented by how much the model disagrees with the market. All profit comes from high-disagreement fights (10%+). When the model strongly disagrees with the market, it's usually because the market overreacted to news — and the model, seeing only numbers, doesn't panic." />
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.segments.map(s => ({
                ...s,
                roi_pct: Math.round(s.roi_pct * 10) / 10,
                profit_units: Math.round(s.profit_units),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="segment" stroke="var(--muted)" fontSize={12} />
                <YAxis
                  stroke="var(--muted)"
                  fontSize={12}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => [
                    name === "roi_pct" ? `${value}%` : `${value}u`,
                    name === "roi_pct" ? "ROI" : "Profit",
                  ]}
                />
                <ReferenceLine y={0} stroke="var(--muted)" strokeDasharray="3 3" />
                <Bar
                  dataKey="roi_pct"
                  name="ROI %"
                  radius={[4, 4, 0, 0]}
                >
                  {metrics.segments.map((s, i) => (
                    <Cell key={i} fill={s.roi_pct >= 0 ? "var(--green)" : "var(--red)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center">
              <table className="text-sm w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-1.5 px-2 text-[var(--muted)] font-medium">Gap</th>
                    <th className="text-right py-1.5 px-2 text-[var(--muted)] font-medium">Fights</th>
                    <th className="text-right py-1.5 px-2 text-[var(--muted)] font-medium">ROI</th>
                    <th className="text-right py-1.5 px-2 text-[var(--muted)] font-medium">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.segments.map((s) => (
                    <tr key={s.segment} className="border-b border-[var(--border)]/50">
                      <td className="py-1.5 px-2 font-medium">{s.segment}</td>
                      <td className="py-1.5 px-2 text-right tabular-nums">{s.n_fights.toLocaleString()}</td>
                      <td className={`py-1.5 px-2 text-right tabular-nums ${
                        s.roi_pct >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"
                      }`}>
                        {s.roi_pct >= 0 ? "+" : ""}{s.roi_pct.toFixed(1)}%
                      </td>
                      <td className={`py-1.5 px-2 text-right tabular-nums ${
                        s.profit_units >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"
                      }`}>
                        {s.profit_units >= 0 ? "+" : ""}{Math.round(s.profit_units)}u
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Yearly breakdown table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h3 className="text-sm font-semibold mb-4 text-[var(--muted)] uppercase tracking-wider">
          Year-by-Year Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-3 text-[var(--muted)] font-medium">Year</th>
                <th className="text-right py-2 px-3 text-[var(--muted)] font-medium">Fights</th>
                <th className="text-right py-2 px-3 text-[var(--muted)] font-medium">Model Brier<InfoTip text="Model's Brier score for this year. Lower = more accurate predictions." /></th>
                <th className="text-right py-2 px-3 text-[var(--muted)] font-medium">Closing Brier<InfoTip text="Closing betting line's Brier score. This is the market's accuracy — what the model needs to beat." /></th>
                <th className="text-right py-2 px-3 text-[var(--muted)] font-medium">Gap<InfoTip text="Difference in basis points (1 bps = 0.0001). Green/positive = model beat the market. The magnitude matters more than the sign — small losses and big wins net positive overall." /></th>
                <th className="text-right py-2 px-3 text-[var(--muted)] font-medium">Accuracy<InfoTip text="Percentage of fights where the model correctly predicted the winner (>50% probability to the actual winner)." /></th>
              </tr>
            </thead>
            <tbody>
              {yearly.map((y) => {
                const gap = y.closing_brier != null ? y.closing_brier - y.model_brier : null;
                return (
                  <tr key={y.year} className="border-b border-[var(--border)]/50 hover:bg-white/[0.02]">
                    <td className="py-2 px-3 font-medium">{y.year}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{y.n_fights}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{y.model_brier.toFixed(4)}</td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {y.closing_brier?.toFixed(4) ?? "—"}
                    </td>
                    <td className={`py-2 px-3 text-right tabular-nums ${
                      gap != null && gap > 0 ? "text-[var(--green)]" : gap != null && gap < 0 ? "text-[var(--red)]" : ""
                    }`}>
                      {gap != null ? (gap > 0 ? "+" : "") + (gap * 10000).toFixed(1) + " bps" : "—"}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {(y.accuracy * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent predictions */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h3 className="text-sm font-semibold mb-4 text-[var(--muted)] uppercase tracking-wider">
          Recent Predictions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-2 text-[var(--muted)] font-medium">Date</th>
                <th className="text-left py-2 px-2 text-[var(--muted)] font-medium">Fight</th>
                <th className="text-right py-2 px-2 text-[var(--muted)] font-medium">Model<InfoTip text="Model's predicted win probability for fighter A (listed first)." /></th>
                <th className="text-right py-2 px-2 text-[var(--muted)] font-medium">Market<InfoTip text="Implied win probability from opening betting odds (de-vigged)." /></th>
                <th className="text-right py-2 px-2 text-[var(--muted)] font-medium">Move<InfoTip text="How much the closing line moved from the opening line. Green = market moved toward the model's prediction." /></th>
                <th className="text-left py-2 px-2 text-[var(--muted)] font-medium">Pick<InfoTip text="Which fighter the model would bet on — the side where model probability exceeds market by 3%+." /></th>
                <th className="text-right py-2 px-2 text-[var(--muted)] font-medium">Edge<InfoTip text="How much the model's probability exceeds the market's. Larger edge = higher conviction bet." /></th>
                <th className="text-left py-2 px-2 text-[var(--muted)] font-medium">Winner</th>
                <th className="text-center py-2 px-2 text-[var(--muted)] font-medium">Hit<InfoTip text="Did the bet win? Green check = the picked fighter won. Red X = they lost. Dash = no bet (edge below 3%)." /></th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((p, i) => {
                // Determine which side the model would bet on (where model disagrees with market)
                let pick = "";
                let edge = 0;
                let betWon: boolean | null = null;
                if (p.model_prob_a != null && p.market_prob_a != null) {
                  const edgeA = p.model_prob_a - p.market_prob_a;
                  const edgeB = (1 - p.model_prob_a) - (1 - p.market_prob_a);
                  if (edgeA > edgeB && edgeA > 0.03) {
                    pick = p.fighter_a;
                    edge = edgeA;
                    betWon = p.winner === p.fighter_a;
                  } else if (edgeB > edgeA && edgeB > 0.03) {
                    pick = p.fighter_b;
                    edge = edgeB;
                    betWon = p.winner === p.fighter_b;
                  }
                }

                // Line movement: how much did closing move from opening?
                // Color green if it moved toward the model's prediction
                let moveVal: number | null = null;
                let moveToward: boolean | null = null;
                if (p.closing_prob_a != null && p.market_prob_a != null && p.model_prob_a != null) {
                  moveVal = p.closing_prob_a - p.market_prob_a;
                  const modelDir = p.model_prob_a - p.market_prob_a;
                  moveToward = modelDir * moveVal > 0;
                }

                return (
                  <tr
                    key={`${p.date}-${i}`}
                    className="border-b border-[var(--border)]/50 hover:bg-white/[0.02]"
                  >
                    <td className="py-2 px-2 text-[var(--muted)] tabular-nums whitespace-nowrap">
                      {p.date}
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">
                      {p.fighter_a} vs {p.fighter_b}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums">
                      {p.model_prob_a != null ? (p.model_prob_a * 100).toFixed(1) + "%" : "—"}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums">
                      {p.market_prob_a != null ? (p.market_prob_a * 100).toFixed(1) + "%" : "—"}
                    </td>
                    <td className={`py-2 px-2 text-right tabular-nums ${
                      moveVal != null && Math.abs(moveVal) >= 0.005
                        ? moveToward ? "text-[var(--green)]" : "text-[var(--red)]"
                        : "text-[var(--muted)]"
                    }`}>
                      {moveVal != null
                        ? `${moveVal >= 0 ? "+" : ""}${(moveVal * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">
                      {pick || <span className="text-[var(--muted)]">—</span>}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums">
                      {edge > 0 ? `+${(edge * 100).toFixed(1)}%` : <span className="text-[var(--muted)]">—</span>}
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">{p.winner}</td>
                    <td className="py-2 px-2 text-center">
                      {betWon === true ? (
                        <span className="text-[var(--green)]">&#10003;</span>
                      ) : betWon === false ? (
                        <span className="text-[var(--red)]">&#10007;</span>
                      ) : (
                        <span className="text-[var(--muted)]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-sm rounded border border-[var(--border)] disabled:opacity-30 hover:bg-white/[0.05]"
            >
              Previous
            </button>
            <span className="text-sm text-[var(--muted)]">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-sm rounded border border-[var(--border)] disabled:opacity-30 hover:bg-white/[0.05]"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
