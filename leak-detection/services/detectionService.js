// services/detectionService.js — Core threat matching logic
const path     = require('path');
const { execFile } = require('child_process');
const mockData = require(path.join(__dirname, '../data/mock_leaks.json'));

const isMatch = (storedQuery, inputQuery, queryType) => {
  const stored = storedQuery.toLowerCase();
  const input  = inputQuery.toLowerCase();
  if (queryType === 'email')  return stored === input;
  if (queryType === 'domain') return stored === input || stored.endsWith(`.${input}`);
  return false;
};

function searchCSV(query, type) {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '../scripts/search_csv.py');
    execFile(
      'python',
      [scriptPath, query, type],
      { cwd: path.join(__dirname, '..') },
      (err, stdout) => {
        if (err) {
          console.error('[CSV] search error:', err.message);
          return resolve([]);
        }
        try   { resolve(JSON.parse(stdout)); }
        catch { resolve([]); }
      }
    );
  });
}

const runDetection = async (inputQuery, queryType) => {
  await new Promise((resolve) => setTimeout(resolve, 120));

  // 1. Mock dataset results
  const mockMatches = mockData
    .filter(entry =>
      entry.query_type === queryType &&
      isMatch(entry.query, inputQuery, queryType)
    )
    .map(({ content, source, risk_level }) => ({ content, source, risk_level }));

  // 2. CSV dataset results (real breach data)
  const csvMatches = await searchCSV(inputQuery, queryType);
  const csvFormatted = csvMatches.map(r => ({
    content:    r.content,
    source:     r.source,
    risk_level: r.risk_level,
  }));

  // 3. Merge and return
  return [...mockMatches, ...csvFormatted];
};

module.exports = { runDetection };