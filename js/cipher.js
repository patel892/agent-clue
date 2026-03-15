/* ================================================================
   Stage 2 — Word Decoder (Unscramble)
   ================================================================ */

const CipherGame = (() => {
  const SOLUTION_WORDS = ['NEW', 'BABY', 'ON', 'THE', 'WAY'];

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
    if (word.length <= 2) {
      // For 2-letter words, just reverse
      return word.split('').reverse();
    }
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
        tile.setAttribute('aria-label', `Letter ${letter}, word ${wordIdx + 1}, position ${letterIdx + 1}`);

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
      // Swap within same word
      const a = selectedTile.letterIdx;
      const b = letterIdx;
      [ws.letters[a], ws.letters[b]] = [ws.letters[b], ws.letters[a]];
      selectedTile.el.classList.remove('selected');
      selectedTile = null;

      // Check if word is now correct
      if (ws.letters.join('') === ws.solution) {
        ws.solved = true;
        solvedCount++;
      }

      renderWords();

      if (solvedCount === SOLUTION_WORDS.length) {
        onComplete();
      }
    } else {
      // Tapped a tile in a different word — switch selection
      selectedTile.el.classList.remove('selected');
      selectedTile = { wordIdx, letterIdx, el: tileEl };
      tileEl.classList.add('selected');
    }
  }

  function onHint() {
    if (hintsUsed >= maxHints) return;

    // Find first unsolved word and fix its first wrong letter
    for (let i = 0; i < wordStates.length; i++) {
      const ws = wordStates[i];
      if (ws.solved) continue;

      // Find the first letter that's in the wrong position
      for (let j = 0; j < ws.letters.length; j++) {
        if (ws.letters[j] !== ws.solution[j]) {
          // Find where the correct letter is and swap it in
          const correctLetter = ws.solution[j];
          const fromIdx = ws.letters.indexOf(correctLetter, j);
          if (fromIdx !== -1) {
            [ws.letters[j], ws.letters[fromIdx]] = [ws.letters[fromIdx], ws.letters[j]];
          }
          break;
        }
      }

      // Check if solved
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
    GameState.stageData.cipher.wordCount = SOLUTION_WORDS.length;

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
