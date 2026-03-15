/* ================================================================
   Mission: Classified — Main App Controller
   ================================================================ */

const CONFIG = {
  PERSONAL_MESSAGE: "Love, Sunnymasa & Lilly",
  ENABLE_SOUND: false,
  DEBUG_MODE: false
};

// Fragments are stored encoded so the secret is never plaintext in source.
const FRAGMENT_KEY = 42;
function encodeFragment(str) {
  return Array.from(str).map(c => c.charCodeAt(0) ^ FRAGMENT_KEY);
}
function decodeFragment(codes) {
  return codes.map(c => String.fromCharCode(c ^ FRAGMENT_KEY)).join('');
}

// Pre-encoded fragments (decoded at runtime during reveal)
const ENCODED_FRAGMENTS = {
  memory:  encodeFragment('NEW RECRUIT'),
  cipher:  encodeFragment('COUSIN'),
  laser:   encodeFragment('BABY'),
  vault:   encodeFragment('OCTOBER 20')
};

// Reveal message also encoded
const ENCODED_REVEAL_LINE1 = encodeFragment('A NEW AGENT IS JOINING THE SQUAD!');
const ENCODED_REVEAL_LINE2 = encodeFragment('YOUR BABY COUSIN ARRIVES OCTOBER 20TH!');

const GameState = {
  agentName: '',
  currentStage: 0,
  fragments: [],
  stageData: {
    memory:  { moves: 0, completed: false },
    cipher:  { hintsUsed: 0, completed: false },
    laser:   { attempts: 0, completed: false, gridSize: 6 },
    vault:   { attempts: 0, completed: false }
  }
};

const STAGE_IDS = [
  'stage-briefing',
  'stage-memory',
  'stage-cipher',
  'stage-laser',
  'stage-vault',
  'stage-reveal'
];

const STAGE_MODULES = [null, MemoryGame, CipherGame, LaserGame, VaultGame, null];

// --- DOM refs ---
const progressBar     = document.getElementById('progress-bar');
const progressFill    = document.getElementById('progress-fill');
const progressLevel   = document.getElementById('progress-level');
const interstitial    = document.getElementById('interstitial');
const debugPanel      = document.getElementById('debug-panel');
const debugSelect     = document.getElementById('debug-stage-select');
const debugGoBtn      = document.getElementById('debug-go-btn');

// --- Briefing refs ---
const codenameInput   = document.getElementById('codename-input');
const acceptBtn       = document.getElementById('accept-mission-btn');
const classifiedStamp = document.getElementById('classified-stamp');
const manilaFolder    = document.getElementById('manila-folder');

// --- Reveal refs ---
const decryptProgress   = document.getElementById('decrypt-progress');
const decryptBarFill    = document.getElementById('decrypt-bar-fill');
const fragmentAssembly  = document.getElementById('fragment-assembly');
const fullMessageEl     = document.getElementById('full-message');
const personalNoteEl    = document.getElementById('personal-note');
const revealActions     = document.getElementById('reveal-actions');
const celebrationOverlay = document.getElementById('celebration-overlay');
const replayBtn         = document.getElementById('replay-btn');
const shareBtn          = document.getElementById('share-btn');

// ---- Initialization ----

function init() {
  if (CONFIG.DEBUG_MODE) {
    debugPanel.classList.add('visible');
    debugGoBtn.addEventListener('click', () => {
      const target = parseInt(debugSelect.value, 10);
      GameState.agentName = GameState.agentName || 'DEBUG';
      if (target >= 1) GameState.stageData.memory.completed = true;
      if (target >= 2) GameState.stageData.cipher.completed = true;
      if (target >= 3) {
        GameState.stageData.laser.completed = true;
        GameState.stageData.laser.gridSize = getGridSize();
      }
      if (target >= 4) GameState.stageData.vault.completed = true;
      goToStage(target);
    });
  }

  setupBriefing();
  showStage(0, false);
}

// ---- Briefing (Stage 0) ----

function setupBriefing() {
  codenameInput.addEventListener('input', () => {
    acceptBtn.disabled = codenameInput.value.trim().length === 0;
  });

  acceptBtn.addEventListener('click', acceptMission);

  codenameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && codenameInput.value.trim().length > 0) {
      acceptMission();
    }
  });
}

function acceptMission() {
  if (acceptBtn.disabled) return;
  GameState.agentName = codenameInput.value.trim().toUpperCase();
  manilaFolder.classList.add('closing');

  setTimeout(() => {
    goToStage(1);
  }, 500);
}

// ---- Stage Management ----

function showStage(index, animate = true) {
  STAGE_IDS.forEach((id, i) => {
    const section = document.getElementById(id);
    if (i === index) {
      section.classList.add('active');
      section.classList.remove('fade-out');
    } else {
      section.classList.remove('active');
    }
  });

  GameState.currentStage = index;

  if (index > 0 && index < 6) {
    progressBar.classList.add('visible');
    updateProgressBar(index - 1);
  } else if (index === 0) {
    progressBar.classList.remove('visible');
  }
}

