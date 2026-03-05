import { useState, useEffect } from 'react'
import { API_URL } from '../config'

const THREAT_LEVELS = [
    { label: 'LOW', color: 'var(--neon-green)', width: '25%', bg: 'linear-gradient(90deg, #39ff14, #00f0ff)' },
    { label: 'MEDIUM', color: 'var(--neon-orange)', width: '55%', bg: 'linear-gradient(90deg, #ffe600, #ff6a00)' },
    { label: 'HIGH', color: 'var(--neon-red)', width: '90%', bg: 'linear-gradient(90deg, #ff6a00, #ff003c)' },
]

export default function AlertPanel() {
    const [isAlert, setIsAlert] = useState(false)
    const [threatIndex, setThreatIndex] = useState(0)
    const [lastTrigger, setLastTrigger] = useState(null)

    // Poll /status every 3 seconds
    useEffect(() => {
        const fetchStatus = () => {
            fetch(`${API_URL}/status`)
                .then(res => res.json())
                .then(data => {
                    setIsAlert(data.is_alert)
                    setThreatIndex(data.threat_level)
                    setLastTrigger(data.last_trigger)
                })
                .catch(() => {
                    // Backend not available — keep defaults
                })
        }

        fetchStatus()
        const interval = setInterval(fetchStatus, 3000)
        return () => clearInterval(interval)
    }, [])

    const threat = THREAT_LEVELS[threatIndex]

    return (
        <div className="glass-card glow-border animate-fade-in animate-fade-in-delay-4"
            style={{
                padding: '20px',
                display: 'flex', flexDirection: 'column', gap: '16px',
                height: '100%',
                ...(isAlert ? {
                    borderColor: 'rgba(255, 0, 60, 0.5)',
                    boxShadow: '0 0 40px rgba(255, 0, 60, 0.1), inset 0 0 30px rgba(255, 0, 60, 0.02)',
                } : {}),
            }}
        >
            {/* Label */}
            <div className="panel-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" style={{ marginLeft: -4 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Alert Status
            </div>

            {/* Status Badge */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px',
                borderRadius: 12,
                background: isAlert ? 'rgba(255, 0, 60, 0.08)' : 'rgba(57, 255, 20, 0.05)',
                border: `1px solid ${isAlert ? 'rgba(255, 0, 60, 0.3)' : 'rgba(57, 255, 20, 0.2)'}`,
                ...(isAlert ? { animation: 'pulse-red 2s ease-in-out infinite' } : {}),
            }}>
                <div style={{ textAlign: 'center' }}>
                    {isAlert ? (
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--neon-red)" strokeWidth="2"
                            style={{ margin: '0 auto 10px' }}>
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    ) : (
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--neon-green)" strokeWidth="2"
                            style={{ margin: '0 auto 10px' }}>
                            <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    )}
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        color: isAlert ? 'var(--neon-red)' : 'var(--neon-green)',
                        textShadow: isAlert
                            ? '0 0 20px rgba(255, 0, 60, 0.5)'
                            : '0 0 20px rgba(57, 255, 20, 0.3)',
                    }}>
                        {isAlert ? 'SOS ALERT DETECTED' : 'SYSTEM NORMAL'}
                    </div>
                    {lastTrigger && (
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                            color: 'var(--text-secondary)', marginTop: 6,
                        }}>
                            Last trigger: {lastTrigger}
                        </div>
                    )}
                </div>
            </div>

            {/* Threat Level */}
            <div>
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 10,
                }}>
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.6rem',
                        letterSpacing: '0.15em',
                        color: 'var(--text-secondary)',
                    }}>
                        THREAT LEVEL
                    </span>
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        letterSpacing: '0.15em',
                        color: threat.color,
                        textShadow: `0 0 10px ${threat.color}`,
                    }}>
                        {threat.label}
                    </span>
                </div>
                <div className="threat-bar-bg">
                    <div className="threat-bar-fill" style={{
                        width: threat.width,
                        background: threat.bg,
                    }} />
                </div>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginTop: 6,
                }}>
                    {THREAT_LEVELS.map((t, i) => (
                        <span key={t.label} style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.5rem',
                            letterSpacing: '0.1em',
                            color: i === threatIndex ? t.color : 'rgba(122, 139, 181, 0.4)',
                            fontWeight: i === threatIndex ? 600 : 400,
                        }}>
                            {t.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Alert Channels */}
            <div style={{
                padding: '12px',
                borderRadius: 8,
                background: 'rgba(0, 240, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.08)',
            }}>
                <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.55rem',
                    letterSpacing: '0.15em',
                    color: 'var(--text-secondary)',
                    marginBottom: 10,
                }}>
                    ALERT CHANNELS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['SMS', 'WhatsApp', 'Email', 'Phone'].map(channel => (
                        <div key={channel} style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: isAlert ? 'rgba(255, 0, 60, 0.06)' : 'rgba(57, 255, 20, 0.06)',
                            border: `1px solid ${isAlert ? 'rgba(255, 0, 60, 0.2)' : 'rgba(57, 255, 20, 0.15)'}`,
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.55rem',
                            color: isAlert ? 'var(--neon-red)' : 'var(--neon-green)',
                            letterSpacing: '0.05em',
                        }}>
                            {isAlert ? '🔴' : '●'} {channel}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
