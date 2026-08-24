import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #18181b 0%, #09090b 50%, #000000 100%)',
          borderRadius: '40px',
          border: '4px solid #f97316',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow backdrop */}
        <div
          style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.45) 0%, rgba(225, 29, 72, 0.15) 60%, rgba(0, 0, 0, 0) 100%)',
          }}
        />

        {/* Weekly Momentum 7-Segments Loop SVG */}
        <svg viewBox="0 0 100 100" style={{ width: '140px', height: '140px' }} fill="none">
          <defs>
            <linearGradient id="sparkGoldGradApple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="30%" stopColor="#fde047" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            <linearGradient id="segSunA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="segMonA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="segTueA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="segWedA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
            <linearGradient id="segThuA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="segFriA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="segSatA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Guide Track */}
          <circle cx="50" cy="50" r="33" stroke="#27272a" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

          {/* 7 Arcs for 7 Days */}
          <g strokeWidth="4.5" strokeLinecap="round">
            <path d="M 45 15.5 A 35 35 0 0 1 58 15.8" stroke="url(#segSunA)" />
            <path d="M 68 20 A 35 35 0 0 1 81 33" stroke="url(#segMonA)" />
            <path d="M 85 45 A 35 35 0 0 1 80 62" stroke="url(#segTueA)" />
            <path d="M 69 75 A 35 35 0 0 1 50 85" stroke="url(#segWedA)" />
            <path d="M 38 83 A 35 35 0 0 1 21 69" stroke="url(#segThuA)" />
            <path d="M 15 57 A 35 35 0 0 1 18 38" stroke="url(#segFriA)" />
            <path d="M 24 28 A 35 35 0 0 1 37 18" stroke="url(#segSatA)" />
          </g>

          {/* Day Beads */}
          <circle cx="50" cy="15" r="2.5" fill="#fde047" />
          <circle cx="75" cy="26" r="2.5" fill="#fb923c" />
          <circle cx="84" cy="53" r="2.5" fill="#f43f5e" />
          <circle cx="60" cy="81" r="2.5" fill="#c084fc" />
          <circle cx="28" cy="77" r="2.5" fill="#38bdf8" />
          <circle cx="16" cy="48" r="2.5" fill="#34d399" />
          <circle cx="30" cy="22" r="2.5" fill="#fbbf24" />

          {/* Center Target Disc & Spark */}
          <circle cx="50" cy="50" r="19" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
          <path 
            d="M 50 35 C 50 43 43 50 35 50 C 43 50 50 57 50 65 C 50 57 57 50 65 50 C 57 50 50 43 50 35 Z" 
            fill="url(#sparkGoldGradApple)" 
          />
          <path d="M 50 42 L 54.5 50 L 50 58 L 45.5 50 Z" fill="#ffffff" />
          <circle cx="50" cy="50" r="2" fill="#ea580c" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
