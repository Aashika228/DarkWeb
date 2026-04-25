const { analyzeLeak } = require('../detection/leakDetector');
const mockLeaks = require('../data/mock_leaks.json');
const scanService        = require('../services/scanService');
const { validateScanInput } = require('../utils/validators');
const { summariseRisk }     = require('../utils/riskSummary');
const logger                = require('../utils/logger');

/**
 * POST /scan
 * Body: { query: string, type: "email" | "domain" }
 */
const createScan = async (req, res, next) => {
  try {
    const validationError = validateScanInput(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const { query, type } = req.body;
    // In a real system, extract userId from JWT / session middleware.
    // We leave it null here to keep the example self-contained.
    const userId = req.user?.id || null;

    logger.info('Scan initiated', { query, type });

    const result = await scanService.initiateScan(userId, query.trim().toLowerCase(), type);

    return res.status(202).json({
      success:      true,
      scan_id:      result.scan_id,
      leak_count:   result.leak_count,
      risk_summary: result.risk_summary,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /results/:scan_id
 */
const getScanResults = async (req, res, next) => {
  try {
    const { scan_id } = req.params;

    const data = await scanService.getScanResults(scan_id);

    if (!data) {
      return res.status(404).json({ success: false, error: 'Scan not found.' });
    }

    // ---------------- NEW CODE START ----------------

    const query = req.body.query?.toLowerCase().trim();
    const type  = req.body.type; // 'email' or 'domain'

    let results = data.leaks; // fallback (original leaks)

    if (query) {
      const relevant = data.leaks.filter(entry => {
        const text = entry.content?.toLowerCase() || '';

        if (type === 'domain') {
          const domain = query.includes('@') ? query.split('@')[1] : query;
          return text.includes(domain);
        }

        return text.includes(query);
      });

      results = relevant.map(entry => {
        const analysis = analyzeLeak(entry.content);

        return {
          source:     entry.source,
          content:    entry.content,
          risk_level: analysis.risk_score, // HIGH / MEDIUM / LOW
          findings:   analysis,
        };
      });
    }

    // ---------------- NEW CODE END ----------------

    return res.status(200).json({
      success:      true,
      scan:         data.scan,
      leaks:        results,
      risk_summary: summariseRisk(results),
    });

  } catch (err) {
    next(err);
  }
};
const getHistory = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { supabase } = require('../db/pool');

    const { data: scans, error } = await supabase
      .from('scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    // Count leaks per scan
    const enriched = await Promise.all((scans || []).map(async (scan) => {
      const { count } = await supabase
        .from('leaks')
        .select('*', { count: 'exact', head: true })
        .eq('scan_id', scan.id);
      return { ...scan, leaks_found: count || 0 };
    }));

    return res.status(200).json({ success: true, history: enriched });
  } catch (err) {
    next(err);
  }
};

module.exports = { createScan, getScanResults, getHistory };