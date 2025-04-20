// grammar.js - Módulo para análise gramatical

/**
 * Inicializa o sistema de análise gramatical
 */
function initGrammarAnalysis() {
    // Análise gramatical será acionada após a tradução pelo botão de tradução
    // Em vez de usar o evento de input, que analisa o texto original
    const translateBtn = document.getElementById('translate-btn');
    translateBtn.addEventListener('click', () => {
        // A análise será executada após a tradução ser concluída
        // A função de tradução cuidará de chamar updateGrammarAnalysis
    });
    
    // Também acionamos análise quando o tom é aplicado
    const applyToneBtn = document.getElementById('apply-tone-btn');
    applyToneBtn.addEventListener('click', () => {
        // A aplicação de tom chamará updateGrammarAnalysis quando concluída
    });
}

/**
 * Função de debounce para limitar chamadas repetidas
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

/**
 * Analisa o texto em busca de padrões gramaticais
 * Modificado para analisar o texto traduzido
 */
function updateGrammarAnalysis() {
    // Obter o texto traduzido (não mais o texto original)
    const translatedText = document.getElementById('target-text').value;
    
    // Se não houver texto traduzido ou estiver em processo de tradução, não faça nada
    if (!translatedText || translatedText === 'Translating...') {
        return;
    }
    
    // Obter o idioma de destino (não mais o idioma de origem)
    const targetLang = document.getElementById('target-language').value;
    const grammarSection = document.querySelector('.grammar-analysis');
    
    // Limpar análises existentes (exceto título)
    const sectionTitle = grammarSection.querySelector('.section-title');
    grammarSection.innerHTML = '';
    grammarSection.appendChild(sectionTitle);
    
    // Determine which API to use based on the selected engine
    const engineOptions = document.querySelectorAll('.engine-option');
    let currentEngine = 'google'; 
    
    engineOptions.forEach(option => {
        if (option.classList.contains('active')) {
            currentEngine = option.dataset.engine;
        }
    });
    
    if (currentEngine === 'openai') {
        // Check if OpenAI key is available
        const openaiKey = document.getElementById('openai-key').value || localStorage.getItem('openai-key');
        if (openaiKey && openaiKey !== 'sk-********************') {
            // Show loading indicator
            addVerbTenseAnalysis('Analyzing...', 'Processing grammar analysis of translated text with OpenAI.');
            
            // Use OpenAI for advanced grammar analysis with Reverso Context style
            analyzeGrammarWithOpenAI(translatedText, targetLang)
                .then(analyses => {
                    // Clear existing analyses again
                    grammarSection.innerHTML = '';
                    grammarSection.appendChild(sectionTitle);
                    
                    // Add the analyses returned by the API
                    analyses.forEach(analysis => {
                        addVerbTenseAnalysis(analysis.name, analysis.explanation, analysis.examples);
                    });
                })
                .catch(error => {
                    console.error('Error in grammar analysis with API:', error);
                    
                    // Clear existing analyses again
                    grammarSection.innerHTML = '';
                    grammarSection.appendChild(sectionTitle);
                    
                    // Show activating LLM message
                    addActivateLLMMessage();
                });
        } else {
            // Show activating LLM message
            addActivateLLMMessage();
        }
    } else if (currentEngine === 'gemini') {
        // Check if Gemini key is available
        const geminiKey = document.getElementById('gemini-key').value || localStorage.getItem('gemini-key');
        if (geminiKey) {
            // Show loading indicator
            addVerbTenseAnalysis('Analyzing...', 'Processing grammar analysis of translated text with Gemini.');
            
            // Use Gemini for advanced grammar analysis with Reverso Context style
            analyzeGrammarWithGemini(translatedText, targetLang)
                .then(analyses => {
                    // Clear existing analyses again
                    grammarSection.innerHTML = '';
                    grammarSection.appendChild(sectionTitle);
                    
                    // Add the analyses returned by the API
                    analyses.forEach(analysis => {
                        addVerbTenseAnalysis(analysis.name, analysis.explanation, analysis.examples);
                    });
                })
                .catch(error => {
                    console.error('Error in grammar analysis with Gemini API:', error);
                    
                    // Clear existing analyses again
                    grammarSection.innerHTML = '';
                    grammarSection.appendChild(sectionTitle);
                    
                    // Show activating LLM message
                    addActivateLLMMessage();
                });
        } else {
            // Show activating LLM message
            addActivateLLMMessage();
        }
    } else {
        // For Google Translate engine, show activating LLM message
        addActivateLLMMessage();
    }
}

/**
 * Shows a message prompting to activate LLM
 */
function addActivateLLMMessage() {
    const grammarSection = document.querySelector('.grammar-analysis');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'llm-message';
    messageDiv.innerHTML = `
        <h3>Advanced Grammar Analysis</h3>
        <p>Please activate your LLM Model in the settings to enable advanced grammar analysis with context examples.</p>
        <button id="activate-llm-btn" class="secondary">Go to Settings</button>
    `;
    
    grammarSection.appendChild(messageDiv);
    
    // Add event listener to the button
    document.getElementById('activate-llm-btn').addEventListener('click', function() {
        // Navigate to settings
        document.getElementById('settings-link').click();
    });
}

/**
 * Function to analyze grammar using OpenAI with Reverso Context style
 */
