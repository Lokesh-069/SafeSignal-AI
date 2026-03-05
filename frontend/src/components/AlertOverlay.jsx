import { useState, useEffect, useRef, useCallback } from 'react'
import { API_URL } from '../config'

/**
 * Full-screen emergency alert overlay.
 * Polls /status every 2s. When is_alert=true:
 *   - Red pulsing border + overlay flash
 *   - Wailing siren sound via Web Audio API
 */
export default function AlertOverlay() {
    const [isAlert, setIsAlert] = useState(false)
    const [dismissed, setDismissed] = useState(false)
    const audioCtxRef = useRef(null)
    const sirenTimerRef = useRef(null)
    const prevAlertRef = useRef(false)

    // Poll /status
    useEffect(() => {
        const checkStatus = () => {
            fetch(`${API_URL}/status`)
                .then(res => res.json())
                .then(data => {
                    const alertActive = data.is_alert === true
                    setIsAlert(alertActive)

                    // New alert detected — reset dismissed state
                    if (alertActive && !prevAlertRef.current) {
                        setDismissed(false)
                    }
                    prevAlertRef.current = alertActive
                })
                .catch(() => { })
        }

        checkStatus()
        const interval = setInterval(checkStatus, 2000)
        return () => clearInterval(interval)
    }, [])

    // Realistic wailing siren using Web Audio API
    const startSiren = useCallback(() => {
        if (sirenTimerRef.current) return

        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)()
            audioCtxRef.current = ctx

            const playSirenCycle = () => {
                const now = ctx.currentTime

                // --- Main siren tone (wailing up-down) ---
                const osc1 = ctx.createOscillator()
                const gain1 = ctx.createGain()
                osc1.type = 'sawtooth'
                gain1.gain.setValueAtTime(0.0, now)
                gain1.gain.linearRampToValueAtTime(0.12, now + 0.1)
                gain1.gain.setValueAtTime(0.12, now + 1.8)
                gain1.gain.linearRampToValueAtTime(0.0, now + 2.0)

                // Wailing sweep: low → high → low
                osc1.frequency.setValueAtTime(300, now)
                osc1.frequency.linearRampToValueAtTime(900, now + 1.0)
                osc1.frequency.linearRampToValueAtTime(300, now + 2.0)

                osc1.connect(gain1)
                gain1.connect(ctx.destination)
                osc1.start(now)
                osc1.stop(now + 2.0)

                // --- Secondary harmonic for richness ---
                const osc2 = ctx.createOscillator()
                const gain2 = ctx.createGain()
                osc2.type = 'sine'
                gain2.gain.setValueAtTime(0.0, now)
                gain2.gain.linearRampToValueAtTime(0.06, now + 0.1)
                gain2.gain.setValueAtTime(0.06, now + 1.8)
                gain2.gain.linearRampToValueAtTime(0.0, now + 2.0)

                osc2.frequency.setValueAtTime(600, now)
                osc2.frequency.linearRampToValueAtTime(1800, now + 1.0)
                osc2.frequency.linearRampToValueAtTime(600, now + 2.0)

                osc2.connect(gain2)
                gain2.connect(ctx.destination)
                osc2.start(now)
                osc2.stop(now + 2.0)
            }

            playSirenCycle()
            sirenTimerRef.current = setInterval(playSirenCycle, 2000)
        } catch (e) {
            console.log('Audio not available:', e)
        }
    }, [])

    const stopSiren = useCallback(() => {
        if (sirenTimerRef.current) {
            clearInterval(sirenTimerRef.current)
            sirenTimerRef.current = null
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => { })
            audioCtxRef.current = null
        }
    }, [])

    // Start/stop siren based on alert state
    useEffect(() => {
        if (isAlert && !dismissed) {
            startSiren()
        } else {
            stopSiren()
        }
        return () => stopSiren()
    }, [isAlert, dismissed, startSiren, stopSiren])

    const handleDismiss = () => {
        setDismissed(true)
        stopSiren()
    }

    if (!isAlert || dismissed) return null

    return (
        <>
            {/* Full-screen red flash overlay */}
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9998,
                pointerEvents: 'none',
                animation: 'alertFlash 0.8s ease-in-out infinite',
            }} />

            {/* Red border pulse around entire viewport */}
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9997,
                pointerEvents: 'none',
                border: '4px solid rgba(255, 0, 60, 0.7)',
                boxShadow: 'inset 0 0 100px rgba(255, 0, 60, 0.2), 0 0 80px rgba(255, 0, 60, 0.15)',
                animation: 'borderPulse 1s ease-in-out infinite',
            }} />

            {/* Top alert banner */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: '12px 24px',
                background: 'linear-gradient(90deg, rgba(255,0,60,0.95), rgba(180,0,30,0.95), rgba(255,0,60,0.95))',
                backgroundSize: '200% 100%',
                animation: 'bannerSlide 1.5s linear infinite',
                boxShadow: '0 4px 40px rgba(255, 0, 60, 0.5)',
                pointerEvents: 'auto',
            }}>
                {/* Flashing icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"
                    style={{ animation: 'iconFlash 0.4s ease-in-out infinite', flexShrink: 0 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>

                <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.25em',
                    color: '#fff',
                    textShadow: '0 0 10px rgba(255,255,255,0.5)',
                    animation: 'textFlash 0.8s ease-in-out infinite',
                }}>
                    🚨 EMERGENCY SOS DETECTED — ALERTS DISPATCHED 🚨
                </span>

                {/* Dismiss button */}
                <button
                    onClick={handleDismiss}
                    style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        color: '#fff',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        flexShrink: 0,
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.35)'}
                    onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
                >
                    DISMISS
                </button>
            </div>

            <style>{`
        @keyframes alertFlash {
          0%, 100% { background: rgba(255, 0, 60, 0); }
          25% { background: rgba(255, 0, 60, 0.1); }
          50% { background: rgba(255, 0, 60, 0); }
          75% { background: rgba(255, 0, 60, 0.08); }
        }
        @keyframes borderPulse {
          0%, 100% {
            border-color: rgba(255, 0, 60, 0.8);
            box-shadow: inset 0 0 100px rgba(255,0,60,0.2), 0 0 80px rgba(255,0,60,0.15);
          }
          50% {
            border-color: rgba(255, 0, 60, 0.15);
            box-shadow: inset 0 0 40px rgba(255,0,60,0.03), 0 0 20px rgba(255,0,60,0.03);
          }
        }
        @keyframes bannerSlide {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes iconFlash {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(0.9); }
        }
        @keyframes textFlash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
        </>
    )
}
