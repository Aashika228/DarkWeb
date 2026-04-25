// utils/logger.js — Minimal structured logger
const IS_PROD = process.env.NODE_ENV === 'production';

const log = (level, message, meta = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  const output = IS_PROD ? JSON.stringify(entry) : entry;
  level === 'error' ? console.error(output) : console.log(output);
};

module.exports = {
  info:  (msg, meta) => log('info',  msg, meta),
  warn:  (msg, meta) => log('warn',  msg, meta),
  error: (msg, meta) => log('error', msg, meta),
};
