document.addEventListener('DOMContentLoaded', function() {
    // Animated music notes/particles background
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        window.addEventListener('resize', () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        });
        // Music note/particle data
        const notes = ['\u266B', '\u266A', '\u266C', '\u2669'];
        const noteIcons = ['🎵','🎶','🎼','🎷','🎸','🎧'];
        const particles = Array.from({length: 18}, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            speed: 0.3 + Math.random() * 0.5,
            drift: (Math.random() - 0.5) * 0.2,
            size: 22 + Math.random() * 16,
            icon: noteIcons[Math.floor(Math.random() * noteIcons.length)],
            alpha: 0.12 + Math.random() * 0.18
        }));
        function draw() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.font = `${p.size}px serif`;
                ctx.fillText(p.icon, p.x, p.y);
                ctx.restore();
                p.y += p.speed;
                p.x += p.drift;
                if (p.y > height + 40) {
                    p.y = -30;
                    p.x = Math.random() * width;
                }
                if (p.x < -40) p.x = width + 20;
                if (p.x > width + 40) p.x = -20;
            });
            requestAnimationFrame(draw);
        }
        draw();
    }
    
    // Audio player elements
    const audioPlayer = document.getElementById('audio-player');
    let currentAudio = null;
    const downloadBtn = document.getElementById('download-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const playText = document.getElementById('play-text');
    
    // Progress elements
    const progressBar = document.getElementById('audio-progress');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration-time');
    
    // New elements
    const durationSlider = document.getElementById('duration-slider');
    const durationValue = document.getElementById('duration-value');
    const harmonizeBtn = document.getElementById('harmonize-btn');
    const reharmonizeBtn = document.getElementById('reharmonize-btn');
    const waveformContainer = document.getElementById('waveform-container');
    const waveformCanvas = document.getElementById('waveform-canvas');
    
    // Classification display elements
    const classificationDisplay = document.getElementById('classification-display');
    const genreDisplay = document.getElementById('genre-display');
    const moodDisplay = document.getElementById('mood-display');
    const tempoDisplay = document.getElementById('tempo-display');
    
    // New elements from Archive-2
    const randomizePrompt = document.getElementById('randomize-prompt');
    const themeToggle = document.getElementById('theme-toggle');
    const favoritesToggle = document.getElementById('favorites-toggle');
    const favoritesPanel = document.getElementById('favorites-panel');
    const closeFavorites = document.getElementById('close-favorites');
    const favoritesList = document.getElementById('favorites-list');
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Form elements
    const form = document.getElementById('music-form');
    const mainContainer = document.getElementById('main-container');
    const statusArea = document.getElementById('status-area');
    const historyPanel = document.getElementById('history-panel');
    const toggleHistoryBtn = document.getElementById('toggle-history');
    const closeHistoryBtn = document.getElementById('close-history');
    const historyList = document.getElementById('history-list');
    const spinner = document.getElementById('spinner');
    let history = [];
    let currentAudioData = null;
    let audioContext = null;
    let analyser = null;
    let source = null;
    let animationId = null;

    // Duration slider functionality
    if (durationSlider && durationValue) {
        durationSlider.addEventListener('input', function() {
            durationValue.textContent = this.value;
        });
    }

    // Time formatting function
    function formatTime(time) {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Update UI based on audio state
    function updatePlayPauseUI() {
        if (!currentAudio) return;
        
        if (currentAudio.paused) {
            // Audio is paused, show play button
            if (playIcon) playIcon.classList.remove('hidden');
            if (pauseIcon) pauseIcon.classList.add('hidden');
            if (playText) playText.textContent = 'Play';
            stopLiveWaveform();
        } else {
            // Audio is playing, show pause button
            if (playIcon) playIcon.classList.add('hidden');
            if (pauseIcon) pauseIcon.classList.remove('hidden');
            if (playText) playText.textContent = 'Pause';
            startLiveWaveform();
        }
    }

    // Real-time waveform visualization
    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
        }
    }

    function setupAudioContextForElement(audioElement) {
        if (!audioElement) return false;
        
        initAudioContext();
        
        // Disconnect existing source if it exists
        if (source) {
            try {
                source.disconnect();
            } catch (e) {
                console.log('Source already disconnected');
            }
            source = null;
        }
        
        // Create new MediaElementSource only if not already created
        try {
            if (!audioElement._audioContextSource) {
                source = audioContext.createMediaElementSource(audioElement);
                audioElement._audioContextSource = source;
            } else {
                source = audioElement._audioContextSource;
            }
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            return true;
        } catch (error) {
            console.warn('Could not create MediaElementSource:', error);
            return false;
        }
    }

    function startLiveWaveform() {
        if (!currentAudio || !setupAudioContextForElement(currentAudio)) {
            return;
        }
        drawLiveWaveform();
    }

    function drawLiveWaveform() {
        if (!analyser || !waveformCanvas || !currentAudio || currentAudio.paused) {
            return;
        }

        const canvas = waveformCanvas;
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions if changed
        if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        
        const width = canvas.width;
        const height = canvas.height;
        
        // Get frequency data
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(1, '#1e40af');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw frequency bars
        const barWidth = (width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] / 255) * height;
            
            // Create gradient for bars
            const barGradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
            barGradient.addColorStop(0, '#60a5fa');
            barGradient.addColorStop(0.5, '#3b82f6');
            barGradient.addColorStop(1, '#1d4ed8');
            
            ctx.fillStyle = barGradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
        
        // Continue animation
        animationId = requestAnimationFrame(drawLiveWaveform);
    }

    function stopLiveWaveform() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        // Draw idle state
        if (waveformCanvas) {
            const canvas = waveformCanvas;
            const ctx = canvas.getContext('2d');
            
            if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }
            
            // Draw idle background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#1e3a8a');
            gradient.addColorStop(1, '#1e40af');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw idle message
            ctx.fillStyle = '#60a5fa';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Click Play to see live waveform', canvas.width / 2, canvas.height / 2);
        }
    }

    // History panel functionality
    if (toggleHistoryBtn) {
        toggleHistoryBtn.addEventListener('click', () => {
            if (historyPanel && (historyPanel.style.display === 'none' || !historyPanel.style.display)) {
                historyPanel.style.display = 'block';
                setTimeout(() => {
                    historyPanel.style.transform = 'translateX(0)';
                }, 10);
            } else if (historyPanel) {
                historyPanel.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    historyPanel.style.display = 'none';
                }, 400);
            }
        });
    }
    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', () => {
            if (historyPanel) {
                historyPanel.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    historyPanel.style.display = 'none';
                }, 400);
            }
        });
    }

    function updateHistory(prompt, status) {
        history.unshift({ prompt, status });
        renderHistory();
    }
    
    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'flex flex-col gap-0.5 mb-2 p-2 rounded bg-blue-950 bg-opacity-60';
            div.innerHTML = `<span class="font-semibold text-blue-300">${escapeHtml(item.prompt)}</span><span class="text-blue-200 text-xs">${escapeHtml(item.status)}</span>`;
            historyList.appendChild(div);
        });
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Audio player functionality
    function showAudioPlayer(audioData) {
        currentAudioData = audioData;
        
        // Clean up existing audio completely
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            currentAudio.removeEventListener('timeupdate', handleTimeUpdate);
            currentAudio.removeEventListener('play', updatePlayPauseUI);
            currentAudio.removeEventListener('pause', updatePlayPauseUI);
            currentAudio.removeEventListener('ended', updatePlayPauseUI);
            if (currentAudio.parentNode) {
                currentAudio.parentNode.removeChild(currentAudio);
            }
            currentAudio = null;
        }

        // Disconnect audio context source
        if (source) {
            try {
                source.disconnect();
            } catch (e) {}
            source = null;
        }
        
        // Create new audio element
        currentAudio = document.createElement('audio');
        currentAudio.preload = 'metadata';
        currentAudio.src = audioData.audio_url;
        
        // Add event listeners for progress and state
        currentAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
        currentAudio.addEventListener('timeupdate', handleTimeUpdate);
        currentAudio.addEventListener('play', updatePlayPauseUI);
        currentAudio.addEventListener('pause', updatePlayPauseUI);
        currentAudio.addEventListener('ended', updatePlayPauseUI);
        
        // Insert into DOM (hidden)
        currentAudio.style.display = 'none';
        document.body.appendChild(currentAudio);
        
        // Setup download button
        if (downloadBtn && audioData.download_url) {
            downloadBtn.onclick = () => {
                window.open(audioData.download_url, '_blank');
            };
        }
        
        // Display classification information if available
        if (audioData.classification && classificationDisplay) {
            const classification = audioData.classification;
            
            // Show the classification display
            classificationDisplay.classList.remove('hidden');
            
            // Update the classification values
            if (genreDisplay) {
                genreDisplay.textContent = classification.genre || 'Unknown';
            }
            if (moodDisplay) {
                moodDisplay.textContent = classification.mood || 'Unknown';
            }
            if (tempoDisplay) {
                tempoDisplay.textContent = classification.tempo || 'Unknown';
            }
        } else if (classificationDisplay) {
            // Hide classification display if no data
            classificationDisplay.classList.add('hidden');
        }
        
        // Show UI elements
        if (audioPlayer) {
            audioPlayer.classList.remove('hidden');
            audioPlayer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        if (waveformContainer) {
            waveformContainer.classList.remove('hidden');
        }
        
        // Initial UI update
        updatePlayPauseUI();
        stopLiveWaveform();
    }

    // Event handlers
    function handleLoadedMetadata() {
        if (!currentAudio || !progressBar || !durationDisplay) return;
        
        const duration = currentAudio.duration || 0;
        progressBar.max = duration;
        durationDisplay.textContent = formatTime(duration);
    }

    function handleTimeUpdate() {
        if (!currentAudio || !progressBar || !currentTimeDisplay) return;
        
        const currentTime = currentAudio.currentTime || 0;
        progressBar.value = currentTime;
        currentTimeDisplay.textContent = formatTime(currentTime);
    }

    function hideAudioPlayer() {
        // Clean up audio
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            currentAudio.removeEventListener('timeupdate', handleTimeUpdate);
            currentAudio.removeEventListener('play', updatePlayPauseUI);
            currentAudio.removeEventListener('pause', updatePlayPauseUI);
            currentAudio.removeEventListener('ended', updatePlayPauseUI);
            if (currentAudio.parentNode) {
                currentAudio.parentNode.removeChild(currentAudio);
            }
            currentAudio = null;
        }

        // Disconnect audio context
        if (source) {
            try {
                source.disconnect();
            } catch (e) {}
            source = null;
        }
        
        if (audioPlayer) audioPlayer.classList.add('hidden');
        if (waveformContainer) waveformContainer.classList.add('hidden');
        if (classificationDisplay) classificationDisplay.classList.add('hidden');
        currentAudioData = null;
        stopLiveWaveform();
    }

    // Progress bar seeking
    if (progressBar) {
        progressBar.addEventListener('input', () => {
            if (currentAudio && !isNaN(currentAudio.duration)) {
                currentAudio.currentTime = progressBar.value;
            }
        });
    }

    // Play/Pause button functionality - FIXED VERSION
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', async () => {
            if (!currentAudio) {
                console.log('No audio element found');
                return;
            }
            
            try {
                if (currentAudio.paused) {
                    console.log('Playing audio...');
                    // Resume AudioContext if suspended
                    if (audioContext && audioContext.state === 'suspended') {
                        await audioContext.resume();
                    }
                    await currentAudio.play();
                } else {
                    console.log('Pausing audio...');
                    currentAudio.pause();
                }
            } catch (error) {
                console.error('Error playing/pausing audio:', error);
                updatePlayPauseUI(); // Reset UI on error
            }
        });
    }

    // Harmonize functionality
    if (harmonizeBtn) {
        harmonizeBtn.addEventListener('click', async function() {
            if (!currentAudioData) return;
            
            this.disabled = true;
            this.classList.add('opacity-60', 'cursor-not-allowed');
            
            try {
                if (statusArea) statusArea.textContent = 'Harmonizing music...';
                
                const response = await fetch('/harmonize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        filename: currentAudioData.filename,
                        duration: durationSlider ? parseInt(durationSlider.value) : 30
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    if (statusArea) statusArea.textContent = 'Music harmonized successfully!';
                    showAudioPlayer(data);
                } else {
                    if (statusArea) statusArea.textContent = `Error: ${data.error}`;
                }
            } catch (error) {
                console.error('Error:', error);
                if (statusArea) statusArea.textContent = 'Error harmonizing music. Please try again.';
            } finally {
                this.disabled = false;
                this.classList.remove('opacity-60', 'cursor-not-allowed');
            }
        });
    }

    // Reharmonize functionality
    if (reharmonizeBtn) {
        reharmonizeBtn.addEventListener('click', async function() {
            if (!currentAudioData) return;
            
            this.disabled = true;
            this.classList.add('opacity-60', 'cursor-not-allowed');
            
            try {
                if (statusArea) statusArea.textContent = 'Reharmonizing music...';
                
                const response = await fetch('/reharmonize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        filename: currentAudioData.filename,
                        duration: durationSlider ? parseInt(durationSlider.value) : 30
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    if (statusArea) statusArea.textContent = 'Music reharmonized successfully!';
                    showAudioPlayer(data);
                } else {
                    if (statusArea) statusArea.textContent = `Error: ${data.error}`;
                }
            } catch (error) {
                console.error('Error:', error);
                if (statusArea) statusArea.textContent = 'Error reharmonizing music. Please try again.';
            } finally {
                this.disabled = false;
                this.classList.remove('opacity-60', 'cursor-not-allowed');
            }
        });
    }

    // Form submission
    if (form) {
        const input = document.getElementById('prompt');
        const button = form.querySelector('button[type="submit"]');
        
        // Preset suggestion buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (input) {
                    input.value = btn.getAttribute('data-suggestion') || '';
                    input.focus();
                    input.classList.add('ring', 'ring-blue-400', 'scale-105');
                    setTimeout(() => {
                        input.classList.remove('scale-105');
                    }, 150);
                }
            });
        });
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!input || !button) return;
            
            button.disabled = true;
            button.classList.add('opacity-60', 'cursor-not-allowed');
            if (spinner) spinner.classList.remove('hidden');
            
            hideAudioPlayer();
            
            if (statusArea) {
                statusArea.classList.remove('fade-in');
                statusArea.classList.add('fade-out');
            }
            
            setTimeout(async () => {
                if (statusArea) {
                    statusArea.textContent = 'Generating music... This may take a moment.';
                    statusArea.classList.remove('fade-out');
                    statusArea.classList.add('fade-in');
                }
                updateHistory(input.value, 'Generating...');
                
                try {
                    const response = await fetch('/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            prompt: input.value,
                            duration: durationSlider ? parseInt(durationSlider.value) : 30
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        if (statusArea) statusArea.textContent = 'Music generated successfully!';
                        updateHistory(input.value, 'Generated successfully');
                        showAudioPlayer(data);
                    } else {
                        if (statusArea) statusArea.textContent = `Error: ${data.error || 'Unknown error'}`;
                        updateHistory(input.value, 'Failed');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    if (statusArea) statusArea.textContent = 'Error generating music. Please try again.';
                    updateHistory(input.value, 'Failed');
                }
                
                input.value = '';
                button.disabled = false;
                button.classList.remove('opacity-60', 'cursor-not-allowed');
                if (spinner) spinner.classList.add('hidden');
            }, 400);
        });
        
        // Input animations
        if (input) {
            input.addEventListener('focus', () => {
                input.classList.add('ring', 'ring-blue-400');
            });
            input.addEventListener('blur', () => {
                input.classList.remove('ring', 'ring-blue-400');
            });
        }
        
        if (button) {
            button.addEventListener('mousedown', () => {
                button.classList.add('scale-95');
            });
            button.addEventListener('mouseup', () => {
                button.classList.remove('scale-95');
            });
            button.addEventListener('mouseleave', () => {
                button.classList.remove('scale-95');
            });
        }
    }
    
    // Navigation functionality
    function showSection(sectionId) {
        // Hide all sections
        contentSections.forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionId + '-section');
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
        
        // Update nav item states
        navItems.forEach(item => {
            item.classList.remove('active', 'text-blue-400');
            item.classList.add('text-blue-200');
        });
        
        // Activate clicked nav item
        const activeNavItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active', 'text-blue-400');
            activeNavItem.classList.remove('text-blue-200');
        }
    }
    
    // Add click handlers to nav items
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
    
    // Show dashboard by default
    showSection('dashboard');
    
    // Randomize prompt functionality
    if (randomizePrompt) {
        const randomPrompts = [
            "Jazz, moody, slow",
            "Rock, energetic, fast",
            "Lo-fi, chill, slow",
            "Disco, fun, medium",
            "Classical, dramatic, moderate",
            "Electronic, upbeat, fast",
            "Blues, melancholic, slow",
            "Pop, happy, medium",
            "Ambient, peaceful, slow",
            "Funk, groovy, medium"
        ];
        
        randomizePrompt.addEventListener('click', function() {
            const randomPrompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
            const input = document.getElementById('prompt');
            if (input) {
                input.value = randomPrompt;
                input.focus();
                input.classList.add('ring', 'ring-blue-400', 'scale-105');
                setTimeout(() => {
                    input.classList.remove('scale-105');
                }, 150);
            }
        });
    }
    
    // Theme Switcher
    function setTheme(theme) {
        document.documentElement.classList.toggle('light', theme === 'light');
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = localStorage.getItem('theme') || 'dark';
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }
    
    // Set theme on load
    setTheme(localStorage.getItem('theme') || 'dark');
    
    // Favorites functionality
    function getFavorites() {
        return JSON.parse(localStorage.getItem('favorites') || '[]');
    }
    
    function setFavorites(favs) {
        localStorage.setItem('favorites', JSON.stringify(favs));
    }
    
    function renderFavorites() {
        if (!favoritesList) return;
        
        const favorites = getFavorites();
        favoritesList.innerHTML = '';
        
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<div class="text-gray-400 text-center py-4">No favorites yet</div>';
            return;
        }
        
        favorites.forEach((fav, index) => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-3 bg-blue-950 bg-opacity-60 rounded-lg';
            div.innerHTML = `
                <div class="flex-1">
                    <div class="text-blue-200 font-medium">${fav.prompt}</div>
                    <div class="text-blue-300 text-xs">${fav.timestamp}</div>
                </div>
                <button class="text-red-400 hover:text-red-300 ml-2" onclick="removeFavorite(${index})">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            `;
            favoritesList.appendChild(div);
        });
    }
    
    // Global function for removing favorites
    window.removeFavorite = function(index) {
        const favorites = getFavorites();
        favorites.splice(index, 1);
        setFavorites(favorites);
        renderFavorites();
    };
    
    function saveToFavorites(track) {
        const favorites = getFavorites();
        const newFavorite = {
            prompt: track.prompt || 'Unknown',
            timestamp: new Date().toLocaleString(),
            audioUrl: track.audio_url
        };
        favorites.unshift(newFavorite);
        setFavorites(favorites);
        renderFavorites();
    }
    
    // Favorites panel toggle
    if (favoritesToggle) {
        favoritesToggle.addEventListener('click', () => {
            if (favoritesPanel.style.display === 'none' || !favoritesPanel.style.display) {
                favoritesPanel.style.display = 'block';
                setTimeout(() => {
                    favoritesPanel.style.transform = 'translateY(0)';
                }, 10);
                renderFavorites();
            } else {
                favoritesPanel.style.transform = 'translateY(100%)';
                setTimeout(() => {
                    favoritesPanel.style.display = 'none';
                }, 400);
            }
        });
    }
    
    if (closeFavorites) {
        closeFavorites.addEventListener('click', () => {
            favoritesPanel.style.transform = 'translateY(100%)';
            setTimeout(() => {
                favoritesPanel.style.display = 'none';
            }, 400);
        });
    }
    
    // Add save to favorites button after music generation
    function addSaveFavoriteButton(track) {
        let btn = document.getElementById('save-favorite-btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'save-favorite-btn';
            btn.className = 'ml-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-blue-600 text-white hover:from-blue-600 hover:to-pink-600 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-semibold';
            btn.innerHTML = '<span>❤️</span> Save to Favorites';
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                saveToFavorites(track);
                btn.innerHTML = '<span>✅</span> Saved!';
                setTimeout(() => btn.innerHTML = '<span>❤️</span> Save to Favorites', 1500);
            });
            if (statusArea) {
                statusArea.appendChild(btn);
            }
        }
    }
    
    // Add save to favorites button after successful music generation
    const originalShowAudioPlayer = showAudioPlayer;
    showAudioPlayer = function(audioData) {
        originalShowAudioPlayer(audioData);
        
        // Add save to favorites button
        setTimeout(() => {
            addSaveFavoriteButton(audioData);
        }, 100);
    };
});
