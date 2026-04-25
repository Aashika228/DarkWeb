// leakDetector.test.js — run with: npx jest

"use strict";

const { analyzeLeak } = require("../src/leakDetector");

// ─── Email Detection ───────────────────────────────────────────────────────────
describe("Email detection", () => {
  test("detects a single email", () => {
    const r = analyzeLeak("Contact us at hello@example.com");
    expect(r.emails).toContain("hello@example.com");
  });

  test("detects multiple emails", () => {
    const r = analyzeLeak("a@gmail.com and b@yahoo.com");
    expect(r.emails.length).toBe(2);
  });

  test("does not duplicate the same email", () => {
    const r = analyzeLeak("a@b.com a@b.com a@b.com");
    expect(r.emails.length).toBe(1);
  });
});

// ─── Password Detection ────────────────────────────────────────────────────────
describe("Password detection", () => {
  test("detects password: value pattern", () => {
    const r = analyzeLeak("password: hunter2");
    expect(r.passwords).toContain("hunter2");
  });

  test("detects pwd= pattern", () => {
    const r = analyzeLeak("pwd=SuperSecret99!");
    expect(r.passwords).toContain("SuperSecret99!");
  });

  test("detects passwd: pattern", () => {
    const r = analyzeLeak("passwd: abc123");
    expect(r.passwords).toContain("abc123");
  });
});

// ─── API Key Detection ─────────────────────────────────────────────────────────
describe("API key detection", () => {
  test("detects AWS IAM key", () => {
    const r = analyzeLeak("key: AKIAIOSFODNN7EXAMPLE");
    expect(r.api_keys.some(k => k.includes("AKIA"))).toBe(true);
  });

  test("detects Stripe live key", () => {
    const r = analyzeLeak("sk-live-4242424242424242abcd");
    expect(r.api_keys.length).toBeGreaterThan(0);
  });

  test("detects generic api_key label", () => {
    const r = analyzeLeak("api_key: mySecretKey1234");
    expect(r.api_keys.length).toBeGreaterThan(0);
  });
});

// ─── Phone Detection ───────────────────────────────────────────────────────────
describe("Phone number detection", () => {
  test("detects US format", () => {
    const r = analyzeLeak("Call me at 800-555-1234");
    expect(r.phones.length).toBeGreaterThan(0);
  });

  test("detects international format", () => {
    const r = analyzeLeak("+91-9876543210");
    expect(r.phones.length).toBeGreaterThan(0);
  });
});

// ─── Credit Card Detection ─────────────────────────────────────────────────────
describe("Credit card detection", () => {
  test("detects Visa number", () => {
    const r = analyzeLeak("card: 4111 1111 1111 1111");
    expect(r.credit_cards.length).toBeGreaterThan(0);
  });

  test("detects Amex number", () => {
    const r = analyzeLeak("amex: 3714 496353 98431");
    expect(r.credit_cards.length).toBeGreaterThan(0);
  });
});

// ─── Risk Scoring ──────────────────────────────────────────────────────────────
describe("Risk scoring", () => {
  test("email only → LOW", () => {
    expect(analyzeLeak("hello@gmail.com").risk_score).toBe("LOW");
  });

  test("phone only → LOW", () => {
    expect(analyzeLeak("call 800-555-1234").risk_score).toBe("LOW");
  });

  test("email + password → MEDIUM", () => {
    expect(analyzeLeak("email: a@b.com password: secret123").risk_score).toBe("MEDIUM");
  });

  test("AWS API key → HIGH", () => {
    expect(analyzeLeak("AKIAIOSFODNN7EXAMPLE").risk_score).toBe("HIGH");
  });

  test("Stripe key → HIGH", () => {
    expect(analyzeLeak("sk-live-4242424242424242abcd").risk_score).toBe("HIGH");
  });

  test("credit card → HIGH", () => {
    expect(analyzeLeak("4111 1111 1111 1111").risk_score).toBe("HIGH");
  });

  test("empty input → LOW with safe explanation", () => {
    const r = analyzeLeak("");
    expect(r.risk_score).toBe("LOW");
    expect(r.explanation).toBeTruthy();
  });
});

// ─── Explanation ───────────────────────────────────────────────────────────────
describe("Explanation generation", () => {
  test("returns a non-empty string", () => {
    const r = analyzeLeak("email: a@b.com password: 1234");
    expect(typeof r.explanation).toBe("string");
    expect(r.explanation.length).toBeGreaterThan(0);
  });

  test("mentions credential type in explanation", () => {
    const r = analyzeLeak("AKIAIOSFODNN7EXAMPLE");
    expect(r.explanation.toLowerCase()).toContain("api key");
  });
});
