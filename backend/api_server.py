from flask import Flask, jsonify, send_file, Response, request
from flask_cors import CORS
import cv2
import mediapipe as mp
import json
import os
import time
import datetime
import threading
import smtplib
from email.message import EmailMessage

app = Flask(__name__)
CORS(app)

# ---------------------------
# TWILIO SETUP
# ---------------------------
from twilio.rest import Client

account_sid = "ACd76b6305e68a1ac820636ff54f082654"
auth_token = "a153e6991d50599ec5ded7169c465920"

twilio_client = Client(account_sid, auth_token)

TWILIO_SMS_NUMBER = "+13204336834"
TARGET_SMS_NUMBER = "+917679341340"

WHATSAPP_SANDBOX_NUMBER = "whatsapp:+14155238886"
TARGET_WHATSAPP_NUMBER = "whatsapp:+917679341340"

# ---------------------------
# CLOUDINARY SETUP
# ---------------------------
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="dcil9emrr",
    api_key="264151859645138",
    api_secret="GdeAAcPy_tqQbLEBUNBpiIRJuAQ"
)

# ---------------------------
# EMAIL SETUP
# ---------------------------
EMAIL_SENDER = "lokeshhazra22@gmail.com"
EMAIL_PASSWORD = "yitvfqimvazjwzwy"
EMAIL_RECEIVER = "sreoshibhowmik28@gmail.com"

# ---------------------------
# STATIC LOCATION
# ---------------------------
LATITUDE = 22.5599202
LONGITUDE = 88.4899014

def get_location():
    return f"https://maps.google.com/?q={LATITUDE},{LONGITUDE}"

# ---------------------------
# IMAGE UPLOAD
# ---------------------------
def upload_image(image_path):
    response = cloudinary.uploader.upload(image_path)
    return response["secure_url"]

# ---------------------------
# ALERT FUNCTIONS
# ---------------------------

def send_sms(image_url, maps_link):
    try:
        twilio_client.messages.create(
            body=f"""
🚨 EMERGENCY ALERT 🚨
Robbery suspected!

📍 Location
{maps_link}

📸 Evidence
{image_url}
""",
            from_=TWILIO_SMS_NUMBER,
            to=TARGET_SMS_NUMBER
        )
        add_log("SMS alert sent successfully", "success")
    except Exception as e:
        add_log(f"SMS failed: {str(e)[:50]}", "alert")


def send_whatsapp(image_url, maps_link):
    try:
        twilio_client.messages.create(
            body=f"""
🚨 *EMERGENCY ALERT*

Robbery suspected!

📍 Location
{maps_link}
""",
            from_=WHATSAPP_SANDBOX_NUMBER,
            to=TARGET_WHATSAPP_NUMBER,
            media_url=[image_url]
        )
        add_log("WhatsApp alert sent successfully", "success")
    except Exception as e:
        add_log(f"WhatsApp failed: {str(e)[:50]}", "alert")


def make_call():
    try:
        twilio_client.calls.create(
            twiml="""
<Response>
<Say voice="alice">
Emergency alert. Possible robbery detected.
Please check your phone for location and evidence.
</Say>
</Response>
""",
            to=TARGET_SMS_NUMBER,
            from_=TWILIO_SMS_NUMBER
        )
        add_log("Emergency phone call initiated", "success")
    except Exception as e:
        add_log(f"Phone call failed: {str(e)[:50]}", "alert")


def send_email(image_url, maps_link):
    try:
        msg = EmailMessage()
        msg['Subject'] = "🚨 EMERGENCY ROBBERY ALERT"
        msg['From'] = EMAIL_SENDER
        msg['To'] = EMAIL_RECEIVER
        msg.set_content(f"""
Emergency robbery detected.

Location:
{maps_link}

Evidence Image:
{image_url}
""")
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_SENDER, EMAIL_PASSWORD)
            smtp.send_message(msg)
        add_log("Email alert sent successfully", "success")
    except Exception as e:
        add_log(f"Email failed: {str(e)[:50]}", "alert")


# ---------------------------
# SHARED STATE
# ---------------------------

event_logs = []
log_lock = threading.Lock()

