import Header from '../components/Header'
import CameraPanel from '../components/CameraPanel'
import MapPanel from '../components/MapPanel'
import EvidencePanel from '../components/EvidencePanel'
import AlertPanel from '../components/AlertPanel'
import SOSButton from '../components/SOSButton'
import EventLogs from '../components/EventLogs'

export default function Dashboard() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <Header />

            {/* Dashboard Grid */}
            <main style={{
                flex: 1,
                padding: '20px 24px 32px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gridTemplateRows: 'auto auto auto auto',
                gap: '20px',
                maxWidth: '1440px',
                width: '100%',
                margin: '0 auto',
            }}>
                {/* Row 1: Camera & Map */}
                <CameraPanel />
                <MapPanel />

                {/* Row 2: Evidence & Alert */}
                <EvidencePanel />
                <AlertPanel />

                {/* Row 3: Manual SOS Button (full width) */}
                <SOSButton />

                {/* Row 4: Event Logs (full width) */}
                <div style={{ gridColumn: '1 / -1' }}>
                    <EventLogs />
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                padding: '16px 32px',
                textAlign: 'center',
                borderTop: '1px solid rgba(0, 240, 255, 0.08)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: 'rgba(122, 139, 181, 0.4)',
                letterSpacing: '0.1em',
            }}>
                SAFE SIGNAL © 2026 — AI-Powered Emergency Detection System
            </footer>

            {/* Responsive Styles */}
            <style>{`
        @media (max-width: 900px) {
          main {
            grid-template-columns: 1fr !important;
          }
          main > div:last-child {
            grid-column: 1 !important;
          }
        }
      `}</style>
        </div>
    )
}
