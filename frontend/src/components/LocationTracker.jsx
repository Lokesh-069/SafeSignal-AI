import { useEffect, useRef, useState } from 'react'
import { API_URL } from '../config'

/**
 * Invisible component that uses the browser's Geolocation API
 * to send real-time GPS coordinates to the backend every 5 seconds.
 */
export default function LocationTracker() {
    const [tracking, setTracking] = useState(false)
    const [error, setError] = useState(null)
    const watchIdRef = useRef(null)

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported')
            return
        }

        // Send position to backend
        const sendPosition = (position) => {
            const { latitude, longitude } = position.coords
            setTracking(true)
            setError(null)

            fetch(`${API_URL}/update_location`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ latitude, longitude })
            }).catch(() => { })
        }

        const handleError = (err) => {
            setError(err.message)
            setTracking(false)
        }

        // Use watchPosition for continuous tracking
        watchIdRef.current = navigator.geolocation.watchPosition(
            sendPosition,
            handleError,
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000,
            }
        )

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current)
            }
        }
    }, [])

    // This component renders a small status indicator
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 6,
            background: tracking ? 'rgba(57, 255, 20, 0.05)' : 'rgba(255, 106, 0, 0.05)',
            border: `1px solid ${tracking ? 'rgba(57, 255, 20, 0.15)' : 'rgba(255, 106, 0, 0.15)'}`,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5rem',
            color: tracking ? 'var(--neon-green)' : 'var(--neon-orange)',
            letterSpacing: '0.05em',
        }}>
            <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: tracking ? 'var(--neon-green)' : 'var(--neon-orange)',
                animation: tracking ? 'pulse-dot 2s ease-in-out infinite' : 'none',
            }} />
            {tracking ? 'GPS LIVE' : error ? `GPS: ${error}` : 'GPS INIT...'}
        </div>
    )
}
