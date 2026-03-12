import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MMA Decoded — Quantitative MMA Analysis",
  description:
    "Open-source MMA prediction model. Brier scores, calibration curves, Glicko-2 ratings, and full track record.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