const STAGE_INTROS = {
  1: 'Our analysts have flagged suspicious activity in the evidence vault. <span class="story-highlight">Match the classified files</span> to unlock the first layer of intel on the new recruit.',
  2: 'Good work, Agent. We intercepted a coded transmission — a single word that reveals the recruit\'s relationship to The Squad. <span class="story-highlight">Unscramble it.</span>',
  3: 'Intel confirmed — the recruit is a <span class="story-highlight">cousin</span>. Now retrieve the supply kit and deliver it through the laser grid to the new arrival.',
  4: 'Almost there, Agent. The recruit\'s <span class="story-highlight">arrival date</span> is locked in the vault. Use what you\'ve learned to crack the code.'
};

const interstitialStory = document.getElementById('interstitial-story');

function goToStage(targetIndex) {
  const currentSection = document.getElementById(STAGE_IDS[GameState.currentStage]);

  const currentModule = STAGE_MODULES[GameState.currentStage];
  if (currentModule && currentModule.destroy) {
    currentModule.destroy();
  }

  if (currentSection) {
    currentSection.classList.add('fade-out');
  }

  const hasStory = !!STAGE_INTROS[targetIndex] && targetIndex < 5;
  const showInterstitial = hasStory || (GameState.currentStage > 0 && targetIndex < 5);

  const afterFadeOut = () => {
    if (currentSection) {
      currentSection.classList.remove('active', 'fade-out');
    }

    if (showInterstitial) {
      if (hasStory) {
        interstitialStory.innerHTML = STAGE_INTROS[targetIndex];
        interstitialStory.style.display = '';
      } else {
        interstitialStory.style.display = 'none';
      }
      interstitialStory.classList.remove('visible');

      interstitial.classList.add('active');

      setTimeout(() => {
        interstitialStory.classList.add('visible');
      }, 100);

      const storyDuration = hasStory ? 3200 : 1000;
      setTimeout(() => {
        interstitial.classList.remove('active');
        interstitialStory.classList.remove('visible');
        activateStage(targetIndex);
      }, storyDuration);
    } else {
      activateStage(targetIndex);
    }
  };

  setTimeout(afterFadeOut, 400);
}

function activateStage(index) {
  showStage(index);

  const mod = STAGE_MODULES[index];
  if (mod && mod.init) {
    mod.init();
  }

  if (index === 5) {
    runReveal();
  }
}

function updateProgressBar(completedStages) {
  const pct = (completedStages / 5) * 100;
  progressFill.style.width = pct + '%';
  progressLevel.textContent = `LEVEL ${completedStages} / 5`;
}

function completeStage(stageName) {
  const fragmentCodes = ENCODED_FRAGMENTS[stageName];
  if (fragmentCodes) {
    GameState.fragments.push(fragmentCodes);
  }

  const stageIndex = { memory: 1, cipher: 2, laser: 3, vault: 4 }[stageName];
  if (stageIndex) {
    updateProgressBar(stageIndex);
  }
}

function advanceFromStage(currentStageName) {
  const nextMap = { memory: 2, cipher: 3, laser: 4, vault: 5 };
  const nextIndex = nextMap[currentStageName];
  if (nextIndex !== undefined) {
    goToStage(nextIndex);
  }
}

// ---- Grid Size Helper ----

function getGridSize() {
  return window.innerWidth >= 768 ? 8 : 6;
}

// ---- Reveal (Stage 5) ----

function runReveal() {
  decryptProgress.style.display = 'flex';
  fragmentAssembly.innerHTML = '';
  fullMessageEl.textContent = '';
  fullMessageEl.classList.remove('visible');
  personalNoteEl.classList.remove('visible');
  revealActions.classList.remove('visible');
  celebrationOverlay.classList.remove('active');
  decryptBarFill.style.width = '0%';

  let progress = 0;
  const decryptInterval = setInterval(() => {
    progress += 2;
    decryptBarFill.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(decryptInterval);
      decryptProgress.style.display = 'none';
      showFragments();
    }
  }, 60);
}

function showFragments() {
  const fragmentWords = GameState.fragments.map(f => decodeFragment(f));

  if (fragmentWords.length === 0) {
    fragmentWords.push(
      decodeFragment(ENCODED_FRAGMENTS.memory),
      decodeFragment(ENCODED_FRAGMENTS.cipher),
      decodeFragment(ENCODED_FRAGMENTS.laser),
      decodeFragment(ENCODED_FRAGMENTS.vault)
    );
  }

  fragmentWords.forEach(word => {
    const el = document.createElement('span');
    el.className = 'assembly-word';
    el.textContent = word;
    fragmentAssembly.appendChild(el);
  });

  const wordEls = fragmentAssembly.querySelectorAll('.assembly-word');
  wordEls.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, 800 * (i + 1));
  });

  const totalDelay = 800 * (wordEls.length + 1) + 1000;
  setTimeout(() => {
    fragmentAssembly.style.display = 'none';
    showFullMessage();
  }, totalDelay);
}

