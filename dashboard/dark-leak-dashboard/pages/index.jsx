// pages/index.jsx

import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import ScanLoader from '../components/ScanLoader';
import { scanTarget } from '../lib/api';
import { Shield, Zap, Globe, Lock, AlertTriangle, Database } from 'lucide-react';

const features = [
  { icon: Database, label: '15B+ Records', sub: 'Breach database coverage' },
  { icon: Globe, label: 'Dark Web', sub: 'Forums & stealer logs' },
  { icon: Zap, label: 'Real-time', sub: 'Live monitoring alerts' },
  { icon: Lock, label: 'AI Analysis', sub: 'Risk scoring & summary' },
];

const recentBreaches = [
  { name: 'RockYou2024', records: '10B', date: 'Jan 2024', severity: 'critical' },
  { name: 'LinkedIn Scrape', records: '700M', date: 'Aug 2023', severity: 'high' },
  { name: 'Stealer Logs Leak', records: '2M', date: 'Mar 2024', severity: 'critical' },
  { name: 'Trello API Leak', records: '15M', date: 'Jan 2024', severity: 'medium' },
];

const severityColors = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
};

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState('');
  const [error, setError] = useState('');

  const handleScan = async (value) => {
    setError('');
    setTarget(value);
    setLoading(true);
    try {
      const result = await scanTarget(value);
      // Store in sessionStorage and navigate to results
      sessionStorage.setItem('scanResult', JSON.stringify({ ...result, target: value }));
      router.push('/results');
    } catch (err) {
      setError('Scan failed. Please check your input and try again.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-56px)] flex flex-col">
        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 relative">
          {/* Radial glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              <span className="font-mono text-[10px] text-accent tracking-widest">THREAT INTELLIGENCE PLATFORM</span>
            </div>

            {/* Title */}
            <h1 className="font-sans font-800 text-4xl sm:text-5xl lg:text-6xl text-white mb-3 leading-tight">
              Dark Web Leak{' '}
              <span className="text-accent glow-text">Detection</span>
            </h1>
            <p className="font-mono text-sm text-muted max-w-md mx-auto mb-10 leading-relaxed">
              Scan any email or domain across 15B+ compromised records. Instant AI-powered risk assessment.
            </p>

            {/* Search bar */}
            {loading ? (
              <ScanLoader target={target} />
            ) : (
              <>
                <SearchBar onScan={handleScan} loading={loading} />
                {error && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-danger font-mono text-xs">
                    <AlertTriangle size={12} />
                    {error}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Feature strips */}
        <section className="border-t border-[#1C2333] px-4 py-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1.5">
                <div className="w-8 h-8 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center">
                  <Icon size={14} className="text-accent" />
                </div>
                <p className="font-sans font-600 text-xs text-white">{label}</p>
                <p className="font-mono text-[10px] text-muted">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent breach ticker */}
        <section className="border-t border-[#1C2333] bg-[#0D1117]/50 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-4 overflow-x-auto scrollbar-hide">
            <span className="flex-shrink-0 font-mono text-[10px] text-accent tracking-widest">RECENT BREACHES</span>
            <div className="w-px h-4 bg-[#1C2333] flex-shrink-0" />
            <div className="flex items-center gap-6">
              {recentBreaches.map((b) => (
                <div key={b.name} className="flex-shrink-0 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${b.severity === 'critical' ? 'bg-red-500 animate-pulse' : b.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                  <span className="font-mono text-[10px] text-white whitespace-nowrap">{b.name}</span>
                  <span className={`font-mono text-[10px] ${severityColors[b.severity]}`}>{b.records}</span>
                  <span className="font-mono text-[10px] text-muted">{b.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
