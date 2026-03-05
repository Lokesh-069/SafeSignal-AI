import { useState, useEffect } from 'react'

export default function EvidencePanel() {
    const [img, setImg] = useState("http://127.0.0.1:5001/latest_evidence")
    const [hasEvidence, setHasEvidence] = useState(false)

    // Auto-refresh every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setImg(`http://127.0.0.1:5001/latest_evidence?t=${Date.now()}`)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="glass-card glow-border animate-fade-in animate-fade-in-delay-3"
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}
        >
            {/* Label */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="panel-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" style={{ marginLeft: -4 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                    Latest Evidence
                </div>
                <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-secondary)',
                }}>
                    /latest_evidence
                </span>
            </div>

            {/* Evidence Container */}
            <div style={{
                flex: 1,
                minHeight: 200,
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid rgba(0, 240, 255, 0.1)',
                background: 'linear-gradient(135deg, #080c18, #0d1224)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }}>
                {/* Evidence image from backend */}
                <img
                    src={img}
                    alt="Latest Evidence"
                    onLoad={() => setHasEvidence(true)}
                    onError={() => setHasEvidence(false)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 10,
                        display: hasEvidence ? 'block' : 'none',
                    }}
                />

                {/* SOS Overlay when evidence exists */}
                {hasEvidence && (
                    <div style={{
                        position: 'absolute',
                        top: 12, left: 12, right: 12,
                        padding: '8px 16px',
                        background: 'rgba(255, 0, 60, 0.85)',
                        borderRadius: 8,
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        color: '#fff',
                        textAlign: 'center',
                        animation: 'pulse-red 2s ease-in-out infinite',
                    }}>
                        ⚠ SOS GESTURE DETECTED
                    </div>
                )}

                {/* No evidence placeholder */}
                {!hasEvidence && (
                    <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 12, padding: 24,
                    }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'rgba(0, 240, 255, 0.05)',
                            border: '1px solid rgba(0, 240, 255, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                        </div>
                        <span style={{
                            fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                            color: 'var(--text-secondary)', textAlign: 'center',
                        }}>
                            No Evidence Yet
                        </span>
                        <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                            color: 'rgba(122, 139, 181, 0.5)', textAlign: 'center',
                        }}>
                            Awaiting SOS gesture detection...
                        </span>
                    </div>
                )}
            </div>

            {/* Status badge */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px',
                background: hasEvidence ? 'rgba(255, 0, 60, 0.05)' : 'rgba(57, 255, 20, 0.03)',
                borderRadius: 8,
                border: `1px solid ${hasEvidence ? 'rgba(255, 0, 60, 0.2)' : 'rgba(57, 255, 20, 0.1)'}`,
            }}>
                <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: hasEvidence ? 'var(--neon-red)' : 'var(--neon-green)',
                }} />
                <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                    color: hasEvidence ? 'var(--neon-red)' : 'var(--neon-green)',
                }}>
                    {hasEvidence ? 'Evidence captured' : 'Monitoring active'}
                </span>
            </div>
        </div>
    )
}
