from flask import Flask, render_template, Response, send_file, jsonify
import cv2
import os
import json

app = Flask(__name__)

# -----------------------------
# CAMERA STREAM
# -----------------------------

camera = cv2.VideoCapture(0)

def generate_frames():
    while True:
        success, frame = camera.read()

        if not success:
            break

        else:
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


# -----------------------------
# MAIN DASHBOARD
# -----------------------------

@app.route('/')
def index():
    return render_template("index.html")


# -----------------------------
# LATEST EVIDENCE IMAGE
# -----------------------------

@app.route('/latest_evidence')
def latest_evidence():

    image_path = "latest.jpg"

    if os.path.exists(image_path):
        return send_file(image_path, mimetype='image/jpeg')

    return "No Evidence Yet"


# -----------------------------
# LOCATION API
# -----------------------------

@app.route('/location')
def location():

    if os.path.exists("location.json"):

        with open("location.json", "r") as f:
            data = json.load(f)

        return jsonify(data)

    return jsonify({
        "lat": 23.0,
        "lon": 88.0
    })


# -----------------------------
# RUN SERVER
# -----------------------------

if __name__ == "__main__":
    app.run(debug=True)