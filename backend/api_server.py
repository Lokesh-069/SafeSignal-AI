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

# ---------------------------------------------------
# TWILIO SETUP
# ---------------------------------------------------

from twilio.rest import Client

# Use environment variables (required for Render deployment)
TWILIO_ACCOUNT_SID = os.environ.get("ACd76b6305e68a1ac820636ff54f082654")
TWILIO_AUTH_TOKEN = os.environ.get("a153e6991d50599ec5ded7169c465920")

twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

TWILIO_SMS_NUMBER = os.environ.get("+13204336834")
TARGET_SMS_NUMBER = os.environ.get("+917679341340")

WHATSAPP_SANDBOX_NUMBER = "whatsapp:+14155238886"
TARGET_WHATSAPP_NUMBER = "whatsapp:+917679341340"

# ---------------------------------------------------
# CLOUDINARY SETUP
# ---------------------------------------------------

import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="dcil9emrr",
    api_key="264151859645138",
    api_secret="GdeAAcPy_tqQbLEBUNBpiIRJuAQ"
)

# ---------------------------------------------------
# EMAIL SETUP
# ---------------------------------------------------

EMAIL_SENDER = os.environ.get("lokeshhazra22@gmail.com")
EMAIL_PASSWORD = os.environ.get("yitvfqimvazjwzwy")
EMAIL_RECEIVER = "sreoshibhowmik28@gmail.com"

# ---------------------------------------------------
# LOCATION
# ---------------------------------------------------

DEFAULT_LATITUDE = 22.5599202
DEFAULT_LONGITUDE = 88.4899014


def get_current_location():
    try:
        with open("location.json") as f:
            data = json.load(f)
        return data.get("latitude", DEFAULT_LATITUDE), data.get("longitude", DEFAULT_LONGITUDE)
    except:
        return DEFAULT_LATITUDE, DEFAULT_LONGITUDE


def get_location():
    lat, lng = get_current_location()
    return f"https://maps.google.com/?q={lat},{lng}"


# ---------------------------------------------------
# IMAGE UPLOAD
# ---------------------------------------------------

def upload_image(image_path):
    response = cloudinary.uploader.upload(image_path)
    return response["secure_url"]


# ---------------------------------------------------
# ALERT FUNCTIONS
# ---------------------------------------------------

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

        print("SMS sent successfully")

    except Exception as e:
        print("SMS Error:", e)


def send_whatsapp(image_url, maps_link):
    try:
        message = twilio_client.messages.create(
            body=f"""
🚨 SOS ALERT 🚨

Possible robbery detected.

📍 Location
{maps_link}

📸 Evidence
{image_url}
""",
            from_=WHATSAPP_SANDBOX_NUMBER,
            to=TARGET_WHATSAPP_NUMBER
        )

        print("WhatsApp sent:", message.sid)

    except Exception as e:
        print("WhatsApp Error:", e)


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

        print("Call initiated")

    except Exception as e:
        print("Call Error:", e)


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

Evidence:
{image_url}
""")

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_SENDER, EMAIL_PASSWORD)
            smtp.send_message(msg)

        print("Email sent successfully")

    except Exception as e:
        print("Email Error:", e)


# ---------------------------------------------------
# TRIGGER ALERT
# ---------------------------------------------------

def trigger_alert(frame):

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"sos_{timestamp}.jpg"

    cv2.imwrite("latest.jpg", frame)
    cv2.imwrite(filename, frame)

    print("🚨 SOS detected")

    def send_all_alerts():

        try:
            image_url = upload_image(filename)

        except:
            image_url = "Image upload failed"

        maps_link = get_location()

        send_sms(image_url, maps_link)
        send_whatsapp(image_url, maps_link)
        make_call()
        send_email(image_url, maps_link)

        print("All alerts sent")

    threading.Thread(target=send_all_alerts).start()


# ---------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------

@app.route("/")
def home():
    return jsonify({
        "status": "SafeSignal Backend Running"
    })


@app.route("/test_alert")
def test_alert():

    import numpy as np

    blank_image = np.zeros((480, 640, 3), dtype=np.uint8)

    trigger_alert(blank_image)

    return jsonify({
        "status": "Test alert triggered"
    })


# ---------------------------------------------------
# RUN SERVER
# ---------------------------------------------------

if __name__ == "__main__":

    print("SafeSignal Backend Running")

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=False
    )
