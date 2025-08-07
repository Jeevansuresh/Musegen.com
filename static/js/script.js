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
    const audioElement = document.getElementById('audio-element');
    const downloadBtn = document.getElementById('download-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const playText = document.getElementById('play-text');
    
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

    // History panel toggle
    if (toggleHistoryBtn) {
        toggleHistoryBtn.addEventListener('click', () => {
            if (historyPanel.style.display === 'none' || !historyPanel.style.display) {
                historyPanel.style.display = 'block';
                setTimeout(() => {
                    historyPanel.style.transform = 'translateX(0)';
                }, 10);
            } else {
                historyPanel.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    historyPanel.style.display = 'none';
                }, 400);
            }
        });
    }
    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', () => {
            historyPanel.style.transform = 'translateX(100%)';
            setTimeout(() => {
                historyPanel.style.display = 'none';
            }, 400);
        });
    }

    function updateHistory(prompt, status) {
        history.unshift({ prompt, status });
        renderHistory();
    }
    
    function renderHistory() {
        historyList.innerHTML = '';
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'flex flex-col gap-0.5 mb-2 p-2 rounded bg-blue-950 bg-opacity-60';
            div.innerHTML = `<span class="font-semibold text-blue-300">${item.prompt}</span><span class="text-blue-200 text-xs">${item.status}</span>`;
            historyList.appendChild(div);
        });
    }

    // Audio player functionality
    function showAudioPlayer(audioData) {
        currentAudioData = audioData;
        audioElement.src = audioData.audio_url;
        downloadBtn.onclick = () => {
            window.open(audioData.download_url, '_blank');
        };
        audioPlayer.classList.remove('hidden');
        audioPlayer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideAudioPlayer() {
        audioPlayer.classList.add('hidden');
        currentAudioData = null;
    }

    // Play/Pause button functionality
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (audioElement.paused) {
                audioElement.play();
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
                playText.textContent = 'Pause';
            } else {
                audioElement.pause();
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                playText.textContent = 'Play';
            }
        });
    }

    // Audio element event listeners
    if (audioElement) {
        audioElement.addEventListener('play', () => {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            playText.textContent = 'Pause';
        });

        audioElement.addEventListener('pause', () => {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            playText.textContent = 'Play';
        });

        audioElement.addEventListener('ended', () => {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            playText.textContent = 'Play';
        });
    }

    if (form) {
        const input = document.getElementById('prompt');
        const button = form.querySelector('button[type="submit"]');
        
        // Preset suggestion buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                input.value = btn.getAttribute('data-suggestion');
                input.focus();
                // Animate input for feedback
                input.classList.add('ring', 'ring-blue-400', 'scale-105');
                setTimeout(() => {
                    input.classList.remove('scale-105');
                }, 150);
            });
        });
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // UX: disable button, show spinner
            button.disabled = true;
            button.classList.add('opacity-60', 'cursor-not-allowed');
            if (spinner) spinner.classList.remove('hidden');
            
            // Hide previous audio player
            hideAudioPlayer();
            
            // Animate status area
            statusArea.classList.remove('fade-in');
            statusArea.classList.add('fade-out');
            
            setTimeout(async () => {
                statusArea.textContent = 'Generating music... This may take a moment.';
                statusArea.classList.remove('fade-out');
                statusArea.classList.add('fade-in');
                updateHistory(input.value, 'Generating...');
                
                try {
                    const response = await fetch('/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: input.value })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        statusArea.textContent = 'Music generated successfully!';
                        updateHistory(input.value, 'Generated successfully');
                        showAudioPlayer(data);
                    } else {
                        statusArea.textContent = `Error: ${data.error}`;
                        updateHistory(input.value, 'Failed');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    statusArea.textContent = 'Error generating music. Please try again.';
                    updateHistory(input.value, 'Failed');
                }
                
                // UX: reset input, enable button, remove spinner
                input.value = '';
                button.disabled = false;
                button.classList.remove('opacity-60', 'cursor-not-allowed');
                if (spinner) spinner.classList.add('hidden');
            }, 400);
        });
        
        // Input focus animation
        input.addEventListener('focus', () => {
            input.classList.add('ring', 'ring-blue-400');
        });
        input.addEventListener('blur', () => {
            input.classList.remove('ring', 'ring-blue-400');
        });
        
        // Button click animation
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
});