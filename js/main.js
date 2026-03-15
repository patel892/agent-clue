/* ================================================================
   Mission: Classified — Main App Controller
   ================================================================ */

const CONFIG = {
  PERSONAL_MESSAGE: "Love, Sunny & Lina",
  ENABLE_SOUND: false,
  DEBUG_MODE: false
};

// Fragments are stored encoded so the secret is never plaintext in source.
// Each fragment is XOR-masked with a key and stored as char codes.
const FRAGMENT_KEY = 42;
function encodeFragment(str) {
  return Array.from(str).map(c => c.charCodeAt(0) ^ FRAGMENT_KEY);
}
function decodeFragment(codes) {
  return codes.map(c => String.fromCharCode(c ^ FRAGMENT_KEY)).join('');
}

// Pre-encoded fragments (decoded at runtime during reveal)
const ENCODED_FRAGMENTS = {
  memory:  encodeFragment('A'),
  cipher:  encodeFragment('NEW'),
  laser:   encodeFragment('BABY'),
  vault:   encodeFragment('COUSIN')
};

// Reveal message also encoded
const ENCODED_REVEAL_LINE1 = encodeFragment('A NEW BABY IS ON THE WAY!');
const ENCODED_REVEAL_LINE2 = encodeFragment("YOU'RE GETTING A COUSIN!");

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
      // Fill placeholder data for skipped stages
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

function goToStage(targetIndex) {
  const currentSection = document.getElementById(STAGE_IDS[GameState.currentStage]);

  // Destroy current stage module
  const currentModule = STAGE_MODULES[GameState.currentStage];
  if (currentModule && currentModule.destroy) {
    currentModule.destroy();
  }

  // Fade out current
  if (currentSection) {
    currentSection.classList.add('fade-out');
  }

  // Show interstitial (skip for briefing→stage1 and vault→reveal)
  const showInterstitial = GameState.currentStage > 0 && targetIndex < 5;

  const afterFadeOut = () => {
    if (currentSection) {
      currentSection.classList.remove('active', 'fade-out');
    }

    if (showInterstitial) {
      interstitial.classList.add('active');
      setTimeout(() => {
        interstitial.classList.remove('active');
        activateStage(targetIndex);
      }, 1000);
    } else {
      activateStage(targetIndex);
    }
  };

  setTimeout(afterFadeOut, 400);
}

function activateStage(index) {
  showStage(index);

  // Initialize stage module
  const mod = STAGE_MODULES[index];
  if (mod && mod.init) {
    mod.init();
  }

  // Handle reveal stage
  if (index === 5) {
    runReveal();
  }
}

function updateProgressBar(completedStages) {
  const pct = (completedStages / 5) * 100;
  progressFill.style.width = pct + '%';
  progressLevel.textContent = `LEVEL ${completedStages} / 5`;
}

// Called by stage modules when they complete
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
  // Reset visibility
  decryptProgress.style.display = 'flex';
  fragmentAssembly.innerHTML = '';
  fullMessageEl.textContent = '';
  fullMessageEl.classList.remove('visible');
  personalNoteEl.classList.remove('visible');
  revealActions.classList.remove('visible');
  celebrationOverlay.classList.remove('active');
  decryptBarFill.style.width = '0%';

  // Phase 1: Fake decrypt progress bar (~3 seconds)
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

  // If we have no fragments (debug mode), use defaults
  if (fragmentWords.length === 0) {
    fragmentWords.push(
      decodeFragment(ENCODED_FRAGMENTS.memory),
      decodeFragment(ENCODED_FRAGMENTS.cipher),
      decodeFragment(ENCODED_FRAGMENTS.laser),
      decodeFragment(ENCODED_FRAGMENTS.vault)
    );
  }

  // Create word elements
  fragmentWords.forEach(word => {
    const el = document.createElement('span');
    el.className = 'assembly-word';
    el.textContent = word;
    fragmentAssembly.appendChild(el);
  });

  // Reveal one by one with delays
  const wordEls = fragmentAssembly.querySelectorAll('.assembly-word');
  wordEls.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, 600 * (i + 1));
  });

  // After all fragments, show full message
  const totalDelay = 600 * (wordEls.length + 1) + 800;
  setTimeout(() => {
    fragmentAssembly.style.display = 'none';
    showFullMessage();
  }, totalDelay);
}

function showFullMessage() {
  const line1 = decodeFragment(ENCODED_REVEAL_LINE1);
  const line2 = decodeFragment(ENCODED_REVEAL_LINE2);
  fullMessageEl.innerHTML = line1 + '<br>' + line2;

  requestAnimationFrame(() => {
    fullMessageEl.classList.add('visible');
  });

  // Confetti
  setTimeout(() => {
    if (typeof ConfettiEffect !== 'undefined' && ConfettiEffect.init) {
      ConfettiEffect.init();
    }
    celebrationOverlay.classList.add('active');
  }, 600);

  // Personal note
  setTimeout(() => {
    personalNoteEl.textContent = CONFIG.PERSONAL_MESSAGE;
    personalNoteEl.classList.add('visible');
  }, 1500);

  // Action buttons
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

  // Reset briefing
  codenameInput.value = '';
  acceptBtn.disabled = true;
  manilaFolder.classList.remove('closing');
  classifiedStamp.style.animation = 'none';
  void classifiedStamp.offsetHeight;
  classifiedStamp.style.animation = '';
  manilaFolder.style.animation = 'none';
  void manilaFolder.offsetHeight;
  manilaFolder.style.animation = '';

  // Reset reveal
  celebrationOverlay.classList.remove('active');
  fullMessageEl.classList.remove('visible');
  personalNoteEl.classList.remove('visible');
  revealActions.classList.remove('visible');
  fragmentAssembly.style.display = '';

  progressBar.classList.remove('visible');
  showStage(0, false);
}

// Replay button
if (replayBtn) {
  replayBtn.addEventListener('click', resetGame);
}

// Share button
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

// Simple hash so password isn't plaintext in source
function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h;
}
const PASS_HASH = -909711554;
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
  if (simpleHash(val) === PASS_HASH) {
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
      GameState.stageData.cipher.wordCount = 5;
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
