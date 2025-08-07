from flask import Flask, render_template, request, jsonify, send_file, url_for
import os
import uuid
import google.generativeai as genai
from transformers import AutoProcessor, MusicgenForConditionalGeneration
import scipy
import torch
import threading
import time
import numpy as np
import librosa

app = Flask(__name__)

# Configure Gemini
genai.configure(api_key="")
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

def calculate_tokens_for_duration(duration_seconds):
    """Calculate tokens needed for desired duration"""
    # Base calculation: 256 tokens ≈ 5 seconds, 512 tokens ≈ 10 seconds
    # Linear interpolation: tokens = (duration / 5) * 256
    tokens = int((duration_seconds / 5) * 256)
    return min(max(tokens, 256), 3072)  # Min 256, max 3072 tokens

def harmonize_audio(audio_data, duration_seconds):
    """Add harmonic elements to the audio"""
    try:
        # Convert to numpy array if needed
        if isinstance(audio_data, torch.Tensor):
            audio_np = audio_data.cpu().numpy()
        else:
            audio_np = audio_data
            
        # Ensure stereo
        if len(audio_np.shape) == 1:
            audio_np = np.expand_dims(audio_np, axis=0)
        
        # Add harmonic enhancement using librosa
        # Pitch shift slightly to create harmony
        y_harmonic = librosa.effects.harmonic(audio_np[0], margin=8)
        
        # Add some reverb for depth
        y_reverb = librosa.effects.preemphasis(y_harmonic, coef=0.95)
        
        # Mix original with harmonic
        enhanced = 0.7 * audio_np[0] + 0.3 * y_harmonic
        
        return enhanced
        
    except Exception as e:
        print(f"Error in harmonization: {e}")
        return audio_data

def reharmonize_audio(audio_data, duration_seconds):
    """Completely reharmonize the audio with new chord progressions"""
    try:
        # Convert to numpy array if needed
        if isinstance(audio_data, torch.Tensor):
            audio_np = audio_data.cpu().numpy()
        else:
            audio_np = audio_data
            
        # Ensure stereo
        if len(audio_np.shape) == 1:    
            audio_np = np.expand_dims(audio_np, axis=0)
        
        # Extract pitch and create new harmonic structure
        y = audio_np[0]
        
        # Pitch shift to create new harmonic relationships
        y_shifted = librosa.effects.pitch_shift(y, sr=model.config.audio_encoder.sampling_rate, n_steps=2)
        
        # Add harmonic enhancement with different parameters
        y_harmonic = librosa.effects.harmonic(y_shifted, margin=12)
        
        # Create a more complex harmonic structure
        y_enhanced = 0.6 * y + 0.4 * y_harmonic
        
        return y_enhanced
        
    except Exception as e:
        print(f"Error in reharmonization: {e}")
        return audio_data

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        user_input = data.get("prompt", "")
        duration_seconds = int(data.get("duration", 10))
        
        if not user_input:
            return jsonify({"error": "No prompt provided"}), 400
        
        # Wait for models to load
        while processor is None or model is None:
            time.sleep(0.1)
        
        # Calculate tokens based on duration
        max_new_tokens = calculate_tokens_for_duration(duration_seconds)
        
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
        
        # Parse the classification to extract individual components
        classification_lines = classification.split('\n')
        genre = "Unknown"
        mood = "Unknown"
        tempo = "Unknown"
        
        for line in classification_lines:
            line = line.strip()
            if line.startswith("Genre:"):
                genre = line.replace("Genre:", "").strip()
            elif line.startswith("Mood:"):
                mood = line.replace("Mood:", "").strip()
            elif line.startswith("Tempo:"):
                tempo = line.replace("Tempo:", "").strip()
        
        # Step 2: Convert Gemini output into MusicGen-style prompt
        musicgen_prompt = f"{user_input}, {classification.lower()}. Professional cinematic feel."
        
        # Step 3: Generate music using MusicGen
        inputs = processor(
            text=[musicgen_prompt],
            padding=True,
            return_tensors="pt",
        ).to(device)

        audio_values = model.generate(**inputs, max_new_tokens=max_new_tokens)
        
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
            "message": "Music generated successfully!",
            "duration": duration_seconds,
            "classification": {
                "genre": genre,
                "mood": mood,
                "tempo": tempo,
                "full_classification": classification
            }
        })
        
    except Exception as e:
        print(f"Error generating music: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/harmonize", methods=["POST"])
def harmonize():
    try:
        data = request.get_json()
        filename = data.get("filename", "")
        duration_seconds = int(data.get("duration", 10))
        
        if not filename:
            return jsonify({"error": "No filename provided"}), 400
        
        # Load the existing audio file
        filepath = os.path.join("static", "generated", filename)
        if not os.path.exists(filepath):
            return jsonify({"error": "Audio file not found"}), 404
        
        # Load audio using librosa
        y, sr = librosa.load(filepath, sr=None)
        
        # Apply harmonization
        harmonized_audio = harmonize_audio(y, duration_seconds)
        
        # Generate new filename for harmonized version
        harmonized_filename = f"harmonized_{uuid.uuid4().hex[:8]}.wav"
        harmonized_filepath = os.path.join("static", "generated", harmonized_filename)
        
        # Save harmonized audio
        scipy.io.wavfile.write(harmonized_filepath, rate=sr, data=(np.clip(harmonized_audio, -1, 1) * 32767).astype(np.int16))
        
        return jsonify({
            "success": True,
            "filename": harmonized_filename,
            "audio_url": url_for('static', filename=f'generated/{harmonized_filename}'),
            "download_url": url_for('download_audio', filename=harmonized_filename),
            "message": "Music harmonized successfully!",
            "duration": duration_seconds
        })
        
    except Exception as e:
        print(f"Error harmonizing music: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/reharmonize", methods=["POST"])
def reharmonize():
    try:
        data = request.get_json()
        filename = data.get("filename", "")
        duration_seconds = int(data.get("duration", 10))
        
        if not filename:
            return jsonify({"error": "No filename provided"}), 400
        
        # Load the existing audio file
        filepath = os.path.join("static", "generated", filename)
        if not os.path.exists(filepath):
            return jsonify({"error": "Audio file not found"}), 404
        
        # Load audio using librosa
        y, sr = librosa.load(filepath, sr=None)
        
        # Apply reharmonization
        reharmonized_audio = reharmonize_audio(y, duration_seconds)
        
        # Generate new filename for reharmonized version
        reharmonized_filename = f"reharmonized_{uuid.uuid4().hex[:8]}.wav"
        reharmonized_filepath = os.path.join("static", "generated", reharmonized_filename)
        
        # Save reharmonized audio
        scipy.io.wavfile.write(reharmonized_filepath, rate=sr, data=(np.clip(reharmonized_audio, -1, 1) * 32767).astype(np.int16))
        
        return jsonify({
            "success": True,
            "filename": reharmonized_filename,
            "audio_url": url_for('static', filename=f'generated/{reharmonized_filename}'),
            "download_url": url_for('download_audio', filename=reharmonized_filename),
            "message": "Music reharmonized successfully!",
            "duration": duration_seconds
        })
        
    except Exception as e:
        print(f"Error reharmonizing music: {e}")
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
