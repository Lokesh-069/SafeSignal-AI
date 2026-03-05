import { useState } from 'react'

export default function SOSButton() {
    const [triggered, setTriggered] = useState(false)
    const [loading, setLoading] = useState(false)
    const [cooldown, setCooldown] = useState(false)
    const [confirmStep, setConfirmStep] = useState(0) // 0=idle, 1=confirm, 2=sending

    const handleClick = () => {
        if (loading || cooldown) return

        if (confirmStep === 0) {
            // First click: show confirmation
            setConfirmStep(1)
            // Auto-reset confirm after 5 seconds
            setTimeout(() => setConfirmStep(prev => prev === 1 ? 0 : prev), 5000)
            return
        }

        if (confirmStep === 1) {
            // Second click: actually trigger
            setConfirmStep(2)
            setLoading(true)

            fetch("http://127.0.0.1:5001/manual_sos", { method: "POST" })
                .then(res => res.json())
                .then(() => {
                    setTriggered(true)
                    setLoading(false)
                    setCooldown(true)
                    setConfirmStep(0)
                    // Reset after 30 seconds
                    setTimeout(() => {
                        setTriggered(false)
                        setCooldown(false)
                    }, 30000)
                })
                .catch(() => {
                    setLoading(false)
                    setConfirmStep(0)
                })
        }
    }

    const handleCancel = (e) => {
        e.stopPropagation()
        setConfirmStep(0)
    }

    return (
        <div className="glass-card animate-fade-in" style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            gridColumn: '1 / -1',
            borderColor: triggered ? 'rgba(255, 0, 60, 0.5)' : undefined,
            boxShadow: triggered ? '0 0 50px rgba(255, 0, 60, 0.15), inset 0 0 30px rgba(255, 0, 60, 0.03)' : undefined,
        }}>

            {/* Label */}
            <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.6rem',
                letterSpacing: '0.2em',
                color: 'var(--text-secondary)',
            }}>
                MANUAL EMERGENCY TRIGGER
            </div>

            {/* SOS Button */}
            <button
                onClick={handleClick}
                disabled={loading || cooldown}
                style={{
                    position: 'relative',
                    width: confirmStep === 1 ? 220 : 140,
                    height: confirmStep === 1 ? 70 : 140,
                    borderRadius: confirmStep === 1 ? 16 : '50%',
                    background: cooldown
                        ? 'rgba(100, 100, 100, 0.3)'
                        : triggered
                            ? 'radial-gradient(circle, rgba(255,0,60,0.4) 0%, rgba(255,0,60,0.1) 70%)'
                            : confirmStep === 1
                                ? 'linear-gradient(135deg, rgba(255,0,60,0.8), rgba(200,0,40,0.9))'
                                : 'radial-gradient(circle, rgba(255,0,60,0.3) 0%, rgba(255,0,60,0.05) 70%)',
                    border: `2px solid ${cooldown ? 'rgba(100,100,100,0.4)' : 'rgba(255, 0, 60, 0.6)'}`,
                    cursor: cooldown ? 'not-allowed' : 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: !cooldown && !triggered && confirmStep === 0 ? 'sosPulse 3s ease-in-out infinite' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    overflow: 'hidden',
                }}
            >
                {/* Spinning ring animation */}
                {loading && (
                    <div style={{
                        position: 'absolute',
                        inset: -4,
                        border: '3px solid transparent',
                        borderTopColor: 'var(--neon-red)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }} />
                )}

                {confirmStep === 0 && !triggered && !cooldown && (
                    <>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ff003c" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            letterSpacing: '0.2em',
                            color: '#ff003c',
                            textShadow: '0 0 20px rgba(255,0,60,0.5)',
                        }}>SOS</span>
                    </>
                )}

                {confirmStep === 1 && (
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        color: '#fff',
                        textShadow: '0 0 10px rgba(255,255,255,0.3)',
                        textAlign: 'center',
                        lineHeight: 1.4,
                    }}>
                        ⚠ TAP AGAIN TO CONFIRM
                    </span>
                )}

                {loading && (
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        color: '#ff003c',
                    }}>SENDING...</span>
                )}

                {triggered && !loading && (
                    <>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff003c" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.55rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            color: '#ff003c',
                        }}>ALERT SENT</span>
                    </>
                )}

                {cooldown && !triggered && (
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.5rem',
                        letterSpacing: '0.1em',
                        color: 'rgba(150,150,150,0.6)',
                    }}>COOLDOWN</span>
                )}
            </button>

            {/* Cancel link during confirmation */}
            {confirmStep === 1 && (
                <button
                    onClick={handleCancel}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.55rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        letterSpacing: '0.1em',
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px',
                    }}
                >
                    Cancel
                </button>
            )}

            {/* Status text */}
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                color: triggered ? 'var(--neon-red)' : 'rgba(122, 139, 181, 0.5)',
                letterSpacing: '0.05em',
                textAlign: 'center',
            }}>
                {cooldown
                    ? 'Emergency alerts sent — cooldown active'
                    : confirmStep === 1
                        ? 'Press again to trigger emergency alerts'
                        : 'Press to manually trigger all alert channels'
                }
            </div>

            <style>{`
        @keyframes sosPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255,0,60,0.15), inset 0 0 15px rgba(255,0,60,0.05); }
          50% { box-shadow: 0 0 40px rgba(255,0,60,0.3), inset 0 0 25px rgba(255,0,60,0.1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}
