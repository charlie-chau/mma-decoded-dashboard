export default function Methodology() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-3">Model Overview</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          MMA Decoded uses a logistic regression model with Ridge regularization
          (L2) to predict UFC fight outcomes. The model combines fighter
          statistics from UFCStats, betting odds from BestFightOdds, and
          Glicko-2 ratings computed from the full Sherdog fight database (200K+
          fights across all MMA promotions).
        </p>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-2">Features</h3>
        <p className="text-[var(--muted)] leading-relaxed mb-3">
          The model uses 21 curated delta features (fighter A minus fighter B)
          plus implied market probability. Key feature groups:
        </p>
        <ul className="text-[var(--muted)] space-y-1.5 list-disc list-inside">
          <li>
            <span className="text-[var(--fg)]">Glicko-2 ratings</span> — mu
            (skill estimate) and phi (uncertainty), computed from 82K+
            fighters across all promotions
          </li>
          <li>
            <span className="text-[var(--fg)]">Striking stats</span> — rolling
            significant strike accuracy, volume, absorption rate, net strikes
          </li>
          <li>
            <span className="text-[var(--fg)]">Grappling stats</span> —
            takedown accuracy/defense, submission attempts, control time
          </li>
          <li>
            <span className="text-[var(--fg)]">Physical attributes</span> —
            height, reach, stance, age, layoff duration
          </li>
          <li>
            <span className="text-[var(--fg)]">Market signal</span> — implied
            probability from opening betting odds (de-vigged)
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-2">Backtest Methodology</h3>
        <p className="text-[var(--muted)] leading-relaxed">
          All results shown are from a strict walk-forward backtest with
          expanding windows. The model is trained on all data before each test
          period, then predicts the next 6 months of fights. No future
          information leaks into predictions — ratings use point-in-time monthly
          checkpoints, not final values.
        </p>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-2">
          What &quot;Beats Closing Line&quot; Means
        </h3>
        <p className="text-[var(--muted)] leading-relaxed">
          The closing line is the final pre-fight betting odds from the market.
          It represents the consensus probability after all information has been
          priced in. Consistently beating the closing line (lower Brier score) is
          the gold standard for sports betting models — it means the model
          identifies mispricings before the market corrects them.
        </p>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-2">Data Sources</h3>
        <div className="overflow-x-auto">
          <table className="text-sm w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-3 text-[var(--muted)] font-medium">
                  Source
                </th>
                <th className="text-right py-2 px-3 text-[var(--muted)] font-medium">
                  Coverage
                </th>
                <th className="text-left py-2 px-3 text-[var(--muted)] font-medium">
                  Used For
                </th>
              </tr>
            </thead>
            <tbody className="text-[var(--muted)]">
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2 px-3 text-[var(--fg)]">UFCStats</td>
                <td className="py-2 px-3 text-right">8,500+ UFC fights</td>
                <td className="py-2 px-3">Fight stats, round-by-round data</td>
              </tr>
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2 px-3 text-[var(--fg)]">BestFightOdds</td>
                <td className="py-2 px-3 text-right">14K+ odds rows</td>
                <td className="py-2 px-3">Opening/closing betting lines</td>
              </tr>
              <tr className="border-b border-[var(--border)]/50">
                <td className="py-2 px-3 text-[var(--fg)]">Sherdog</td>
                <td className="py-2 px-3 text-right">200K+ MMA fights</td>
                <td className="py-2 px-3">
                  Glicko-2 ratings (all promotions)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-2">Read More</h3>
        <ul className="space-y-1.5 text-[var(--muted)]">
          <li>
            <a
              href="https://mmadecoded.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Substack &rarr;
            </a>{" "}
            Deep dives on methodology and analysis
          </li>
          <li>
            <a
              href="https://github.com/mmadecoded/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              GitHub &rarr;
            </a>{" "}
            Open-source dashboard code
          </li>
        </ul>
      </div>
    </div>
  );
}
