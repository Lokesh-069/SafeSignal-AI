from flask import Flask, request, jsonify
import json

app = Flask(__name__)

LOCATION_FILE = "location.json"

@app.route("/")
def home():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Location Service</title>
    </head>
    <body>
        <h2>GPS Location Active</h2>
        <script>
            function sendLocation(position) {
                fetch('/update_location', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    })
                });
            }

            function errorHandler(error) {
                console.log("Location error:", error);
            }

            function updateLocation() {
                navigator.geolocation.getCurrentPosition(sendLocation, errorHandler);
            }

            setInterval(updateLocation, 5000);
            updateLocation();
        </script>
    </body>
    </html>
    """

@app.route("/update_location", methods=["POST"])
def update_location():
    data = request.json
    with open(LOCATION_FILE, "w") as f:
        json.dump(data, f)
    return jsonify({"status": "updated"})

if __name__ == "__main__":
    app.run(debug=False)