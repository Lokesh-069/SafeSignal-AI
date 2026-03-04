import requests

import cv2
import mediapipe as mp
import time
import datetime
import smtplib
from email.message import EmailMessage

# -----------------------
# TWILIO SETUP
# -----------------------
from twilio.rest import Client

account_sid = "ACd76b6305e68a1ac820636ff54f082654"
auth_token = "a153e6991d50599ec5ded7169c465920"

client = Client(account_sid, auth_token)

TWILIO_SMS_NUMBER = "+13204336834"
TARGET_SMS_NUMBER = "+917679341340"

WHATSAPP_SANDBOX_NUMBER = "whatsapp:+14155238886"
TARGET_WHATSAPP_NUMBER = "whatsapp:+917679341340"

# -----------------------
# CLOUDINARY SETUP
# -----------------------
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="dcil9emrr",
    api_key="264151859645138",
    api_secret="GdeAAcPy_tqQbLEBUNBpiIRJuAQ"
)

# -----------------------
# EMAIL SETUP
# -----------------------
EMAIL_SENDER = "lokeshhazra22@gmail.com"
EMAIL_PASSWORD = "yitvfqimvazjwzwy"
EMAIL_RECEIVER = "sreoshibhowmik28@gmail.com"

# -----------------------
# STATIC LOCATION
# -----------------------
LATITUDE = 23.2417
LONGITUDE = 88.6106

def get_location():
    return f"https://maps.google.com/?q={LATITUDE},{LONGITUDE}"

# -----------------------
# IMAGE UPLOAD
# -----------------------
def upload_image(image_path):
    response = cloudinary.uploader.upload(image_path)
    return response["secure_url"]

# -----------------------
# ALERT FUNCTIONS
# -----------------------

def send_sms(image_url, maps_link):

    client.messages.create(
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

    print("SMS Sent")


def send_whatsapp(image_url, maps_link):

    client.messages.create(
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

    print("WhatsApp Sent")


def make_call():

    client.calls.create(
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

    print("Call Sent")


def send_email(image_url, maps_link):

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

    with smtplib.SMTP_SSL('smtp.gmail.com',465) as smtp:
        smtp.login(EMAIL_SENDER, EMAIL_PASSWORD)
        smtp.send_message(msg)

    print("Email Sent")


# -----------------------
# TRIGGER ALERT
# -----------------------

def trigger_alert(frame):

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

    filename = f"sos_{timestamp}.jpg"

    # Save evidence image
    cv2.imwrite("latest.jpg", frame)   # for dashboard
    cv2.imwrite(filename, frame)       # for archive

    print("Uploading image...")

    # Upload evidence to cloudinary
    image_url = upload_image(filename)

    # Get location
    maps_link = get_location()

    # Send alerts
    send_sms(image_url, maps_link)

    send_whatsapp(image_url, maps_link)

    make_call()

    send_email(image_url, maps_link)

    # Notify dashboard
    try:
        requests.post("http://127.0.0.1:5001/trigger_alert")
        print("Dashboard notified")
    except:
        print("Dashboard notification failed (api_server may not be running)")


# -----------------------
# POSE DETECTION SETUP
# -----------------------

gesture_start_time = None
HOLD_DURATION = 5
sos_triggered = False

mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

mp_drawing = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Camera not detected")
    exit()

# -----------------------
# MAIN LOOP
# -----------------------

while True:

    ret, frame = cap.read()

    if not ret:
        break

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = pose.process(rgb)

    gesture_detected = False

    if results.pose_landmarks:

        mp_drawing.draw_landmarks(
            frame,
            results.pose_landmarks,
            mp_pose.POSE_CONNECTIONS
        )

        lm = results.pose_landmarks.landmark

        left_wrist = lm[mp_pose.PoseLandmark.LEFT_WRIST]
        right_wrist = lm[mp_pose.PoseLandmark.RIGHT_WRIST]
        left_shoulder = lm[mp_pose.PoseLandmark.LEFT_SHOULDER]
        right_shoulder = lm[mp_pose.PoseLandmark.RIGHT_SHOULDER]

        # SOS: Wrists must cross sides, be raised above shoulders, close together, near center
        wrists_crossed = left_wrist.x < right_wrist.x
        wrists_raised = (
            left_wrist.y < left_shoulder.y - 0.05 and
            right_wrist.y < right_shoulder.y - 0.05
        )
        wrists_close = abs(left_wrist.y - right_wrist.y) < 0.12
        body_center_x = (left_shoulder.x + right_shoulder.x) / 2
        wrists_near_center = (
            abs(left_wrist.x - body_center_x) < 0.25 and
            abs(right_wrist.x - body_center_x) < 0.25
        )

        crossed_x = wrists_crossed and wrists_raised and wrists_close and wrists_near_center

        if crossed_x:

            gesture_detected = True

            cv2.putText(frame,
                        "SOS GESTURE DETECTED",
                        (50,50),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1,
                        (0,255,255),
                        2)

    # -----------------------
    # HOLD TIMER
    # -----------------------

    if gesture_detected:

        if gesture_start_time is None:
            gesture_start_time = time.time()

        elapsed = time.time() - gesture_start_time

        remaining = int(HOLD_DURATION - elapsed)

        if remaining > 0:

            cv2.putText(frame,
                        f"Hold {remaining} sec",
                        (50,90),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1,
                        (255,255,0),
                        2)

        if elapsed >= HOLD_DURATION and not sos_triggered:

            print("🚨 Emergency Triggered")

            trigger_alert(frame)

            sos_triggered = True

    else:

        gesture_start_time = None

    cv2.imshow("SentinelPose - Emergency System", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# -----------------------
# CLEANUP
# -----------------------

cap.release()
cv2.destroyAllWindows()
