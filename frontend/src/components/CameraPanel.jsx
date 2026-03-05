import { useState, useEffect, useRef, useCallback } from "react"
import { API_URL } from "../config"

// MediaPipe CDN URLs
const VISION_WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
const POSE_MODEL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"

export default function CameraPanel() {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const poseLandmarkerRef = useRef(null)
    const animFrameRef = useRef(null)
    const gestureStartRef = useRef(null)
    const cooldownRef = useRef(false)

    const [cameraReady, setCameraReady] = useState(false)
    const [cameraError, setCameraError] = useState(null)
    const [sosProgress, setSosProgress] = useState(0) // 0-100
    const [sosTriggered, setSosTriggered] = useState(false)
    const [modelLoading, setModelLoading] = useState(true)

    const HOLD_DURATION = 5 // seconds to hold pose
    const COOLDOWN = 30 // seconds after trigger

    // Initialize camera
    useEffect(() => {
        let stream = null

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: "user" },
                    audio: false,
                })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    setCameraReady(true)
                }
            } catch (err) {
                setCameraError(err.name === "NotAllowedError"
                    ? "Camera permission denied. Please allow camera access."
                    : "Camera not available: " + err.message)
            }
        }

        startCamera()

        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop())
        }
    }, [])

    // Load MediaPipe Pose Landmarker
    useEffect(() => {
        const loadPose = async () => {
            try {
                const vision = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/+esm")
                const { PoseLandmarker, FilesetResolver } = vision

                const filesetResolver = await FilesetResolver.forVisionTasks(VISION_WASM)

                poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: POSE_MODEL,
                        delegate: "GPU",
                    },
                    runningMode: "VIDEO",
                    numPoses: 1,
                })

                setModelLoading(false)
            } catch (err) {
                console.error("MediaPipe load error:", err)
                setModelLoading(false)
            }
        }

        loadPose()
    }, [])

    // SOS gesture detection: crossed arms
    const detectSOS = useCallback((landmarks) => {
        if (!landmarks || landmarks.length === 0) return false

        const lm = landmarks[0]
        // Key indices: 11=left shoulder, 12=right shoulder, 13=left elbow, 14=right elbow, 15=left wrist, 16=right wrist
        const leftShoulder = lm[11]
        const rightShoulder = lm[12]
        const leftElbow = lm[13]
        const rightElbow = lm[14]
        const leftWrist = lm[15]
        const rightWrist = lm[16]

        if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist || !leftElbow || !rightElbow) return false

        // All landmarks must be visible enough
        const minVis = 0.5
        if (leftShoulder.visibility < minVis || rightShoulder.visibility < minVis ||
            leftWrist.visibility < minVis || rightWrist.visibility < minVis) return false

        // Crossed arms: left wrist is on the RIGHT side, right wrist is on the LEFT side
        const leftWristCrossed = leftWrist.x < rightShoulder.x
        const rightWristCrossed = rightWrist.x > leftShoulder.x

        // Wrists should be near shoulder height (not too low)
        const shoulderY = (leftShoulder.y + rightShoulder.y) / 2
        const wristNearShoulders = Math.abs(leftWrist.y - shoulderY) < 0.25 &&
            Math.abs(rightWrist.y - shoulderY) < 0.25

        // Elbows should be bent (distance check)
        const elbowsBent = leftElbow.y > leftShoulder.y && rightElbow.y > rightShoulder.y

        return leftWristCrossed && rightWristCrossed && wristNearShoulders
    }, [])

    // Trigger SOS alert to backend
    const triggerSOS = useCallback(async () => {
        if (cooldownRef.current) return
        cooldownRef.current = true
        setSosTriggered(true)

        try {
            // Capture frame as evidence
            const canvas = document.createElement("canvas")
            canvas.width = videoRef.current.videoWidth
            canvas.height = videoRef.current.videoHeight
            canvas.getContext("2d").drawImage(videoRef.current, 0, 0)

            const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", 0.85))

            // Upload evidence
            const formData = new FormData()
            formData.append("evidence", blob, "sos_evidence.jpg")

            await fetch(`${API_URL}/upload_evidence`, { method: "POST", body: formData }).catch(() => { })

            // Trigger alert
            await fetch(`${API_URL}/trigger_alert`, { method: "POST" }).catch(() => { })
        } catch (e) {
            console.error("SOS trigger error:", e)
        }

        setTimeout(() => {
            cooldownRef.current = false
            setSosTriggered(false)
            setSosProgress(0)
        }, COOLDOWN * 1000)
    }, [])

    // Main detection loop
    useEffect(() => {
        if (!cameraReady || modelLoading) return

        const detect = () => {
            const video = videoRef.current
            const canvas = canvasRef.current
            const poseLandmarker = poseLandmarkerRef.current

            if (!video || !canvas || !poseLandmarker || video.readyState < 2) {
                animFrameRef.current = requestAnimationFrame(detect)
                return
            }

            const ctx = canvas.getContext("2d")
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            // Run pose detection
            const result = poseLandmarker.detectForVideo(video, performance.now())

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw landmarks
            if (result.landmarks && result.landmarks.length > 0) {
                const landmarks = result.landmarks[0]

                // Draw connections
                const connections = [
                    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
                    [11, 23], [12, 24], [23, 24], [23, 25], [24, 26],
                    [25, 27], [26, 28],
                ]

                ctx.strokeStyle = "rgba(0, 240, 255, 0.5)"
                ctx.lineWidth = 2
                connections.forEach(([a, b]) => {
                    if (landmarks[a] && landmarks[b]) {
                        ctx.beginPath()
                        ctx.moveTo(landmarks[a].x * canvas.width, landmarks[a].y * canvas.height)
                        ctx.lineTo(landmarks[b].x * canvas.width, landmarks[b].y * canvas.height)
                        ctx.stroke()
                    }
                })

                    // Draw key points
                    ;[11, 12, 13, 14, 15, 16, 23, 24].forEach(i => {
                        if (landmarks[i]) {
                            ctx.beginPath()
                            ctx.arc(landmarks[i].x * canvas.width, landmarks[i].y * canvas.height, 4, 0, Math.PI * 2)
                            ctx.fillStyle = "rgba(0, 240, 255, 0.8)"
                            ctx.fill()
                        }
                    })
            }

            // Check SOS gesture
            const isGesture = detectSOS(result.landmarks)

            if (isGesture && !cooldownRef.current) {
                if (!gestureStartRef.current) {
                    gestureStartRef.current = Date.now()
                }
                const elapsed = (Date.now() - gestureStartRef.current) / 1000
                const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100)
                setSosProgress(progress)

                if (elapsed >= HOLD_DURATION) {
                    triggerSOS()
                    gestureStartRef.current = null
                }

                // Draw SOS progress ring
                ctx.strokeStyle = `rgba(255, 0, 60, ${0.5 + progress / 200})`
                ctx.lineWidth = 4
                ctx.beginPath()
                ctx.arc(canvas.width / 2, 40, 25, -Math.PI / 2, -Math.PI / 2 + (progress / 100) * Math.PI * 2)
                ctx.stroke()

                // SOS text
                ctx.fillStyle = "#ff003c"
                ctx.font = "bold 14px Orbitron, sans-serif"
                ctx.textAlign = "center"
                ctx.fillText(`SOS ${Math.round(progress)}%`, canvas.width / 2, 80)
            } else if (!cooldownRef.current) {
                gestureStartRef.current = null
                setSosProgress(0)
            }

            animFrameRef.current = requestAnimationFrame(detect)
        }

        animFrameRef.current = requestAnimationFrame(detect)

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        }
    }, [cameraReady, modelLoading, detectSOS, triggerSOS])

    return (
        <div
            className="glass-card animated-glow-border animate-fade-in animate-fade-in-delay-1"
            style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                height: '100%'
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="panel-label">Live Camera Feed</div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                    color: cameraReady ? 'var(--neon-green)' : 'var(--neon-orange)',
                }}>
                    <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: cameraReady ? 'var(--neon-green)' : 'var(--neon-orange)',
                        animation: cameraReady ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
                    }} />
                    {cameraReady ? 'LIVE' : 'CONNECTING'}
                </div>
            </div>

            {/* Video Container */}
            <div style={{
                position: 'relative', flex: 1, minHeight: 280,
                borderRadius: 12, overflow: 'hidden',
                background: 'linear-gradient(135deg, #080c18, #0d1224)',
                border: `1px solid ${sosTriggered ? 'rgba(255,0,60,0.5)' : sosProgress > 0 ? 'rgba(255,0,60,0.3)' : 'rgba(0,240,255,0.15)'}`,
                transition: 'border-color 0.3s',
            }}>
                {/* Scanning animation while loading */}
                {!cameraReady && !cameraError && <div className="scan-line" />}

                {/* Browser camera video */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)', // Mirror
                    }}
                />

                {/* Pose detection overlay canvas */}
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)', // Mirror to match video
                        pointerEvents: 'none',
                    }}
                />

                {/* SOS triggered flash overlay */}
                {sosTriggered && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 5,
                        background: 'rgba(255,0,60,0.15)',
                        animation: 'alertFlash 0.8s ease-in-out infinite',
                        pointerEvents: 'none',
                    }} />
                )}

                {/* Camera error message */}
                {cameraError && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 12,
                        padding: 20, textAlign: 'center',
                    }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff6a00" strokeWidth="1" opacity="0.6">
                            <path d="M23 7l-7 5 7 5V7z" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            <line x1="1" y1="1" x2="23" y2="23" stroke="#ff003c" strokeWidth="2" />
                        </svg>
                        <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                            color: 'var(--neon-orange)', letterSpacing: '0.05em',
                            maxWidth: 300,
                        }}>
                            {cameraError}
                        </span>
                    </div>
                )}

                {/* Loading placeholder */}
                {!cameraReady && !cameraError && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 12,
                    }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1" opacity="0.4">
                            <path d="M23 7l-7 5 7 5V7z" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                        <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                            color: 'var(--text-secondary)', letterSpacing: '0.1em',
                        }}>
                            Requesting camera access...
                        </span>
                    </div>
                )}

                {/* Corner brackets */}
                {[
                    { top: 8, left: 8 }, { top: 8, right: 8 },
                    { bottom: 8, left: 8 }, { bottom: 8, right: 8 },
                ].map((pos, i) => (
                    <div key={i} style={{
                        position: 'absolute', ...pos, width: 20, height: 20,
                        borderColor: sosProgress > 0 ? '#ff003c' : 'var(--neon-cyan)',
                        borderStyle: 'solid', borderWidth: 0, opacity: 0.5,
                        transition: 'border-color 0.3s',
                        ...(pos.top !== undefined && pos.left !== undefined && { borderTopWidth: 2, borderLeftWidth: 2 }),
                        ...(pos.top !== undefined && pos.right !== undefined && { borderTopWidth: 2, borderRightWidth: 2 }),
                        ...(pos.bottom !== undefined && pos.left !== undefined && { borderBottomWidth: 2, borderLeftWidth: 2 }),
                        ...(pos.bottom !== undefined && pos.right !== undefined && { borderBottomWidth: 2, borderRightWidth: 2 }),
                    }} />
                ))}

                {/* Grid overlay */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: 'linear-gradient(rgba(0,240,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                }} />
            </div>

            {/* Bottom status bar */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px',
                background: sosTriggered ? 'rgba(255,0,60,0.06)' : sosProgress > 0 ? 'rgba(255,0,60,0.03)' : 'rgba(0,240,255,0.03)',
                borderRadius: 8,
                border: `1px solid ${sosTriggered ? 'rgba(255,0,60,0.2)' : 'rgba(0,240,255,0.08)'}`,
                transition: 'all 0.3s',
            }}>
                <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                    color: sosTriggered ? 'var(--neon-red)' : sosProgress > 0 ? '#ff6a00' : 'var(--neon-cyan)',
                    display: 'flex', alignItems: 'center', gap: 6,
                }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                    {sosTriggered ? '🚨 SOS TRIGGERED' : sosProgress > 0 ? `SOS Detecting ${Math.round(sosProgress)}%` : modelLoading ? 'Loading AI Model...' : 'AI Monitoring Active'}
                </span>

                {/* SOS progress bar */}
                {sosProgress > 0 && !sosTriggered && (
                    <div style={{
                        width: 80, height: 4, borderRadius: 4,
                        background: 'rgba(255,0,60,0.15)',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: `${sosProgress}%`, height: '100%',
                            background: 'linear-gradient(90deg, #ff6a00, #ff003c)',
                            borderRadius: 4,
                            transition: 'width 0.2s',
                        }} />
                    </div>
                )}

                <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                    color: 'var(--text-secondary)',
                }}>
                    Browser Camera
                </span>
            </div>

            <style>{`
        @keyframes alertFlash {
          0%, 100% { background: rgba(255,0,60,0); }
          50% { background: rgba(255,0,60,0.15); }
        }
      `}</style>
        </div>
    )
}
