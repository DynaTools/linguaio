// translation.js - Módulo para funcionalidades básicas de tradução

/**
 * Inicializa o sistema de tradução
 */
function initTranslationSystem() {
    const translateBtn = document.getElementById('translate-btn');
    const sourceText = document.getElementById('source-text');
    const targetText = document.getElementById('target-text');
    const sourceLanguage = document.getElementById('source-language');
    const targetLanguage = document.getElementById('target-language');
    const applyToneBtn = document.getElementById('apply-tone-btn');
    
    // Engine selection
    const engineOptions = document.querySelectorAll('.engine-option');
    let currentEngine = 'google'; // engine padrão

    engineOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remover classe ativa de todas as opções
            engineOptions.forEach(o => o.classList.remove('active'));
            // Adicionar classe ativa à opção selecionada
            option.classList.add('active');
            // Atualizar o motor de tradução atual
            currentEngine = option.dataset.engine;
        });
    });

    // Evento do botão traduzir
    translateBtn.addEventListener('click', async () => {
        if (sourceText.value) {
            // Mostrar mensagem de carregamento
            targetText.value = 'Translating...';
            
            try {
                let translatedText;
                
                switch(currentEngine) {
                    case 'openai':
                        // Verificar se há chave OpenAI configurada
                        const openaiKey = document.getElementById('openai-key').value || localStorage.getItem('openai-key');
                        if (openaiKey && openaiKey !== 'sk-********************') {
                            translatedText = await translateWithOpenAI(
                                sourceText.value,
                                sourceLanguage.value,
                                targetLanguage.value
                            );
                        } else {
                            translatedText = "Please configure your OpenAI API key in Settings to use this feature.";
                        }
                        break;
                        
                    case 'gemini':
                        // Verificar se há chave Gemini configurada
                        const geminiKey = document.getElementById('gemini-key').value || localStorage.getItem('gemini-key');
                        if (geminiKey && geminiKey !== '') {
                            translatedText = await translateWithGemini(
                                sourceText.value,
                                sourceLanguage.value,
                                targetLanguage.value
                            );
                        } else {
                            translatedText = "Please configure your Google Gemini API key in Settings to use this feature.";
                        }
                        break;
                        
                    case 'google':
                    default:
                        // Usar Google Translate como fallback
                        translatedText = await translateText(
                            sourceText.value,
                            sourceLanguage.value,
                            targetLanguage.value
                        );
                        break;
                }
                
                // Atualizar o campo de saída
                targetText.value = translatedText;
                
                // Atualizar a análise gramatical
                if (typeof updateGrammarAnalysis === 'function') {
                    updateGrammarAnalysis(sourceText.value);
                }
            } catch (error) {
                console.error("Translation error:", error);
                targetText.value = `Translation error: ${error.message}`;
            }
        }
    });

    // Evento do botão aplicar tom
    applyToneBtn.addEventListener('click', async () => {
        if (targetText.value && targetText.value !== 'Translating...') {
            // Obter o tom selecionado
            const selectedTone = document.querySelector('.tone-option.active').textContent;
            
            // Feedback visual
            const originalBtnText = applyToneBtn.textContent;
            applyToneBtn.textContent = `Applying ${selectedTone} tone...`;
            
            try {
                let translatedText;
                
                switch(currentEngine) {
                    case 'openai':
                        // Verificar se há chave OpenAI configurada
                        const openaiKey = document.getElementById('openai-key').value || localStorage.getItem('openai-key');
                        if (openaiKey && openaiKey !== 'sk-********************') {
                            translatedText = await translateWithOpenAI(
                                sourceText.value,
                                sourceLanguage.value,
                                targetLanguage.value,
                                selectedTone
                            );
                        } else {
                            translatedText = "Please configure your OpenAI API key in Settings to use this feature.";
                        }
                        break;
                        
                    case 'gemini':
                        // Verificar se há chave Gemini configurada
                        const geminiKey = document.getElementById('gemini-key').value || localStorage.getItem('gemini-key');
                        if (geminiKey && geminiKey !== '') {
                            translatedText = await translateWithGemini(
                                sourceText.value,
                                sourceLanguage.value,
                                targetLanguage.value,
                                selectedTone
                            );
                        } else {
                            translatedText = "Please configure your Google Gemini API key in Settings to use this feature.";
                        }
                        break;
                        
                    case 'google':
                    default:
                        // Com Google Translate, simplesmente re-traduzir
                        translatedText = await translateText(
                            sourceText.value,
                            sourceLanguage.value,
                            targetLanguage.value
                        );
                        break;
                }
                
                // Atualizar o campo de saída sem adicionar o prefixo [Tom: X]
                targetText.value = translatedText;
                
                // Restaurar texto do botão com confirmação
                applyToneBtn.textContent = `✓ ${selectedTone} tone applied!`;
                setTimeout(() => {
                    applyToneBtn.textContent = originalBtnText;
                }, 2000);
                
            } catch (error) {
                console.error('Error applying tone:', error);
                applyToneBtn.textContent = `Error applying tone: ${error.message}`;
                setTimeout(() => {
                    applyToneBtn.textContent = originalBtnText;
                }, 3000);
            }
        }
    });
}

/**
 * Função para traduzir texto usando o Google Translate
 * Esta função usa uma técnica para simular o uso do Google Translate sem chave API
 * Nota: Esta abordagem é apenas para fins educacionais e pode não funcionar no futuro
 * Para um projeto comercial, recomenda-se usar uma API oficial com chave
 */
async function translateText(text, sourceLang, targetLang) {
    try {
        // URL do serviço de tradução
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        
        // Fazer a requisição
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extrair e juntar os resultados da tradução
        let translatedText = '';
        data[0].forEach(item => {
            translatedText += item[0];
        });
        
        return translatedText;
    } catch (error) {
        console.error('Error translating text:', error);
        return `Translation error: ${error.message}`;
    }
}

// Função auxiliar para obter o nome completo do idioma a partir do código
function getLanguageName(langCode) {
    const languages = {
        'pt': 'Portuguese',
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian'
    };
    
    return languages[langCode] || langCode;
}