async function analyzeGrammarWithOpenAI(text, lang) {
    // Get API key
    const apiKey = document.getElementById('openai-key').value || localStorage.getItem('openai-key');
    
    if (!apiKey || apiKey === 'sk-********************') {
        throw new Error('OpenAI API key not configured');
    }
    
    try {
        // Create the prompt for grammar analysis with context examples
        const prompt = `Analyze the grammar in this ${getLanguageName(lang)} text:
        "${text}"
        
        Return exactly 3 grammatical elements found in the text.
        
        For each element, provide:
        1. The name of the grammatical structure or verb tense
        2. A brief explanation of how it's used in the text
        3. 3 context examples showing how this grammatical structure is used in different contexts (similar to Reverso Context)
        
        Format your response as a JSON array with objects containing 'name', 'explanation', and 'examples' properties.
        Examples should be an array of strings.
        
        Example response format:
        [
          {
            "name": "Present Simple",
            "explanation": "In 'I work', present simple is used for habitual actions.",
            "examples": [
              "I work at a bank. (habitual action)",
              "The train leaves at 8:30 AM. (scheduled event)",
              "Water boils at 100°C. (scientific fact)"
            ]
          }
        ]`;
        
        // API request configuration
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {role: 'system', content: 'You are a grammar expert that provides contextual examples like Reverso Context.'},
                    {role: 'user', content: prompt}
                ],
                temperature: 0.3,
                max_tokens: 1000
            })
        });
        
        const data = await response.json();
        
        // Check for errors
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        // Try to extract JSON from the response
        try {
            const content = data.choices[0].message.content.trim();
            // Find JSON in the content (might be surrounded by text)
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            
            if (jsonMatch) {
                const analysisArray = JSON.parse(jsonMatch[0]);
                return analysisArray;
            } else {
                // Try to parse entire response as JSON
                return JSON.parse(content);
            }
        } catch (parseError) {
            console.error('Error parsing JSON response:', parseError);
            // Return the response as text if unable to parse as JSON
            return [{
                name: 'Text Analysis',
                explanation: data.choices[0].message.content.trim(),
                examples: ["Example 1", "Example 2", "Example 3"]
            }];
        }
    } catch (error) {
        console.error('Error in grammar analysis with OpenAI:', error);
        throw error;
    }
}

/**
 * Function to analyze grammar using Google Gemini with Reverso Context style
 */
async function analyzeGrammarWithGemini(text, lang) {
    // Get API key
    const apiKey = document.getElementById('gemini-key').value || localStorage.getItem('gemini-key');
    
    if (!apiKey) {
        throw new Error('Gemini API key not configured');
    }
    
    try {
        // Create the prompt for grammar analysis with context examples
        const prompt = `Analyze the grammar in this ${getLanguageName(lang)} text:
        "${text}"
        
        Return exactly 3 grammatical elements found in the text.
        
        For each element, provide:
        1. The name of the grammatical structure or verb tense
        2. A brief explanation of how it's used in the text
        3. 3 context examples showing how this grammatical structure is used in different contexts (similar to Reverso Context)
        
        Format your response as a JSON array with objects containing 'name', 'explanation', and 'examples' properties.
        Examples should be an array of strings.
        
        Example response format:
        [
          {
            "name": "Present Simple",
            "explanation": "In 'I work', present simple is used for habitual actions.",
            "examples": [
              "I work at a bank. (habitual action)",
              "The train leaves at 8:30 AM. (scheduled event)",
              "Water boils at 100°C. (scientific fact)"
            ]
          }
        ]`;
        
        // URL for Gemini API
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        
        // API request configuration
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
        
        // Check for errors
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        // Try to extract JSON from the response
        try {
            const content = data.candidates[0].content.parts[0].text.trim();
            // Find JSON in the content (might be surrounded by text)
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            
            if (jsonMatch) {
                const analysisArray = JSON.parse(jsonMatch[0]);
                return analysisArray;
            } else {
                // Try to parse entire response as JSON
                return JSON.parse(content);
            }
        } catch (parseError) {
            console.error('Error parsing JSON response:', parseError);
            // Return the response as text if unable to parse as JSON
            return [{
                name: 'Text Analysis',
                explanation: data.candidates[0].content.parts[0].text.trim(),
                examples: ["Example 1", "Example 2", "Example 3"]
            }];
        }
    } catch (error) {
        console.error('Error in grammar analysis with Gemini:', error);
        throw error;
    }
}

/**
 * Helper function to add a verb tense analysis element to the interface
 */
function addVerbTenseAnalysis(tenseName, explanation, examples = []) {
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
    
    // Add context examples if available
    if (examples && examples.length > 0) {
        const contextSection = document.createElement('div');
        contextSection.className = 'context-examples';
        
        const contextTitle = document.createElement('div');
        contextTitle.className = 'context-title';
        contextTitle.textContent = 'Context Examples:';
        
        const examplesList = document.createElement('ul');
        examples.forEach(example => {
            const exampleItem = document.createElement('li');
            exampleItem.textContent = example;
            examplesList.appendChild(exampleItem);
        });
        
        contextSection.appendChild(contextTitle);
        contextSection.appendChild(examplesList);
        verbTense.appendChild(contextSection);
    }
    
    grammarSection.appendChild(verbTense);
}

// Add CSS for the LLM activation message
const style = document.createElement('style');
style.textContent = `
.llm-message {
    background-color: var(--light-color);
    padding: 15px;
    border-radius: var(--border-radius);
    text-align: center;
}

.llm-message h3 {
    margin-bottom: 10px;
    color: var(--primary-color);
}

.llm-message p {
    margin-bottom: 15px;
}

#activate-llm-btn {
    display: inline-block;
    background-color: var(--accent-color);
    color: white;
}

#activate-llm-btn:hover {
    background-color: var(--secondary-color);
}
`;
document.head.appendChild(style);