function showFullMessage() {
  const line1 = decodeFragment(ENCODED_REVEAL_LINE1);
  const line2 = decodeFragment(ENCODED_REVEAL_LINE2);
  fullMessageEl.innerHTML = line1 + '<br><br>' + line2;

  requestAnimationFrame(() => {
    fullMessageEl.classList.add('visible');
  });

  setTimeout(() => {
    if (typeof ConfettiEffect !== 'undefined' && ConfettiEffect.init) {
      ConfettiEffect.init();
    }
    celebrationOverlay.classList.add('active');
  }, 600);

  setTimeout(() => {
    personalNoteEl.textContent = CONFIG.PERSONAL_MESSAGE;
    personalNoteEl.classList.add('visible');
  }, 1500);

  setTimeout(() => {
    revealActions.classList.add('visible');
  }, 2000);
}

// ---- Replay & Share ----

function resetGame() {
  GameState.agentName = '';
  GameState.currentStage = 0;
  GameState.fragments = [];
  GameState.stageData.memory  = { moves: 0, completed: false };
  GameState.stageData.cipher  = { hintsUsed: 0, completed: false };
  GameState.stageData.laser   = { attempts: 0, completed: false, gridSize: 6 };
  GameState.stageData.vault   = { attempts: 0, completed: false };

  if (typeof ConfettiEffect !== 'undefined' && ConfettiEffect.destroy) {
    ConfettiEffect.destroy();
  }

  codenameInput.value = '';
  acceptBtn.disabled = true;
  manilaFolder.classList.remove('closing');
  classifiedStamp.style.animation = 'none';
  void classifiedStamp.offsetHeight;
  classifiedStamp.style.animation = '';
  manilaFolder.style.animation = 'none';
  void manilaFolder.offsetHeight;
  manilaFolder.style.animation = '';

  celebrationOverlay.classList.remove('active');
  fullMessageEl.classList.remove('visible');
  personalNoteEl.classList.remove('visible');
  revealActions.classList.remove('visible');
  fragmentAssembly.style.display = '';

  progressBar.classList.remove('visible');
  showStage(0, false);
}

if (replayBtn) {
  replayBtn.addEventListener('click', resetGame);
}

if (shareBtn) {
  shareBtn.addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        shareBtn.textContent = 'LINK COPIED!';
        setTimeout(() => { shareBtn.textContent = 'SHARE'; }, 2000);
      });
    }
  });
}

// ---- Secret Skip Menu ----

const secretTrigger  = document.getElementById('secret-trigger');
const secretModal    = document.getElementById('secret-modal');
const secretClose    = document.getElementById('secret-close');
const secretAuth     = document.getElementById('secret-auth');
const secretNav      = document.getElementById('secret-nav');
const secretPassword = document.getElementById('secret-password');
const secretSubmit   = document.getElementById('secret-submit');
const secretError    = document.getElementById('secret-error');

const ENCODED_PASS = encodeFragment('salina');
let secretUnlocked = false;

secretTrigger.addEventListener('click', () => {
  secretModal.classList.add('active');
  if (secretUnlocked) {
    secretAuth.style.display = 'none';
    secretNav.classList.add('active');
  } else {
    secretAuth.style.display = 'flex';
    secretNav.classList.remove('active');
    secretPassword.value = '';
    secretError.classList.remove('visible');
    setTimeout(() => secretPassword.focus(), 100);
  }
});

secretClose.addEventListener('click', () => {
  secretModal.classList.remove('active');
});

secretModal.addEventListener('click', (e) => {
  if (e.target === secretModal) secretModal.classList.remove('active');
});

function trySecretAuth() {
  const val = secretPassword.value.trim().toLowerCase();
  if (val === decodeFragment(ENCODED_PASS)) {
    secretUnlocked = true;
    secretAuth.style.display = 'none';
    secretNav.classList.add('active');
  } else {
    secretError.classList.remove('visible');
    void secretError.offsetHeight;
    secretError.classList.add('visible');
  }
}

secretSubmit.addEventListener('click', trySecretAuth);
secretPassword.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') trySecretAuth();
});

document.querySelectorAll('.secret-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = parseInt(btn.dataset.target, 10);
    secretModal.classList.remove('active');

    if (!GameState.agentName) GameState.agentName = 'AGENT';
    if (target >= 1) GameState.stageData.memory.completed = true;
    if (target >= 2) {
      GameState.stageData.cipher.completed = true;
      GameState.stageData.cipher.letterCount = 6;
    }
    if (target >= 3) {
      GameState.stageData.laser.completed = true;
      GameState.stageData.laser.gridSize = getGridSize();
    }
    if (target >= 4) GameState.stageData.vault.completed = true;

    goToStage(target);
  });
});

// ---- Boot ----
document.addEventListener('DOMContentLoaded', init);
