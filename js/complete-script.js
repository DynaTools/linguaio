// Esperar que o DOM esteja completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Obter referências a elementos do DOM
    const swapBtn = document.querySelector('.swap-btn');
    const sourceLanguage = document.getElementById('source-language');
    const targetLanguage = document.getElementById('target-language');
    const sourceText = document.getElementById('source-text');
    const targetText = document.getElementById('target-text');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const translateBtn = document.getElementById('translate-btn');
    const toneOptions = document.querySelectorAll('.tone-option');
    const applyToneBtn = document.getElementById('apply-tone-btn');
    const playBtn = document.getElementById('play-btn');
    const recordBtn = document.getElementById('record-btn');
    const speedSelect = document.getElementById('speed-select');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const flagBtns = document.querySelectorAll('.flag-btn');

    // Trocar idiomas
    swapBtn.addEventListener('click', () => {
        const tempLang = sourceLanguage.value;
        sourceLanguage.value = targetLanguage.value;
        targetLanguage.value = tempLang;
        
        // Se houver texto já traduzido, inverte os textos
        if (targetText.value) {
            const tempText = sourceText.value;
            sourceText.value = targetText.value;
            targetText.value = tempText;
        }
    });

    // Limpar texto
    clearBtn.addEventListener('click', () => {
        sourceText.value = '';
        targetText.value = '';
    });

    // Copiar tradução
    copyBtn.addEventListener('click', () => {
        if (targetText.value) {
            navigator.clipboard.writeText(targetText.value)
                .then(() => {
                    // Feedback visual de cópia bem-sucedida
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = '✓ Copiado!';
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Erro ao copiar texto: ', err);
                    alert('Não foi possível copiar o texto. Tente novamente.');
                });
        }
    });

    // Simular tradução (para fins de demonstração)
    translateBtn.addEventListener('click', () => {
        if (sourceText.value) {
            // Aqui você integraria com uma API real de tradução
            // Por enquanto, fazemos uma simulação simples
            const mockTranslations = {
                'pt-en': {
                    'Olá, gostaria de agendar uma reunião para discutir o projeto. Está disponível na próxima semana?': 
                    'Hello, I would like to schedule a meeting to discuss the project. Are you available next week?'
                },
                'en-pt': {
                    'Hello, I would like to schedule a meeting to discuss the project. Are you available next week?': 
                    'Olá, gostaria de agendar uma reunião para discutir o projeto. Está disponível na próxima semana?'
                },
                'pt-es': {
                    'Olá, gostaria de agendar uma reunião para discutir o projeto. Está disponível na próxima semana?': 
                    'Hola, me gustaría programar una reunión para discutir el proyecto. ¿Está disponible la próxima semana?'
                }
            };
            
            // Obter a chave para as traduções mockadas
            const translationKey = `${sourceLanguage.value}-${targetLanguage.value}`;
            
            // Verificar se temos uma tradução mockada para o texto exato
            if (mockTranslations[translationKey] && mockTranslations[translationKey][sourceText.value]) {
                targetText.value = mockTranslations[translationKey][sourceText.value];
            } else {
                // Simulação simples para outros textos
                // Em uma aplicação real, você usaria uma API de tradução
                targetText.value = `[Tradução de ${sourceLanguage.value} para ${targetLanguage.value}]: ${sourceText.value}`;
            }
            
            // Atualizar a análise gramatical (simulado)
            updateGrammarAnalysis(sourceText.value);
        }
    });

    // Selecionar tom
    toneOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remover classe ativa de todas as opções
            toneOptions.forEach(o => o.classList.remove('active'));
            // Adicionar classe ativa à opção selecionada
            option.classList.add('active');
        });
    });

    // Aplicar tom à tradução
    applyToneBtn.addEventListener('click', () => {
        if (targetText.value) {
            const selectedTone = document.querySelector('.tone-option.active').textContent;
            // Simular aplicação de tom (em uma aplicação real, você usaria uma API)
            
            // Feedback visual
            const originalText = applyToneBtn.textContent;
            applyToneBtn.textContent = `✓ Tom ${selectedTone} aplicado!`;
            setTimeout(() => {
                applyToneBtn.textContent = originalText;
            }, 2000);
            
            // Aqui você pode adicionar lógica real para ajustar o tom
            // Por enquanto, apenas adicionamos um prefixo para demonstração
            if (!targetText.value.includes('[Tom:')) {
                targetText.value = `[Tom: ${selectedTone}] ${targetText.value}`;
            } else {
                // Substituir tom existente
                targetText.value = targetText.value.replace(/\[Tom: [^\]]+\] /, `[Tom: ${selectedTone}] `);
            }
        }
    });

    // Simulação de análise gramatical
    function updateGrammarAnalysis(text) {
        // Esta é apenas uma simulação de análise gramatical
        // Em uma aplicação real, você usaria uma API para análise gramatical
        const grammarSection = document.querySelector('.grammar-analysis');
        const verbTenses = grammarSection.querySelectorAll('.verb-tense');
        
        // Limpar análises existentes (exceto título)
        const sectionTitle = grammarSection.querySelector('.section-title');
        grammarSection.innerHTML = '';
        grammarSection.appendChild(sectionTitle);
        
        // Adicionar novas análises baseadas no texto
        if (text.includes('gostaria')) {
            addVerbTenseAnalysis('Presente do Indicativo (Condicional)', 
                                 'Em "gostaria", você está usando o futuro do pretérito, que expressa um desejo de forma educada.');
        }
        
        if (text.includes('está disponível')) {
            addVerbTenseAnalysis('Presente do Indicativo', 
                                 'Em "está disponível", você está fazendo uma pergunta no tempo presente.');
        }
        
        if (text.includes('would like')) {
            addVerbTenseAnalysis('Conditional Mood', 
                                 'Em "would like", você está usando o condicional em inglês, expressando um desejo de forma educada.');
        }
        
        if (text.includes('are you available')) {
            addVerbTenseAnalysis('Present Simple', 
                                 'Em "are you available", você está fazendo uma pergunta direta no presente simples.');
        }
    }
    
    function addVerbTenseAnalysis(tenseName, explanation) {
        const grammarSection = document.querySelector('.grammar-analysis');
        
        const verbTense = document.createElement('div');
        verbTense.className = 'verb-tense';
        
        const tenseNameEl = document.createElement('div');
        tenseNameEl.className = 'tense-name';
        tenseNameEl.textContent = tenseName;
        
        const explanationEl = document.createElement('div');
        explanationEl.className = 'tense-explanation';
        explanationEl.textContent = explanation;
        
        verbTense.appendChild(tenseNameEl);
        verbTense.appendChild(explanationEl);
        grammarSection.appendChild(verbTense);
    }

    // Simulação de reprodução de áudio
    playBtn.addEventListener('click', () => {
        // Em uma aplicação real, você reproduziria o áudio
        // Por enquanto, apenas simulamos a ação
        playBtn.textContent = '⏸️ Pausar';
        setTimeout(() => {
            playBtn.textContent = '▶️ Reproduzir';
        }, 3000);
    });

    // Simulação de gravação de áudio
    let isRecording = false;
    recordBtn.addEventListener('click', () => {
        isRecording = !isRecording;
        
        if (isRecording) {
            // Simulação de início de gravação
            recordBtn.style.backgroundColor = '#f44336';
            recordBtn.textContent = '⏹️';
        } else {
            // Simulação de fim de gravação
            recordBtn.style.backgroundColor = '#4caf50';
            recordBtn.textContent = '✓';
            
            // Simulação de avaliação de pronúncia
            setTimeout(() => {
                // Resetar botão
                recordBtn.style.backgroundColor = 'var(--error-color)';
                recordBtn.textContent = '🎙️';
                
                // Atualizar medidor de precisão (aleatoriamente para demonstração)
                const accuracyFill = document.querySelector('.accuracy-fill');
                const accuracy = Math.floor(Math.random() * 30) + 65; // Entre 65% e 95%
                accuracyFill.style.width = `${accuracy}%`;
            }, 1500);
        }
    });

    // Alternar bandeiras
    flagBtns.forEach(flag => {
        flag.addEventListener('click', () => {
            // Remover classe ativa de todas as bandeiras
            flagBtns.forEach(f => f.classList.remove('active'));
            // Adicionar classe ativa à bandeira selecionada
            flag.classList.add('active');
            
            // Aqui você pode adicionar lógica para mudar o idioma da interface
            const language = flag.alt;
            console.log(`Idioma alterado para: ${language}`);
        });
    });

    // Salvar configurações
    saveSettingsBtn.addEventListener('click', () => {
        const openaiKey = document.getElementById('openai-key').value;
        const geminiKey = document.getElementById('gemini-key').value;
        
        // Simulação de salvamento
        if (openaiKey || geminiKey) {
            // Em uma aplicação real, você salvaria estas chaves em localStorage ou backend
            const originalText = saveSettingsBtn.textContent;
            saveSettingsBtn.textContent = '✓ Configurações Salvas!';
            setTimeout(() => {
                saveSettingsBtn.textContent = originalText;
            }, 2000);
        }
    });
});
