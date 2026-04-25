// pages/results.jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import LeakCard from '../components/LeakCard';
import RiskBadge from '../components/RiskBadge';
import { AlertTriangle, ArrowLeft, Bot, ChevronRight, Shield, Search } from 'lucide-react';
import Link from 'next/link';

export default function Results() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('scanResult');
    if (stored) {
      setData(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-6 h-6" />
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <AlertTriangle size={32} className="text-warn mx-auto mb-4" />
          <h2 className="font-sans font-700 text-xl text-white mb-2">No scan results found</h2>
          <p className="font-mono text-xs text-muted mb-6">Run a scan from the home page first.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white font-mono text-xs rounded hover:bg-orange-600 transition-colors">
            <Search size={12} /> Run a Scan
          </Link>
        </div>
      </Layout>
    );
  }

  const { leaks, summary, target, scannedAt } = data;
  const criticalCount = leaks.filter((l) => l.risk === 'critical').length;
  const highCount = leaks.filter((l) => l.risk === 'high').length;

  const overallRisk =
    criticalCount > 0 ? 'critical' : highCount > 0 ? 'high' : leaks.some((l) => l.risk === 'medium') ? 'medium' : 'low';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-white transition-colors mb-6 group">
          <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
          BACK TO SCANNER
        </Link>

        {/* Header card */}
        <div className="bg-[#0D1117] border border-[#1C2333] rounded-xl p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] text-muted tracking-widest mb-1">SCAN TARGET</p>
              <h1 className="font-mono text-lg sm:text-xl text-white font-500 break-all">{target}</h1>
              <p className="font-mono text-[10px] text-[#4A5568] mt-1">
                Scanned {new Date(scannedAt).toLocaleString()} &nbsp;·&nbsp; {leaks.length} exposures found
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <RiskBadge risk={overallRisk} size="lg" />
              <p className="font-mono text-[10px] text-muted">Overall Risk Level</p>
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-4 gap-2 mt-5 pt-5 border-t border-[#1C2333]">
            {[
              { label: 'Total', value: leaks.length, color: 'text-white' },
              { label: 'Critical', value: criticalCount, color: 'text-red-400' },
              { label: 'High', value: highCount, color: 'text-orange-400' },
              { label: 'Other', value: leaks.length - criticalCount - highCount, color: 'text-muted' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`font-sans font-800 text-xl ${color}`}>{value}</p>
                <p className="font-mono text-[10px] text-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        {summary && (
          <div className="bg-[#0D1117] border border-accent/25 rounded-xl p-5 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-accent/10 border border-accent/30 rounded flex items-center justify-center">
                  <Bot size={12} className="text-accent" />
                </div>
                <span className="font-mono text-[10px] text-accent tracking-widest">AI RISK SUMMARY</span>
              </div>
              <p className="font-mono text-xs text-[#C9D1D9] leading-relaxed">{summary}</p>
              <div className="mt-3 pt-3 border-t border-[#1C2333] flex items-center gap-1.5">
                <Shield size={10} className="text-muted" />
                <span className="font-mono text-[10px] text-muted">Generated by DarkScan AI · For informational purposes only</span>
              </div>
            </div>
          </div>
        )}

        {/* Leaks list */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-xs text-muted tracking-widest">BREACH RECORDS ({leaks.length})</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1 font-mono text-[10px] text-accent hover:text-orange-300 transition-colors"
          >
            VIEW DASHBOARD <ChevronRight size={10} />
          </button>
        </div>

        <div className="stagger space-y-3">
          {leaks.map((leak, i) => (
            <LeakCard key={leak.id} leak={leak} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 bg-[#0D1117] border border-[#1C2333] rounded-xl p-5 text-center">
          <p className="font-sans font-600 text-sm text-white mb-1">Enable Continuous Monitoring</p>
          <p className="font-mono text-[10px] text-muted mb-4">Get instant alerts when your data appears in new breaches</p>
          <button className="px-6 py-2.5 bg-accent hover:bg-orange-600 text-white font-mono text-xs rounded-lg transition-colors tracking-wider">
            UPGRADE TO PRO
          </button>
        </div>
      </div>
    </Layout>
  );
}
