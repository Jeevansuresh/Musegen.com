# 🎵 MuseGen - AI Music Generation Web App

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A powerful web application that generates music using AI models. The app combines Ollama for prompt enhancement and Facebook's MusicGen for actual music generation, creating a seamless experience for AI-powered music creation.

## ✨ Features

- 🎵 **AI Music Generation**: Generate music from text descriptions
- ⏱️ **Duration Control**: Slider to choose audio length (5-60 seconds)
- 🎼 **Harmonization**: Add harmonic elements to existing music
- 🔄 **Reharmonization**: Completely reharmonize with new chord progressions
- 📊 **Waveform Visualization**: Visual representation of generated audio
- 🎧 **Audio Player**: Built-in audio player with play/pause controls
- 📥 **Download**: Download generated music as WAV files
- 🎨 **Modern UI**: Beautiful, responsive interface with animations
- 📚 **History**: Track your generation history
- ⚡ **Real-time**: Instant feedback and status updates

## 🚀 Quick Start

### Prerequisites

- **Python 3.8 or higher**
- **CUDA-compatible GPU** (optional, for faster generation)
- **Ollama** (local AI model runner - [Download here](https://ollama.ai/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd "Music Generation"
   ```

2. **Create a virtual environment**:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Install and configure Ollama**:
   - Download and install Ollama from [ollama.ai](https://ollama.ai/)
   - Pull the Mistral model:
     ```bash
     ollama pull mistral
     ```
   - Ensure Ollama is running on your system

5. **Run the application**:
   ```bash
   python app.py
   ```

6. **Open your browser** and navigate to `http://localhost:5000`

## 🎯 Demo

1. **Enter a music description** (e.g., "upbeat jazz with piano and drums, energetic, 120 BPM")
2. **Adjust the duration slider** (5-60 seconds)
3. **Click "Generate Music"** and wait for processing
4. **Listen to your creation** using the built-in audio player
5. **Enhance with harmonization** or reharmonization features
6. **Download your music** as a WAV file

## 🎼 New Features

### Duration Control
- **Slider Range**: 5-60 seconds
- **Token Calculation**: Automatically calculates the right number of tokens for desired duration
- **Real-time Preview**: See the selected duration as you adjust the slider

### Harmonization
- **Harmonize Button**: Adds harmonic elements to existing music using audio processing
- **Enhanced Harmonics**: Uses librosa for pitch shifting and harmonic enhancement
- **Preserves Original**: Maintains the original melody while adding harmonic depth

### Reharmonization
- **Reharmonize Button**: Completely reharmonizes the music with new chord progressions
- **Pitch Shifting**: Creates new harmonic relationships through pitch manipulation
- **Complex Harmonics**: Builds more complex harmonic structures

### Waveform Visualization
- **Real-time Display**: Shows waveform of generated audio
- **Interactive Canvas**: Responsive canvas that adapts to audio content
- **Visual Feedback**: Helps understand the audio structure and dynamics

## 🔧 How it Works

1. **Prompt Enhancement**: Your text description is enhanced using Ollama to classify genre, mood, and tempo
2. **Duration Calculation**: The duration slider determines the number of tokens for MusicGen generation
3. **Music Generation**: The enhanced prompt is used by Facebook's MusicGen model to generate actual audio
4. **Audio Processing**: The generated audio is saved as a WAV file and served through the web interface
5. **Harmonization**: Additional audio processing using librosa for harmonic enhancement
6. **Visualization**: Web Audio API is used to create waveform visualizations

## 📁 Project Structure

```
Music Generation/
├── app.py                 # Main Flask application
├── main.py               # Original standalone script
├── requirements.txt      # Python dependencies
├── README.md            # This file
├── .gitignore           # Git ignore file
├── static/
│   ├── css/
│   │   └── style.css    # Custom styles
│   ├── js/
│   │   └── script.js    # Frontend JavaScript
│   └── generated/       # Generated audio files
├── templates/
│   └── index.html       # Main web interface
└── venv39/              # Virtual environment (if using)
```
<img width="1918" height="977" alt="image" src="https://github.com/user-attachments/assets/d522f577-0f21-4989-af5a-f2ae7816a276" />
<img width="1918" height="981" alt="image" src="https://github.com/user-attachments/assets/5ab429f7-cece-45fe-906b-b330ff34a659" />
<img width="1918" height="992" alt="image" src="https://github.com/user-attachments/assets/5d229f06-a728-4c81-a231-cbcb0a07f05a" />


## 💡 Tips for Better Results

- **Be specific**: Instead of "happy music", try "upbeat jazz with piano and drums, energetic, 120 BPM"
- **Include genre**: Mention specific genres like "rock", "jazz", "classical", "electronic"
- **Describe mood**: Use words like "melancholic", "energetic", "peaceful", "dramatic"
- **Mention instruments**: Include instruments like "piano", "guitar", "strings", "drums"
- **Choose duration wisely**: Longer durations (30-60s) work better for complex pieces, shorter (5-15s) for simple melodies
- **Experiment with harmonization**: Try both harmonize and reharmonize to see different effects

## 🔧 Troubleshooting

### Common Issues

**Slow generation**:
- Music generation can take 30-60 seconds. This is normal for AI models
- Consider using a GPU for faster processing

**GPU not detected**:
- The app will use CPU if CUDA is not available, which is slower but still works
- Install CUDA toolkit if you have a compatible GPU

**Ollama errors**:
- Make sure Ollama is installed and running on your system
- Check that you have pulled the Mistral model: `ollama list`
- Verify Ollama is accessible at the default URL (http://localhost:11434)

**Audio not playing**:
- Check that your browser supports WAV playback
- Try refreshing the page or clearing browser cache

**Harmonization errors**:
- Ensure librosa is properly installed: `pip install librosa`
- Check that audio files are accessible and not corrupted

**Waveform not showing**:
- Check browser console for Web Audio API errors
- Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)

**Import errors**:
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Verify Python version is 3.8 or higher

## 🛠️ Technical Details

- **Backend**: Flask web framework
- **AI Models**: 
  - Ollama Mistral (local AI model) for prompt enhancement
  - Facebook MusicGen Small for music generation
- **Audio Processing**: librosa for harmonization and audio manipulation
- **Frontend**: HTML5, CSS3, JavaScript with Tailwind CSS
- **Audio Format**: WAV files (44.1kHz, 16-bit)
- **Visualization**: Web Audio API for waveform generation
- **Dependencies**: See `requirements.txt` for complete list

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- Music generation powered by [Facebook MusicGen](https://github.com/facebookresearch/audiocraft)
- Prompt enhancement powered by [Ollama Mistral](https://ollama.ai/) (local AI model)
- Audio processing powered by [librosa](https://librosa.org/)
- UI design inspired by modern web applications

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information about your problem

---

**Made with ❤️ for music lovers and AI enthusiasts**
