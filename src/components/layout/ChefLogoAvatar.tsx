import React from 'react';

export const ChefLogoAvatar: React.FC<{ className?: string }> = ({ className = "w-11 h-11" }) => {
  return (
    <div className={`relative rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 p-[2px] shadow-lg shadow-orange-500/25 flex-shrink-0 group cursor-pointer transition-transform hover:scale-105 active:scale-95 ${className}`}>
      <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-slate-900 via-zinc-900 to-black overflow-hidden flex items-center justify-center relative">
        
        {/* Modern Weekly Planner Logo SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="100%" stopColor="#fed7aa" />
            </linearGradient>
            <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Radial Ambient Glow */}
          <circle cx="50" cy="52" r="38" fill="url(#glowGrad)" />

          {/* Calendar Body Base Plate */}
          <rect x="18" y="24" width="64" height="60" rx="14" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
          <rect x="20" y="26" width="60" height="56" rx="12" fill="url(#calGrad)" fillOpacity="0.08" />

          {/* Calendar Header Bar with Gradient */}
          <path d="M 18 36 C 18 29.37 23.37 24 30 24 L 70 24 C 76.63 24 82 29.37 82 36 L 82 40 L 18 40 Z" fill="url(#headerGrad)" />

          {/* Calendar Spiral Rings / Pins */}
          <rect x="30" y="16" width="5" height="12" rx="2.5" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
          <rect x="47.5" y="16" width="5" height="12" rx="2.5" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
          <rect x="65" y="16" width="5" height="12" rx="2.5" fill="#f8fafc" stroke="#475569" strokeWidth="1" />

          {/* Weekly Days Grid Matrix (7 Days dots / blocks) */}
          <g transform="translate(24, 46)">
            {/* Row 1 - Days 1 to 4 */}
            <rect x="0" y="0" width="8" height="8" rx="2.5" fill="#fb923c" fillOpacity="0.9" />
            <rect x="14" y="0" width="8" height="8" rx="2.5" fill="#fbbf24" fillOpacity="0.9" />
            <rect x="28" y="0" width="8" height="8" rx="2.5" fill="#f43f5e" fillOpacity="0.9" />
            <rect x="42" y="0" width="8" height="8" rx="2.5" fill="#a855f7" fillOpacity="0.9" />

            {/* Row 2 - Days 5 to 7 + Goal Checkmark */}
            <rect x="0" y="14" width="8" height="8" rx="2.5" fill="#38bdf8" fillOpacity="0.9" />
            <rect x="14" y="14" width="8" height="8" rx="2.5" fill="#34d399" fillOpacity="0.9" />
            <rect x="28" y="14" width="8" height="8" rx="2.5" fill="#fb923c" fillOpacity="0.9" />
            
            {/* Weekly Target Completed Badge */}
            <circle cx="46" cy="18" r="6" fill="url(#accentGrad)" />
            <path d="M 43.5 18 L 45.2 19.8 L 48.8 16.2" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Dumbbell & Fork subtle emblems at bottom */}
          <path d="M 32 74 L 38 74 M 32 72 L 32 76 M 38 72 L 38 76 M 35 72.5 L 35 75.5" stroke="#f97316" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <path d="M 64 71 L 64 77 M 62 71 L 62 73.5 C 62 74.5 66 74.5 66 73.5 L 66 71" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        </svg>

      </div>

      {/* Floating Sparkle / Active Status Badge */}
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-[9px] font-black text-zinc-950 shadow-md border-2 border-white dark:border-zinc-900 animate-pulse">
        ✦
      </span>
    </div>
  );
};

export const AppLogo = ChefLogoAvatar;

