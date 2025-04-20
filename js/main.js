// main.js – acréscimo dos dois botões de e‑mail online
document.addEventListener('DOMContentLoaded', () => {

  /* ===== referências ===== */
  const swapBtn        = document.querySelector('.swap-btn');
  const sourceLang     = document.getElementById('source-language');
  const targetLang     = document.getElementById('target-language');
  const sourceText     = document.getElementById('source-text');
  const targetText     = document.getElementById('target-text');

  const clearBtn       = document.getElementById('clear-btn');
  const copyBtn        = document.getElementById('copy-btn');
  const translateBtn   = document.getElementById('translate-btn');

  /* ▼ novos botões ▼ */
  const sendGmailBtn   = document.getElementById('send-gmail-btn');
  const sendOutBtn     = document.getElementById('send-outlook-btn');
  /* ▲ --------------- ▲ */

  const toneOptions    = document.querySelectorAll('.tone-option');
  const applyToneBtn   = document.getElementById('apply-tone-btn');

  const settingsLink   = document.getElementById('settings-link');
  const logoHome       = document.getElementById('logo-home');
  const translatorLink = document.getElementById('translator-link');

  const toneInfoBtn    = document.getElementById('tone-info-btn');
  const toneInfoPopup  = document.getElementById('tone-info-popup');

  const practiceLink = document.getElementById('practice-link');

  /* ===== pop‑up ℹ️ de tom ===== */
  if (toneInfoBtn && toneInfoPopup) {
    toneInfoBtn.addEventListener('click', e => {
      e.stopPropagation();
      const vis = toneInfoPopup.style.display === 'block';
      toneInfoPopup.style.display = vis ? 'none' : 'block';
      if (!vis) {
        const r = toneInfoBtn.getBoundingClientRect();
        toneInfoPopup.style.top  = r.bottom + window.scrollY + 8 + 'px';
        toneInfoPopup.style.left = r.left   + window.scrollX - 40 + 'px';
      }
    });
    document.addEventListener('click', e => {
      if (toneInfoPopup.style.display === 'block' &&
          !toneInfoPopup.contains(e.target) &&
          e.target !== toneInfoBtn) {
        toneInfoPopup.style.display = 'none';
      }
    });
  }

  /* ===== módulos existentes ===== */
  initUIControls();
  initTranslationSystem();
  initGrammarAnalysis();
  initAudioSystem();

  /* ===== UI controls ===== */
  function initUIControls() {

    /* ⇄  inverter idiomas */
    swapBtn.addEventListener('click', () => {
      [sourceLang.value, targetLang.value] = [targetLang.value, sourceLang.value];

      if (targetText.value) {
        [sourceText.value, targetText.value] = [targetText.value, sourceText.value];
      }
    });

    /* 🧹 limpar */
    clearBtn.addEventListener('click', () => {
      sourceText.value = '';
      targetText.value = '';
    });

    /* 📋 copiar tradução */
    copyBtn.addEventListener('click', () => {
      if (!targetText.value) return;
      navigator.clipboard.writeText(targetText.value)
        .then(() => flash(copyBtn, '✓ Copied!'))
        .catch(()  => alert('Could not copy the text. Please try again.'));
    });

    /* 🎨 selecionar tom */
    toneOptions.forEach(opt => opt.addEventListener('click', () => {
      toneOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
    }));

    /* 🔗 navegação simples */
    logoHome.addEventListener     ('click', showTranslator);
    translatorLink.addEventListener('click', e => { e.preventDefault(); showTranslator(); });
    settingsLink  .addEventListener('click', e => { e.preventDefault(); openSettings(); });

    /* ✉️ Gmail online */
    sendGmailBtn.addEventListener('click', () => {
      const subject = encodeURIComponent('Tradução LinguaIO');
      const body    = encodeURIComponent(targetText.value);
      const url = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${subject}&body=${body}`;
      window.open(url, '_blank');
    });

    /* ✉️ Outlook Web */
    sendOutBtn.addEventListener('click', () => {
      const subject = encodeURIComponent('Tradução LinguaIO');
      const body    = encodeURIComponent(targetText.value);
      const url = `https://outlook.office.com/mail/deeplink/compose?subject=${subject}&body=${body}`;
      window.open(url, '_blank');
    });

    /* salvar / carregar chaves API */
    document.getElementById('openai-key').value = localStorage.getItem('openai-key') || '';
    document.getElementById('gemini-key').value = localStorage.getItem('gemini-key') || '';

    // Navegação para a página de Practice
    if (practiceLink) {
        practiceLink.addEventListener('click', function(e) {
            e.preventDefault();
            showPractice();
        });
    }
  }

  /* ===== helpers ===== */
  function flash(btn, text, ms = 2000) {
    const old = btn.textContent;
    btn.textContent = text;
    setTimeout(() => btn.textContent = old, ms);
  }

  function showTranslator() {
    document.querySelector('.translator-container').style.display = 'block';
    const sp = document.querySelector('.settings-page');
    if (sp) sp.style.display = 'none';
  }

  function openSettings() {
    /* ... seu código de settings permanece igual ... */
  }

  // Função para mostrar a página de Practice
  function showPractice() {
    document.querySelector('.translator-container').style.display = 'none';
    if (!document.getElementById('practice-page')) {
        const practicePage = document.createElement('div');
        practicePage.id = 'practice-page';
        practicePage.innerHTML = `
            <div class="practice-columns">
                <div class="grammar-analysis">
                    <h3 class="section-title">📝 Grammar Analysis</h3>
                    <div class="llm-message">
                        <h3>Advanced Grammar Analysis</h3>
                        <p>Please activate your LLM Model in the settings to enable advanced grammar analysis with context examples.</p>
                        <button id="activate-llm-btn" class="secondary">Go to Settings</button>
                    </div>
                </div>
                <div class="shadowing-tool">
                    <h3 class="section-title">🔊 Shadowing Practice</h3>
                    <div class="voice-engine-selector">
                        <label for="voice-engine">Engine:</label>
                        <select id="voice-engine">
                            <option value="google">Google</option>
                            <option value="whisper">Whisper (OpenAI)</option>
                        </select>
                    </div>
                    <div class="audio-controls">
                        <button id="play-btn">▶️ Play</button>
                        <select id="speed-select">
                            <option>Speed: Normal</option>
                            <option>Speed: Slow</option>
                            <option>Speed: Very Slow</option>
                        </select>
                    </div>
                    <div class="waveform">
                        <div class="model-wave">
                            <div class="wave-bar" style="height:20%"></div>
                            <div class="wave-bar" style="height:40%"></div>
                            <div class="wave-bar" style="height:60%"></div>
                            <div class="wave-bar" style="height:80%"></div>
                            <div class="wave-bar" style="height:70%"></div>
                            <div class="wave-bar" style="height:50%"></div>
                            <div class="wave-bar" style="height:30%"></div>
                            <div class="wave-bar" style="height:20%"></div>
                            <div class="wave-bar" style="height:10%"></div>
                            <div class="wave-bar" style="height:20%"></div>
                            <div class="wave-bar" style="height:30%"></div>
                            <div class="wave-bar" style="height:40%"></div>
                            <div class="wave-bar" style="height:50%"></div>
                            <div class="wave-bar" style="height:60%"></div>
                            <div class="wave-bar" style="height:70%"></div>
                            <div class="wave-bar" style="height:60%"></div>
                            <div class="wave-bar" style="height:50%"></div>
                            <div class="wave-bar" style="height:40%"></div>
                            <div class="wave-bar" style="height:30%"></div>
                            <div class="wave-bar" style="height:20%"></div>
                        </div>
                        <div class="user-wave">
                            <div class="wave-bar" style="height:10%"></div>
                            <div class="wave-bar" style="height:20%"></div>
                            <div class="wave-bar" style="height:40%"></div>
                            <div class="wave-bar" style="height:60%"></div>
                            <div class="wave-bar" style="height:50%"></div>
                            <div class="wave-bar" style="height:30%"></div>
                            <div class="wave-bar" style="height:20%"></div>
                            <div class="wave-bar" style="height:10%"></div>
                            <div class="wave-bar" style="height:5%"></div>
                            <div class="wave-bar" style="height:10%"></div>
                            <div class="wave-bar" style="height:20%"></div>
                            <div class="wave-bar" style="height:30%"></div>
                            <div class="wave-bar" style="height:40%"></div>
                            <div class="wave-bar" style="height:50%"></div>
                            <div class="wave-bar" style="height:40%"></div>
                            <div class="wave-bar" style="height:30%"></div>
                            <div class="wave-bar" style="height:20%"></div>
                            <div class="wave-bar" style="height:10%"></div>
                            <div class="wave-bar" style="height:5%"></div>
                            <div class="wave-bar" style="height:10%"></div>
                        </div>
                    </div>
                    <div class="record-btn" id="record-btn">🎙️</div>
                    <p>Pronunciation accuracy:</p>
                    <div class="accuracy-meter">
                        <div class="accuracy-fill"></div>
                    </div>
                </div>
            </div>
        `;
        document.querySelector('.main-content').appendChild(practicePage);
    }
    document.getElementById('practice-page').style.display = 'block';
    if (document.querySelector('.settings-page')) document.querySelector('.settings-page').style.display = 'none';
  }
});
