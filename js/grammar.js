// grammar.js - Módulo para análise gramatical

/**
 * Inicializa o sistema de análise gramatical
 */
function initGrammarAnalysis() {
    // Evento para atualizar a análise gramatical quando o texto mudar
    const sourceText = document.getElementById('source-text');
    sourceText.addEventListener('input', debounce(() => {
        if (sourceText.value.length > 10) {
            updateGrammarAnalysis(sourceText.value);
        }
    }, 1000));
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
 * Esta é uma implementação básica que identifica alguns padrões comuns em português e inglês
 * Para uma análise mais avançada, seria necessária uma API dedicada
 */
function updateGrammarAnalysis(text) {
    // Obter o idioma atual
    const sourceLang = document.getElementById('source-language').value;
    const grammarSection = document.querySelector('.grammar-analysis');
    
    // Limpar análises existentes (exceto título)
    const sectionTitle = grammarSection.querySelector('.section-title');
    grammarSection.innerHTML = '';
    grammarSection.appendChild(sectionTitle);
    
    // Verificar se devemos usar a API OpenAI para análise gramatical
    const openaiKey = document.getElementById('openai-key').value || localStorage.getItem('openai-key');
    
    if (openaiKey && openaiKey !== 'sk-********************' && typeof analyzeGrammarWithOpenAI === 'function') {
        // Mostrar indicador de carregamento
        addVerbTenseAnalysis('Analisando...', 'Processando análise gramatical avançada.');
        
        // Usar OpenAI para análise gramatical avançada
        analyzeGrammarWithOpenAI(text, sourceLang)
            .then(analyses => {
                // Limpar análises existentes novamente
                grammarSection.innerHTML = '';
                grammarSection.appendChild(sectionTitle);
                
                // Adicionar as análises retornadas pela API
                analyses.forEach(analysis => {
                    addVerbTenseAnalysis(analysis.name, analysis.explanation);
                });
            })
            .catch(error => {
                console.error('Erro na análise gramatical com API:', error);
                
                // Limpar análises existentes novamente
                grammarSection.innerHTML = '';
                grammarSection.appendChild(sectionTitle);
                
                // Mostrar erro e fazer fallback para análise local
                addVerbTenseAnalysis('Erro na análise com API', 
                               'Usando análise gramatical básica como alternativa.');
                
                // Usar análise local como fallback
                performLocalGrammarAnalysis(text, sourceLang, grammarSection);
            });
    } else {
        // Usar análise local se não houver chave OpenAI
        performLocalGrammarAnalysis(text, sourceLang, grammarSection);
    }
}

/**
 * Executa análise gramatical local baseada em regras
 */
function performLocalGrammarAnalysis(text, sourceLang, grammarSection) {
    // Analisar baseado no idioma
    if (sourceLang === 'pt') {
        analyzePortugueseGrammar(text, grammarSection);
    } else if (sourceLang === 'en') {
        analyzeEnglishGrammar(text, grammarSection);
    } else if (sourceLang === 'es') {
        analyzeSpanishGrammar(text, grammarSection);
    } else {
        // Para outros idiomas, mostre uma mensagem informativa
        addVerbTenseAnalysis('Análise não disponível', 
                       `A análise gramatical para ${getLanguageName(sourceLang)} ainda não está implementada.`);
    }
}

/**
 * Analisa estruturas gramaticais em português
 */
function analyzePortugueseGrammar(text, grammarSection) {
    const lowerText = text.toLowerCase();
    
    // Verificar tempos verbais comuns em português
    const patterns = [
        {
            name: 'Presente do Indicativo',
            regex: /\b(eu )?(falo|faço|vou|estou|tenho|sou|fico|quero|posso|sei|vejo|digo|venho|leio)\b/gi,
            explanation: 'O presente do indicativo é usado para ações que acontecem no momento atual ou habitualmente.'
        },
        {
            name: 'Pretérito Perfeito',
            regex: /\b(eu )?(falei|fiz|fui|estive|tive|fiquei|quis|pude|soube|vi|disse|vim|li)\b/gi,
            explanation: 'O pretérito perfeito expressa ações concluídas no passado.'
        },
        {
            name: 'Futuro do Presente',
            regex: /\b(eu )?(falarei|farei|irei|estarei|terei|serei|ficarei|quererei|poderei|saberei|verei|direi|virei|lerei)\b/gi,
            explanation: 'O futuro do presente indica ações que acontecerão em um momento posterior ao atual.'
        },
        {
            name: 'Futuro do Pretérito (Condicional)',
            regex: /\b(eu )?(falaria|faria|iria|estaria|teria|seria|ficaria|quereria|poderia|saberia|veria|diria|viria|leria|gostaria)\b/gi,
            explanation: 'O futuro do pretérito (condicional) expressa ações hipotéticas ou desejos.'
        },
        {
            name: 'Imperativo',
            regex: /\b(fale|faça|vá|esteja|tenha|seja|fique|queira|possa|saiba|veja|diga|venha|leia)\b/gi,
            explanation: 'O imperativo é usado para dar ordens, conselhos ou fazer pedidos.'
        },
        {
            name: 'Presente do Subjuntivo',
            regex: /\b(que eu )?(fale|faça|vá|esteja|tenha|seja|fique|queira|possa|saiba|veja|diga|venha|leia)\b/gi,
            explanation: 'O presente do subjuntivo expressa desejos, possibilidades ou suposições no presente.'
        }
    ];
    
    // Verificar expressões específicas
    if (lowerText.includes('está disponível')) {
        addVerbTenseAnalysis('Presente do Indicativo', 
                       'Em "está disponível", você está fazendo uma pergunta no tempo presente.');
    }
    
    if (lowerText.includes('gostaria')) {
        addVerbTenseAnalysis('Futuro do Pretérito (Condicional)', 
                       'Em "gostaria", você está usando o futuro do pretérito, que expressa um desejo de forma educada.');
    }
    
    // Verificar padrões mais genéricos
    let foundPatterns = 0;
    patterns.forEach(pattern => {
        const matches = text.match(pattern.regex);
        if (matches && matches.length > 0 && foundPatterns < 3) {
            // Remove duplicatas
            const uniqueMatches = [...new Set(matches.map(m => m.toLowerCase()))];
            
            // Limitar a 3 análises para não sobrecarregar a interface
            const verbList = uniqueMatches.slice(0, 3).join('", "');
            addVerbTenseAnalysis(pattern.name, 
                           `Identificado em "${verbList}". ${pattern.explanation}`);
            foundPatterns++;
        }
    });
    
    // Se nenhum padrão foi encontrado
    if (foundPatterns === 0) {
        addVerbTenseAnalysis('Análise básica', 
                       'Nenhum padrão verbal específico foi identificado. Tente um texto mais completo para análise.');
    }
}

/**
 * Analisa estruturas gramaticais em inglês
 */
function analyzeEnglishGrammar(text, grammarSection) {
    const lowerText = text.toLowerCase();
    
    // Verificar tempos verbais comuns em inglês
    const patterns = [
        {
            name: 'Present Simple',
            regex: /\b(i |you |he |she |it |we |they )?(am|is|are|go|do|have|want|need|like|see|say|know)\b/gi,
            explanation: 'The present simple is used for habits, facts and regular actions.'
        },
        {
            name: 'Present Continuous',
            regex: /\b(i |you |he |she |it |we |they )?(am|is|are) ([\w]+ing)\b/gi,
            explanation: 'The present continuous is used for actions happening now or temporary situations.'
        },
        {
            name: 'Past Simple',
            regex: /\b(i |you |he |she |it |we |they )?(was|were|went|did|had|wanted|needed|liked|saw|said|knew)\b/gi,
            explanation: 'The past simple is used for completed actions in the past.'
        },
        {
            name: 'Future with Will',
            regex: /\b(i |you |he |she |it |we |they )?(will) ([\w]+)\b/gi,
            explanation: 'The future with "will" is used for predictions or spontaneous decisions.'
        },
        {
            name: 'Future with Going to',
            regex: /\b(i |you |he |she |it |we |they )?(am|is|are) going to ([\w]+)\b/gi,
            explanation: 'The future with "going to" is used for planned actions or evident predictions.'
        },
        {
            name: 'Conditional',
            regex: /\b(i |you |he |she |it |we |they )?(would) ([\w]+)\b/gi,
            explanation: 'The conditional is used for hypothetical situations or polite requests.'
        }
    ];
    
    // Verificar expressões específicas
    if (lowerText.includes('would like')) {
        addVerbTenseAnalysis('Conditional Mood', 
                       'In "would like", you are using the conditional mood, expressing a polite request or desire.');
    }
    
    if (lowerText.includes('are you available')) {
        addVerbTenseAnalysis('Present Simple', 
                       'In "are you available", you are asking a direct question in the present simple tense.');
    }
    
    // Verificar padrões mais genéricos
    let foundPatterns = 0;
    patterns.forEach(pattern => {
        const matches = text.match(pattern.regex);
        if (matches && matches.length > 0 && foundPatterns < 3) {
            const verbMatch = matches[0].trim();
            addVerbTenseAnalysis(pattern.name, 
                           `Identified in "${verbMatch}". ${pattern.explanation}`);
            foundPatterns++;
        }
    });
    
    // Se nenhum padrão foi encontrado
    if (foundPatterns === 0) {
        addVerbTenseAnalysis('Basic Analysis', 
                       'No specific verb patterns identified. Try a more complete text for analysis.');
    }
}

/**
 * Analisa estruturas gramaticais em espanhol
 */
function analyzeSpanishGrammar(text, grammarSection) {
    const lowerText = text.toLowerCase();
    
    // Verificar tempos verbais comuns em espanhol
    const patterns = [
        {
            name: 'Presente del Indicativo',
            regex: /\b(yo |tú |él |ella |usted |nosotros |vosotros |ellos |ellas |ustedes )?(hablo|hablas|habla|hablamos|habláis|hablan|estoy|estás|está|estamos|estáis|están)\b/gi,
            explanation: 'El presente del indicativo se usa para acciones habituales o hechos.'
        },
        {
            name: 'Pretérito Perfecto',
            regex: /\b(yo |tú |él |ella |usted |nosotros |vosotros |ellos |ellas |ustedes )?(he|has|ha|hemos|habéis|han) ([\w]+ado|[\w]+ido)\b/gi,
            explanation: 'El pretérito perfecto se usa para acciones completadas en un pasado reciente.'
        },
        {
            name: 'Pretérito Indefinido',
            regex: /\b(yo |tú |él |ella |usted |nosotros |vosotros |ellos |ellas |ustedes )?(hablé|hablaste|habló|hablamos|hablasteis|hablaron|estuve|estuviste|estuvo|estuvimos|estuvisteis|estuvieron)\b/gi,
            explanation: 'El pretérito indefinido se usa para acciones completadas en un momento específico del pasado.'
        },
        {
            name: 'Futuro Simple',
            regex: /\b(yo |tú |él |ella |usted |nosotros |vosotros |ellos |ellas |ustedes )?(hablaré|hablarás|hablará|hablaremos|hablaréis|hablarán)\b/gi,
            explanation: 'El futuro simple se usa para acciones que ocurrirán en el futuro.'
        },
        {
            name: 'Condicional',
            regex: /\b(yo |tú |él |ella |usted |nosotros |vosotros |ellos |ellas |ustedes )?(hablaría|hablarías|hablaría|hablaríamos|hablaríais|hablarían|gustaría)\b/gi,
            explanation: 'El condicional se usa para expresar hipótesis o deseos.'
        }
    ];
    
    // Verificar expressões específicas
    if (lowerText.includes('me gustaría')) {
        addVerbTenseAnalysis('Condicional', 
                       'En "me gustaría", estás usando el condicional, que expresa un deseo de forma educada.');
    }
    
    if (lowerText.includes('está disponible')) {
        addVerbTenseAnalysis('Presente del Indicativo', 
                       'En "está disponible", estás haciendo una pregunta en el tiempo presente.');
    }
    
    // Verificar padrões mais genéricos
    let foundPatterns = 0;
    patterns.forEach(pattern => {
        const matches = text.match(pattern.regex);
        if (matches && matches.length > 0 && foundPatterns < 3) {
            const verbMatch = matches[0].trim();
            addVerbTenseAnalysis(pattern.name, 
                           `Identificado en "${verbMatch}". ${pattern.explanation}`);
            foundPatterns++;
        }
    });
    
    // Se nenhum padrão foi encontrado
    if (foundPatterns === 0) {
        addVerbTenseAnalysis('Análisis básico', 
                       'No se identificaron patrones verbales específicos. Intenta con un texto más completo para el análisis.');
    }
}

/**
 * Função auxiliar para adicionar um elemento de análise de tempo verbal à interface
 */
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
