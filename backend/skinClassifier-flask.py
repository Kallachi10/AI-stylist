from flask import Flask, request, jsonify
import cv2
import numpy as np
from sklearn.cluster import KMeans

app = Flask(__name__)

# Load OpenCV's pre-trained face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

def extract_skin_tone(image_bytes):
    """Extracts skin tone from an uploaded image without saving it."""
    # Convert image bytes to a NumPy array
    image_array = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if image is None:
        return {"error": "Invalid image file."}

    # Convert to grayscale for face detection
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(100, 100))

    if len(faces) == 0:
        return {"error": "No face detected."}

    # Select the first detected face
    (x, y, w, h) = faces[0]

    # Crop a central portion of the face to avoid hair and background
    face_roi = image[y + int(h * 0.2): y + int(h * 0.8), x + int(w * 0.2): x + int(w * 0.8)]

    if face_roi.size == 0:
        return {"error": "Face cropping failed."}

    # Convert to L*a*b* color space
    lab = cv2.cvtColor(face_roi, cv2.COLOR_BGR2LAB)

    # Reshape image data for clustering
    pixels = lab.reshape((-1, 3))

    # Apply KMeans clustering to find 3 dominant skin tones
    num_clusters = 3
    kmeans = KMeans(n_clusters=num_clusters, n_init=10, random_state=42)
    kmeans.fit(pixels)

    # Get the top 3 most dominant colors
    dominant_colors = kmeans.cluster_centers_

    # Function to classify Fitzpatrick type based on L* values
    def classify_fitzpatrick(lab_colors):
        avg_L = np.mean([color[0] for color in lab_colors])  # Average L* value
        if avg_L > 190:
            return "Type 1 (Very Fair)"
        elif avg_L > 160:
            return "Type 2 (Fair)"
        elif avg_L > 130:
            return "Type 3 (Medium)"
        elif avg_L > 100:
            return "Type 4 (Olive)"
        elif avg_L > 75:
            return "Type 5 (Brown)"
        else:
            return "Type 6 (Dark Brown/Black)"

    # Classify skin tone based on the average of dominant colors
    fitzpatrick_type = classify_fitzpatrick(dominant_colors)

    return {
        "dominant_colors": dominant_colors.tolist(),
        "fitzpatrick_type": fitzpatrick_type
    }

@app.route("/upload", methods=["POST"])
def upload_image():
    """Receives image from frontend and processes it."""
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    image_bytes = image_file.read()

    result = extract_skin_tone(image_bytes)

    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
