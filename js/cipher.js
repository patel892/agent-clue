/* ================================================================
   Stage 2 — Word Decoder (Unscramble)
   ================================================================ */

const CipherGame = (() => {
  const SOLUTION_WORDS = ['COUSIN'];

  let wordStates = [];
  let solvedCount = 0;
  let hintsUsed = 0;
  let maxHints = 3;
  let selectedTile = null;

  let wordsEl, hintBtn, hintCountEl, completeOverlay, fragmentEl, continueBtn;

  function init() {
    wordsEl         = document.getElementById('unscramble-words');
    hintBtn         = document.getElementById('cipher-hint-btn');
    hintCountEl     = document.getElementById('cipher-hint-count');
    completeOverlay = document.getElementById('cipher-complete');
    fragmentEl      = document.getElementById('cipher-fragment');
    continueBtn     = document.getElementById('cipher-continue-btn');

    wordStates = [];
    solvedCount = 0;
    hintsUsed = 0;
    selectedTile = null;

    hintCountEl.textContent = `(${maxHints})`;
    hintBtn.disabled = false;
    completeOverlay.classList.remove('active');

    SOLUTION_WORDS.forEach(word => {
      wordStates.push({
        solution: word,
        letters: scrambleWord(word),
        solved: false
      });
    });

    renderWords();

    hintBtn.addEventListener('click', onHint);
    continueBtn.addEventListener('click', onContinue);
  }

  function destroy() {
    hintBtn.removeEventListener('click', onHint);
    continueBtn.removeEventListener('click', onContinue);
    wordsEl.innerHTML = '';
  }

  function scrambleWord(word) {
    const arr = word.split('');
    let attempts = 0;
    do {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      attempts++;
    } while (arr.join('') === word && attempts < 20);
    return arr;
  }

  function renderWords() {
    wordsEl.innerHTML = '';
    wordStates.forEach((ws, wordIdx) => {
      const wordRow = document.createElement('div');
      wordRow.className = 'unscramble-word' + (ws.solved ? ' solved' : '');
      wordRow.dataset.wordIdx = wordIdx;

      if (ws.solved) {
        const check = document.createElement('span');
        check.className = 'word-check';
        check.textContent = '✓';
        wordRow.appendChild(check);
      }

      ws.letters.forEach((letter, letterIdx) => {
        const tile = document.createElement('button');
        tile.className = 'unscramble-tile';
        tile.textContent = letter;
        tile.dataset.wordIdx = wordIdx;
        tile.dataset.letterIdx = letterIdx;
        tile.setAttribute('aria-label', `Letter ${letter}, position ${letterIdx + 1}`);

        if (ws.solved) {
          tile.disabled = true;
          tile.classList.add('locked');
        } else {
          tile.addEventListener('click', () => onTileTap(wordIdx, letterIdx, tile));
        }

        wordRow.appendChild(tile);
      });

      wordsEl.appendChild(wordRow);
    });
  }

  function onTileTap(wordIdx, letterIdx, tileEl) {
    const ws = wordStates[wordIdx];
    if (ws.solved) return;

    if (selectedTile === null) {
      selectedTile = { wordIdx, letterIdx, el: tileEl };
      tileEl.classList.add('selected');
    } else if (selectedTile.wordIdx === wordIdx && selectedTile.letterIdx === letterIdx) {
      selectedTile.el.classList.remove('selected');
      selectedTile = null;
    } else if (selectedTile.wordIdx === wordIdx) {
      const a = selectedTile.letterIdx;
      const b = letterIdx;
      [ws.letters[a], ws.letters[b]] = [ws.letters[b], ws.letters[a]];
      selectedTile.el.classList.remove('selected');
      selectedTile = null;

      if (ws.letters.join('') === ws.solution) {
        ws.solved = true;
        solvedCount++;
      }

      renderWords();

      if (solvedCount === SOLUTION_WORDS.length) {
        onComplete();
      }
    } else {
      selectedTile.el.classList.remove('selected');
      selectedTile = { wordIdx, letterIdx, el: tileEl };
      tileEl.classList.add('selected');
    }
  }

  function onHint() {
    if (hintsUsed >= maxHints) return;

    for (let i = 0; i < wordStates.length; i++) {
      const ws = wordStates[i];
      if (ws.solved) continue;

      for (let j = 0; j < ws.letters.length; j++) {
        if (ws.letters[j] !== ws.solution[j]) {
          const correctLetter = ws.solution[j];
          const fromIdx = ws.letters.indexOf(correctLetter, j);
          if (fromIdx !== -1) {
            [ws.letters[j], ws.letters[fromIdx]] = [ws.letters[fromIdx], ws.letters[j]];
          }
          break;
        }
      }

      if (ws.letters.join('') === ws.solution) {
        ws.solved = true;
        solvedCount++;
      }

      break;
    }

    hintsUsed++;
    GameState.stageData.cipher.hintsUsed = hintsUsed;
    hintCountEl.textContent = `(${maxHints - hintsUsed})`;
    if (hintsUsed >= maxHints) hintBtn.disabled = true;

    if (selectedTile) {
      selectedTile.el.classList.remove('selected');
      selectedTile = null;
    }

    renderWords();

    if (solvedCount === SOLUTION_WORDS.length) {
      onComplete();
    }
  }

  function onComplete() {
    GameState.stageData.cipher.completed = true;
    GameState.stageData.cipher.letterCount = SOLUTION_WORDS[0].length;

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
