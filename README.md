# MuseGen - AI Music Generation Web App

A web application that generates music using AI models. The app combines Google's Gemini AI for prompt enhancement and Facebook's MusicGen for actual music generation.

## Features

- 🎵 **AI Music Generation**: Generate music from text descriptions
- 🎧 **Audio Player**: Built-in audio player with play/pause controls
- 📥 **Download**: Download generated music as WAV files
- 🎨 **Modern UI**: Beautiful, responsive interface with animations
- 📚 **History**: Track your generation history
- ⚡ **Real-time**: Instant feedback and status updates

## Setup

### Prerequisites

- Python 3.8 or higher
- CUDA-compatible GPU (optional, for faster generation)

### Installation

1. **Clone or download the project files**

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up your Google AI API key**:
   - Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Replace the API key in `app.py` line 12:
     ```python
     genai.configure(api_key="YOUR_API_KEY_HERE")
     ```

## Usage

1. **Start the application**:
   ```bash
   python app.py
   ```

2. **Open your browser** and go to `http://localhost:5000`

3. **Generate music**:
   - Enter a description of the music you want (e.g., "upbeat jazz, happy, fast tempo")
   - Use the preset buttons for quick suggestions
   - Click "Generate Music"

4. **Listen and download**:
   - Use the built-in audio player to listen to your generated music
   - Click "Download WAV" to save the file to your computer

## How it Works

1. **Prompt Enhancement**: Your text description is enhanced using Google's Gemini AI to classify genre, mood, and tempo
2. **Music Generation**: The enhanced prompt is used by Facebook's MusicGen model to generate actual audio
3. **Audio Processing**: The generated audio is saved as a WAV file and served through the web interface

## File Structure

```
Music Generation/
├── app.py                 # Main Flask application
├── main.py               # Original standalone script
├── requirements.txt      # Python dependencies
├── README.md            # This file
├── static/
│   ├── css/
│   │   └── style.css    # Custom styles
│   ├── js/
│   │   └── script.js    # Frontend JavaScript
│   └── generated/       # Generated audio files
└── templates/
    └── index.html       # Main web interface
```

## Tips for Better Results

- **Be specific**: Instead of "happy music", try "upbeat jazz with piano and drums, energetic, 120 BPM"
- **Include genre**: Mention specific genres like "rock", "jazz", "classical", "electronic"
- **Describe mood**: Use words like "melancholic", "energetic", "peaceful", "dramatic"
- **Mention instruments**: Include instruments like "piano", "guitar", "strings", "drums"

## Troubleshooting

- **Slow generation**: Music generation can take 30-60 seconds. This is normal for AI models
- **GPU not detected**: The app will use CPU if CUDA is not available, which is slower but still works
- **API errors**: Make sure your Google AI API key is valid and has sufficient quota
- **Audio not playing**: Check that your browser supports WAV playback

## Technical Details

- **Backend**: Flask web framework
- **AI Models**: 
  - Google Gemini 1.5 Flash for prompt enhancement
  - Facebook MusicGen Small for music generation
- **Frontend**: HTML5, CSS3, JavaScript with Tailwind CSS
- **Audio Format**: WAV files (44.1kHz, 16-bit)

## License

This project is for educational and personal use. Please respect the terms of service for the AI models used.

## Credits

- Music generation powered by [Facebook MusicGen](https://github.com/facebookresearch/audiocraft)
- Prompt enhancement powered by [Google Gemini](https://ai.google.dev/)
- UI design inspired by modern web applications
