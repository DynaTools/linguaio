// gemini.js - Módulo para integração com a API do Google Gemini

/**
 * Função para traduzir texto usando a API do Google Gemini
 * Requer uma chave de API válida do Google Gemini
 * @param {string} text - Texto a ser traduzido
 * @param {string} sourceLang - Código do idioma de origem (ex: 'pt', 'en')
 * @param {string} targetLang - Código do idioma de destino (ex: 'en', 'pt')
 * @param {string} tone - Tom opcional para a tradução (ex: 'formal', 'casual')
 * @returns {Promise<string>} - O texto traduzido
 */
async function translateWithGemini(text, sourceLang, targetLang, tone = 'neutral') {
    // Obter a chave da API do campo de configuração ou localStorage
    let apiKey = document.getElementById('gemini-key').value;
    
    // Tentar obter do localStorage se não estiver no campo
    if (!apiKey) {
        apiKey = localStorage.getItem('gemini-key');
    }
    
    if (!apiKey) {
        return 'Please configure a valid Google Gemini API key in Settings.';
    }
    
    try {
        // Preparar o prompt com instruções para tradução
        const toneMap = {
            'Neutral': 'neutral and straightforward',
            'Casual': 'casual and conversational',
            'Formal': 'formal and professional',
            'Professional': 'business appropriate and technical',
            'Friendly': 'friendly and approachable'
        };
        
        // Obter o tom selecionado ou usar o padrão
        const selectedTone = document.querySelector('.tone-option.active')?.textContent || 'Neutral';
        const toneDescription = toneMap[selectedTone] || 'neutral';
        
        // Obter nomes dos idiomas
        const sourceLanguageName = getLanguageName(sourceLang);
        const targetLanguageName = getLanguageName(targetLang);
        
        // Criar o prompt para a API
        const prompt = `Translate the following text from ${sourceLanguageName} to ${targetLanguageName}. 
        Use a ${toneDescription} tone.
        Original text: "${text}"
        Translation:`;
        
        // Log para debug (remover em produção)
        console.log('Sending to Google Gemini:', { 
            sourceLang: sourceLanguageName, 
            targetLang: targetLanguageName, 
            tone: toneDescription 
        });
        
        // URL base da API Gemini
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        
        // Configuração da requisição
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 1000
                }
            })
        });
        
        const data = await response.json();
        
        // Verificar erros na resposta
        if (data.error) {
            throw new Error(data.error.message || 'Unknown error from Google Gemini API');
        }
        
        // Verificar se há uma resposta válida
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid response from Google Gemini API');
        }
        
        // Extrair a tradução da resposta
        const translation = data.candidates[0].content.parts[0].text.trim();
        return translation;
    } catch (error) {
        console.error('Error translating with Google Gemini:', error);
        return `Google Gemini translation error: ${error.message}`;
    }
}
