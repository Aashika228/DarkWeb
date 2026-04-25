// components/RiskBadge.jsx
export const riskConfig = {
  critical: {
    label: 'CRITICAL',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    dot: 'bg-red-500',
    glow: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]',
  },
  high: {
    label: 'HIGH',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    dot: 'bg-orange-500',
    glow: 'shadow-[0_0_8px_rgba(249,115,22,0.4)]',
  },
  medium: {
    label: 'MEDIUM',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    dot: 'bg-yellow-500',
    glow: '',
  },
  low: {
    label: 'LOW',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    dot: 'bg-green-500',
    glow: '',
  },
};

export default function RiskBadge({ risk, size = 'sm' }) {
  const cfg = riskConfig[risk] || riskConfig.low;
  const textSize = size === 'lg' ? 'text-xs' : 'text-[10px]';
  const padding = size === 'lg' ? 'px-3 py-1.5' : 'px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono ${textSize} font-600 tracking-widest ${padding} rounded border ${cfg.bg} ${cfg.border} ${cfg.text} ${cfg.glow}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${risk === 'critical' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}
