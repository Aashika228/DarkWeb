// controllers/healthController.js
const { supabase } = require('../db/pool');

const getHealth = async (req, res) => {
  const health = {
    status:    'ok',
    timestamp: new Date().toISOString(),
    uptime_s:  Math.floor(process.uptime()),
    db:        'unknown',
  };
  try {
    const { error } = await supabase.from('scans').select('id').limit(1);
    if (error) throw error;
    health.db = 'connected';
    return res.status(200).json(health);
  } catch {
    health.status = 'degraded';
    health.db     = 'unreachable';
    return res.status(503).json(health);
  }
};

module.exports = { getHealth };
