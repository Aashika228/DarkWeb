const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function scanTarget(value) {
  const type = value.includes('@') ? 'email' : 'domain';
  const scanRes = await fetch(`${BASE}/scan`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ query: value, type }),
  });
  if (!scanRes.ok) throw new Error('Scan failed');
  const { scan_id } = await scanRes.json();

  const resultRes = await fetch(`${BASE}/results/${scan_id}`);
  if (!resultRes.ok) throw new Error('Failed to fetch results');
  const { leaks, scan } = await resultRes.json();

  return {
    scan_id,
    target:    value,
    scannedAt: scan?.created_at || new Date().toISOString(),
    leaks: (leaks || []).map(l => ({
      id:       l.id,
      source:   l.source,
      content:  l.content,
      risk:     l.risk_level?.toLowerCase(),
      findings: l.findings,
    })),
    summary: leaks?.[0]?.findings?.explanation || null,
  };
}

export async function getDashboardStats() {
  try {
    const res = await fetch(`${BASE}/history?limit=100`);
    const data = await res.json();
    console.log('HISTORY RESPONSE:', data);
    const history = data.history;

    if (!history || history.length === 0) return getEmptyStats();

    const totalLeaks    = history.reduce((s, r) => s + (r.leaks_found || 0), 0);
    const criticalCount = history.filter(r => r.leaks_found > 0).length;
    const highCount     = Math.floor(totalLeaks * 0.3);
    const mediumCount   = Math.floor(totalLeaks * 0.25);
    const lowCount      = Math.max(0, totalLeaks - criticalCount - highCount - mediumCount);

    const domains = [...new Set(history.filter(r => r.query_type === 'domain').map(r => r.query))];
    const emails  = [...new Set(history.filter(r => r.query_type === 'email').map(r => r.query))];

    const monthMap = {};
    history.forEach(r => {
      const month = new Date(r.created_at).toLocaleString('default', { month: 'short' });
      monthMap[month] = (monthMap[month] || 0) + (r.leaks_found || 0);
    });
    const leaksByMonth = Object.entries(monthMap).map(([month, leaks]) => ({ month, leaks }));

    const recentActivity = history.slice(0, 4).map(r => ({
  action:   r.status === 'completed' ? 'Scan complete' : 'Scan failed',
  target:   r.query,
  time:     timeAgo(r.created_at),
  severity: 'info',
}));

    return {
      totalLeaks,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      lastScan:         history[0].created_at,
      domainsMonitored: domains.length,
      emailsMonitored:  emails.length,
      riskDistribution: [
        { name: 'Critical', value: criticalCount },
        { name: 'High',     value: highCount     },
        { name: 'Medium',   value: mediumCount   },
        { name: 'Low',      value: lowCount      },
      ],
      leaksByMonth: leaksByMonth.length ? leaksByMonth : getEmptyStats().leaksByMonth,
      dataTypesExposed: getEmptyStats().dataTypesExposed,
      recentActivity,
    };

  } catch (err) {
    console.error('getDashboardStats failed:', err.message);
    return getEmptyStats();
  }
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getEmptyStats() {
  return {
    totalLeaks: 0, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0,
    lastScan: new Date().toISOString(),
    domainsMonitored: 0, emailsMonitored: 0,
    riskDistribution: [
      { name: 'Critical', value: 0 },
      { name: 'High',     value: 0 },
      { name: 'Medium',   value: 0 },
      { name: 'Low',      value: 0 },
    ],
    leaksByMonth: [
      { month: 'Jan', leaks: 0 }, { month: 'Feb', leaks: 0 },
      { month: 'Mar', leaks: 0 }, { month: 'Apr', leaks: 0 },
    ],
    dataTypesExposed: [
      { type: 'Passwords',       count: 0, pct: 0 },
      { type: 'Email Addresses', count: 0, pct: 0 },
      { type: 'Phone Numbers',   count: 0, pct: 0 },
      { type: 'Credit Cards',    count: 0, pct: 0 },
    ],
    recentActivity: [],
  };
}