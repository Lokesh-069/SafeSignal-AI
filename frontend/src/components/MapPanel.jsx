import { useEffect, useRef, useState } from 'react'

export default function MapPanel() {
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markerRef = useRef(null)
    const radiusRef = useRef(null)
    const [location, setLocation] = useState({ latitude: 0, longitude: 0 })
    const [mapReady, setMapReady] = useState(false)

    // Fetch location from Flask backend
    useEffect(() => {
        const fetchLocation = () => {
            fetch("http://127.0.0.1:5001/location")
                .then(res => res.json())
                .then(data => setLocation(data))
                .catch(() => setLocation({ latitude: 22.5599202, longitude: 88.4899014 }))
        }

        fetchLocation()
        // Refresh location every 5 seconds for real-time tracking
        const interval = setInterval(fetchLocation, 5000)
        return () => clearInterval(interval)
    }, [])

    // Initialize map when location is available
    useEffect(() => {
        if (location.latitude === 0 && location.longitude === 0) return

        const initMap = async () => {
            const L = await import('leaflet')

            if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([location.latitude, location.longitude], 16, { duration: 1.5 })
                if (markerRef.current) markerRef.current.setLatLng([location.latitude, location.longitude])
                if (radiusRef.current) radiusRef.current.setLatLng([location.latitude, location.longitude])
                return
            }

            const map = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false,
            }).setView([location.latitude, location.longitude], 16)

            // Add zoom control to bottom-right
            L.control.zoom({ position: 'bottomright' }).addTo(map)

            // Dark-themed map tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map)

            // Pulse radius circle
            radiusRef.current = L.circle([location.latitude, location.longitude], {
                radius: 120,
                color: '#ff003c',
                fillColor: '#ff003c',
                fillOpacity: 0.08,
                weight: 1,
                dashArray: '5, 8',
            }).addTo(map)

            // Custom glowing red marker
            const redIcon = L.divIcon({
                className: '',
                html: `
          <div style="position: relative; width: 36px; height: 36px;">
            <div style="
              position: absolute;
              inset: 0;
              border-radius: 50%;
              background: rgba(255, 0, 60, 0.15);
              animation: mapPulse 2s ease-in-out infinite;
            "></div>
            <div style="
              position: absolute;
              top: 50%; left: 50%;
              transform: translate(-50%, -50%);
              width: 14px; height: 14px;
              background: #ff003c;
              border-radius: 50%;
              border: 2px solid #fff;
              box-shadow: 0 0 12px #ff003c, 0 0 24px rgba(255,0,60,0.5);
            "></div>
          </div>
        `,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
            })

            markerRef.current = L.marker([location.latitude, location.longitude], { icon: redIcon }).addTo(map)

            // Add popup
            markerRef.current.bindPopup(`
        <div style="
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          letter-spacing: 0.1em;
          color: #0a0e1a;
          text-align: center;
          padding: 4px;
        ">
          <strong>📍 SUBJECT LOCATION</strong><br/>
          <span style="font-family: monospace; font-size: 11px;">
            ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
          </span>
        </div>
      `)

            mapInstanceRef.current = map
            setMapReady(true)

            setTimeout(() => map.invalidateSize(), 200)
        }

        initMap()

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
                markerRef.current = null
                radiusRef.current = null
            }
        }
    }, [location])

    const handleOpenMaps = () => {
        window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank')
    }

    const handleRecenter = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([location.latitude, location.longitude], 16, { duration: 1 })
        }
    }

    return (
        <div className="glass-card glow-border animate-fade-in animate-fade-in-delay-2"
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}
        >
            {/* Label row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="panel-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" style={{ marginLeft: -4 }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    Location Tracking
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                    color: mapReady ? 'var(--neon-green)' : 'var(--text-secondary)',
                }}>
                    <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: mapReady ? 'var(--neon-green)' : 'var(--neon-orange)',
                    }} />
                    {mapReady ? 'TRACKING' : 'LOADING'}
                </div>
            </div>

            {/* Map container */}
            <div style={{ position: 'relative', flex: 1, minHeight: 220 }}>
                <div ref={mapRef} style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid rgba(0, 240, 255, 0.1)',
                }} />

                {/* Recenter button overlay */}
                <button
                    onClick={handleRecenter}
                    title="Recenter"
                    style={{
                        position: 'absolute',
                        top: 10, right: 10, zIndex: 1000,
                        width: 32, height: 32,
                        borderRadius: 8,
                        background: 'rgba(13, 18, 36, 0.85)',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        color: 'var(--neon-cyan)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        backdropFilter: 'blur(10px)',
                    }}
                    onMouseEnter={e => { e.target.style.background = 'rgba(0, 240, 255, 0.15)'; e.target.style.boxShadow = '0 0 15px rgba(0,240,255,0.2)'; }}
                    onMouseLeave={e => { e.target.style.background = 'rgba(13, 18, 36, 0.85)'; e.target.style.boxShadow = 'none'; }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                    </svg>
                </button>
            </div>

            {/* Info bar */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px',
                background: 'rgba(0, 240, 255, 0.03)',
                borderRadius: 10,
                border: '1px solid rgba(0, 240, 255, 0.08)',
                flexWrap: 'wrap',
                gap: 10,
            }}>
                <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                        <div style={{
                            fontFamily: 'var(--font-display)', fontSize: '0.45rem',
                            letterSpacing: '0.15em', color: 'var(--text-secondary)', marginBottom: 2,
                        }}>LATITUDE</div>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--neon-cyan)',
                            textShadow: '0 0 8px rgba(0,240,255,0.3)',
                        }}>
                            {location.latitude.toFixed(6)}°N
                        </div>
                    </div>
                    <div style={{ width: 1, background: 'rgba(0,240,255,0.15)' }} />
                    <div>
                        <div style={{
                            fontFamily: 'var(--font-display)', fontSize: '0.45rem',
                            letterSpacing: '0.15em', color: 'var(--text-secondary)', marginBottom: 2,
                        }}>LONGITUDE</div>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--neon-cyan)',
                            textShadow: '0 0 8px rgba(0,240,255,0.3)',
                        }}>
                            {location.longitude.toFixed(6)}°E
                        </div>
                    </div>
                </div>
                <button className="neon-btn" onClick={handleOpenMaps} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Open in Maps
                </button>
            </div>

            {/* Pulse animation for map marker */}
            <style>{`
        @keyframes mapPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(2); opacity: 0; }
        }
      `}</style>
        </div>
    )
}
