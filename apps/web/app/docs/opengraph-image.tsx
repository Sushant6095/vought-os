import { ImageResponse } from 'next/og';

export const alt = 'Vought Documentation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3358ff', fontWeight: 600, border: '1px solid rgba(51,88,255,0.4)', padding: '6px 16px', borderRadius: 100 }}>
            Documentation
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', fontSize: 88, fontWeight: 800, lineHeight: 1.0, letterSpacing: '-2px', color: '#ffffff' }}>
              Vought
            </div>
            <div style={{ display: 'flex', fontSize: 88, fontWeight: 800, lineHeight: 1.0, letterSpacing: '-2px', color: '#ffffff' }}>
              Docs.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.55)', fontWeight: 400, lineHeight: 1.5 }}>
              API reference, integration guides, and SDK documentation.
            </div>
            <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.55)', fontWeight: 400, lineHeight: 1.5 }}>
              For developers building on the Vought platform.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', fontSize: 16, color: '#3358ff', letterSpacing: '0.12em', fontWeight: 600 }}>
            Vought
          </div>
          <div style={{ display: 'flex', fontSize: 16, color: 'rgba(255,255,255,0.3)' }}>
            vought.com/docs
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
