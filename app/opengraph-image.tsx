import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'תכנון שבועי - ארוחות, כושר וסגנון חיים';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #09090b 0%, #18181b 50%, #000000 100%)',
          fontFamily: 'sans-serif',
          direction: 'rtl',
          position: 'relative',
        }}
      >
        {/* Ambient Glow in Background */}
        <div
          style={{
            position: 'absolute',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, rgba(225, 29, 72, 0.1) 60%, rgba(0, 0, 0, 0) 100%)',
          }}
        />

        {/* Central Logo Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '150px',
            height: '150px',
            background: '#18181b',
            borderRadius: '38px',
            border: '4px solid #f97316',
            boxShadow: '0 20px 40px rgba(249, 115, 22, 0.4)',
            marginBottom: '28px',
          }}
        >
          <svg viewBox="0 0 100 100" style={{ width: '120px', height: '120px' }} fill="none">
            <defs>
              <linearGradient id="ogSparkGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="30%" stopColor="#fde047" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>

            <circle cx="50" cy="50" r="33" stroke="#27272a" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

            <g strokeWidth="4.5" strokeLinecap="round">
              <path d="M 45 15.5 A 35 35 0 0 1 58 15.8" stroke="#fde047" />
              <path d="M 68 20 A 35 35 0 0 1 81 33" stroke="#fb923c" />
              <path d="M 85 45 A 35 35 0 0 1 80 62" stroke="#f43f5e" />
              <path d="M 69 75 A 35 35 0 0 1 50 85" stroke="#c084fc" />
              <path d="M 38 83 A 35 35 0 0 1 21 69" stroke="#38bdf8" />
              <path d="M 15 57 A 35 35 0 0 1 18 38" stroke="#34d399" />
              <path d="M 24 28 A 35 35 0 0 1 37 18" stroke="#fbbf24" />
            </g>

            <circle cx="50" cy="50" r="18" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
            <path 
              d="M 50 35 C 50 43 43 50 35 50 C 43 50 50 57 50 65 C 50 57 57 50 65 50 C 57 50 50 43 50 35 Z" 
              fill="url(#ogSparkGold)" 
            />
            <path d="M 50 42 L 54.5 50 L 50 58 L 45.5 50 Z" fill="#ffffff" />
            <circle cx="50" cy="50" r="2" fill="#ea580c" />
          </svg>
        </div>

        <div
          style={{
            fontSize: '54px',
            fontWeight: 900,
            color: '#f8fafc',
            marginBottom: '10px',
            letterSpacing: '-0.02em',
          }}
        >
          תכנון שבועי
        </div>

        <div
          style={{
            fontSize: '26px',
            fontWeight: 600,
            color: '#fb923c',
          }}
        >
          ארוחות, כושר, משימות והרגלים שבועיים ✦
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
