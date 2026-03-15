/* ================================================================
   Stage 1 — Memory Matrix
   ================================================================ */

const MemoryGame = (() => {
  const PAIRS = [
    { emoji: '🍼', label: 'Unidentified Liquid Container' },
    { emoji: '🧒', label: 'Miniature Asset' },
    { emoji: '🧸', label: 'Surveillance Bear' },
    { emoji: '👶', label: 'New Recruit' },
    { emoji: '🎀', label: 'Signal Ribbon' },
    { emoji: '🧩', label: 'Intel Fragment' },
    { emoji: '🧷', label: 'Micro Fastener' },
    { emoji: '🌙', label: 'Night Ops Symbol' }
  ];

  let cards = [];
  let flippedCards = [];
  let matchedCount = 0;
  let moves = 0;
  let locked = false;
  let shuffled = false;
  let gridEl, movesEl, completeOverlay, ratingEl, fragmentEl, continueBtn;

  function init() {
    gridEl          = document.getElementById('memory-grid');
    movesEl         = document.getElementById('memory-moves');
    completeOverlay = document.getElementById('memory-complete');
    ratingEl        = document.getElementById('memory-rating');
    fragmentEl      = document.getElementById('memory-fragment');
    continueBtn     = document.getElementById('memory-continue-btn');

    cards = [];
    flippedCards = [];
    matchedCount = 0;
    moves = 0;
    locked = false;
    shuffled = false;

    movesEl.textContent = '0';
    completeOverlay.classList.remove('active');
    gridEl.innerHTML = '';

    const deck = buildDeck();
    cards = fisherYatesShuffle(deck);
    renderCards();

    continueBtn.addEventListener('click', onContinue);
  }

  function destroy() {
    continueBtn.removeEventListener('click', onContinue);
    gridEl.innerHTML = '';
  }

  function buildDeck() {
    const deck = [];
    PAIRS.forEach((pair, index) => {
      deck.push({ id: index, ...pair, matched: false });
      deck.push({ id: index, ...pair, matched: false });
    });
    return deck;
  }

  function fisherYatesShuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderCards() {
    gridEl.innerHTML = '';
    cards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.dataset.index = index;
      if (card.matched) cardEl.classList.add('flipped', 'matched');

      cardEl.setAttribute('role', 'button');
      cardEl.setAttribute('aria-label', card.matched
        ? `Card ${index + 1}: ${card.emoji} ${card.label}, matched`
        : `Card ${index + 1}, face down`
      );
      cardEl.setAttribute('tabindex', '0');

      cardEl.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-back">🔒</div>
          <div class="memory-card-face">
            <span class="card-emoji">${card.emoji}</span>
            <span class="card-label">${card.label}</span>
          </div>
        </div>
      `;

      cardEl.addEventListener('click', () => onCardClick(index));
      cardEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick(index);
        }
      });

      gridEl.appendChild(cardEl);
    });
  }

  function onCardClick(index) {
    if (locked) return;
    const card = cards[index];
    if (card.matched) return;
    if (flippedCards.find(f => f.index === index)) return;

    const cardEl = gridEl.children[index];
    cardEl.classList.add('flipped');
    flippedCards.push({ index, card });

    if (flippedCards.length === 2) {
      locked = true;
      moves++;
      movesEl.textContent = moves;
      checkMatch();
    }
  }

  function checkMatch() {
    const [a, b] = flippedCards;

    if (a.card.id === b.card.id) {
      // Match
      cards[a.index].matched = true;
      cards[b.index].matched = true;
      gridEl.children[a.index].classList.add('matched');
      gridEl.children[b.index].classList.add('matched');
      gridEl.children[a.index].setAttribute('aria-label',
        `Card ${a.index + 1}: ${a.card.emoji} ${a.card.label}, matched`);
      gridEl.children[b.index].setAttribute('aria-label',
        `Card ${b.index + 1}: ${b.card.emoji} ${b.card.label}, matched`);

      matchedCount++;
      flippedCards = [];
      locked = false;

      if (matchedCount === 4 && !shuffled) {
        triggerShuffle();
      } else if (matchedCount === PAIRS.length) {
        onComplete();
      }
    } else {
      // Mismatch — flip back after 800ms
      setTimeout(() => {
        gridEl.children[a.index].classList.remove('flipped');
        gridEl.children[b.index].classList.remove('flipped');
        flippedCards = [];
        locked = false;
      }, 800);
    }
  }

  function triggerShuffle() {
    shuffled = true;
    locked = true;

    const warning = document.getElementById('shuffle-warning');
    warning.classList.add('active');

    setTimeout(() => {
      // Collect unmatched cards and their positions
      const unmatchedIndices = [];
      const unmatchedCards = [];
      cards.forEach((card, i) => {
        if (!card.matched) {
          unmatchedIndices.push(i);
          unmatchedCards.push({ ...card });
        }
      });

      // Shuffle unmatched cards
      const shuffledUnmatched = fisherYatesShuffle(unmatchedCards);

      // Place shuffled cards back
      unmatchedIndices.forEach((pos, i) => {
        cards[pos] = shuffledUnmatched[i];
      });

      // Re-render to apply new positions
      renderCards();
      warning.classList.remove('active');
      locked = false;
    }, 1500);
  }

  function onComplete() {
    GameState.stageData.memory.moves = moves;
    GameState.stageData.memory.completed = true;

    if (typeof completeStage === 'function') {
      completeStage('memory');
    }

    // Calculate rating
    let stars;
    if (moves <= 12) stars = '★★★';
    else if (moves <= 18) stars = '★★☆';
    else stars = '★☆☆';

    ratingEl.textContent = `EFFICIENCY RATING: ${stars}`;
    fragmentEl.textContent = decodeFragment(ENCODED_FRAGMENTS.memory);

    setTimeout(() => {
      completeOverlay.classList.add('active');
    }, 600);
  }

  function onContinue() {
    completeOverlay.classList.remove('active');
    if (typeof advanceFromStage === 'function') {
      advanceFromStage('memory');
    }
  }

  return { init, destroy };
})();
