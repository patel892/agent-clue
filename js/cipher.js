/* ================================================================
   Stage 2 — Code Breaker (Substitution Cipher)
   ================================================================ */

const CipherGame = (() => {
  // The secret phrase and its unique letters
  const PHRASE_WORDS = ['NEW', 'BABY', 'ON', 'THE', 'WAY'];
  const UNIQUE_LETTERS = ['N', 'E', 'W', 'B', 'A', 'Y', 'O', 'T', 'H'];

  // Symbols used for each letter (deterministic mapping)
  const SYMBOLS = ['★', '◆', '▲', '●', '■', '✦', '◎', '△', '⬡'];

  const LETTER_TO_SYMBOL = {};
  const SYMBOL_TO_LETTER = {};
  UNIQUE_LETTERS.forEach((letter, i) => {
    LETTER_TO_SYMBOL[letter] = SYMBOLS[i];
    SYMBOL_TO_LETTER[SYMBOLS[i]] = letter;
  });

  // Free hint: ★ = N
  const FREE_SYMBOL = '★';
  const FREE_LETTER = 'N';

  let assignments = {};     // symbol → letter (player's assignments)
  let solvedCount = 0;
  let hintsUsed = 0;
  let maxHints = 2;
  let freqUsed = false;
  let selectedSymbol = null;

  let messageEl, keyGridEl, alphabetEl, freqBtn, hintBtn, hintCountEl;
  let freqPanel, completeOverlay, fragmentEl, continueBtn, freeHintEl;

  function init() {
    messageEl       = document.getElementById('cipher-message');
    keyGridEl       = document.getElementById('cipher-key-grid');
    alphabetEl      = document.getElementById('cipher-alphabet');
    freqBtn         = document.getElementById('cipher-freq-btn');
    hintBtn         = document.getElementById('cipher-hint-btn');
    hintCountEl     = document.getElementById('cipher-hint-count');
    freqPanel       = document.getElementById('frequency-panel');
    completeOverlay = document.getElementById('cipher-complete');
    fragmentEl      = document.getElementById('cipher-fragment');
    continueBtn     = document.getElementById('cipher-continue-btn');
    freeHintEl      = document.getElementById('cipher-free-hint');

    assignments = {};
    solvedCount = 0;
    hintsUsed = 0;
    freqUsed = false;
    selectedSymbol = null;

    // Apply free hint
    assignments[FREE_SYMBOL] = FREE_LETTER;
    solvedCount = 1;

    freeHintEl.textContent = `The symbol ${FREE_SYMBOL} = ${FREE_LETTER}`;
    hintCountEl.textContent = `(${maxHints})`;
    completeOverlay.classList.remove('active');
    freqPanel.classList.remove('active');

    renderMessage();
    renderKeyGrid();
    renderAlphabet();

    freqBtn.addEventListener('click', onFrequencyAnalysis);
    hintBtn.addEventListener('click', onHint);
    continueBtn.addEventListener('click', onContinue);

    freqBtn.disabled = false;
    hintBtn.disabled = false;
  }

  function destroy() {
    freqBtn.removeEventListener('click', onFrequencyAnalysis);
    hintBtn.removeEventListener('click', onHint);
    continueBtn.removeEventListener('click', onContinue);
    messageEl.innerHTML = '';
    keyGridEl.innerHTML = '';
    alphabetEl.innerHTML = '';
    freqPanel.innerHTML = '';
  }

  // --- Rendering ---

  function renderMessage() {
    messageEl.innerHTML = '';
    PHRASE_WORDS.forEach(word => {
      const wordEl = document.createElement('div');
      wordEl.className = 'cipher-word';

      Array.from(word).forEach(letter => {
        const symbol = LETTER_TO_SYMBOL[letter];
        const slot = document.createElement('div');
        slot.className = 'cipher-slot';
        slot.dataset.symbol = symbol;
        slot.dataset.letter = letter;

        const symSpan = document.createElement('span');
        symSpan.className = 'symbol';
        symSpan.textContent = symbol;

        const decoded = document.createElement('span');
        decoded.className = 'decoded-letter';

        if (assignments[symbol] === letter) {
          decoded.textContent = letter;
          slot.classList.add('correct');
        }

        slot.appendChild(symSpan);
        slot.appendChild(decoded);
        wordEl.appendChild(slot);
      });

      messageEl.appendChild(wordEl);
    });
  }

  function renderKeyGrid() {
    keyGridEl.innerHTML = '';
    SYMBOLS.forEach(symbol => {
      const tile = document.createElement('div');
      tile.className = 'cipher-key-tile';
      tile.dataset.symbol = symbol;

      if (assignments[symbol]) {
        tile.classList.add('solved');
      }

      const symSpan = document.createElement('span');
      symSpan.className = 'key-symbol';
      symSpan.textContent = symbol;

      const arrow = document.createElement('span');
      arrow.className = 'key-arrow';
      arrow.textContent = '→';

      const letterSpan = document.createElement('span');
      letterSpan.className = 'key-letter';
      letterSpan.textContent = assignments[symbol] || '_';

      tile.appendChild(symSpan);
      tile.appendChild(arrow);
      tile.appendChild(letterSpan);

      if (!assignments[symbol]) {
        tile.addEventListener('click', () => selectSymbol(symbol, tile));
        tile.setAttribute('role', 'button');
        tile.setAttribute('tabindex', '0');
        tile.setAttribute('aria-label', `Symbol ${symbol}, unassigned`);
        tile.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectSymbol(symbol, tile);
          }
        });
      } else {
        tile.setAttribute('aria-label', `Symbol ${symbol} = ${assignments[symbol]}`);
      }

      keyGridEl.appendChild(tile);
    });
  }

  function renderAlphabet() {
    alphabetEl.innerHTML = '';
    const usedLetters = new Set(Object.values(assignments));

    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
      const btn = document.createElement('button');
      btn.className = 'cipher-letter-btn';
      btn.textContent = letter;
      btn.dataset.letter = letter;
      btn.setAttribute('aria-label', `Letter ${letter}`);

      if (usedLetters.has(letter)) {
        btn.classList.add('used');
        btn.disabled = true;
      }

      btn.addEventListener('click', () => onLetterSelect(letter));
      alphabetEl.appendChild(btn);
    });
  }

  // --- Interactions ---

  function selectSymbol(symbol, tileEl) {
    if (assignments[symbol]) return;

    // Deselect previous
    keyGridEl.querySelectorAll('.cipher-key-tile.selected').forEach(el => {
      el.classList.remove('selected');
    });

    selectedSymbol = symbol;
    tileEl.classList.add('selected');
  }

  function onLetterSelect(letter) {
    if (!selectedSymbol) return;
    if (assignments[selectedSymbol]) return;

    const usedLetters = new Set(Object.values(assignments));
    if (usedLetters.has(letter)) return;

    const correctLetter = SYMBOL_TO_LETTER[selectedSymbol];

    if (letter === correctLetter) {
      assignments[selectedSymbol] = letter;
      solvedCount++;
      selectedSymbol = null;

      renderMessage();
      renderKeyGrid();
      renderAlphabet();

      if (solvedCount === UNIQUE_LETTERS.length) {
        onComplete();
      }
    } else {
      // Wrong — flash red on message slots with this symbol
      const slots = messageEl.querySelectorAll(`[data-symbol="${selectedSymbol}"]`);
      slots.forEach(slot => {
        slot.classList.add('wrong');
        setTimeout(() => slot.classList.remove('wrong'), 400);
      });
    }
  }

  function onFrequencyAnalysis() {
    if (freqUsed) return;
    freqUsed = true;
    freqBtn.disabled = true;

    // Count symbol frequency across the full phrase
    const fullPhrase = PHRASE_WORDS.join('');
    const freq = {};
    SYMBOLS.forEach(s => { freq[s] = 0; });
    Array.from(fullPhrase).forEach(letter => {
      const sym = LETTER_TO_SYMBOL[letter];
      if (sym) freq[sym]++;
    });

    const maxFreq = Math.max(...Object.values(freq));

    freqPanel.innerHTML = '';
    SYMBOLS.forEach(symbol => {
      const row = document.createElement('div');
      row.className = 'freq-row';

      const symEl = document.createElement('span');
      symEl.className = 'freq-symbol';
      symEl.textContent = symbol;

      const barWrapper = document.createElement('div');
      barWrapper.style.flex = '1';

      const bar = document.createElement('div');
      bar.className = 'freq-bar';
      bar.style.width = '0%';

      const countEl = document.createElement('span');
      countEl.className = 'freq-count';
      countEl.textContent = freq[symbol];

      barWrapper.appendChild(bar);
      row.appendChild(symEl);
      row.appendChild(barWrapper);
      row.appendChild(countEl);
      freqPanel.appendChild(row);

      // Animate bars
      requestAnimationFrame(() => {
        bar.style.width = ((freq[symbol] / maxFreq) * 100) + '%';
      });
    });

    freqPanel.classList.add('active');
  }

  function onHint() {
    if (hintsUsed >= maxHints) return;

    // Find an unsolved symbol
    const unsolved = SYMBOLS.find(s => !assignments[s]);
    if (!unsolved) return;

    const correctLetter = SYMBOL_TO_LETTER[unsolved];
    assignments[unsolved] = correctLetter;
    solvedCount++;
    hintsUsed++;

    GameState.stageData.cipher.hintsUsed = hintsUsed;
    hintCountEl.textContent = `(${maxHints - hintsUsed})`;
    if (hintsUsed >= maxHints) hintBtn.disabled = true;

    renderMessage();
    renderKeyGrid();
    renderAlphabet();

    if (solvedCount === UNIQUE_LETTERS.length) {
      onComplete();
    }
  }

  function onComplete() {
    GameState.stageData.cipher.completed = true;

    if (typeof completeStage === 'function') {
      completeStage('cipher');
    }

    fragmentEl.textContent = decodeFragment(ENCODED_FRAGMENTS.cipher);

    setTimeout(() => {
      completeOverlay.classList.add('active');
    }, 600);
  }

  function onContinue() {
    completeOverlay.classList.remove('active');
    if (typeof advanceFromStage === 'function') {
      advanceFromStage('cipher');
    }
  }

  return { init, destroy };
})();