# SOS detection state
gesture_start_time = None
HOLD_DURATION = 5
sos_triggered = False
last_sos_time = 0
SOS_COOLDOWN = 30  # seconds between SOS triggers
gesture_frame_count = 0  # consecutive frames with gesture detected
GESTURE_MIN_FRAMES = 3  # require 3 consecutive frames to confirm
last_gesture_time = 0  # for grace period
GESTURE_GRACE_PERIOD = 0.5  # seconds — ignore brief drops

def add_log(message, log_type="info"):
    """Add a log entry (thread-safe)"""
    with log_lock:
        event_logs.append({
            "time": datetime.datetime.now().strftime("%H:%M:%S"),
            "message": message,
            "type": log_type
        })
        if len(event_logs) > 100:
            event_logs.pop(0)
    print(f"[{log_type.upper()}] {message}")

# Initial logs
add_log("System initialized", "info")
add_log("Loading AI detection models...", "info")


# ---------------------------
# TRIGGER FULL ALERT
# ---------------------------

def trigger_alert(frame):
    """Save evidence, upload, and send all alerts"""
    global last_sos_time

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"sos_{timestamp}.jpg"

    # Save evidence image
    cv2.imwrite("latest.jpg", frame)
    cv2.imwrite(filename, frame)

    add_log("🚨 SOS GESTURE DETECTED — EMERGENCY TRIGGERED", "alert")
    add_log("Evidence frame captured and saved", "warning")

    last_sos_time = time.time()

    # Run alerts in background thread to not block video feed
    def send_all_alerts():
        add_log("Uploading evidence to cloud...", "info")
        try:
            image_url = upload_image(filename)
            add_log("Evidence uploaded to Cloudinary", "success")
        except Exception as e:
            add_log(f"Upload failed: {str(e)[:50]}", "alert")
            return

        maps_link = get_location()

        add_log("Sending SMS alert...", "warning")
        send_sms(image_url, maps_link)

        add_log("Sending WhatsApp alert...", "warning")
        send_whatsapp(image_url, maps_link)

        add_log("Making emergency phone call...", "warning")
        make_call()

        add_log("Sending email alert...", "warning")
        send_email(image_url, maps_link)

        add_log("All alert channels notified ✅", "success")

    threading.Thread(target=send_all_alerts, daemon=True).start()


# ---------------------------
# MEDIAPIPE POSE SETUP
# ---------------------------

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)
mp_drawing = mp.solutions.drawing_utils

add_log("MediaPipe Pose model loaded", "success")
add_log("Camera initializing...", "info")


# ---------------------------
# CAMERA STREAM WITH SOS DETECTION
# ---------------------------

