// utils/riskSummary.js — Aggregate risk stats from a set of leak records

const RISK_LEVELS = ['critical', 'high', 'medium', 'low'];

/**
 * Build a risk summary object from an array of leak rows.
 *
 * @param {Array<{risk_level: string}>} leaks
 * @returns {{
 *   total: number,
 *   critical: number,
 *   high: number,
 *   medium: number,
 *   low: number,
 *   highest_severity: string|null
 * }}
 */
const summariseRisk = (leaks = []) => {
  const counts = Object.fromEntries(RISK_LEVELS.map((l) => [l, 0]));

  for (const leak of leaks) {
    if (counts[leak.risk_level] !== undefined) {
      counts[leak.risk_level]++;
    }
  }

  const highest = RISK_LEVELS.find((l) => counts[l] > 0) || null;

  return {
    total: leaks.length,
    ...counts,
    highest_severity: highest,
  };
};

module.exports = { summariseRisk };
