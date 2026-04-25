// utils/validators.js — Input sanitisation & validation helpers

const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

/**
 * Validate the /scan request body.
 * Returns an error string or null if valid.
 *
 * @param {{ query?: any, type?: any }} body
 * @returns {string|null}
 */
const validateScanInput = ({ query, type } = {}) => {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return '"query" is required and must be a non-empty string.';
  }

  if (!type || !['email', 'domain'].includes(type)) {
    return '"type" must be one of: "email", "domain".';
  }

  const q = query.trim().toLowerCase();

  if (type === 'email' && !EMAIL_RE.test(q)) {
    return `"${query}" is not a valid email address.`;
  }

  if (type === 'domain' && !DOMAIN_RE.test(q)) {
    return `"${query}" is not a valid domain name.`;
  }

  return null;
};

module.exports = { validateScanInput };
