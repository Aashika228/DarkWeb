-- ============================================================
-- Leak Detection & Threat Intelligence System — Schema
-- Run this in your Supabase SQL editor (or psql)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scans
CREATE TABLE IF NOT EXISTS scans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  query       TEXT NOT NULL,
  query_type  TEXT NOT NULL CHECK (query_type IN ('email', 'domain')),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leaks
CREATE TABLE IF NOT EXISTS leaks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id     UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  source      TEXT NOT NULL,
  risk_level  TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scans_user_id    ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_query      ON scans(query);
CREATE INDEX IF NOT EXISTS idx_leaks_scan_id    ON leaks(scan_id);
CREATE INDEX IF NOT EXISTS idx_leaks_risk_level ON leaks(risk_level);
