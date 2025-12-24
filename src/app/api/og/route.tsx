
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // ?title=<title>
        const hasTitle = searchParams.has('title');
        const title = hasTitle
            ? searchParams.get('title')?.slice(0, 100)
            : 'Belmobile.be';

        // ?subtitle=<subtitle>
        const hasSubtitle = searchParams.has('subtitle');
        const subtitle = hasSubtitle
            ? searchParams.get('subtitle')?.slice(0, 100)
            : 'Buyback & Repair Experts';

        return new ImageResponse(
            (
                <div
                    style={{
                        fontSize: 60,
                        background: 'linear-gradient(to bottom right, #1e1b4b, #4338ca)',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontFamily: 'sans-serif',
                        position: 'relative',
                    }}
                >
                    {/* Background Decorative Circles */}
                    <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: '#4f46e5', filter: 'blur(100px)', opacity: 0.5, borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, background: '#eab308', filter: 'blur(100px)', opacity: 0.4, borderRadius: '50%' }} />

                    {/* Content Container */}
                    <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                        {/* Logo Text */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.02em' }}>BELMOBILE</span>
                            <span style={{ fontSize: 40, fontWeight: 900, color: '#facc15' }}>.BE</span>
                        </div>

                        {/* Main Title */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 40px' }}>
                            <span style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                {title}
                            </span>
                        </div>

                        {/* Subtitle / Value Prop */}
                        <div style={{
                            marginTop: 20,
                            padding: '16px 48px',
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 50,
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: 32, fontWeight: 600, color: '#e0e7ff' }}>
                                {subtitle}
                            </span>
                        </div>
                    </div>

                    {/* Footer Design Element */}
                    <div style={{ position: 'absolute', bottom: 40, display: 'flex', gap: 10, opacity: 0.6 }}>
                        <div style={{ width: 10, height: 10, background: '#fff', borderRadius: '50%' }} />
                        <div style={{ width: 10, height: 10, background: '#fff', borderRadius: '50%' }} />
                        <div style={{ width: 10, height: 10, background: '#fff', borderRadius: '50%' }} />
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch {
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
