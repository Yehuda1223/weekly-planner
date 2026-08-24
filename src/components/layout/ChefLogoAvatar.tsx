import React from 'react';

export const ChefLogoAvatar: React.FC<{ className?: string }> = ({ className = "w-11 h-11" }) => {
  return (
    <div className={`relative rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 p-[2px] shadow-lg shadow-orange-500/25 flex-shrink-0 group cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-orange-500/40 ${className}`}>
      <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-slate-950 via-zinc-900 to-zinc-950 overflow-hidden flex items-center justify-center relative">
        
        {/* Weekly Momentum Loop (7-Day Radiant Circle) SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Ambient Background Glow */}
            <radialGradient id="ringCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#e11d48" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Spark & Lightning Core Gradient */}
            <linearGradient id="sparkGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="30%" stopColor="#fde047" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Day 1 - Sunday: Sun Amber */}
            <linearGradient id="segSun" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Day 2 - Monday: Orange Flame */}
            <linearGradient id="segMon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Day 3 - Tuesday: Coral Rose */}
            <linearGradient id="segTue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>

            {/* Day 4 - Wednesday: Vivid Violet / Purple */}
            <linearGradient id="segWed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>

            {/* Day 5 - Thursday: Cyan Sky */}
            <linearGradient id="segThu" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Day 6 - Friday: Emerald Success */}
            <linearGradient id="segFri" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Day 7 - Saturday: Golden Sabbath / Target Ring */}
            <linearGradient id="segSat" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Central Radial Glow */}
          <circle cx="50" cy="50" r="42" fill="url(#ringCoreGlow)" />

          {/* Inner Calendar Plate Guide Ring */}
          <circle cx="50" cy="50" r="33" stroke="#27272a" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

          {/* The 7 Weekly Momentum Segments (Orbital Day Arcs) */}
          <g strokeWidth="4.5" strokeLinecap="round">
            {/* Day 1 (Top / Sunday - ~ -90 deg) */}
            <path d="M 45 15.5 A 35 35 0 0 1 58 15.8" stroke="url(#segSun)" />

            {/* Day 2 (Top Right / Monday - ~ -40 deg) */}
            <path d="M 68 20 A 35 35 0 0 1 81 33" stroke="url(#segMon)" />

            {/* Day 3 (Bottom Right / Tuesday - ~ +15 deg) */}
            <path d="M 85 45 A 35 35 0 0 1 80 62" stroke="url(#segTue)" />

            {/* Day 4 (Bottom / Wednesday - ~ +65 deg) */}
            <path d="M 69 75 A 35 35 0 0 1 50 85" stroke="url(#segWed)" />

            {/* Day 5 (Bottom Left / Thursday - ~ +125 deg) */}
            <path d="M 38 83 A 35 35 0 0 1 21 69" stroke="url(#segThu)" />

            {/* Day 6 (Top Left / Friday - ~ +180 deg) */}
            <path d="M 15 57 A 35 35 0 0 1 18 38" stroke="url(#segFri)" />

            {/* Day 7 (Top-Top Left / Saturday - ~ -130 deg) */}
            <path d="M 24 28 A 35 35 0 0 1 37 18" stroke="url(#segSat)" />
          </g>

          {/* Orbit Node Beads for each day */}
          <circle cx="50" cy="15" r="2.5" fill="#fde047" />
          <circle cx="75" cy="26" r="2.5" fill="#fb923c" />
          <circle cx="84" cy="53" r="2.5" fill="#f43f5e" />
          <circle cx="60" cy="81" r="2.5" fill="#c084fc" />
          <circle cx="28" cy="77" r="2.5" fill="#38bdf8" />
          <circle cx="16" cy="48" r="2.5" fill="#34d399" />
          <circle cx="30" cy="22" r="2.5" fill="#fbbf24" />

          {/* Center Dynamic Momentum Spark / Star & Target */}
          <g transform="translate(0, 0)">
            {/* Center Outer Disc */}
            <circle cx="50" cy="50" r="19" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="17" fill="url(#sparkGoldGrad)" fillOpacity="0.15" />

            {/* 4-Point High-Velocity Spark & Momentum Bolt */}
            {/* North-South-East-West Spark Flares */}
            <path 
              d="M 50 35 C 50 43 43 50 35 50 C 43 50 50 57 50 65 C 50 57 57 50 65 50 C 57 50 50 43 50 35 Z" 
              fill="url(#sparkGoldGrad)" 
            />

            {/* Inner Core Diamond */}
            <path 
              d="M 50 42 L 54.5 50 L 50 58 L 45.5 50 Z" 
              fill="#ffffff" 
            />

            {/* Central Success Check Mark / Focus Dot */}
            <circle cx="50" cy="50" r="2" fill="#ea580c" />
          </g>
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
