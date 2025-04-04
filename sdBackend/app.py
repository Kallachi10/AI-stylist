import random
import sys
import torch
from flask import Flask, request, send_file, jsonify
from diffusers import DiffusionPipeline, TCDScheduler
from huggingface_hub import hf_hub_download
import io
from PIL import Image

app = Flask(__name__)

# Configuration
num_inference_steps = 12
base_model_id = "stabilityai/stable-diffusion-xl-base-1.0"
repo_name = "ByteDance/Hyper-SD"
ckpt_name = f"Hyper-SDXL-{num_inference_steps}step{'s' if num_inference_steps > 1 else ''}-CFG-lora.safetensors"
device = "cuda"  # Or "cpu" if no GPU is available

# Load the model and weights
pipe = DiffusionPipeline.from_pretrained(base_model_id, torch_dtype=torch.float16, variant="fp16").to(device)
pipe.load_lora_weights(hf_hub_download(repo_name, ckpt_name))
pipe.fuse_lora()
pipe.scheduler = TCDScheduler.from_config(pipe.scheduler.config)

@app.route('/')
def index():
    return "Stable Diffusion API is running!"

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "")
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        seed = random.randint(0, sys.maxsize)
        
        # Define the guidance scale and eta
        guidance_scale = 5.0
        eta = 0.5
        
        # Generate the image
        images = pipe(
            prompt=prompt,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            eta=eta,
            generator=torch.Generator(device).manual_seed(seed),
        ).images

        # Print for debugging purposes
        print(f"Prompt:\t{prompt}\nSeed:\t{seed}")

        # Convert the generated image to a format that can be sent via Flask
        img_io = io.BytesIO()
        images[0].save(img_io, 'PNG')
        img_io.seek(0)

        return send_file(img_io, mimetype='image/png')
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
