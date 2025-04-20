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
    const settingsLink = document.getElementById('settings-link');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const logoHome = document.getElementById('logo-home');
    const translatorLink = document.getElementById('translator-link');
    const sendEmailBtn = document.getElementById('send-email-btn');

    // Pop-up de explicação dos tons
    const toneInfoBtn = document.getElementById('tone-info-btn');
    const toneInfoPopup = document.getElementById('tone-info-popup');
    if (toneInfoBtn && toneInfoPopup) {
        toneInfoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (toneInfoPopup.style.display === 'none' || !toneInfoPopup.style.display) {
                // Posicionar popup próximo ao botão
                const rect = toneInfoBtn.getBoundingClientRect();
                toneInfoPopup.style.top = (rect.bottom + window.scrollY + 8) + 'px';
                toneInfoPopup.style.left = (rect.left + window.scrollX - 40) + 'px';
                toneInfoPopup.style.display = 'block';
            } else {
                toneInfoPopup.style.display = 'none';
            }
        });
        // Fechar popup ao clicar fora
        document.addEventListener('click', (e) => {
            if (toneInfoPopup.style.display === 'block' && !toneInfoPopup.contains(e.target) && e.target !== toneInfoBtn) {
                toneInfoPopup.style.display = 'none';
            }
        });
    }

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
                        copyBtn.textContent = '✓ Copied!';
                        setTimeout(() => {
                            copyBtn.textContent = originalText;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Error copying text: ', err);
                        alert('Could not copy the text. Please try again.');
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

        // Go back to translator from logo
        logoHome.addEventListener('click', function() {
            showTranslator();
        });
        
        // Go back to translator from nav link
        translatorLink.addEventListener('click', function(e) {
            e.preventDefault();
            showTranslator();
        });

        // Link to settings page
        settingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Create settings page if it doesn't exist
            if (!document.querySelector('.settings-page')) {
                const settingsPage = document.createElement('div');
                settingsPage.className = 'settings-page';
                
                // Get the settings panel content
                const settingsPanel = document.querySelector('.settings-panel');
                
                // Create settings page content
                settingsPage.innerHTML = `
                    <h2>Settings</h2>
                    <div class="settings-container">
                        <div class="api-settings">
                            <div class="api-input">
                                <label>OpenAI API Key:</label>
                                <input type="password" id="settings-openai-key" placeholder="sk-..." value="${document.getElementById('openai-key').value}">
                            </div>
                            
                            <div class="api-input">
                                <label>Google Gemini API Key:</label>
                                <input type="password" id="settings-gemini-key" placeholder="Your Gemini key..." value="${document.getElementById('gemini-key').value}">
                            </div>
                            
                            <button id="settings-save-btn">Save Settings</button>
                        </div>
                    </div>
                    <button class="back-btn">Back to Translator</button>
                `;
                
                // Add to main content
                document.querySelector('.main-content').prepend(settingsPage);
                
                // Add event listener for save button in settings
                document.getElementById('settings-save-btn').addEventListener('click', function() {
                    const openaiKey = document.getElementById('settings-openai-key').value;
                    const geminiKey = document.getElementById('settings-gemini-key').value;
                    
                    // Save keys to localStorage
                    if (openaiKey) localStorage.setItem('openai-key', openaiKey);
                    if (geminiKey) localStorage.setItem('gemini-key', geminiKey);
                    
                    // Update the main form fields
                    document.getElementById('openai-key').value = openaiKey;
                    document.getElementById('gemini-key').value = geminiKey;
                    
                    // Feedback visual
                    const originalText = this.textContent;
                    this.textContent = '✓ Settings Saved!';
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 2000);
                });
                
                // Add event listener for back button
                document.querySelector('.back-btn').addEventListener('click', function() {
                    showTranslator();
                });
            }
            
            // Hide translator, show settings
            document.querySelector('.translator-container').style.display = 'none';
            document.querySelector('.settings-page').style.display = 'block';
        });

        // Add event listener for the activation button in grammar analysis
        document.getElementById('activate-llm-btn').addEventListener('click', function() {
            // Navigate to settings
            settingsLink.click();
        });

        // Function to show translator and hide settings
        function showTranslator() {
            document.querySelector('.translator-container').style.display = 'block';
            
            if (document.querySelector('.settings-page')) {
                document.querySelector('.settings-page').style.display = 'none';
            }
        }

        // Carregar configurações salvas
        const savedOpenAIKey = localStorage.getItem('openai-key');
        const savedGeminiKey = localStorage.getItem('gemini-key');
        
        if (savedOpenAIKey) document.getElementById('openai-key').value = savedOpenAIKey;
        if (savedGeminiKey) document.getElementById('gemini-key').value = savedGeminiKey;
    }

    if (sendEmailBtn && targetText) {
        sendEmailBtn.addEventListener('click', () => {
            const body = encodeURIComponent(targetText.value);
            window.location.href = `mailto:?subject=Tradução%20LinguaIO&body=${body}`;
        });
    }
});