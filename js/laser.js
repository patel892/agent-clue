/* ================================================================
   Stage 3 — Laser Grid (Path Puzzle)
   ================================================================ */

const LaserGame = (() => {
  let gridSize = 6;
  let grid = [];           // 2D array: each cell = { laser: null | { dir, cycle }, active: bool }
  let playerPos = { row: 0, col: 0 };
  let goalPos = {};
  let strikes = 0;
  let scansLeft = 2;
  let scanning = false;
  let intervals = [];
  let completed = false;

  let gridEl, strikesEl, scanBtn, scanCountEl, detectedFlash;
  let completeOverlay, fragmentEl, continueBtn;

  // Laser layouts — pre-designed for solvability
  const LASER_CONFIGS = {
    6: [
      { row: 0, col: 2, dir: 'h', cycle: 1 },
      { row: 1, col: 1, dir: 'v', cycle: 2 },
      { row: 1, col: 4, dir: 'h', cycle: 1 },
      { row: 2, col: 3, dir: 'v', cycle: 2 },
      { row: 3, col: 0, dir: 'h', cycle: 1 },
      { row: 3, col: 2, dir: 'v', cycle: 1 },
      { row: 4, col: 4, dir: 'h', cycle: 2 },
      { row: 4, col: 1, dir: 'v', cycle: 1 },
      { row: 5, col: 3, dir: 'h', cycle: 2 },
    ],
    8: [
      { row: 0, col: 3, dir: 'h', cycle: 1 },
      { row: 1, col: 1, dir: 'v', cycle: 2 },
      { row: 1, col: 5, dir: 'h', cycle: 1 },
      { row: 2, col: 3, dir: 'v', cycle: 2 },
      { row: 2, col: 6, dir: 'h', cycle: 1 },
      { row: 3, col: 2, dir: 'h', cycle: 2 },
      { row: 3, col: 4, dir: 'v', cycle: 1 },
      { row: 4, col: 1, dir: 'h', cycle: 1 },
      { row: 4, col: 6, dir: 'v', cycle: 2 },
      { row: 5, col: 3, dir: 'h', cycle: 2 },
      { row: 5, col: 5, dir: 'v', cycle: 1 },
      { row: 6, col: 2, dir: 'v', cycle: 2 },
      { row: 6, col: 4, dir: 'h', cycle: 1 },
      { row: 7, col: 6, dir: 'h', cycle: 2 },
    ]
  };

  function init() {
    gridEl          = document.getElementById('laser-grid');
    strikesEl       = document.getElementById('laser-strikes');
    scanBtn         = document.getElementById('laser-scan-btn');
    scanCountEl     = document.getElementById('laser-scan-count');
    detectedFlash   = document.getElementById('detected-flash');
    completeOverlay = document.getElementById('laser-complete');
    fragmentEl      = document.getElementById('laser-fragment');
    continueBtn     = document.getElementById('laser-continue-btn');

    gridSize = getGridSize();
    GameState.stageData.laser.gridSize = gridSize;
    strikes = 0;
    scansLeft = 2;
    scanning = false;
    completed = false;

    strikesEl.textContent = '0';
    scanCountEl.textContent = '(2)';
    scanBtn.disabled = false;
    completeOverlay.classList.remove('active');
    detectedFlash.classList.remove('active');

    // Set CSS grid columns
    gridEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    playerPos = { row: 0, col: 0 };
    goalPos = { row: gridSize - 1, col: gridSize - 1 };

    buildGrid();
    renderGrid();
    startLasers();

    // Controls
    scanBtn.addEventListener('click', onScan);
    continueBtn.addEventListener('click', onContinue);
    document.addEventListener('keydown', onKeyDown);

    // D-pad
    document.getElementById('dpad-up').addEventListener('click', () => move(-1, 0));
    document.getElementById('dpad-down').addEventListener('click', () => move(1, 0));
    document.getElementById('dpad-left').addEventListener('click', () => move(0, -1));
    document.getElementById('dpad-right').addEventListener('click', () => move(0, 1));
  }

  function destroy() {
    intervals.forEach(id => clearInterval(id));
    intervals = [];
    document.removeEventListener('keydown', onKeyDown);

    scanBtn.removeEventListener('click', onScan);
    continueBtn.removeEventListener('click', onContinue);

    const btns = ['dpad-up', 'dpad-down', 'dpad-left', 'dpad-right'];
    btns.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.replaceWith(el.cloneNode(true));
    });

    gridEl.innerHTML = '';
  }

  function buildGrid() {
    grid = [];
    for (let r = 0; r < gridSize; r++) {
      grid[r] = [];
      for (let c = 0; c < gridSize; c++) {
        grid[r][c] = { laser: null, active: false };
      }
    }

    const config = LASER_CONFIGS[gridSize] || LASER_CONFIGS[6];
    config.forEach(l => {
      if (l.row < gridSize && l.col < gridSize) {
        // Don't place lasers on start or goal
        if ((l.row === 0 && l.col === 0) || (l.row === goalPos.row && l.col === goalPos.col)) return;
        grid[l.row][l.col] = {
          laser: { dir: l.dir, cycle: l.cycle },
          active: false
        };
      }
    });
  }

  function renderGrid() {
    gridEl.innerHTML = '';
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = document.createElement('div');
        cell.className = 'laser-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        // Player
        if (r === playerPos.row && c === playerPos.col) {
          cell.classList.add('player');
          cell.textContent = '🕵️';
        }

        // Goal
        if (r === goalPos.row && c === goalPos.col) {
          cell.classList.add('goal');
          if (!(r === playerPos.row && c === playerPos.col)) {
            cell.textContent = '🔓';
          }
        }

        // Laser beam
        const cellData = grid[r][c];
        if (cellData.laser) {
          const beam = document.createElement('div');
          beam.className = 'laser-beam ' + (cellData.laser.dir === 'h' ? 'horizontal' : 'vertical');
          if (!cellData.active) beam.classList.add('off');
          cell.appendChild(beam);
        }

        // Fog of war
        if (!scanning) {
          const dist = Math.abs(r - playerPos.row) + Math.abs(c - playerPos.col);
          if (dist > 2) {
            cell.classList.add('fog');
          }
        }

        gridEl.appendChild(cell);
      }
    }
  }

  function startLasers() {
    // Cycle 1: toggle every 1500ms
    const id1 = setInterval(() => {
      toggleLaserCycle(1);
      renderGrid();
    }, 1500);

    // Cycle 2: toggle every 2500ms
    const id2 = setInterval(() => {
      toggleLaserCycle(2);
      renderGrid();
    }, 2500);

    intervals.push(id1, id2);
  }

  function toggleLaserCycle(cycle) {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c].laser && grid[r][c].laser.cycle === cycle) {
          grid[r][c].active = !grid[r][c].active;
        }
      }
    }
  }

  function onKeyDown(e) {
    if (completed) return;
    switch (e.key) {
      case 'ArrowUp':    e.preventDefault(); move(-1, 0); break;
      case 'ArrowDown':  e.preventDefault(); move(1, 0);  break;
      case 'ArrowLeft':  e.preventDefault(); move(0, -1); break;
      case 'ArrowRight': e.preventDefault(); move(0, 1);  break;
    }
  }

  function move(dr, dc) {
    if (completed) return;
    const newRow = playerPos.row + dr;
    const newCol = playerPos.col + dc;

    if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize) return;

    playerPos.row = newRow;
    playerPos.col = newCol;

    // Check laser collision
    const cell = grid[newRow][newCol];
    if (cell.active) {
      onDetected();
      return;
    }

    renderGrid();

    // Check goal
    if (newRow === goalPos.row && newCol === goalPos.col) {
      onComplete();
    }
  }

  function onDetected() {
    strikes++;
    strikesEl.textContent = strikes;
    GameState.stageData.laser.attempts = strikes;

    playerPos = { row: 0, col: 0 };
    renderGrid();

    detectedFlash.classList.add('active');
    setTimeout(() => {
      detectedFlash.classList.remove('active');
    }, 800);
  }

  function onScan() {
    if (scansLeft <= 0) return;
    scansLeft--;
    scanCountEl.textContent = `(${scansLeft})`;
    if (scansLeft <= 0) scanBtn.disabled = true;

    scanning = true;
    renderGrid();

    setTimeout(() => {
      scanning = false;
      renderGrid();
    }, 3000);
  }

  function onComplete() {
    completed = true;
    intervals.forEach(id => clearInterval(id));
    intervals = [];

    GameState.stageData.laser.completed = true;
    GameState.stageData.laser.attempts = strikes;

    if (typeof completeStage === 'function') {
      completeStage('laser');
    }

    fragmentEl.textContent = decodeFragment(ENCODED_FRAGMENTS.laser);

    setTimeout(() => {
      completeOverlay.classList.add('active');
    }, 600);
  }

  function onContinue() {
    completeOverlay.classList.remove('active');
    if (typeof advanceFromStage === 'function') {
      advanceFromStage('laser');
    }
  }

  return { init, destroy };
})();
