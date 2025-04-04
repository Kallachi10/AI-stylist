import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Get API key from Render environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Ensure the API key is set
if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY is not set! Add it in Render's environment variables.")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

@app.route('/get_outfit', methods=['GET','POST'])
def get_outfit():
    data = request.json
    skin_type = data.get("skin_type")
    gender = data.get("gender", "unspecified")  # ✔️ safely get gender

    if not skin_type:
        return jsonify({"error": "❌ Skin type is required"}), 400

    try:
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        prompt = f"""
User has Fitzpatrick skin type {skin_type} and gender is {gender}. 
Suggest three outfit styles with appropriate colors based on color theory:

1️⃣ **Casual** – Everyday comfortable wear.
2️⃣ **Eccentric** – Unique and bold fashion.
3️⃣ **Kerala Traditional** – Ethnic attire.

Return the response in **strict JSON format** like this:

{{
    "casual": {{
        "outfit": "Describe the casual outfit here",
        "colors": ["Color1", "Color2", "Color3"],
        "prompt_info": "Clothing type: (type), color: (color)"
    }},
    "eccentric": {{
        "outfit": "Describe the eccentric outfit here",
        "colors": ["Color1", "Color2", "Color3"],
        "prompt_info": "Clothing type: (type), color: (color)"
    }},
    "kerala_traditional": {{
        "outfit": "Describe the Kerala traditional outfit here",
        "colors": ["Color1", "Color2", "Color3"],
        "prompt_info": "Clothing type: (type), color: (color)"
    }}
}}

Do not add extra text—return **only** the JSON object.
"""




        response = model.generate_content(prompt)
        return jsonify({"recommendations": response.text})

    except Exception as e:
        return jsonify({"error": f"❌ Gemini API Error: {str(e)}"}), 500


@app.route('/')
def home():
    return "✅ Gemini Outfit Recommender is running!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  # Use `debug=False` in production
