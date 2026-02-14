import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const avg = searchParams.get('avg') || '0.938';
  const min = searchParams.get('min') || '0.912';
  const savings = searchParams.get('savings') || '83';
  const preset = searchParams.get('preset') || '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #001E2B 0%, #0A2E3F 50%, #001E2B 100%)',
          padding: '60px 70px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              fontSize: '36px',
              fontWeight: 800,
              color: '#00D4AA',
              letterSpacing: '-0.03em',
            }}
          >
            vai
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '16px',
              color: '#889397',
              borderLeft: '2px solid #3D4F58',
              paddingLeft: '16px',
            }}
          >
            Shared Space Explorer
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: '48px',
            fontWeight: 800,
            color: '#E8EDEB',
            lineHeight: 1.15,
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex' }}>3 Models. 1 Vector Space.</div>
          <div style={{ display: 'flex', color: '#00D4AA' }}>Proven.</div>
        </div>

        <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 32px',
              borderRadius: '16px',
              background: 'rgba(0, 212, 170, 0.12)',
              border: '2px solid rgba(0, 212, 170, 0.3)',
            }}
          >
            <div style={{ display: 'flex', fontSize: '56px', fontWeight: 800, color: '#00D4AA', lineHeight: 1 }}>
              {avg}
            </div>
            <div style={{ display: 'flex', fontSize: '16px', color: '#C1C7C6', marginTop: '8px' }}>
              cross-model similarity
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 32px',
              borderRadius: '16px',
              background: 'rgba(0, 212, 170, 0.05)',
              border: '1px solid #3D4F58',
            }}
          >
            <div style={{ display: 'flex', fontSize: '56px', fontWeight: 800, color: '#E8EDEB', lineHeight: 1 }}>
              {min}
            </div>
            <div style={{ display: 'flex', fontSize: '16px', color: '#C1C7C6', marginTop: '8px' }}>
              weakest pair (still &gt;0.90)
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 32px',
              borderRadius: '16px',
              background: 'rgba(64, 224, 255, 0.05)',
              border: '1px solid #3D4F58',
            }}
          >
            <div style={{ display: 'flex', fontSize: '56px', fontWeight: 800, color: '#40E0FF', lineHeight: 1 }}>
              {savings}%
            </div>
            <div style={{ display: 'flex', fontSize: '16px', color: '#C1C7C6', marginTop: '8px' }}>
              query cost savings
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ display: 'flex', fontSize: '18px', color: '#889397' }}>
            {preset && preset !== 'custom' ? `Preset: ${decodeURIComponent(preset)}  ·  ` : ''}vaicli.com/shared-space
          </div>
          <div style={{ display: 'flex', fontSize: '14px', color: '#3D4F58' }}>
            Powered by Voyage AI embedding models
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
