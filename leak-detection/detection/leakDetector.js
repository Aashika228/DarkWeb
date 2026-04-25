// leakDetector.js — modular, zero-dependency leak detection module
// Usage: const { analyzeLeak } = require('./src/leakDetector');

"use strict";

// ─── Regex Patterns ────────────────────────────────────────────────────────────
const PATTERNS = {
  emails: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g,

  passwords: /(?:password|passwd|pwd|pass)\s*[:=]\s*(\S+)/gi,

  api_keys: /(?:sk[-_](?:live[-_]|test[-_])?[A-Za-z0-9]{12,}|AKIA[0-9A-Z]{16}|(?:api[-_]?key|apikey|token|secret)\s*[:=]\s*([A-Za-z0-9\-_.]{8,}))/gi,

  phones: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,

  credit_cards: /\b(?:3[47][0-9]{2}[- ]?[0-9]{6}[- ]?[0-9]{5}|(?:4[0-9]{3}|5[1-5][0-9]{2}|6011)[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4})\b/g
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extract unique, non-empty matches from text using a regex.
 * Prefers capture group 1 when present (e.g. for password values).
 */
function extractMatches(text, pattern) {
  const found = [];
  let m;
  const re = new RegExp(pattern.source, pattern.flags);
  while ((m = re.exec(text)) !== null) {
    const val = (m[1] || m[0]).trim();
    if (val && !found.includes(val)) found.push(val);
  }
  return found;
}

/**
 * Compute risk score based on what was found.
 * HIGH   — API keys or credit card numbers present
 * MEDIUM — Email + password pair found
 * LOW    — Only email / phone / other PII
 */
function computeRisk({ api_keys, credit_cards, passwords, emails, phones }) {
  if (api_keys.length > 0 || credit_cards.length > 0) return "HIGH";
  if (passwords.length > 0 && emails.length > 0)       return "MEDIUM";
  if (emails.length > 0 || phones.length > 0)          return "LOW";
  return "LOW";
}

/**
 * Generate a short plain-English explanation of the scan result.
 */
function generateExplanation(result) {
  const parts = [];
  if (result.api_keys.length)     parts.push(`${result.api_keys.length} API key(s)`);
  if (result.credit_cards.length) parts.push(`${result.credit_cards.length} credit card number(s)`);
  if (result.passwords.length)    parts.push(`${result.passwords.length} password(s)`);
  if (result.emails.length)       parts.push(`${result.emails.length} email address(es)`);
  if (result.phones.length)       parts.push(`${result.phones.length} phone number(s)`);

  if (!parts.length) return "No sensitive data detected in the provided text.";

  const riskMessages = {
    HIGH:   "This leak exposes critical secrets and poses HIGH risk. Immediate credential rotation and incident response is strongly advised.",
    MEDIUM: "This leak contains exposed account credentials and poses MEDIUM risk. Affected accounts should be secured promptly.",
    LOW:    "This leak contains limited PII and poses LOW risk. The data should still be treated as sensitive."
  };

  return `Detected: ${parts.join(", ")}. ${riskMessages[result.risk_score]}`;
}

// ─── Main Export ───────────────────────────────────────────────────────────────

/**
 * Analyze raw text for leaked sensitive data.
 *
 * @param {string} text — Raw input text to scan
 * @returns {{
 *   emails: string[],
 *   passwords: string[],
 *   api_keys: string[],
 *   phones: string[],
 *   credit_cards: string[],
 *   risk_score: "LOW"|"MEDIUM"|"HIGH",
 *   explanation: string
 * }}
 */
function analyzeLeak(text) {
  if (typeof text !== "string" || !text.trim()) {
    return {
      emails: [], passwords: [], api_keys: [],
      phones: [], credit_cards: [],
      risk_score: "LOW",
      explanation: "No input provided."
    };
  }

  const emails       = extractMatches(text, PATTERNS.emails);
  const passwords    = extractMatches(text, PATTERNS.passwords);
  const api_keys     = extractMatches(text, PATTERNS.api_keys);
  const phones       = extractMatches(text, PATTERNS.phones);
  const credit_cards = extractMatches(text, PATTERNS.credit_cards);
  const risk_score   = computeRisk({ emails, passwords, api_keys, phones, credit_cards });
  const explanation  = generateExplanation({ emails, passwords, api_keys, phones, credit_cards, risk_score });
  return { emails, passwords, api_keys, phones, credit_cards, risk_score, explanation };
}

module.exports = { analyzeLeak, computeRisk, generateExplanation };
