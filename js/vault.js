/* ================================================================
   Stage 4 — The Vault (Combination Lock)
   ================================================================ */

const VaultGame = (() => {
  let dials = [0, 0, 0, 0];
  let attempts = 0;
  let completed = false;

  let dialsEl, crackBtn, attemptsEl, cluesEl, vaultDoor;
  let logBtn, logModal, logCloseBtn, logContent;
  let completeOverlay, fragmentEl, continueBtn, dossier;

  const CLUES = [
    {
      label: 'Protocol Alpha',
      text: 'The Matrix held 16 classified files, but every file had a twin hiding in the deck. The number of unique identities — not the total files — is your first digit.',
      clarification: '(16 cards total. Each item appeared twice. 16 ÷ 2 = ?)'
    },
    {
      label: 'Protocol Bravo',
      text: 'Five words emerged from the cipher. Among them, the most common word length appeared more than once. How many words shared that most common length? That count is your second digit.',
      clarification: '(Word lengths in the decoded message: 3, 4, 2, 3, 3. Which length is most common? How many words have it?)'
    },
    {
      label: 'Protocol Charlie',
      text: 'The cipher masked its message behind unique symbols — one per letter. But your intel briefing cracked one before you even started. The number of symbols you decoded yourself matches a digit you\'ve already found.',
      clarification: '(9 unique symbols total. 1 was given free. 9 − 1 = ?)'
    },
    {
      label: 'Protocol Delta',
      text: 'The laser field was a perfect square. But here\'s the catch — was the grid you navigated the same dimensions as Alpha? Or did the field adapt to your screen? Trust your own eyes, Agent.',
      clarification: '(How many rows did YOUR laser grid have? Check the Mission Log if you aren\'t sure.)'
    }
  ];

  function init() {
    dialsEl         = document.getElementById('vault-dials');
    crackBtn        = document.getElementById('vault-crack-btn');
    attemptsEl      = document.getElementById('vault-attempts');
    cluesEl         = document.getElementById('vault-clues');
    vaultDoor       = document.getElementById('vault-door');
    logBtn          = document.getElementById('vault-log-btn');
    logModal        = document.getElementById('mission-log-modal');
    logCloseBtn     = document.getElementById('mission-log-close');
    logContent      = document.getElementById('mission-log-content');
    completeOverlay = document.getElementById('vault-complete');
    fragmentEl      = document.getElementById('vault-fragment');
    continueBtn     = document.getElementById('vault-continue-btn');
    dossier         = document.getElementById('vault-dossier');

    dials = [0, 0, 0, 0];
    attempts = 0;
    completed = false;

    attemptsEl.textContent = '';
    vaultDoor.classList.remove('open', 'wrong-attempt');
    completeOverlay.classList.remove('active');
    logModal.classList.remove('active');
    dossier.classList.remove('show-hints');

    renderDials();
    renderClues();

    crackBtn.addEventListener('click', onCrack);
    logBtn.addEventListener('click', showMissionLog);
    logCloseBtn.addEventListener('click', closeMissionLog);
    continueBtn.addEventListener('click', onContinue);
  }

  function destroy() {
    crackBtn.removeEventListener('click', onCrack);
    logBtn.removeEventListener('click', showMissionLog);
    logCloseBtn.removeEventListener('click', closeMissionLog);
    continueBtn.removeEventListener('click', onContinue);
    dialsEl.innerHTML = '';
    cluesEl.innerHTML = '';
  }

  function renderDials() {
    dialsEl.innerHTML = '';
    dials.forEach((value, index) => {
      const dialWrapper = document.createElement('div');
      dialWrapper.className = 'vault-dial';

      const upBtn = document.createElement('button');
      upBtn.className = 'dial-btn';
      upBtn.textContent = '▲';
      upBtn.setAttribute('aria-label', `Dial ${index + 1} up`);

      const display = document.createElement('div');
      display.className = 'dial-display';
      display.textContent = value;
      display.id = `dial-display-${index}`;

      const downBtn = document.createElement('button');
      downBtn.className = 'dial-btn';
      downBtn.textContent = '▼';
      downBtn.setAttribute('aria-label', `Dial ${index + 1} down`);

      upBtn.addEventListener('click', () => adjustDial(index, 1));
      downBtn.addEventListener('click', () => adjustDial(index, -1));

      // Touch swipe support
      let touchStartY = 0;
      display.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      display.addEventListener('touchend', (e) => {
        const dy = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(dy) > 20) {
          adjustDial(index, dy > 0 ? 1 : -1);
        }
      });

      dialWrapper.appendChild(upBtn);
      dialWrapper.appendChild(display);
      dialWrapper.appendChild(downBtn);
      dialsEl.appendChild(dialWrapper);
    });
  }

  function adjustDial(index, delta) {
    if (completed) return;
    dials[index] = (dials[index] + delta + 10) % 10;
    const display = document.getElementById(`dial-display-${index}`);
    if (display) display.textContent = dials[index];
  }

  function renderClues() {
    cluesEl.innerHTML = '';
    CLUES.forEach(clue => {
      const el = document.createElement('p');
      el.className = 'dossier-clue';
      el.innerHTML = `<span class="clue-label">${clue.label}</span> — ${clue.text} <span class="clue-clarification">${clue.clarification}</span>`;
      cluesEl.appendChild(el);
    });
  }

  function getCorrectCode() {
    return [
      8,
      3,
      8,
      GameState.stageData.laser.gridSize || 8
    ];
  }

  function onCrack() {
    if (completed) return;

    const correct = getCorrectCode();
    const isCorrect = dials.every((d, i) => d === correct[i]);

    if (isCorrect) {
      completed = true;
      onComplete();
    } else {
      attempts++;
      GameState.stageData.vault.attempts = attempts;
      attemptsEl.textContent = `ATTEMPT ${attempts}/∞`;

      vaultDoor.classList.add('wrong-attempt');
      setTimeout(() => vaultDoor.classList.remove('wrong-attempt'), 500);

      // After 3 wrong attempts, show clarifications
      if (attempts >= 3) {
        dossier.classList.add('show-hints');
      }
    }
  }

  function onComplete() {
    GameState.stageData.vault.completed = true;
    GameState.stageData.vault.attempts = attempts;

    if (typeof completeStage === 'function') {
      completeStage('vault');
    }

    // Vault door open animation
    vaultDoor.classList.add('open');

    fragmentEl.textContent = decodeFragment(ENCODED_FRAGMENTS.vault);

    setTimeout(() => {
      completeOverlay.classList.add('active');
    }, 1000);
  }

  function showMissionLog() {
    logContent.innerHTML = '';

    const entries = [
      { label: 'Mission 1 — Memory Matrix', items: [
        `Evidence pairs matched: <span class="log-value">${GameState.stageData.memory.completed ? 8 : '???'}</span>`,
        `Attempts: <span class="log-value">${GameState.stageData.memory.moves}</span>`
      ]},
      { label: 'Mission 2 — Code Breaker', items: [
        `Decoded phrase: <span class="log-value">${GameState.stageData.cipher.completed ? 'NEW BABY ON THE WAY' : '???'}</span>`,
        `Unique symbols: <span class="log-value">9</span>`,
        `Free hints given: <span class="log-value">1</span>`,
        `Hints used: <span class="log-value">${GameState.stageData.cipher.hintsUsed}</span>`
      ]},
      { label: 'Mission 3 — Laser Grid', items: [
        `Grid size: <span class="log-value">${GameState.stageData.laser.gridSize}×${GameState.stageData.laser.gridSize}</span>`,
        `Strikes: <span class="log-value">${GameState.stageData.laser.attempts}</span>`
      ]}
    ];

    entries.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'log-entry';
      div.innerHTML = `<p class="log-label">${entry.label}</p>` +
        entry.items.map(item => `<p>${item}</p>`).join('');
      logContent.appendChild(div);
    });

    logModal.classList.add('active');
  }

  function closeMissionLog() {
    logModal.classList.remove('active');
  }

  function onContinue() {
    completeOverlay.classList.remove('active');
    if (typeof advanceFromStage === 'function') {
      advanceFromStage('vault');
    }
  }

  return { init, destroy };
})();
