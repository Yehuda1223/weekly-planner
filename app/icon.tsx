import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 192,
  height: 192,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #e11d48 100%)',
          borderRadius: '44px',
          fontSize: '110px',
          boxShadow: '0 12px 30px rgba(234, 88, 12, 0.45)',
        }}
      >
        📅
      </div>
    ),
    {
      ...size,
    }
  );
}
