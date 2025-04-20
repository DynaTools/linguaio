// openai.js - Módulo para integração com a API da OpenAI

/**
 * Função para traduzir texto usando a API da OpenAI
 * Requer uma chave de API válida da OpenAI
 * @param {string} text - Texto a ser traduzido
 * @param {string} sourceLang - Código do idioma de origem (ex: 'pt', 'en')
 * @param {string} targetLang - Código do idioma de destino (ex: 'en', 'pt')
 * @param {string} tone - Tom opcional para a tradução (ex: 'formal', 'casual')
 * @returns {Promise<string>} - O texto traduzido
 */
async function translateWithOpenAI(text, sourceLang, targetLang, tone = 'neutral') {
    // Obter a chave da API do campo de configuração ou localStorage
    let apiKey = document.getElementById('openai-key').value;
    
    // Tentar obter do localStorage se não estiver no campo
    if (!apiKey || apiKey === 'sk-********************') {
        apiKey = localStorage.getItem('openai-key');
    }
    
    if (!apiKey || apiKey === 'sk-********************') {
        return 'Por favor, configure uma chave de API OpenAI válida nas configurações.';
    }
    
    try {
        // Preparar o prompt com instruções para tradução
        const toneMap = {
            'Neutro': 'neutral and straightforward',
            'Casual': 'casual and conversational',
            'Formal': 'formal and professional',
            'Profissional': 'business appropriate and technical',
            'Amigável': 'friendly and approachable'
        };
        
        // Obter o tom selecionado ou usar o padrão
        const selectedTone = document.querySelector('.tone-option.active')?.textContent || 'Neutro';
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
        console.log('Enviando para OpenAI:', { 
            sourceLang: sourceLanguageName, 
            targetLang: targetLanguageName, 
            tone: toneDescription 
        });
        
        // Configuração da requisição
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {role: 'system', content: 'You are a professional translator.'},
                    {role: 'user', content: prompt}
                ],
                temperature: 0.3,
                max_tokens: 1000
            })
        });
        
        const data = await response.json();
        
        // Verificar erros na resposta
        if (data.error) {
            throw new Error(data.error.message || 'Erro desconhecido da API OpenAI');
        }
        
        // Verificar se há uma resposta válida
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Resposta inválida da API OpenAI');
        }
        
        // Extrair a tradução da resposta
        const translation = data.choices[0].message.content.trim();
        return translation;
    } catch (error) {
        console.error('Erro ao traduzir com OpenAI:', error);
        return `Erro na tradução com OpenAI: ${error.message}`;
    }
}

/**
 * Função que analisa o texto usando a API da OpenAI para extrair informações gramaticais
 * Esta função pode ser usada como uma alternativa à análise gramatical baseada em regras
 * @param {string} text - Texto a ser analisado
 * @param {string} lang - Código do idioma do texto
 * @returns {Promise<Array>} - Array de objetos contendo análises gramaticais
 */
async function analyzeGrammarWithOpenAI(text, lang) {
    // Obter a chave da API
    let apiKey = document.getElementById('openai-key').value;
    
    // Tentar obter do localStorage se não estiver no campo
    if (!apiKey || apiKey === 'sk-********************') {
        apiKey = localStorage.getItem('openai-key');
    }
    
    if (!apiKey || apiKey === 'sk-********************') {
        return [{
            name: 'Configuração necessária',
            explanation: 'Por favor, configure uma chave de API OpenAI válida nas configurações para análise gramatical avançada.'
        }];
    }
    
    try {
        // Criar o prompt para análise gramatical
        const prompt = `Analyze the grammar and verb tenses in this ${getLanguageName(lang)} text:
        "${text}"
        
        Return exactly 3 grammatical elements found in the text. For each element, provide:
        1. The name of the grammatical structure or verb tense
        2. An example from the text
        3. A brief explanation of its usage
        
        Format your response as a JSON array with objects containing 'name' and 'explanation' properties only.
        Example: [{"name": "Present Simple", "explanation": "In 'I work', present simple is used for habitual actions."}]`;
        
        // Configuração da requisição
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {role: 'system', content: 'You are a grammar expert.'},
                    {role: 'user', content: prompt}
                ],
                temperature: 0.3,
                max_tokens: 1000
            })
        });
        
        const data = await response.json();
        
        // Verificar erros na resposta
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        // Tentar extrair o JSON da resposta
        try {
            const content = data.choices[0].message.content.trim();
            // Encontrar o JSON no conteúdo (pode estar cercado por texto)
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            
            if (jsonMatch) {
                const analysisArray = JSON.parse(jsonMatch[0]);
                return analysisArray;
            } else {
                // Tentar analisar toda a resposta como JSON
                return JSON.parse(content);
            }
        } catch (parseError) {
            console.error('Erro ao analisar resposta JSON:', parseError);
            // Retornar a resposta como texto se não for possível analisar como JSON
            return [{
                name: 'Análise de texto',
                explanation: data.choices[0].message.content.trim()
            }];
        }
    } catch (error) {
        console.error('Erro na análise gramatical com OpenAI:', error);
        return [{
            name: 'Erro na análise',
            explanation: `Não foi possível analisar o texto: ${error.message}`
        }];
    }
}
