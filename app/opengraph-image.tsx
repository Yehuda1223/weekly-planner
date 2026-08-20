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
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
          fontFamily: 'sans-serif',
          direction: 'rtl',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '180px',
            height: '180px',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #e11d48 100%)',
            borderRadius: '44px',
            fontSize: '110px',
            boxShadow: '0 20px 40px rgba(234, 88, 12, 0.35)',
            marginBottom: '30px',
          }}
        >
          📅
        </div>

        <div
          style={{
            fontSize: '52px',
            fontWeight: 900,
            color: '#1e293b',
            marginBottom: '12px',
          }}
        >
          תכנון שבועי
        </div>

        <div
          style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#c2410c',
          }}
        >
          ארוחות, כושר, דייטים, מטלות וקניות משפחתיות ✨
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
