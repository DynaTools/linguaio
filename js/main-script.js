// main.js - Arquivo principal que inicializa e conecta todas as funcionalidades

document.addEventListener('DOMContentLoaded', () => {
    // Referências a elementos comuns
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
    const flagBtns = document.querySelectorAll('.flag-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    // Inicializar os diferentes módulos
    initUIControls();
    initTranslationSystem();
    initGrammarAnalysis();
    initAudioSystem();

    // Inicializar controles básicos da interface
    function initUIControls() {
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

        // Selecionar tom
        toneOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remover classe ativa de todas as opções
                toneOptions.forEach(o => o.classList.remove('active'));
                // Adicionar classe ativa à opção selecionada
                option.classList.add('active');
            });
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
            
            // Salvar as chaves no localStorage
            if (openaiKey) localStorage.setItem('openai-key', openaiKey);
            if (geminiKey) localStorage.setItem('gemini-key', geminiKey);
            
            // Feedback visual
            const originalText = saveSettingsBtn.textContent;
            saveSettingsBtn.textContent = '✓ Configurações Salvas!';
            setTimeout(() => {
                saveSettingsBtn.textContent = originalText;
            }, 2000);
        });

        // Carregar configurações salvas
        const savedOpenAIKey = localStorage.getItem('openai-key');
        const savedGeminiKey = localStorage.getItem('gemini-key');
        
        if (savedOpenAIKey) document.getElementById('openai-key').value = savedOpenAIKey;
        if (savedGeminiKey) document.getElementById('gemini-key').value = savedGeminiKey;
    }
});
