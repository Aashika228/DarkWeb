// db/scanRepository.js — Data access using Supabase JS client directly
const { supabase } = require('./pool');

const RISK_ORDER = { critical: 1, high: 2, medium: 3, low: 4 };

const createScan = async (userId, scanQuery, queryType) => {
  const { data, error } = await supabase
    .from('scans')
    .insert({ user_id: userId || null, query: scanQuery, query_type: queryType, status: 'pending' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const updateScanStatus = async (scanId, status) => {
  const { error } = await supabase
    .from('scans')
    .update({ status })
    .eq('id', scanId);
  if (error) throw new Error(error.message);
};

const insertLeaks = async (scanId, leakItems) => {
  if (!leakItems || leakItems.length === 0) return [];
  const rows = leakItems.map(item => ({
    scan_id:    scanId,
    content:    item.content,
    source:     item.source,
    risk_level: item.risk_level,
  }));
  const { data, error } = await supabase
    .from('leaks')
    .insert(rows)
    .select();
  if (error) throw new Error(error.message);
  return data;
};

const getScanById = async (scanId) => {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data || null;
};

const getLeaksByScanId = async (scanId) => {
  const { data, error } = await supabase
    .from('leaks')
    .select('*')
    .eq('scan_id', scanId);
  if (error) throw new Error(error.message);
  return (data || []).sort((a, b) =>
    (RISK_ORDER[a.risk_level] || 9) - (RISK_ORDER[b.risk_level] || 9)
  );
};

module.exports = { createScan, updateScanStatus, insertLeaks, getScanById, getLeaksByScanId };
