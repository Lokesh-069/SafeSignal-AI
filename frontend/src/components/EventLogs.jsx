import { useState, useEffect, useRef } from 'react'

const TYPE_COLORS = {
    info: 'var(--neon-cyan)',
    success: 'var(--neon-green)',
    warning: 'var(--neon-orange)',
    alert: 'var(--neon-red)',
}

const TYPE_PREFIXES = {
    info: 'INF',
    success: 'OK ',
    warning: 'WRN',
    alert: 'ALT',
}

export default function EventLogs() {
    const [logs, setLogs] = useState([])
    const scrollRef = useRef(null)

    // Poll /logs from backend every 3 seconds
    useEffect(() => {
        const fetchLogs = () => {
            fetch("http://127.0.0.1:5001/logs")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setLogs(data)
                    }
                })
                .catch(() => {
                    // Backend not available — show fallback logs
                    if (logs.length === 0) {
                        const now = new Date().toLocaleTimeString('en-US', { hour12: false })
                        setLogs([
                            { time: now, message: 'Waiting for backend connection...', type: 'warning' },
                            { time: now, message: 'Backend: http://127.0.0.1:5001', type: 'info' },
                        ])
                    }
                })
        }

        fetchLogs()
        const interval = setInterval(fetchLogs, 3000)
        return () => clearInterval(interval)
    }, [])

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    return (
        <div className="glass-card glow-border animate-fade-in animate-fade-in-delay-5"
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
            {/* Label */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="panel-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" style={{ marginLeft: -4 }}>
                        <polyline points="4 17 10 11 4 5" />
                        <line x1="12" y1="19" x2="20" y2="19" />
                    </svg>
                    Event Logs
                </div>
                <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                    color: 'var(--text-secondary)',
                }}>
                    {logs.length} entries
                </span>
            </div>

            {/* Log container */}
            <div ref={scrollRef} style={{
                maxHeight: 220,
                overflowY: 'auto',
                borderRadius: 10,
                background: 'rgba(5, 8, 22, 0.6)',
                border: '1px solid rgba(0, 240, 255, 0.08)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
            }}>
                {logs.length === 0 ? (
                    <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                        color: 'var(--text-secondary)', textAlign: 'center', padding: 20,
                    }}>
                        Waiting for logs from backend...
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            gap: 10,
                            padding: '4px 6px',
                            borderRadius: 4,
                            background: log.type === 'alert'
                                ? 'rgba(255, 0, 60, 0.06)'
                                : i === logs.length - 1
                                    ? 'rgba(0, 240, 255, 0.04)'
                                    : 'transparent',
                            transition: 'background 0.3s',
                        }}>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.6rem',
                                color: 'rgba(122, 139, 181, 0.5)',
                                flexShrink: 0,
                                userSelect: 'all',
                            }}>
                                {log.time}
                            </span>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.6rem',
                                color: TYPE_COLORS[log.type] || 'var(--neon-cyan)',
                                flexShrink: 0,
                                fontWeight: 600,
                            }}>
                                [{TYPE_PREFIXES[log.type] || 'INF'}]
                            </span>
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.6rem',
                                color: log.type === 'alert' ? 'var(--neon-red)' : 'var(--text-primary)',
                                opacity: 0.85,
                                fontWeight: log.type === 'alert' ? 600 : 400,
                            }}>
                                {log.message}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
