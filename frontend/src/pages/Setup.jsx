import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const USE_CASES = [
    {
        id: 'mall',
        label: 'Shopping Mall',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M9 22V12h6v10" />
            </svg>
        ),
        desc: 'Monitor entrances, aisles, parking areas',
        color: '#00f0ff',
    },
    {
        id: 'home',
        label: 'Residential Home',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M9 22V12h6v10" />
                <circle cx="12" cy="8" r="1" />
            </svg>
        ),
        desc: 'Home security, doorstep monitoring',
        color: '#39ff14',
    },
    {
        id: 'jewellery',
        label: 'Jewellery Shop',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
        desc: 'High-value asset protection',
        color: '#ffaa00',
    },
    {
        id: 'bank',
        label: 'Bank',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="10" width="18" height="11" rx="1" />
                <path d="M12 3L2 10h20L12 3z" />
                <line x1="7" y1="14" x2="7" y2="17" />
                <line x1="12" y1="14" x2="12" y2="17" />
                <line x1="17" y1="14" x2="17" y2="17" />
            </svg>
        ),
        desc: 'Vault rooms, ATM zones, teller areas',
        color: '#ff003c',
    },
]

const inputStyle = {
    width: '100%',
    padding: '11px 14px 11px 40px',
    background: 'rgba(0,240,255,0.03)',
    border: '1px solid rgba(0,240,255,0.15)',
    borderRadius: 10,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    outline: 'none',
    transition: 'border-color 0.3s, box-shadow 0.3s',
}

const labelStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: '0.5rem',
    letterSpacing: '0.15em',
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: 6,
}

