// src/index.js
require('dotenv').config();

const app      = require('./app');
const logger   = require('../utils/logger');
const { supabase } = require('../db/pool');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    // Verify Supabase connectivity
    const { error } = await supabase.from('scans').select('id').limit(1);
    if (error) throw new Error(error.message);
    logger.info('Supabase connection established.');

    const server = app.listen(PORT, () => {
      logger.info('Leak Detection API running', {
        port: PORT,
        env: process.env.NODE_ENV || 'development',
      });
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down.`);
      server.close(() => process.exit(0));
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server', { message: err.message });
    process.exit(1);
  }
};

start();
