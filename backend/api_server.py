from flask import Flask, jsonify, send_file, Response, request
from flask_cors import CORS
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

account_sid = os.environ.get("TWILIO_SID", "ACd76b6305e68a1ac820636ff54f082654")
auth_token = os.environ.get("TWILIO_TOKEN", "a153e6991d50599ec5ded7169c465920")

twilio_client = Client(account_sid, auth_token)

TWILIO_SMS_NUMBER = "+13204336834"
TARGET_SMS_NUMBER = "+917679341340"

WHATSAPP_SANDBOX_NUMBER = "whatsapp:+14155238886"
TARGET_WHATSAPP_NUMBER = "whatsapp:+917679341340"

TWILIO_CALL_NUMBER = "+13204336834"
TARGET_CALL_NUMBER = "+917679341340"

# ---------------------------
# CLOUDINARY SETUP
# ---------------------------
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD", "dfhzpgyep"),
    api_key=os.environ.get("CLOUDINARY_KEY", "594898555647737"),
    api_secret=os.environ.get("CLOUDINARY_SECRET", "1YBf7OIFNAv8gFx-wW2x5IhKk_c"),
)

# ---------------------------
# EMAIL SETUP
# ---------------------------
EMAIL_SENDER = os.environ.get("EMAIL_SENDER", "skynetincoming@gmail.com")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD", "yitvfqimvazjwzwy")
EMAIL_RECEIVER = os.environ.get("EMAIL_RECEIVER", "sreoshibhowmik28@gmail.com")

# ---------------------------
# DYNAMIC LOCATION
# ---------------------------
DEFAULT_LATITUDE = 22.5599202
DEFAULT_LONGITUDE = 88.4899014

def get_current_location():
    """Read latest location from location.json"""
    try:
        with open("location.json") as f:
            data = json.load(f)
        return data.get("latitude", DEFAULT_LATITUDE), data.get("longitude", DEFAULT_LONGITUDE)
    except:
        return DEFAULT_LATITUDE, DEFAULT_LONGITUDE

def get_location():
    lat, lng = get_current_location()
    return f"https://maps.google.com/?q={lat},{lng}"

# ---------------------------
# IMAGE UPLOAD
# ---------------------------

def upload_image(image_path):
    return cloudinary.uploader.upload(image_path)["secure_url"]

# ---------------------------
# ALERT FUNCTIONS
# ---------------------------

def send_sms(image_url, maps_link):
    try:
        message = twilio_client.messages.create(
            body=f"🚨 SafeSignal ALERT!\n\n⚠ SOS Detected.\n📍 Location: {maps_link}\n📷 Evidence: {image_url}",
            from_=TWILIO_SMS_NUMBER,
            to=TARGET_SMS_NUMBER
        )
        add_log(f"SMS sent: {message.sid[:15]}...", "success")
    except Exception as e:
        add_log(f"SMS failed: {str(e)[:50]}", "alert")


def send_whatsapp(image_url, maps_link):
    try:
        message = twilio_client.messages.create(
            body=f"🚨 *SafeSignal ALERT!*\n\n⚠ SOS Detected.\n📍 Location: {maps_link}\n📷 Evidence: {image_url}",
            from_=WHATSAPP_SANDBOX_NUMBER,
            to=TARGET_WHATSAPP_NUMBER
        )
        add_log(f"WhatsApp sent: {message.sid[:15]}...", "success")
    except Exception as e:
        add_log(f"WhatsApp failed: {str(e)[:50]}", "alert")


def make_call():
    try:
        call = twilio_client.calls.create(
            twiml="<Response><Say voice='Polly.Joanna'>Alert! This is SafeSignal emergency system. An SOS signal has been detected at the monitored location. Immediate attention is required. Please respond immediately.</Say><Pause length='2'/><Say voice='Polly.Joanna'>Repeating: SOS alert detected. Please check your SafeSignal dashboard for evidence and location details.</Say></Response>",
            from_=TWILIO_CALL_NUMBER,
            to=TARGET_CALL_NUMBER
        )
        add_log(f"Call initiated: {call.sid[:15]}...", "success")
    except Exception as e:
        add_log(f"Call failed: {str(e)[:50]}", "alert")


def send_email(image_url, maps_link):
    try:
        msg = EmailMessage()
        msg["Subject"] = "🚨 SafeSignal SOS ALERT"
        msg["From"] = EMAIL_SENDER
        msg["To"] = EMAIL_RECEIVER
        msg.set_content(f"""
🚨 SafeSignal Emergency Alert

⚠ An SOS signal has been detected.

📍 Location: {maps_link}
📷 Evidence: {image_url}

This is an automated alert from SafeSignal AI Security System.
        """)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(EMAIL_SENDER, EMAIL_PASSWORD)
            smtp.send_message(msg)
        add_log("Email sent successfully", "success")
    except Exception as e:
        add_log(f"Email failed: {str(e)[:50]}", "alert")


