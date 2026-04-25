// lib/mockApi.js
// Simulates backend API calls with realistic data and delays

export const mockLeaks = [
  {
    id: 'LK-001',
    email: 'admin@example.com',
    source: 'RockYou2024',
    date: '2024-01-15',
    risk: 'critical',
    dataTypes: ['password', 'email', 'username'],
    breach: 'RockYou2024 — 10B records',
    verified: true,
  },
  {
    id: 'LK-002',
    email: 'user@example.com',
    source: 'LinkedIn Scrape 2023',
    date: '2023-08-22',
    risk: 'high',
    dataTypes: ['email', 'phone', 'name', 'employer'],
    breach: 'LinkedIn Data Scrape — 700M records',
    verified: true,
  },
  {
    id: 'LK-003',
    email: 'contact@example.com',
    source: 'Stealer Logs Telegram',
    date: '2024-03-01',
    risk: 'critical',
    dataTypes: ['password', 'email', 'credit_card', 'session_token'],
    breach: 'Infostealer Campaign — 2M records',
    verified: false,
  },
  {
    id: 'LK-004',
    email: 'support@example.com',
    source: 'Adobe 2013',
    date: '2013-10-04',
    risk: 'medium',
    dataTypes: ['email', 'password_hint', 'username'],
    breach: 'Adobe Systems — 153M records',
    verified: true,
  },
  {
    id: 'LK-005',
    email: 'info@example.com',
    source: 'Canva 2019',
    date: '2019-05-24',
    risk: 'low',
    dataTypes: ['email', 'name', 'username'],
    breach: 'Canva — 137M records',
    verified: true,
  },
];

export const mockDashboardStats = {
  totalLeaks: 2847,
  criticalCount: 312,
  highCount: 891,
  mediumCount: 1104,
  lowCount: 540,
  lastScan: '2024-03-15T14:32:00Z',
  domainsMonitored: 12,
  emailsMonitored: 48,
  riskDistribution: [
    { name: 'Critical', value: 312, fill: '#EF4444' },
    { name: 'High', value: 891, fill: '#F97316' },
    { name: 'Medium', value: 1104, fill: '#EAB308' },
    { name: 'Low', value: 540, fill: '#22C55E' },
  ],
  leaksByMonth: [
    { month: 'Sep', leaks: 142 },
    { month: 'Oct', leaks: 289 },
    { month: 'Nov', leaks: 198 },
    { month: 'Dec', leaks: 421 },
    { month: 'Jan', leaks: 367 },
    { month: 'Feb', leaks: 512 },
    { month: 'Mar', leaks: 918 },
  ],
  dataTypesExposed: [
    { type: 'Passwords', count: 1832, pct: 64 },
    { type: 'Email Addresses', count: 2847, pct: 100 },
    { type: 'Phone Numbers', count: 1204, pct: 42 },
    { type: 'Full Names', count: 2103, pct: 74 },
    { type: 'Credit Cards', count: 287, pct: 10 },
    { type: 'Session Tokens', count: 412, pct: 14 },
    { type: 'SSN / Tax IDs', count: 89, pct: 3 },
  ],
  recentActivity: [
    { action: 'New breach detected', target: 'RockYou2024', time: '2h ago', severity: 'critical' },
    { action: 'Domain scan complete', target: 'example.com', time: '4h ago', severity: 'info' },
    { action: 'Alert triggered', target: 'admin@example.com', time: '6h ago', severity: 'high' },
    { action: 'New exposure found', target: 'contact@example.com', time: '1d ago', severity: 'critical' },
  ],
};

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export async function scanTarget(target) {
  await sleep(2200); // Simulate API delay

  // Simulate random scan behavior
  const leakCount = Math.floor(Math.random() * 4) + 2;
  const leaks = mockLeaks.slice(0, leakCount).map((l) => ({
    ...l,
    email: target.includes('@') ? target : `user@${target}`,
  }));

  const hasCritical = leaks.some((l) => l.risk === 'critical');
  const hasHigh = leaks.some((l) => l.risk === 'high');

  const summary = hasCritical
    ? `⚠️ Critical exposure detected for ${target}. Credentials found in active stealer logs suggest immediate password rotation and MFA enforcement across all services. Credit card data may be at risk — monitor financial accounts.`
    : hasHigh
    ? `Your target ${target} appears in ${leakCount} known data breaches. Password reuse across services poses the highest risk. We recommend immediate credential rotation and enabling 2FA where possible.`
    : `${target} was found in ${leakCount} lower-severity breaches. While no critical credentials were exposed, reviewing account security and enabling alerts is advised.`;

  return { leaks, summary, scannedAt: new Date().toISOString() };
}

export async function getDashboardStats() {
  await sleep(600);
  return mockDashboardStats;
}
