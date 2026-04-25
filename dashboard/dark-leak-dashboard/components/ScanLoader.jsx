// components/ScanLoader.jsx
import { useEffect, useState } from 'react';

const steps = [
  'Initializing scan engine...',
  'Querying breach databases...',
  'Cross-referencing stealer logs...',
  'Scanning dark web forums...',
  'Checking Telegram channels...',
  'Analyzing exposed credentials...',
  'Generating risk assessment...',
  'Compiling AI summary...',
];

export default function ScanLoader({ target }) {
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }, 260);
    const dotTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => {
      clearInterval(stepTimer);
      clearInterval(dotTimer);
    };
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto py-8">
      {/* Progress bar */}
      <div className="h-px bg-[#1C2333] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-orange-300 rounded-full transition-all duration-300"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Target being scanned */}
      <div className="text-center mb-6">
        <p className="font-mono text-[10px] text-muted tracking-widest mb-1">SCANNING TARGET</p>
        <p className="font-mono text-sm text-accent">{target}</p>
      </div>

      {/* Step log */}
      <div className="bg-[#0D1117] border border-[#1C2333] rounded-lg p-4 font-mono text-[11px] space-y-1.5 max-h-40 overflow-hidden">
        {steps.slice(0, step + 1).map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-safe">{'>'}</span>
            <span className={i === step ? 'text-white' : 'text-[#4A5568]'}>
              {s}
              {i === step ? <span className="text-accent">{dots}</span> : <span className="text-safe ml-1">✓</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <p className="text-center text-[10px] font-mono text-[#3D4D60] mt-4 tracking-wider">
        QUERYING 15+ BREACH DATABASES &nbsp;·&nbsp; DO NOT CLOSE
      </p>
    </div>
  );
}
