// translate.js - Módulo para funcionalidades básicas de tradução

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

    // Evento do botão traduzir
    translateBtn.addEventListener('click', async () => {
        if (sourceText.value) {
            // Mostrar mensagem de carregamento
            targetText.value = 'Traduzindo...';
            
            try {
                // Verificar se há chave OpenAI configurada
                const openaiKey = document.getElementById('openai-key').value;
                
                let translatedText;
                if (openaiKey && openaiKey !== 'sk-********************') {
                    // Usar OpenAI se houver chave configurada
                    translatedText = await translateWithOpenAI(
                        sourceText.value,
                        sourceLanguage.value,
                        targetLanguage.value
                    );
                } else {
                    // Fallback para Google Translate
                    translatedText = await translateText(
                        sourceText.value,
                        sourceLanguage.value,
                        targetLanguage.value
                    );
                }
                
                // Atualizar o campo de saída
                targetText.value = translatedText;
                
                // Atualizar a análise gramatical
                if (typeof updateGrammarAnalysis === 'function') {
                    updateGrammarAnalysis(sourceText.value);
                }
            } catch (error) {
                console.error("Erro de tradução:", error);
                targetText.value = `Erro na tradução: ${error.message}`;
            }
        }
    });

    // Evento do botão aplicar tom
    applyToneBtn.addEventListener('click', async () => {
        if (targetText.value && targetText.value !== 'Traduzindo...') {
            // Obter o tom selecionado
            const selectedTone = document.querySelector('.tone-option.active').textContent;
            
            // Feedback visual
            const originalBtnText = applyToneBtn.textContent;
            applyToneBtn.textContent = `Aplicando tom ${selectedTone}...`;
            
            try {
                // Obter chave da OpenAI para ajuste de tom
                const openaiKey = document.getElementById('openai-key').value;
                
                if (openaiKey && openaiKey !== 'sk-********************') {
                    // Usar OpenAI para ajustar o tom
                    const adjustedText = await translateWithOpenAI(
                        sourceText.value,
                        sourceLanguage.value,
                        targetLanguage.value,
                        selectedTone
                    );
                    
                    targetText.value = adjustedText;
                } else {
                    // Sem API, apenas adicionar uma indicação do tom
                    if (!targetText.value.includes('[Tom:')) {
                        targetText.value = `[Tom: ${selectedTone}] ${targetText.value}`;
                    } else {
                        // Substituir tom existente
                        targetText.value = targetText.value.replace(/\[Tom: [^\]]+\] /, `[Tom: ${selectedTone}] `);
                    }
                }
                
                // Restaurar texto do botão com confirmação
                applyToneBtn.textContent = `✓ Tom ${selectedTone} aplicado!`;
                setTimeout(() => {
                    applyToneBtn.textContent = originalBtnText;
                }, 2000);
                
            } catch (error) {
                console.error('Erro ao aplicar tom:', error);
                applyToneBtn.textContent = `Erro ao aplicar tom: ${error.message}`;
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
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extrair e juntar os resultados da tradução
        let translatedText = '';
        data[0].forEach(item => {
            translatedText += item[0];
        });
        
        return translatedText;
    } catch (error) {
        console.error('Erro ao traduzir texto:', error);
        return `Erro na tradução: ${error.message}`;
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