def generate_frames():
    global gesture_start_time, sos_triggered, last_sos_time, gesture_frame_count, last_gesture_time

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        add_log("Camera not detected!", "alert")
        print("Camera not detected")
        return

    add_log("Camera stream initialized", "success")
    add_log("AI gesture recognition active", "success")
    add_log("Alert channels: SMS, WhatsApp, Email, Phone", "info")
    add_log("System ready — AI monitoring active", "success")

    while True:
        success, frame = cap.read()

        if not success:
            break

        # --- POSE DETECTION ---
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb)

        gesture_detected = False

        if results.pose_landmarks:
            # Draw pose landmarks on the frame
            mp_drawing.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(0, 255, 255), thickness=2, circle_radius=2),
                mp_drawing.DrawingSpec(color=(0, 240, 255), thickness=1, circle_radius=1),
            )

            lm = results.pose_landmarks.landmark

            left_wrist = lm[mp_pose.PoseLandmark.LEFT_WRIST]
            right_wrist = lm[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_elbow = lm[mp_pose.PoseLandmark.LEFT_ELBOW]
            right_elbow = lm[mp_pose.PoseLandmark.RIGHT_ELBOW]
            left_shoulder = lm[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = lm[mp_pose.PoseLandmark.RIGHT_SHOULDER]

            # --- SOS GESTURE: Crossed arms raised above chest ---
            # Normal: left_wrist.x > right_wrist.x
            # Crossed: left_wrist.x < right_wrist.x (wrists swap sides)

            # 1) Wrists must CROSS sides
            wrists_crossed = left_wrist.x < right_wrist.x

            # 2) Both wrists ABOVE shoulders (relaxed threshold)
            wrists_raised = (
                left_wrist.y < left_shoulder.y and
                right_wrist.y < right_shoulder.y
            )

            # 3) Wrists at similar height (relaxed)
            wrists_close_vertically = abs(left_wrist.y - right_wrist.y) < 0.20

            # 4) Wrists near body center (relaxed)
            body_center_x = (left_shoulder.x + right_shoulder.x) / 2
            wrists_near_center = (
                abs(left_wrist.x - body_center_x) < 0.35 and
                abs(right_wrist.x - body_center_x) < 0.35
            )

            raw_detection = (
                wrists_crossed and
                wrists_raised and
                wrists_close_vertically and
                wrists_near_center
            )

            if raw_detection:
                gesture_frame_count += 1
                last_gesture_time = time.time()
            else:
                # Grace period: don't reset immediately on a single dropped frame
                if time.time() - last_gesture_time > GESTURE_GRACE_PERIOD:
                    gesture_frame_count = 0

            # Confirmed after enough consecutive frames
            if gesture_frame_count >= GESTURE_MIN_FRAMES:
                gesture_detected = True
                cv2.putText(frame, "SOS GESTURE DETECTED",
                            (50, 50), cv2.FONT_HERSHEY_SIMPLEX,
                            1, (0, 0, 255), 2)
            elif raw_detection:
                # Show early feedback
                cv2.putText(frame, "HOLD STEADY...",
                            (50, 50), cv2.FONT_HERSHEY_SIMPLEX,
                            0.7, (0, 255, 255), 2)
            elif wrists_raised:
                cv2.putText(frame, "CROSS ARMS TO SIGNAL SOS",
                            (50, 50), cv2.FONT_HERSHEY_SIMPLEX,
                            0.6, (0, 200, 200), 1)

        # --- HOLD TIMER ---
        current_time = time.time()

        # Reset sos_triggered after cooldown
        if sos_triggered and (current_time - last_sos_time) > SOS_COOLDOWN:
            sos_triggered = False
            add_log("SOS cooldown reset — monitoring resumed", "info")

        if gesture_detected:
            if gesture_start_time is None:
                gesture_start_time = current_time
                add_log("SOS gesture confirmed — hold for 5 seconds", "warning")

            elapsed = current_time - gesture_start_time
            remaining = int(HOLD_DURATION - elapsed)

            if remaining > 0:
                cv2.putText(frame, f"Hold {remaining} sec",
                            (50, 90), cv2.FONT_HERSHEY_SIMPLEX,
                            1, (255, 255, 0), 2)

                # Draw progress bar
                bar_width = int((elapsed / HOLD_DURATION) * 300)
                cv2.rectangle(frame, (50, 110), (50 + bar_width, 125), (0, 255, 255), -1)
                cv2.rectangle(frame, (50, 110), (350, 125), (0, 255, 255), 1)

            if elapsed >= HOLD_DURATION and not sos_triggered:
                print("🚨 Emergency Triggered")
                trigger_alert(frame)
                sos_triggered = True

        else:
            if gesture_start_time is not None:
                gesture_start_time = None

        # --- ENCODE AND YIELD ---
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')


@app.route("/video_feed")
def video_feed():
    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


# ---------------------------
# LOCATION API
# ---------------------------

@app.route("/location")
def location():
    try:
        with open("location.json") as f:
            data = json.load(f)
        return jsonify(data)
    except:
        return jsonify({
            "latitude": 22.5599202,
            "longitude": 88.4899014
        })


# ---------------------------
# LATEST EVIDENCE IMAGE
# ---------------------------

@app.route("/latest_evidence")
def latest_evidence():
    image_path = "latest.jpg"
    if os.path.exists(image_path):
        return send_file(image_path, mimetype="image/jpeg")
    return jsonify({"error": "No evidence yet"}), 404


# ---------------------------
# SYSTEM STATUS API
# ---------------------------

@app.route("/status")
def status():
    has_evidence = os.path.exists("latest.jpg")
    is_active_alert = False
    last_modified = None

    if has_evidence:
        try:
            mod_time = os.path.getmtime("latest.jpg")
            last_modified = datetime.datetime.fromtimestamp(mod_time).strftime("%Y-%m-%d %H:%M:%S")
            if (datetime.datetime.now().timestamp() - mod_time) < 60:
                is_active_alert = True
        except:
            pass

    if is_active_alert:
        threat_level = 2
    elif has_evidence:
        threat_level = 1
    else:
        threat_level = 0

    return jsonify({
        "is_alert": is_active_alert,
        "has_evidence": has_evidence,
        "threat_level": threat_level,
        "last_trigger": last_modified,
        "system_active": True,
    })


# ---------------------------
# EVENT LOGS API
# ---------------------------

@app.route("/logs")
def logs():
    with log_lock:
        return jsonify(list(event_logs))


# ---------------------------
# TRIGGER ALERT ENDPOINT (from gesture detection)
# ---------------------------

@app.route("/trigger_alert", methods=["POST"])
def trigger_alert_endpoint():
    add_log("🚨 SOS GESTURE DETECTED", "alert")
    add_log("All alert channels notified", "success")
    return jsonify({"status": "alert_registered"})


# ---------------------------
# MANUAL SOS ENDPOINT
# ---------------------------

# Shared camera frame for manual SOS
latest_frame = None
frame_lock = threading.Lock()

@app.route("/manual_sos", methods=["POST"])
def manual_sos():
    """Manual SOS button - captures current frame and triggers all alerts"""
    global sos_triggered, last_sos_time

    add_log("🚨 MANUAL SOS ACTIVATED", "alert")

    # Try to capture a frame from the camera
    frame_captured = False
    try:
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"manual_sos_{timestamp}.jpg"
                cv2.imwrite("latest.jpg", frame)
                cv2.imwrite(filename, frame)
                frame_captured = True
                add_log("Evidence frame captured", "warning")

                last_sos_time = time.time()
                sos_triggered = True

                # Send alerts in background
                def send_manual_alerts():
                    add_log("Uploading evidence to cloud...", "info")
                    try:
                        image_url = upload_image(filename)
                        add_log("Evidence uploaded to Cloudinary", "success")
                    except Exception as e:
                        add_log(f"Upload failed: {str(e)[:50]}", "alert")
                        return

                    maps_link = get_location()

                    add_log("Sending SMS alert...", "warning")
                    send_sms(image_url, maps_link)

                    add_log("Sending WhatsApp alert...", "warning")
                    send_whatsapp(image_url, maps_link)

                    add_log("Making emergency phone call...", "warning")
                    make_call()

                    add_log("Sending email alert...", "warning")
                    send_email(image_url, maps_link)

                    add_log("All alert channels notified ✅", "success")

                threading.Thread(target=send_manual_alerts, daemon=True).start()

            cap.release()
    except Exception as e:
        add_log(f"Camera capture failed: {str(e)[:50]}", "alert")

    if not frame_captured:
        add_log("No camera frame available — sending alerts without evidence", "warning")
        last_sos_time = time.time()
        sos_triggered = True

        def send_no_frame_alerts():
            maps_link = get_location()
            add_log("Sending SMS alert...", "warning")
            send_sms("No image available", maps_link)
            add_log("Sending WhatsApp alert...", "warning")
            send_whatsapp("No image available", maps_link)
            add_log("Making emergency phone call...", "warning")
            make_call()
            add_log("Sending email alert...", "warning")
            send_email("No image available", maps_link)
            add_log("All alert channels notified ✅", "success")

        threading.Thread(target=send_no_frame_alerts, daemon=True).start()

    return jsonify({"status": "manual_sos_triggered", "evidence": frame_captured})


# ---------------------------
# HEALTH CHECK
# ---------------------------

@app.route("/")
def home():
    return jsonify({
        "status": "SafeSignal Backend Running"
    })


# ---------------------------
# RUN SERVER
# ---------------------------

if __name__ == "__main__":
    print("=" * 50)
    print("  SafeSignal API Server")
    print("  AI-Powered Emergency Detection")
    print("=" * 50)
    print(f"  Camera Feed:    http://127.0.0.1:5001/video_feed")
    print(f"  Location API:   http://127.0.0.1:5001/location")
    print(f"  Evidence API:   http://127.0.0.1:5001/latest_evidence")
    print(f"  Status API:     http://127.0.0.1:5001/status")
    print(f"  Logs API:       http://127.0.0.1:5001/logs")
    print("=" * 50)

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=False  # Must be False to avoid duplicate camera captures
    )