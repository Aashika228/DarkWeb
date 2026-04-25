// components/StatCard.jsx
export default function StatCard({ label, value, sub, accent = false, icon: Icon, trend }) {
  return (
    <div
      className={`card-hover bg-[#0D1117] border rounded-lg p-4 flex flex-col gap-2 ${
        accent ? 'border-accent/30 shadow-glow-sm' : 'border-[#1C2333]'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted tracking-widest uppercase">{label}</span>
        {Icon && (
          <div className={`w-6 h-6 rounded flex items-center justify-center ${accent ? 'bg-accent/10' : 'bg-[#161B22]'}`}>
            <Icon size={11} className={accent ? 'text-accent' : 'text-muted'} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={`font-sans font-800 text-2xl sm:text-3xl leading-none ${accent ? 'text-accent glow-text' : 'text-white'}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend !== undefined && (
          <span className={`font-mono text-[10px] ${trend > 0 ? 'text-danger' : 'text-safe'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {sub && <p className="font-mono text-[10px] text-[#4A5568] leading-tight">{sub}</p>}
    </div>
  );
}