export default function Setup() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1: use case, 2: details
    const [selected, setSelected] = useState(null)
    const [transitioning, setTransitioning] = useState(false)
    const [leaving, setLeaving] = useState(false)
    const [form, setForm] = useState({
        mobile: '', email: '', whatsapp: '',
        emergencyPhone: '', emergencyWhatsapp: '', emergencyEmail: '',
    })

    const handleUseCaseSelect = (id) => {
        setSelected(id)
    }

    const handleNext = () => {
        if (!selected) return
        setTransitioning(true)
        setTimeout(() => {
            setStep(2)
            setTransitioning(false)
        }, 400)
    }

    const handleLaunch = (e) => {
        e.preventDefault()
        setLeaving(true)
        // Epic transition to dashboard
        setTimeout(() => navigate('/dashboard'), 1200)
    }

    const handleBack = () => {
        setTransitioning(true)
        setTimeout(() => {
            setStep(1)
            setTransitioning(false)
        }, 400)
    }

    const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Ambient glow orbs */}
            <div style={{
                position: 'fixed', top: '10%', left: '5%',
                width: 500, height: 500, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)',
                pointerEvents: 'none', filter: 'blur(50px)',
            }} />
            <div style={{
                position: 'fixed', bottom: '5%', right: '5%',
                width: 450, height: 450, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(57,255,20,0.05) 0%, transparent 70%)',
                pointerEvents: 'none', filter: 'blur(50px)',
            }} />

            {/* Leaving transition overlay */}
            {leaving && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    background: 'var(--bg-primary)',
                    animation: 'launchFadeIn 1.2s ease-out forwards',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 20,
                }}>
                    <div style={{
                        width: 60, height: 60,
                        border: '3px solid rgba(0,240,255,0.2)',
                        borderTop: '3px solid #00f0ff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.7rem',
                        letterSpacing: '0.3em',
                        color: 'var(--neon-cyan)',
                        animation: 'textPulse 1s ease-in-out infinite',
                    }}>
                        INITIALIZING COMMAND CENTER
                    </div>
                    <div style={{
                        width: 200, height: 3,
                        background: 'rgba(0,240,255,0.1)',
                        borderRadius: 10,
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: '100%', height: '100%',
                            background: 'linear-gradient(90deg, #00f0ff, #39ff14)',
                            animation: 'loadBar 1.2s ease-out forwards',
                        }} />
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="animate-fade-in" style={{
                width: '100%',
                maxWidth: 640,
                position: 'relative',
                zIndex: 1,
                opacity: transitioning ? 0 : 1,
                transform: transitioning ? 'translateY(20px)' : 'translateY(0)',
                transition: 'opacity 0.4s, transform 0.4s',
            }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 14,
                        background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(57,255,20,0.1))',
                        border: '1px solid rgba(0,240,255,0.3)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(0,240,255,0.15)',
                        marginBottom: 12,
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1.5">
                            <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
                            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 style={{
                        fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700,
                        letterSpacing: '0.15em',
                        background: 'linear-gradient(90deg, #00f0ff, #39ff14)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        SAFE SIGNAL
                    </h1>
                    <p style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.5rem',
                        letterSpacing: '0.3em', color: 'var(--text-secondary)', marginTop: 4,
                    }}>
                        {step === 1 ? 'SELECT DEPLOYMENT ZONE' : 'CONFIGURE ALERT CHANNELS'}
                    </p>

                    {/* Step indicators */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 8, marginTop: 16,
                    }}>
                        <div style={{
                            width: 28, height: 3, borderRadius: 4,
                            background: '#00f0ff',
                            boxShadow: '0 0 8px rgba(0,240,255,0.4)',
                            transition: 'all 0.3s',
                        }} />
                        <div style={{
                            width: 28, height: 3, borderRadius: 4,
                            background: step === 2 ? '#00f0ff' : 'rgba(0,240,255,0.15)',
                            boxShadow: step === 2 ? '0 0 8px rgba(0,240,255,0.4)' : 'none',
                            transition: 'all 0.3s',
                        }} />
                    </div>
                </div>

                {/* STEP 1: Use Case Selection */}
                {step === 1 && (
                    <div className="glass-card" style={{ padding: '32px 28px', borderRadius: 20 }}>
                        <h2 style={{
                            fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600,
                            letterSpacing: '0.15em', color: 'var(--neon-cyan)', marginBottom: 4,
                        }}>
                            DEPLOYMENT ENVIRONMENT
                        </h2>
                        <p style={{
                            fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                            color: 'var(--text-secondary)', marginBottom: 24,
                        }}>
                            Select where SafeSignal will be deployed
                        </p>

                        {/* Use case cards grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 14,
                            marginBottom: 28,
                        }}>
                            {USE_CASES.map((uc) => (
                                <button
                                    key={uc.id}
                                    onClick={() => handleUseCaseSelect(uc.id)}
                                    style={{
                                        padding: '20px 16px',
                                        borderRadius: 14,
                                        background: selected === uc.id
                                            ? `linear-gradient(135deg, ${uc.color}15, ${uc.color}08)`
                                            : 'rgba(0,240,255,0.02)',
                                        border: `1.5px solid ${selected === uc.id ? uc.color + '60' : 'rgba(0,240,255,0.1)'}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 10,
                                        boxShadow: selected === uc.id ? `0 0 25px ${uc.color}15` : 'none',
                                        transform: selected === uc.id ? 'scale(1.02)' : 'scale(1)',
                                    }}
                                    onMouseEnter={e => {
                                        if (selected !== uc.id) {
                                            e.currentTarget.style.borderColor = uc.color + '40'
                                            e.currentTarget.style.background = `${uc.color}08`
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (selected !== uc.id) {
                                            e.currentTarget.style.borderColor = 'rgba(0,240,255,0.1)'
                                            e.currentTarget.style.background = 'rgba(0,240,255,0.02)'
                                        }
                                    }}
                                >
                                    <div style={{ color: selected === uc.id ? uc.color : 'var(--text-secondary)', transition: 'color 0.3s' }}>
                                        {uc.icon}
                                    </div>
                                    <div style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '0.6rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.1em',
                                        color: selected === uc.id ? uc.color : 'var(--text-primary)',
                                        transition: 'color 0.3s',
                                    }}>
                                        {uc.label.toUpperCase()}
                                    </div>
                                    <div style={{
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '0.65rem',
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.3,
                                    }}>
                                        {uc.desc}
                                    </div>

                                    {/* Selected checkmark */}
                                    {selected === uc.id && (
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%',
                                            background: uc.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            position: 'absolute', top: 8, right: 8,
                                        }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0e1a" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Next button */}
                        <button
                            onClick={handleNext}
                            disabled={!selected}
                            style={{
                                width: '100%', padding: '14px',
                                background: selected
                                    ? 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(57,255,20,0.15))'
                                    : 'rgba(0,240,255,0.05)',
                                border: `1px solid ${selected ? 'rgba(0,240,255,0.4)' : 'rgba(0,240,255,0.1)'}`,
                                borderRadius: 12, color: selected ? '#fff' : 'var(--text-secondary)',
                                fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 600,
                                letterSpacing: '0.2em',
                                cursor: selected ? 'pointer' : 'not-allowed',
                                transition: 'all 0.3s',
                                boxShadow: selected ? '0 0 25px rgba(0,240,255,0.12)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}
                        >
                            CONFIGURE ALERTS
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* STEP 2: Contact Details */}
                {step === 2 && (
                    <div className="glass-card" style={{ padding: '32px 28px', borderRadius: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <h2 style={{
                                fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600,
                                letterSpacing: '0.15em', color: 'var(--neon-cyan)',
                            }}>
                                ALERT CONFIGURATION
                            </h2>
                            <button onClick={handleBack} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                                color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                        </div>
                        <p style={{
                            fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                            color: 'var(--text-secondary)', marginBottom: 24,
                        }}>
                            Configure your contact and emergency alert channels
                        </p>

                        <form onSubmit={handleLaunch} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                            {/* Your Details Section */}
                            <div style={{
                                fontFamily: 'var(--font-display)', fontSize: '0.5rem',
                                letterSpacing: '0.2em', color: 'var(--neon-green)',
                                padding: '6px 0', borderBottom: '1px solid rgba(57,255,20,0.1)',
                                marginBottom: 2,
                            }}>
                                👤 YOUR DETAILS
                            </div>

                            {/* Mobile */}
                            <div>
                                <label style={labelStyle}>MOBILE NUMBER</label>
                                <div style={{ position: 'relative' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"
                                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                        <line x1="12" y1="18" x2="12.01" y2="18" />
                                    </svg>
                                    <input type="tel" placeholder="+91 98765 43210" value={form.mobile}
                                        onChange={e => updateForm('mobile', e.target.value)} style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = 'rgba(0,240,255,0.5)'; e.target.style.boxShadow = '0 0 15px rgba(0,240,255,0.08)'; }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(0,240,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label style={labelStyle}>EMAIL ID</label>
                                <div style={{ position: 'relative' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"
                                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                    <input type="email" placeholder="you@example.com" value={form.email}
                                        onChange={e => updateForm('email', e.target.value)} style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = 'rgba(0,240,255,0.5)'; e.target.style.boxShadow = '0 0 15px rgba(0,240,255,0.08)'; }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(0,240,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div>
                                <label style={labelStyle}>WHATSAPP NUMBER</label>
                                <div style={{ position: 'relative' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"
                                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                    </svg>
                                    <input type="tel" placeholder="+91 98765 43210" value={form.whatsapp}
                                        onChange={e => updateForm('whatsapp', e.target.value)} style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = 'rgba(0,240,255,0.5)'; e.target.style.boxShadow = '0 0 15px rgba(0,240,255,0.08)'; }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(0,240,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>

                            {/* Emergency Section */}
                            <div style={{
                                fontFamily: 'var(--font-display)', fontSize: '0.5rem',
                                letterSpacing: '0.2em', color: 'var(--neon-red)',
                                padding: '6px 0', borderBottom: '1px solid rgba(255,0,60,0.15)',
                                marginTop: 8, marginBottom: 2,
                            }}>
                                🚨 EMERGENCY CONTACTS
                            </div>

                            {/* Emergency Phone */}
                            <div>
                                <label style={labelStyle}>EMERGENCY PHONE NUMBER</label>
                                <div style={{ position: 'relative' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"
                                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    <input type="tel" placeholder="+91 Emergency Number" value={form.emergencyPhone}
                                        onChange={e => updateForm('emergencyPhone', e.target.value)} style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = 'rgba(255,0,60,0.5)'; e.target.style.boxShadow = '0 0 15px rgba(255,0,60,0.08)'; }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(0,240,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>

                            {/* Emergency WhatsApp */}
                            <div>
                                <label style={labelStyle}>EMERGENCY WHATSAPP</label>
                                <div style={{ position: 'relative' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"
                                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                    </svg>
                                    <input type="tel" placeholder="+91 Emergency WhatsApp" value={form.emergencyWhatsapp}
                                        onChange={e => updateForm('emergencyWhatsapp', e.target.value)} style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = 'rgba(255,0,60,0.5)'; e.target.style.boxShadow = '0 0 15px rgba(255,0,60,0.08)'; }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(0,240,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>

                            {/* Emergency Email */}
                            <div>
                                <label style={labelStyle}>EMERGENCY EMAIL</label>
                                <div style={{ position: 'relative' }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"
                                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                    <input type="email" placeholder="emergency@example.com" value={form.emergencyEmail}
                                        onChange={e => updateForm('emergencyEmail', e.target.value)} style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = 'rgba(255,0,60,0.5)'; e.target.style.boxShadow = '0 0 15px rgba(255,0,60,0.08)'; }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(0,240,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>

                            {/* Launch button */}
                            <button type="submit" style={{
                                width: '100%', padding: '15px', marginTop: 8,
                                background: 'linear-gradient(135deg, rgba(0,240,255,0.25), rgba(57,255,20,0.2))',
                                border: '1px solid rgba(0,240,255,0.5)',
                                borderRadius: 12, color: '#fff',
                                fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700,
                                letterSpacing: '0.25em',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 0 30px rgba(0,240,255,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = '0 0 50px rgba(0,240,255,0.3)'
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = '0 0 30px rgba(0,240,255,0.15)'
                                    e.currentTarget.style.transform = 'none'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
                                </svg>
                                LAUNCH COMMAND CENTER
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Animations */}
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes textPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes launchFadeIn {
          0% { opacity: 0; }
          30% { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes loadBar {
          0% { width: 0; }
          100% { width: 100%; }
        }
        input::placeholder { color: rgba(122,139,181,0.4); }
      `}</style>
        </div>
    )
}
