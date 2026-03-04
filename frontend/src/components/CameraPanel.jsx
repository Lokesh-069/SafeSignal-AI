import { useState } from "react";

export default function CameraPanel() {

    const [loaded, setLoaded] = useState(false)

    return (
        <div
            className="glass-card animated-glow-border animate-fade-in animate-fade-in-delay-1"
            style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                height: '100%'
            }}
        >

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <div className="panel-label">Live Camera Feed</div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: 'var(--neon-green)'
                }}>
                    <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--neon-green)',
                        animation: 'pulse-dot 1.5s ease-in-out infinite'
                    }} />
                    LIVE
                </div>

            </div>

            {/* Video Container */}
            <div style={{
                position: 'relative',
                flex: 1,
                minHeight: 280,
                borderRadius: 12,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #080c18, #0d1224)',
                border: '1px solid rgba(0, 240, 255, 0.15)'
            }}>

                {/* Scanning animation while loading */}
                {!loaded && <div className="scan-line" />}

                {/* Live Video Feed */}
                <img
                    src="http://127.0.0.1:5001/video_feed"
                    alt="Live Camera Feed"
                    onLoad={() => setLoaded(true)}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />

                {/* Loading Placeholder */}
                {!loaded && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12
                    }}>

                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#00f0ff"
                            strokeWidth="1"
                            opacity="0.4"
                        >
                            <path d="M23 7l-7 5 7 5V7z" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>

                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            color: 'var(--text-secondary)',
                            letterSpacing: '0.1em'
                        }}>
                            Connecting to camera feed...
                        </span>

                    </div>
                )}

                {/* Corner brackets */}
                {[
                    { top: 8, left: 8 },
                    { top: 8, right: 8 },
                    { bottom: 8, left: 8 },
                    { bottom: 8, right: 8 },
                ].map((pos, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            ...pos,
                            width: 20,
                            height: 20,
                            borderColor: 'var(--neon-cyan)',
                            borderStyle: 'solid',
                            borderWidth: 0,
                            ...(pos.top !== undefined && pos.left !== undefined && { borderTopWidth: 2, borderLeftWidth: 2 }),
                            ...(pos.top !== undefined && pos.right !== undefined && { borderTopWidth: 2, borderRightWidth: 2 }),
                            ...(pos.bottom !== undefined && pos.left !== undefined && { borderBottomWidth: 2, borderLeftWidth: 2 }),
                            ...(pos.bottom !== undefined && pos.right !== undefined && { borderBottomWidth: 2, borderRightWidth: 2 }),
                            opacity: 0.5
                        }}
                    />
                ))}

                {/* Overlay grid */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                        'linear-gradient(rgba(0,240,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    pointerEvents: 'none'
                }} />

            </div>

            {/* Bottom status bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'rgba(0, 240, 255, 0.03)',
                borderRadius: 8,
                border: '1px solid rgba(0, 240, 255, 0.08)'
            }}>

                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: 'var(--neon-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                }}>

                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>

                    AI Monitoring...

                </span>

                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.55rem',
                    color: 'var(--text-secondary)'
                }}>
                    /video_feed
                </span>

            </div>

        </div>
    )
}
