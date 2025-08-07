import google.generativeai as genai
from transformers import AutoProcessor, MusicgenForConditionalGeneration
import scipy
import torch

# Load Gemini
genai.configure(api_key="AIzaSyBPnhXENzwNskIEVXGjB4H9dC9uC87eo_w")
gemini_model = genai.GenerativeModel("gemini-1.5-flash")

# User input
user_input = "I want something emotional and epic"

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
print("Gemini Classification:\n", classification)

# Step 2: Convert Gemini output into MusicGen-style prompt
# You can optionally parse the Gemini response and build a rich prompt
musicgen_prompt = f"{user_input}, {classification.lower()}. Professional cinematic feel."

# Step 3: Generate music using MusicGen
device = "cuda" if torch.cuda.is_available() else "cpu"

processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small").to(device)

inputs = processor(
    text=[musicgen_prompt],
    padding=True,
    return_tensors="pt",
).to(device)

audio_values = model.generate(**inputs, max_new_tokens=1024)

sampling_rate = model.config.audio_encoder.sampling_rate
scipy.io.wavfile.write("output.wav", rate=sampling_rate, data=audio_values[0, 0].cpu().numpy())

print("Music generated and saved to output.wav")
