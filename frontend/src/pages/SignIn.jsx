import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function SignIn() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        // Demo — fake delay then navigate to dashboard
        setTimeout(() => navigate('/dashboard'), 1500)
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            position: 'relative',
        }}>
            {/* Ambient glow orbs */}
            <div style={{
                position: 'fixed', top: '15%', left: '10%',
                width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)',
                pointerEvents: 'none', filter: 'blur(40px)',
            }} />
            <div style={{
                position: 'fixed', bottom: '10%', right: '10%',
                width: 350, height: 350, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(57,255,20,0.05) 0%, transparent 70%)',
                pointerEvents: 'none', filter: 'blur(40px)',
            }} />

            <div className="animate-fade-in" style={{
                width: '100%',
                maxWidth: 440,
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(57,255,20,0.1))',
                        border: '1px solid rgba(0,240,255,0.3)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(0,240,255,0.15)',
                        marginBottom: 16,
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1.5">
                            <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
                            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 style={{
                        fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700,
                        letterSpacing: '0.15em',
                        background: 'linear-gradient(90deg, #00f0ff, #39ff14)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        SAFE SIGNAL
                    </h1>
                    <p style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.55rem',
                        letterSpacing: '0.3em', color: 'var(--text-secondary)', marginTop: 4,
                    }}>
                        AI SECURITY SYSTEM
                    </p>
                </div>

                {/* Card */}
                <div className="glass-card" style={{
                    padding: '36px 32px',
                    borderRadius: 20,
                }}>
                    <h2 style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600,
                        letterSpacing: '0.15em', color: 'var(--neon-cyan)', marginBottom: 4,
                    }}>
                        SIGN IN
                    </h2>
                    <p style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                        color: 'var(--text-secondary)', marginBottom: 28,
                    }}>
                        Access the security command center
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {/* Email */}
                        <div>
                            <label style={{
                                fontFamily: 'var(--font-display)', fontSize: '0.55rem',
                                letterSpacing: '0.15em', color: 'var(--text-secondary)',
                                display: 'block', marginBottom: 8,
                            }}>
                                EMAIL ADDRESS
                            </label>
                            <div style={{ position: 'relative' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"
                                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="operator@safesignal.ai"
                                    style={{
                                        width: '100%', padding: '12px 14px 12px 42px',
                                        background: 'rgba(0,240,255,0.03)',
                                        border: '1px solid rgba(0,240,255,0.15)',
                                        borderRadius: 10, color: 'var(--text-primary)',
                                        fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                                        outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = 'rgba(0,240,255,0.5)'; e.target.style.boxShadow = '0 0 20px rgba(0,240,255,0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(0,240,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{
                                fontFamily: 'var(--font-display)', fontSize: '0.55rem',
                                letterSpacing: '0.15em', color: 'var(--text-secondary)',
                                display: 'block', marginBottom: 8,
                            }}>
                                PASSWORD
                            </label>
                            <div style={{ position: 'relative' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"
                                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••••"
                                    style={{
                                        width: '100%', padding: '12px 14px 12px 42px',
                                        background: 'rgba(0,240,255,0.03)',
                                        border: '1px solid rgba(0,240,255,0.15)',
                                        borderRadius: 10, color: 'var(--text-primary)',
                                        fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                                        outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = 'rgba(0,240,255,0.5)'; e.target.style.boxShadow = '0 0 20px rgba(0,240,255,0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(0,240,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        {/* Remember + Forgot */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                                fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-secondary)',
                            }}>
                                <input type="checkbox" style={{
                                    accentColor: '#00f0ff', width: 14, height: 14,
                                }} />
                                Remember me
                            </label>
                            <span style={{
                                fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                                color: 'var(--neon-cyan)', cursor: 'pointer',
                            }}>
                                Forgot password?
                            </span>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '14px',
                            background: loading
                                ? 'rgba(0,240,255,0.15)'
                                : 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(57,255,20,0.15))',
                            border: '1px solid rgba(0,240,255,0.4)',
                            borderRadius: 12, color: '#fff',
                            fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600,
                            letterSpacing: '0.2em', cursor: loading ? 'wait' : 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: loading ? 'none' : '0 0 30px rgba(0,240,255,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        }}
                            onMouseEnter={e => { if (!loading) { e.target.style.boxShadow = '0 0 40px rgba(0,240,255,0.25)'; e.target.style.transform = 'translateY(-1px)'; } }}
                            onMouseLeave={e => { e.target.style.boxShadow = '0 0 30px rgba(0,240,255,0.12)'; e.target.style.transform = 'none'; }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: 16, height: 16, border: '2px solid rgba(0,240,255,0.3)',
                                        borderTop: '2px solid #00f0ff', borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite',
                                    }} />
                                    AUTHENTICATING...
                                </>
                            ) : (
                                'ACCESS COMMAND CENTER'
                            )}
                        </button>
                    </form>
                </div>

                {/* Sign up link */}
                <p style={{
                    textAlign: 'center', marginTop: 24,
                    fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                }}>
                    Don't have clearance?{' '}
                    <Link to="/signup" style={{
                        color: 'var(--neon-cyan)', textDecoration: 'none',
                        fontWeight: 600, transition: 'text-shadow 0.3s',
                    }}
                        onMouseEnter={e => e.target.style.textShadow = '0 0 10px rgba(0,240,255,0.5)'}
                        onMouseLeave={e => e.target.style.textShadow = 'none'}
                    >
                        Request Access
                    </Link>
                </p>
            </div>

            {/* Spinner keyframe */}
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(122,139,181,0.4); }
      `}</style>
        </div>
    )
}
