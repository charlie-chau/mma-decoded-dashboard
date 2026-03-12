export default function About() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-3">About MMA Decoded</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          MMA Decoded is a quantitative research project investigating
          inefficiencies in MMA betting markets. The project combines
          statistical modelling, Glicko-2 fighter ratings, and public
          accountability to document the process of building and validating a
          predictive model — entirely in the open.
        </p>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-2">The Approach</h3>
        <ul className="text-[var(--muted)] space-y-2">
          <li>
            <span className="text-[var(--fg)] font-medium">Build:</span>{" "}
            Data pipeline, feature engineering, walk-forward backtest. Every
            number on this dashboard comes from strict out-of-sample testing.
          </li>
          <li>
            <span className="text-[var(--fg)] font-medium">Bet:</span>{" "}
            Paper trading first, then real money with documented bet sizing.
            Half-Kelly, 3% max exposure, 25% drawdown breaker.
          </li>
          <li>
            <span className="text-[var(--fg)] font-medium">Share:</span>{" "}
            Substack for analysis and storytelling. This dashboard for data.
            Every claim is verifiable.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-2">Links</h3>
        <ul className="space-y-2 text-[var(--muted)]">
          <li>
            <a
              href="https://mmadecoded.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Substack
            </a>{" "}
            — Deep dives, build journals, post-fight calibration
          </li>
          <li>
            <a
              href="https://twitter.com/mmadecoded"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Twitter/X
            </a>{" "}
            — Quick takes, fight week predictions, chart highlights
          </li>
          <li>
            <a
              href="https://betmma.tips/mmadecoded"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              BetMMA.tips
            </a>{" "}
            — Third-party bet verification
          </li>
          <li>
            <a
              href="https://github.com/charlie-chau/mma-decoded-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              GitHub
            </a>{" "}
            — Dashboard source code (open-source)
          </li>
        </ul>
      </div>

      <div className="border-t border-[var(--border)] pt-6">
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          <span className="font-medium text-[var(--fg)]">Disclaimer:</span>{" "}
          This is a research project documenting a personal investigation into
          MMA market efficiency. It is not financial advice or a picks service.
          Past performance does not guarantee future results. All backtest
          results use strict walk-forward methodology with no future data
          leakage. Gamble responsibly.
        </p>
      </div>
    </div>
  );
}
