// src/app.js — Express application factory
const express    = require('express');
const { v4: uuidv4 } = require('uuid');
const scanRoutes = require('../routes/scanRoutes');
const { getHealth } = require('../controllers/healthController');
const { getHistory } = require('../controllers/scanController');
const { supabase }  = require('../db/pool');
const logger        = require('../utils/logger');

const app = express();
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' }));

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json());

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, { ip: req.ip });
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.get('/health', getHealth);
app.get('/history', getHistory);  
app.use('/scan',    scanRoutes);
app.use('/results', scanRoutes);

app.post('/ingest', async (req, res) => {
  try {
    const { source, content, classification } = req.body;
    if (!content) return res.status(400).json({ error: 'content required' });

    const scan_id = uuidv4();

    await supabase.from('scans').insert({
      id:          scan_id,
      query:       source || 'pipeline',
      type:        'pipeline',
      leaks_found: classification?.types?.length > 0 ? 1 : 0,
      created_at:  new Date().toISOString(),
    });

    await supabase.from('leaks').insert({
      scan_id,
      source,
      content,
      risk_level: classification?.severity || 'LOW',
      findings:   classification,
    });

    res.status(202).json({ success: true, scan_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// ── Error middleware ───────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  const status  = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred.'
    : err.message;
  res.status(status).json({ success: false, error: message });
});

module.exports = app;  // ← exports at the very end, after all routes