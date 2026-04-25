// pages/dashboard.jsx
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { getDashboardStats } from '../lib/api';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  Shield, AlertTriangle, Database, Globe, Clock,
  TrendingUp, Eye, Activity, Zap, ChevronRight
} from 'lucide-react';

const RISK_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0D1117] border border-[#1C2333] rounded-lg px-3 py-2">
        <p className="font-mono text-[11px] text-white">{payload[0].name}</p>
        <p className="font-mono text-[11px] text-accent">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const AreaTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0D1117] border border-[#1C2333] rounded-lg px-3 py-2">
        <p className="font-mono text-[10px] text-muted">{label}</p>
        <p className="font-mono text-[11px] text-accent">{payload[0].value} leaks</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-24 h-4 bg-[#1C2333] rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-[#0D1117] border border-[#1C2333] rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-[#0D1117] border border-[#1C2333] rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-accent" />
              <h1 className="font-sans font-700 text-xl text-white">Security Dashboard</h1>
            </div>
            <p className="font-mono text-[10px] text-muted">
              Last updated: {new Date(stats.lastScan).toLocaleString()} &nbsp;·&nbsp;
              {stats.domainsMonitored} domains &nbsp;·&nbsp; {stats.emailsMonitored} emails monitored
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg font-mono text-xs text-accent hover:bg-accent/20 transition-colors self-start sm:self-auto">
            <Zap size={11} /> RUN FULL SCAN
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="Total Leaks"
            value={stats.totalLeaks}
            sub="Across all monitored assets"
            accent
            icon={Database}
            trend={18}
          />
          <StatCard
            label="Critical"
            value={stats.criticalCount}
            sub="Requires immediate action"
            icon={AlertTriangle}
            trend={7}
          />
          <StatCard
            label="Domains"
            value={stats.domainsMonitored}
            sub="Under active monitoring"
            icon={Globe}
          />
          <StatCard
            label="Emails"
            value={stats.emailsMonitored}
            sub="Protected accounts"
            icon={Eye}
          />
        </div>

        {/* Charts row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Pie chart */}
          <div className="bg-[#0D1117] border border-[#1C2333] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-[10px] text-muted tracking-widest">RISK DISTRIBUTION</h2>
              <Shield size={12} className="text-muted" />
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={140}>
                <PieChart>
                  <Pie
                    data={stats.riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.riskDistribution.map((entry, i) => (
                      <Cell key={i} fill={RISK_COLORS[i]} opacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {stats.riskDistribution.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: RISK_COLORS[i] }} />
                      <span className="font-mono text-[10px] text-muted">{item.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Area chart */}
          <div className="bg-[#0D1117] border border-[#1C2333] rounded-xl p-5 sm:col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-[10px] text-muted tracking-widest">LEAKS OVER TIME</h2>
              <TrendingUp size={12} className="text-muted" />
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={stats.leaksByMonth} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="leakGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2333" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#8B949E', fontFamily: 'IBM Plex Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#8B949E', fontFamily: 'IBM Plex Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<AreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="leaks"
                  stroke="#F97316"
                  strokeWidth={2}
                  fill="url(#leakGrad)"
                  dot={{ fill: '#F97316', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#F97316' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Data types exposed */}
          <div className="bg-[#0D1117] border border-[#1C2333] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-[10px] text-muted tracking-widest">DATA TYPES EXPOSED</h2>
              <Database size={12} className="text-muted" />
            </div>
            <div className="space-y-3">
              {stats.dataTypesExposed.map(({ type, count, pct }) => (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] text-[#C9D1D9]">{type}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted">{count.toLocaleString()}</span>
                      <span className="font-mono text-[10px] text-accent">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1 bg-[#1C2333] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        background: pct > 80 ? '#EF4444' : pct > 40 ? '#F97316' : pct > 15 ? '#EAB308' : '#22C55E',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-[#0D1117] border border-[#1C2333] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-[10px] text-muted tracking-widest">RECENT ACTIVITY</h2>
              <Clock size={12} className="text-muted" />
            </div>
            <div className="space-y-3">
              {stats.recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-[#1C2333] last:border-0 last:pb-0">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    item.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                    item.severity === 'high' ? 'bg-orange-500' :
                    item.severity === 'info' ? 'bg-blue-400' : 'bg-muted'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[11px] text-white">{item.action}</p>
                    <p className="font-mono text-[10px] text-muted truncate">{item.target}</p>
                  </div>
                  <span className="font-mono text-[10px] text-[#4A5568] flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 flex items-center justify-center gap-1 font-mono text-[10px] text-muted hover:text-white transition-colors pt-2">
              VIEW ALL ACTIVITY <ChevronRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
