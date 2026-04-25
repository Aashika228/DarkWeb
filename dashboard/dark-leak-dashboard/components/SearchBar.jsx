// components/SearchBar.jsx
import { useState } from 'react';
import { Search, Loader2, Globe, Mail, ChevronRight } from 'lucide-react';

export default function SearchBar({ onScan, loading }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const isEmail = value.includes('@');
  const isDomain = !isEmail && value.includes('.') && !value.includes('@');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || loading) return;
    onScan(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div
        className={`relative flex items-center gap-0 bg-[#0D1117] border rounded-lg transition-all duration-200 ${
          focused
            ? 'border-accent shadow-glow'
            : 'border-[#1C2333] hover:border-[#2C3445]'
        }`}
      >
        {/* Icon */}
        <div className="flex-shrink-0 pl-4 pr-2">
          {isEmail ? (
            <Mail size={14} className={focused ? 'text-accent' : 'text-muted'} />
          ) : isDomain ? (
            <Globe size={14} className={focused ? 'text-accent' : 'text-muted'} />
          ) : (
            <Search size={14} className={focused ? 'text-accent' : 'text-muted'} />
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Enter email or domain to scan..."
          className="flex-1 bg-transparent py-3.5 pr-3 text-sm font-mono text-white placeholder:text-[#3D4D60] outline-none"
          disabled={loading}
        />

        {/* Type indicator */}
        {(isEmail || isDomain) && !loading && (
          <span className="hidden sm:flex flex-shrink-0 items-center gap-1 font-mono text-[10px] px-2 py-0.5 mr-2 border border-accent/30 rounded text-accent bg-accent/5">
            {isEmail ? 'EMAIL' : 'DOMAIN'}
          </span>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!value.trim() || loading}
          className={`flex-shrink-0 flex items-center gap-2 px-5 py-3.5 rounded-r-lg text-sm font-mono font-600 tracking-wider transition-all duration-200 ${
            !value.trim() || loading
              ? 'text-muted cursor-not-allowed'
              : 'text-white bg-accent hover:bg-orange-600 active:scale-95'
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span className="hidden sm:block">SCANNING</span>
            </>
          ) : (
            <>
              <span>SCAN</span>
              <ChevronRight size={13} />
            </>
          )}
        </button>
      </div>

      {/* Hint text */}
      <p className="text-center text-[10px] font-mono text-[#3D4D60] mt-2.5 tracking-wider">
        TRY: user@example.com &nbsp;·&nbsp; example.com &nbsp;·&nbsp; yourcompany.io
      </p>
    </form>
  );
}
