// components/LeakCard.jsx
import { Database, Calendar, CheckCircle, AlertCircle, Hash } from 'lucide-react';
import RiskBadge from './RiskBadge';

const dataTypeColors = {
  password: 'text-red-400 border-red-400/30 bg-red-400/5',
  credit_card: 'text-red-400 border-red-400/30 bg-red-400/5',
  session_token: 'text-orange-400 border-orange-400/30 bg-orange-400/5',
  email: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  phone: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  name: 'text-teal-400 border-teal-400/30 bg-teal-400/5',
  username: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/5',
  employer: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/5',
  password_hint: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
};

const formatDataType = (t) =>
  t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function LeakCard({ leak, index }) {
  return (
    <div
      className="card-hover bg-[#0D1117] border border-[#1C2333] rounded-lg p-4 sm:p-5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 w-7 h-7 bg-[#161B22] border border-[#1C2333] rounded flex items-center justify-center">
            <Database size={12} className="text-accent" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs text-white truncate font-500">{leak.breach}</p>
            <p className="font-mono text-[10px] text-muted mt-0.5 flex items-center gap-1">
              <Hash size={8} />
              {leak.id}
            </p>
          </div>
        </div>
        <RiskBadge risk={leak.risk} />
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 border-t border-[#1C2333] pt-3">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted">
          <Calendar size={9} />
          <span>{new Date(leak.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          {leak.verified ? (
            <><CheckCircle size={9} className="text-safe" /><span className="text-safe">Verified</span></>
          ) : (
            <><AlertCircle size={9} className="text-warn" /><span className="text-warn">Unverified</span></>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted">
          <span className="text-[#8B949E]">Source:</span>
          <span className="text-white truncate">{leak.source}</span>
        </div>
      </div>

      {/* Data types exposed */}
      <div className="flex flex-wrap gap-1.5">
        {(leak.dataTypes || leak.findings?.types || []).map((dt) => (
          <span
            key={dt}
            className={`font-mono text-[9px] tracking-wider px-2 py-0.5 border rounded ${
              dataTypeColors[dt] || 'text-muted border-[#1C2333] bg-transparent'
            }`}
          >
            {formatDataType(dt)}
          </span>
        ))}
      </div>
    </div>
  );
}