# ---------------------------
# SHARED STATE
# ---------------------------

event_logs = []
log_lock = threading.Lock()

# SOS detection state
sos_triggered = False
last_sos_time = 0
SOS_COOLDOWN = 30
manual_alert_time = 0
ALERT_DURATION = 60

def add_log(message, log_type="info"):
    """Add a log entry (thread-safe)"""
    with log_lock:
        event_logs.append({
            "time": datetime.datetime.now().strftime("%H:%M:%S"),
            "message": message,
            "type": log_type,
        })
        if len(event_logs) > 100:
            event_logs.pop(0)

# Initial logs
add_log("System initialized", "info")
add_log("SafeSignal backend ready", "success")
add_log("Waiting for browser connections...", "info")


# ---------------------------
# TRIGGER FULL ALERT (called by browser or manual SOS)
# ---------------------------

def trigger_full_alert(image_path=None):
    """Save evidence, upload, and send all alerts"""
    global sos_triggered, last_sos_time, manual_alert_time

    last_sos_time = time.time()
    manual_alert_time = time.time()
    sos_triggered = True

    def send_all_alerts():
        image_url = "No image available"

        if image_path and os.path.exists(image_path):
            add_log("Uploading evidence to cloud...", "info")
            try:
                image_url = upload_image(image_path)
                add_log("Evidence uploaded to Cloudinary", "success")
            except Exception as e:
                add_log(f"Upload failed: {str(e)[:50]}", "alert")

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
            "latitude": DEFAULT_LATITUDE,
            "longitude": DEFAULT_LONGITUDE
        })


@app.route("/update_location", methods=["POST"])
def update_location():
    """Receive GPS coordinates from the browser and save to location.json"""
    data = request.json
    if data and "latitude" in data and "longitude" in data:
        with open("location.json", "w") as f:
            json.dump({
                "latitude": data["latitude"],
                "longitude": data["longitude"]
            }, f)
        return jsonify({"status": "location_updated"})
    return jsonify({"error": "Missing latitude/longitude"}), 400


# ---------------------------
# LATEST EVIDENCE IMAGE
# ---------------------------

@app.route("/latest_evidence")
def latest_evidence():
    if os.path.exists("latest.jpg"):
        return send_file("latest.jpg", mimetype="image/jpeg")
    return jsonify({"error": "No evidence available"}), 404


# ---------------------------
# UPLOAD EVIDENCE (from browser)
# ---------------------------

@app.route("/upload_evidence", methods=["POST"])
def upload_evidence():
    """Receive evidence image from browser camera capture"""
    if "evidence" not in request.files:
        return jsonify({"error": "No evidence file"}), 400

    file = request.files["evidence"]
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"sos_{timestamp}.jpg"

    file.save("latest.jpg")
    file.seek(0)
    file.save(filename)

    add_log("Evidence received from browser", "success")
    return jsonify({"status": "evidence_uploaded", "filename": filename})


# ---------------------------
# SYSTEM STATUS API
# ---------------------------

@app.route("/status")
def status():
    has_evidence = os.path.exists("latest.jpg")
    is_active_alert = False
    last_modified = None

    # Check file-based alert
    if has_evidence:
        try:
            mod_time = os.path.getmtime("latest.jpg")
            last_modified = datetime.datetime.fromtimestamp(mod_time).strftime("%Y-%m-%d %H:%M:%S")
            if (datetime.datetime.now().timestamp() - mod_time) < ALERT_DURATION:
                is_active_alert = True
        except:
            pass

    # Check in-memory alert (from manual SOS or trigger_alert)
    if manual_alert_time > 0 and (time.time() - manual_alert_time) < ALERT_DURATION:
        is_active_alert = True
        if last_modified is None:
            last_modified = datetime.datetime.fromtimestamp(manual_alert_time).strftime("%Y-%m-%d %H:%M:%S")

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
# TRIGGER ALERT ENDPOINT (from browser pose detection)
# ---------------------------

@app.route("/trigger_alert", methods=["POST"])
def trigger_alert_endpoint():
    add_log("🚨 SOS GESTURE DETECTED (browser)", "alert")
    trigger_full_alert("latest.jpg")
    return jsonify({"status": "alert_triggered"})


# ---------------------------
# MANUAL SOS ENDPOINT
# ---------------------------

@app.route("/manual_sos", methods=["POST"])
def manual_sos():
    """Manual SOS button — triggers all alerts"""
    global manual_alert_time

    manual_alert_time = time.time()
    add_log("🚨 MANUAL SOS ACTIVATED", "alert")
    trigger_full_alert("latest.jpg")
    return jsonify({"status": "manual_sos_triggered"})


# ---------------------------
# HEALTH CHECK
# ---------------------------

@app.route("/")
def home():
    return jsonify("SafeSignal Backend Running")


# ---------------------------
# RUN SERVER
# ---------------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    add_log(f"Server starting on port {port}", "info")
    app.run(host="0.0.0.0", port=port, debug=False)