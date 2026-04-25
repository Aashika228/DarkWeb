// services/scanService.js — Orchestrates the full scan pipeline
const { execFile } = require('child_process');
const path = require('path');
const repo           = require('../db/scanRepository');
const { runDetection } = require('./detectionService');
const { summariseRisk } = require('../utils/riskSummary');

/**
 * Full scan pipeline:
 *  1. Persist scan record (status = pending)
 *  2. Run threat detection against data sources
 *  3. Bulk-insert detected leaks
 *  4. Mark scan as completed (or failed on error)
 *
 * @param {string|null} userId
 * @param {string}      scanQuery
 * @param {'email'|'domain'} queryType
 * @returns {Promise<{ scan_id: string, leak_count: number, risk_summary: Object }>}
 */
const initiateScan = async (userId, scanQuery, queryType) => {
  // 1. Create scan record
  const scan = await repo.createScan(userId, scanQuery, queryType);

  try {
    // 2. Detect leaks
    const detectedLeaks = await runDetection(scanQuery, queryType);

    // 3. Persist leaks
    const insertedLeaks = await repo.insertLeaks(scan.id, detectedLeaks);

    // 4. Mark complete
    await repo.updateScanStatus(scan.id, 'completed');

    return {
      scan_id:      scan.id,
      leak_count:   insertedLeaks.length,
      risk_summary: summariseRisk(insertedLeaks),
    };
  } catch (err) {
    await repo.updateScanStatus(scan.id, 'failed');
    throw err;
  }
};

/**
 * Retrieve a scan + all its associated leaks.
 *
 * @param {string} scanId
 * @returns {Promise<{ scan: Object, leaks: Array }>}
 */
const getScanResults = async (scanId) => {
  const scan = await repo.getScanById(scanId);
  if (!scan) return null;

  const leaks = await repo.getLeaksByScanId(scanId);
  return { scan, leaks };
};
function searchCSV(query, type) {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '../scripts/search_csv.py');
    execFile('python', [scriptPath, query, type], { cwd: path.join(__dirname, '..') },
      (err, stdout) => {
        if (err) { console.error('CSV search error:', err.message); return resolve([]); }
        try { resolve(JSON.parse(stdout)); }
        catch { resolve([]); }
      }
    );
  });
}

module.exports = { initiateScan, getScanResults };
