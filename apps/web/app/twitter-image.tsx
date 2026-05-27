import { ImageResponse } from 'next/og';

export const alt = 'Vought · Intelligence for live conversations.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          color: '#ffffff',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px 80px 72px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', width: 10, height: 10, borderRadius: '50%', background: '#3358ff' }} />
          <div style={{ display: 'flex', fontSize: 18, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            Vought
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', fontSize: 80, fontWeight: 800, lineHeight: 1.0, letterSpacing: '-2px', color: '#ffffff' }}>
              Intelligence for
            </div>
            <div style={{ display: 'flex', fontSize: 80, fontWeight: 800, lineHeight: 1.0, letterSpacing: '-2px', color: '#ffffff' }}>
              live conversations.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.55)', fontWeight: 400, lineHeight: 1.5 }}>
              Real-time voice intelligence. Sub-second latency.
            </div>
            <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.55)', fontWeight: 400, lineHeight: 1.5 }}>
              Built on ElevenLabs Speech Engine.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', fontSize: 16, color: '#3358ff', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
            · 412ms
          </div>
          <div style={{ display: 'flex', fontSize: 16, color: 'rgba(255,255,255,0.3)' }}>
            vought.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
