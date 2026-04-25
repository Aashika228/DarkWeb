// server.js — Example Express API integration
// Install deps: npm install express
// Run: node server.js

"use strict";

const express = require("express");
const { analyzeLeak } = require("./src/leakDetector");

const app = express();
app.use(express.json());

// POST /scan — scan raw text for leaks
app.post("/scan", (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Request body must include a 'text' field." });
  }

  const result = analyzeLeak(text);

  // Example: block HIGH risk payloads from being stored/forwarded
  if (result.risk_score === "HIGH") {
    console.warn("[ALERT] HIGH risk leak detected:", result.explanation);
    // notifySecurityTeam(result); // plug in your alerting here
  }

  return res.json(result);
});

// GET /health
app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Leak Detector API running on http://localhost:${PORT}`);
  console.log("POST /scan  { \"text\": \"<raw text>\" }");
});
