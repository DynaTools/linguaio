// audio.js - Módulo para funcionalidades de áudio e shadowing

/**
 * Inicializa o sistema de áudio e shadowing
 */
function initAudioSystem() {
    const playBtn = document.getElementById('play-btn');
    const recordBtn = document.getElementById('record-btn');
    const speedSelect = document.getElementById('speed-select');
    const targetText = document.getElementById('target-text');
    const targetLanguage = document.getElementById('target-language');
    const voiceEngineSelect = document.getElementById('voice-engine');
    
    // Estado do sistema de áudio
    let isRecording = false;
    let audioContext = null;
    let mediaRecorder = null;
    let audioStream = null;
    let audioChunks = [];
    let recordedAudio = null;
    let synth = window.speechSynthesis;
    
    // Inicializar sintetizador de voz
    let utterance = new SpeechSynthesisUtterance();
    
    // Botão de reprodução
    playBtn.addEventListener('click', async () => {
        if (voiceEngineSelect.value === 'google') {
            // Google Speech Synthesis (Web Speech API)
            if (synth.speaking) {
                synth.cancel();
                playBtn.textContent = '▶️ Reproduzir';
                return;
            }
            if (targetText.value) {
                utterance.text = targetText.value;
                const langMap = {
                    'en': 'en-US',
                    'pt': 'pt-BR',
                    'es': 'es-ES',
                    'fr': 'fr-FR',
                    'de': 'de-DE',
                    'it': 'it-IT'
                };
                utterance.lang = langMap[targetLanguage.value] || 'en-US';
                const speedValue = speedSelect.value;
                if (speedValue.includes('Lenta')) {
                    utterance.rate = 0.7;
                } else if (speedValue.includes('Muito Lenta')) {
                    utterance.rate = 0.5;
                } else {
                    utterance.rate = 1.0;
                }
                animateWaveform('model-wave');
                playBtn.textContent = '⏸️ Pausar';
                synth.speak(utterance);
                utterance.onend = () => {
                    playBtn.textContent = '▶️ Reproduzir';
                    stopWaveformAnimation('model-wave');
                };
            }
        } else if (voiceEngineSelect.value === 'whisper') {
            // Whisper (OpenAI) - síntese de voz via API
            if (recordedAudio && !recordedAudio.paused) {
                recordedAudio.pause();
                playBtn.textContent = '▶️ Reproduzir';
                stopWaveformAnimation('model-wave');
                return;
            }
            if (targetText.value) {
                playBtn.textContent = '⏳ Gerando áudio...';
                animateWaveform('model-wave');
                try {
                    const audioUrl = await synthesizeWithWhisper(targetText.value, targetLanguage.value);
                    if (recordedAudio) {
                        recordedAudio.pause();
                        recordedAudio = null;
                    }
                    recordedAudio = new Audio(audioUrl);
                    recordedAudio.onended = () => {
                        playBtn.textContent = '▶️ Reproduzir';
                        stopWaveformAnimation('model-wave');
                    };
                    recordedAudio.play();
                    playBtn.textContent = '⏸️ Pausar';
                } catch (err) {
                    playBtn.textContent = '▶️ Reproduzir';
                    stopWaveformAnimation('model-wave');
                    alert('Erro ao gerar áudio com Whisper: ' + err.message);
                }
            }
        }
    });
    
    // Botão de gravação
    recordBtn.addEventListener('click', async () => {
        // Alternar estado de gravação
        isRecording = !isRecording;
        
        if (isRecording) {
            // Iniciar gravação
            try {
                // Solicitar permissão para acessar o microfone
                audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // Configurar o gravador
                mediaRecorder = new MediaRecorder(audioStream);
                audioChunks = [];
                
                // Coletar dados de áudio
                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });
                
                // Quando a gravação terminar
                mediaRecorder.addEventListener('stop', () => {
                    // Criar blob de áudio
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    
                    // Cria URL para o áudio
                    recordedAudio = URL.createObjectURL(audioBlob);
                    
                    // Analisar a precisão (simulação)
                    analyzeAudioAccuracy();
                });
                
                // Iniciar gravação
                mediaRecorder.start();
                
                // Animar a forma de onda do usuário
                animateWaveform('user-wave');
                
                // Alterar aparência do botão
                recordBtn.style.backgroundColor = '#f44336';
                recordBtn.textContent = '⏹️';
                
            } catch (error) {
                console.error('Erro ao acessar o microfone:', error);
                alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
                
                // Resetar estado
                isRecording = false;
                recordBtn.style.backgroundColor = 'var(--error-color)';
                recordBtn.textContent = '🎙️';
            }
        } else {
            // Parar gravação
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
                
                // Parar stream do microfone
                if (audioStream) {
                    audioStream.getTracks().forEach(track => track.stop());
                }
                
                // Parar animação
                stopWaveformAnimation('user-wave');
                
                // Alterar aparência do botão temporariamente
                recordBtn.style.backgroundColor = '#4caf50';
                recordBtn.textContent = '✓';
                
                // Restaurar botão após um momento
                setTimeout(() => {
                    recordBtn.style.backgroundColor = 'var(--error-color)';
                    recordBtn.textContent = '🎙️';
                }, 2000);
            }
        }
    });
    
    // Analisar precisão do áudio (simulação)
    function analyzeAudioAccuracy() {
        // Em uma implementação real, usaríamos reconhecimento de voz
        // e comparação com o texto traduzido
        
        // Simular uma precisão aleatória entre 65% e 95%
        const accuracy = Math.floor(Math.random() * 30) + 65;
        
        // Atualizar o medidor de precisão
        const accuracyFill = document.querySelector('.accuracy-fill');
        accuracyFill.style.width = `${accuracy}%`;
        
        // Adicionar cor baseada na precisão
        if (accuracy >= 85) {
            accuracyFill.style.backgroundColor = 'var(--success-color)';
        } else if (accuracy >= 70) {
            accuracyFill.style.backgroundColor = 'var(--warning-color)';
        } else {
            accuracyFill.style.backgroundColor = 'var(--error-color)';
        }
    }
    
    // Animação da forma de onda
    function animateWaveform(waveClass) {
        const waveform = document.querySelector(`.${waveClass}`);
        const waveBars = waveform.querySelectorAll('.wave-bar');
        
        // ID da animação para controle
        waveform.animationId = setInterval(() => {
            waveBars.forEach(bar => {
                // Gerar altura aleatória
                const height = Math.floor(Math.random() * 70) + 10;
                bar.style.height = `${height}%`;
            });
        }, 150);
    }
    
    // Parar animação da forma de onda
    function stopWaveformAnimation(waveClass) {
        const waveform = document.querySelector(`.${waveClass}`);
        
        if (waveform.animationId) {
            clearInterval(waveform.animationId);
            waveform.animationId = null;
        }
    }
    
    // Verificar se o navegador suporta as APIs necessárias
    function checkBrowserSupport() {
        // Verificar suporte para Speech Synthesis
        if (!('speechSynthesis' in window)) {
            playBtn.disabled = true;
            alert('Seu navegador não suporta síntese de voz. Tente usar o Chrome ou Edge.');
        }
        
        // Verificar suporte para Media Devices API
        if (!('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices)) {
            recordBtn.disabled = true;
            alert('Seu navegador não suporta acesso ao microfone. Tente usar o Chrome ou Edge.');
        }
    }
    
    // Verificar suporte do navegador ao inicializar
    checkBrowserSupport();
}

// Função para síntese de voz com Whisper (OpenAI)
async function synthesizeWithWhisper(text, lang) {
    // Obter chave da API OpenAI
    let apiKey = document.getElementById('openai-key')?.value || localStorage.getItem('openai-key');
    if (!apiKey || apiKey === 'sk-********************') {
        throw new Error('Configure uma chave OpenAI válida nas configurações.');
    }
    // Mapear código de idioma para nome
    const langMap = {
        'en': 'en',
        'pt': 'pt',
        'es': 'es',
        'fr': 'fr',
        'de': 'de',
        'it': 'it'
    };
    const voiceLang = langMap[lang] || 'en';
    // Chamada para API OpenAI TTS (Whisper)
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: 'alloy', // Pode ser customizado
            language: voiceLang,
            response_format: 'mp3'
        })
    });
    if (!response.ok) {
        throw new Error('Erro na API Whisper: ' + response.statusText);
    }
    // Receber o blob de áudio
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}
