from flask import Flask, render_template, request, jsonify, send_file, url_for
import os
import uuid
import google.generativeai as genai
from transformers import AutoProcessor, MusicgenForConditionalGeneration
import scipy
import torch
import threading
import time

app = Flask(__name__)

# Configure Gemini
genai.configure(api_key="AIzaSyBPnhXENzwNskIEVXGjB4H9dC9uC87eo_w")
gemini_model = genai.GenerativeModel("gemini-1.5-flash")

# Global variables for model loading
processor = None
model = None
device = None

def load_models():
    """Load MusicGen models in a separate thread to avoid blocking"""
    global processor, model, device
    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading models on device: {device}")
        
        processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
        model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small").to(device)
        
        print("Models loaded successfully!")
    except Exception as e:
        print(f"Error loading models: {e}")

# Start loading models in background
threading.Thread(target=load_models, daemon=True).start()

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        user_input = data.get("prompt", "")
        
        if not user_input:
            return jsonify({"error": "No prompt provided"}), 400
        
        # Wait for models to load
        while processor is None or model is None:
            time.sleep(0.1)
        
        # Step 1: Enhance using Gemini
        gemini_prompt = f"""
        Classify the following text into music genre, mood, and tempo. Give tempo in both words and BPM.

        Text: "{user_input}"

        Output format:
        Genre: <genre>
        Mood: <mood>
        Tempo: <tempo word> (<bpm> BPM)
        """

        response = gemini_model.generate_content(gemini_prompt)
        classification = response.text.strip()
        
        # Step 2: Convert Gemini output into MusicGen-style prompt
        musicgen_prompt = f"{user_input}, {classification.lower()}. Professional cinematic feel."
        
        # Step 3: Generate music using MusicGen
        inputs = processor(
            text=[musicgen_prompt],
            padding=True,
            return_tensors="pt",
        ).to(device)

        audio_values = model.generate(**inputs, max_new_tokens=1024)
        
        # Generate unique filename
        filename = f"generated_{uuid.uuid4().hex[:8]}.wav"
        filepath = os.path.join("static", "generated", filename)
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Save audio
        sampling_rate = model.config.audio_encoder.sampling_rate
        scipy.io.wavfile.write(filepath, rate=sampling_rate, data=audio_values[0, 0].cpu().numpy())
        
        return jsonify({
            "success": True,
            "filename": filename,
            "audio_url": url_for('static', filename=f'generated/{filename}'),
            "download_url": url_for('download_audio', filename=filename),
            "message": "Music generated successfully!"
        })
        
    except Exception as e:
        print(f"Error generating music: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/download/<filename>")
def download_audio(filename):
    """Download the generated audio file"""
    try:
        filepath = os.path.join("static", "generated", filename)
        if os.path.exists(filepath):
            return send_file(filepath, as_attachment=True, download_name=filename)
        else:
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/audio/<filename>")
def serve_audio(filename):
    """Serve audio files for playback"""
    try:
        filepath = os.path.join("static", "generated", filename)
        if os.path.exists(filepath):
            return send_file(filepath, mimetype='audio/wav')
        else:
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)