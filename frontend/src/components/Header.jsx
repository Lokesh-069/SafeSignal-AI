import { useState, useEffect } from 'react'

export default function Header() {
    const [time, setTime] = useState(new Date())
    const [backendActive, setBackendActive] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Check backend health every 5 seconds
    useEffect(() => {
        const checkBackend = () => {
            fetch("http://127.0.0.1:5001/")
                .then(res => res.json())
                .then(() => setBackendActive(true))
                .catch(() => setBackendActive(false))
        }

        checkBackend()
        const interval = setInterval(checkBackend, 5000)
        return () => clearInterval(interval)
    }, [])

    const formattedTime = time.toLocaleTimeString('en-US', { hour12: false })
    const formattedDate = time.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })

    return (
        <header className="animate-fade-in" style={{
            padding: '20px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
            background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.03) 0%, transparent 100%)',
        }}>
            {/* Left: Logo + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(57, 255, 20, 0.1))',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)',
                }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1.5">
                        <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
                        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div>
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(0.9rem, 2vw, 1.3rem)',
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        background: 'linear-gradient(90deg, #00f0ff, #39ff14)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1.2,
                    }}>
                        SAFE SIGNAL
                    </h1>
                    <p style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.55rem',
                        letterSpacing: '0.3em',
                        color: 'var(--text-secondary)',
                        marginTop: 2,
                    }}>
                        AI SECURITY SYSTEM
                    </p>
                </div>
            </div>

            {/* Center: Status */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '8px 20px', borderRadius: 10,
                background: backendActive ? 'rgba(57, 255, 20, 0.05)' : 'rgba(255, 106, 0, 0.05)',
                border: `1px solid ${backendActive ? 'rgba(57, 255, 20, 0.2)' : 'rgba(255, 106, 0, 0.2)'}`,
            }}>
                <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: backendActive ? 'var(--neon-green)' : 'var(--neon-orange)',
                    animation: 'pulse-dot 2s ease-in-out infinite',
                }} />
                <div>
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.6rem',
                        letterSpacing: '0.15em',
                        color: backendActive ? 'var(--neon-green)' : 'var(--neon-orange)',
                    }}>
                        {backendActive ? 'SYSTEM ACTIVE' : 'BACKEND OFFLINE'}
                    </span>
                    <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.65rem',
                        color: 'var(--text-secondary)',
                        marginLeft: 12,
                    }}>
                        {backendActive ? 'AI Monitoring Running' : 'Connecting...'}
                    </span>
                </div>
            </div>

            {/* Right: Time */}
            <div style={{ textAlign: 'right' }}>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.1rem',
                    color: 'var(--neon-cyan)',
                    letterSpacing: '0.1em',
                    textShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
                }}>
                    {formattedTime}
                </div>
                <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    marginTop: 2,
                }}>
                    {formattedDate}
                </div>
            </div>
        </header>
    )
}
