#!/usr/bin/env node
// index.js — CLI entry point
// Usage: node index.js "email: abc@gmail.com password: 123456"

"use strict";

const { analyzeLeak } = require("./src/leakDetector");

const input = process.argv.slice(2).join(" ").trim();

if (!input) {
  console.log("\nUsage: node index.js \"<text to scan>\"\n");
  console.log("Examples:");
  console.log("  node index.js \"email: abc@gmail.com\"");
  console.log("  node index.js \"password: hunter2 email: a@b.com\"");
  console.log("  node index.js \"AKIAIOSFODNN7EXAMPLE\"\n");
  process.exit(0);
}

const result = analyzeLeak(input);

// Color output based on risk
const colors = { HIGH: "\x1b[31m", MEDIUM: "\x1b[33m", LOW: "\x1b[32m", reset: "\x1b[0m" };
const c = colors[result.risk_score];

console.log("\n── Leak Scan Result ──────────────────────────────");
console.log(`Risk Score : ${c}${result.risk_score}${colors.reset}`);
console.log(`Explanation: ${result.explanation}`);
console.log("\nJSON Output:");
console.log(JSON.stringify(result, null, 2));
console.log("──────────────────────────────────────────────────\n");
