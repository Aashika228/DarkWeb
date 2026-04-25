// components/Navbar.jsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Shield, LayoutDashboard, Search, Bell, Menu, X, Activity } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alerts] = useState(3);

  const links = [
    { href: '/', label: 'Scanner', icon: Search },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const isActive = (href) =>
    href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1C2333] bg-[#080C10]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-7 h-7 bg-accent/10 border border-accent/30 rounded flex items-center justify-center group-hover:border-accent/60 group-hover:bg-accent/20 transition-all">
                <Shield size={14} className="text-accent" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full animate-pulse-slow" />
            </div>
            <span className="font-sans font-700 text-sm tracking-wide text-white">
              DARK<span className="text-accent">SCAN</span>
            </span>
            <span className="hidden sm:block font-mono text-[9px] text-muted px-1.5 py-0.5 border border-[#1C2333] rounded tracking-widest">
              v2.4.1
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all ${
                  isActive(href)
                    ? 'text-accent bg-accent/10 border border-accent/20'
                    : 'text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={12} />
                {label.toUpperCase()}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-muted">
              <Activity size={10} className="text-safe animate-pulse-slow" />
              <span>MONITORING</span>
            </div>

            {/* Alert bell */}
            <button className="relative p-1.5 rounded hover:bg-white/5 transition-colors">
              <Bell size={14} className="text-muted hover:text-white transition-colors" />
              {alerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-danger text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {alerts}
                </span>
              )}
            </button>

            {/* Status pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-safe/10 border border-safe/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-safe rounded-full animate-pulse-slow" />
              <span className="font-mono text-[10px] text-safe tracking-wider">SECURE</span>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 rounded hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={16} className="text-white" /> : <Menu size={16} className="text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1C2333] bg-[#0D1117] px-4 py-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-mono tracking-wider transition-all ${
                isActive(href)
                  ? 'text-accent bg-accent/10'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={12} />
              {label.toUpperCase()}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
