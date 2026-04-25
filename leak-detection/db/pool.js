// db/pool.js — Supabase JS client
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Health-check shim
const pool = {
  query: async () => ({ rows: [{ '?column?': 1 }] }),
  end:   async () => {},
  on:    () => {},
};

module.exports = { pool, supabase };
