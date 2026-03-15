# Plan — Mission: Classified

Tracking checklist for the spy puzzle game. Each phase maps to the development sequence in `AGENTS.md`. Check items off as they are completed. Commit after each phase.

---

## Phase 1 — Scaffold

Set up the project skeleton: HTML structure, base CSS theme, JS app controller, and file/folder layout.

- [ ] Create folder structure: `css/`, `js/`, `assets/`
- [ ] Create `index.html` with:
  - [ ] Viewport meta tag (`width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`)
  - [ ] `<section>` shells for all 6 stages (briefing, memory, cipher, laser, vault, reveal), all hidden by default
  - [ ] Progress bar / clearance meter element (persistent across stages)
  - [ ] `<script>` tags for all JS modules (main, memory, cipher, laser, vault, confetti)
  - [ ] Link to `css/styles.css`
- [ ] Create `css/styles.css` with:
  - [ ] CSS reset / base styles
  - [ ] Dark spy theme: color palette (`#0a0a0f`, `#f5a623`, `#00ff88`, `#e63946`, white)
  - [ ] Typography: monospace for terminal elements, sans-serif for headings
  - [ ] Scan-line overlay effect (CSS pseudo-element)
  - [ ] Mobile-first base layout (375px baseline)
  - [ ] iOS Safari preventions: `overscroll-behavior: none`, `touch-action: manipulation`, `user-select: none`, `-webkit-tap-highlight-color: transparent`, `overflow: hidden` on html/body
  - [ ] Safe area inset padding (`env(safe-area-inset-*)`)
  - [ ] Use `dvh` instead of `vh` for full-screen heights
  - [ ] Stage visibility classes (`.stage-active` / hidden)
  - [ ] Transition animations for stage changes (opacity fade, 400ms)
  - [ ] Progress bar styling (security clearance meter)
  - [ ] `prefers-reduced-motion` media query to disable animations
- [ ] Create `js/main.js` with:
  - [ ] `CONFIG` object (personal message, reveal message, enable sound, debug mode)
  - [ ] `GameState` object (agentName, currentStage, fragments[], stageData)
  - [ ] Stage transition controller (fade-out → interstitial → fade-in)
  - [ ] Progress bar update logic
  - [ ] `DEBUG_MODE` stage-skip capability
  - [ ] Fragment collection and encoding (secret never in plaintext source)
- [ ] Create stub files: `js/memory.js`, `js/cipher.js`, `js/laser.js`, `js/vault.js`, `js/confetti.js` — each with `init()` and `destroy()` exports
- [ ] Create `404.html` (redirect to `index.html` for GitHub Pages SPA fallback)

---

## Phase 2 — Stage 0: Mission Briefing

Landing screen that sets the spy tone and collects the player's codename.

- [ ] HTML: briefing section content
  - [ ] "CLASSIFIED" stamp element
  - [ ] Manila folder graphic container
  - [ ] Mission briefing text
  - [ ] Codename input field (font-size ≥ 16px to prevent iOS zoom)
  - [ ] "ACCEPT MISSION" button (min 48×48px tap target)
- [ ] CSS: briefing screen styling
  - [ ] "CLASSIFIED" stamp fade-in with thud animation
  - [ ] Manila folder open/close animation
  - [ ] Input and button styling (spy theme)
  - [ ] Responsive layout for all breakpoints
- [ ] JS: briefing logic in `main.js`
  - [ ] Store agent name in `GameState.agentName`
  - [ ] Validate non-empty codename before proceeding
  - [ ] Trigger folder close animation → transition to Stage 1
  - [ ] Show progress bar on transition

---

## Phase 3 — Stage 1: Memory Matrix

16-card matching game with mid-game shuffle twist.

- [ ] HTML: memory stage section
  - [ ] 4×4 card grid container
  - [ ] Move counter display ("ATTEMPTS: 0")
  - [ ] Stage completion overlay (ACCESS GRANTED, efficiency rating, fragment reveal)
- [ ] CSS: memory stage styling
  - [ ] Card grid: responsive — 4×4 on tablet/desktop, 3-col layout on phones
  - [ ] Card flip animation (`transform: rotateY(180deg)`, `backface-visibility: hidden`)
  - [ ] "TOP SECRET" card back design
  - [ ] Card face styling (emoji + spy label)
  - [ ] Shuffle animation (slide transitions for repositioned cards)
  - [ ] "SECURITY ROTATION" warning banner animation
  - [ ] Min 48×48px card tap targets
- [ ] JS: `js/memory.js` game logic
  - [ ] Card data: 8 pairs with emoji + spy names
  - [ ] Fisher-Yates shuffle
  - [ ] Card flip mechanic (tap to flip, max 2 face-up at a time)
  - [ ] Board lock while checking a pair (prevent rapid-tap exploits)
  - [ ] Match detection: matched pairs stay revealed
  - [ ] Mismatch: flip back after 800ms
  - [ ] Move counter increment on each pair attempt
  - [ ] Mid-game shuffle trigger: after 4 pairs matched, shuffle remaining unmatched card positions with visible slide animation
  - [ ] Completion detection: all 8 pairs matched
  - [ ] Efficiency rating calculation (★★★ / ★★ / ★ based on move count)
  - [ ] Store `moves` and `completed` in `GameState.stageData.memory`
  - [ ] Add fragment "A" (encoded) to `GameState.fragments`
  - [ ] Call stage transition to Stage 2
  - [ ] `init()` and `destroy()` lifecycle methods

---

## Phase 4 — Stage 2: Code Breaker (Substitution Cipher)

Decode "NEW BABY ON THE WAY" from symbol cipher using tap-to-select, tap-to-place.

- [ ] HTML: cipher stage section
  - [ ] Encoded message display (symbols with spaces preserved)
  - [ ] Cipher key grid (symbol → blank letter slot for each of 9 unique symbols)
  - [ ] On-screen alphabet for letter assignment
  - [ ] "INTEL INTERCEPT" free hint display (★ = N)
  - [ ] "FREQUENCY ANALYSIS" button
  - [ ] "HINT" button (limited to 2 uses)
  - [ ] Frequency analysis display area (bar chart / counts)
  - [ ] Stage completion overlay (DECRYPTION COMPLETE, fragment reveal)
- [ ] CSS: cipher stage styling
  - [ ] Symbol tiles styling (selectable, highlight on select)
  - [ ] Alphabet grid layout
  - [ ] Correct assignment: green reveal animation
  - [ ] Wrong assignment: red flash + bounce-back animation
  - [ ] Frequency analysis panel styling
  - [ ] Responsive: single-row scrollable tray on phones, multi-row grid on tablet/desktop
  - [ ] Min 48×48px tap targets on all tiles
- [ ] JS: `js/cipher.js` game logic
  - [ ] 9 unique symbol-to-letter mappings (N, E, W, B, A, Y, O, T, H)
  - [ ] Render encoded message with symbols
  - [ ] Tap-to-select, tap-to-place interaction (NO HTML5 Drag and Drop API)
    - [ ] Tap symbol → highlights as selected
    - [ ] Tap letter from alphabet → assigns to selected symbol
  - [ ] Correct/incorrect feedback (green reveal / red flash)
  - [ ] Free hint pre-populated (★ = N)
  - [ ] "HINT" button: reveals one correct mapping (max 2 uses)
  - [ ] "FREQUENCY ANALYSIS" button: shows symbol frequency counts (usable once)
  - [ ] Completion detection: all 9 mappings correct
  - [ ] Store `hintsUsed` and `completed` in `GameState.stageData.cipher`
  - [ ] Add fragment "NEW" (encoded) to `GameState.fragments`
  - [ ] Call stage transition to Stage 3
  - [ ] `init()` and `destroy()` lifecycle methods

---

## Phase 5 — Stage 3: Laser Grid (Path Puzzle)

Navigate agent through a grid with timed lasers and fog of war.

- [ ] HTML: laser stage section
  - [ ] Grid container
  - [ ] On-screen D-pad (up/down/left/right buttons, anchored to bottom)
  - [ ] Agent icon (🕵️) and goal icon (🔓)
  - [ ] "DETECTED!" flash overlay
  - [ ] Strike counter display
  - [ ] "SCAN" button (2 uses)
  - [ ] Stage completion overlay (SECURITY BYPASSED, fragment reveal)
- [ ] CSS: laser stage styling
  - [ ] CSS Grid layout: 8×8 on tablet/desktop, 6×6 on phones
  - [ ] Laser beam animations (red glowing lines, horizontal/vertical)
  - [ ] Two timing cycle visual distinction
  - [ ] Fog of war: cells outside 2-cell radius dimmed via opacity
  - [ ] D-pad styling: thumb-friendly, 48×48px min buttons, anchored to bottom
  - [ ] "DETECTED!" flash animation
  - [ ] Responsive breakpoints for grid size switch
- [ ] JS: `js/laser.js` game logic
  - [ ] Grid state as 2D array
  - [ ] Responsive grid size detection (6×6 vs 8×8) — store in `GameState.stageData.laser.gridSize`
  - [ ] Laser placement with solvable path guaranteed
  - [ ] Two timing cycles: `setInterval` at 1.5s and 2.5s for laser toggling
  - [ ] Player movement via D-pad (touch events) and arrow keys (keyboard fallback)
  - [ ] Collision detection: active laser → reset to start, increment strikes
  - [ ] Fog of war: visibility radius of 2 cells from player position
  - [ ] "SCAN" button: reveals full grid for 3 seconds (2 uses)
  - [ ] Goal detection: player reaches 🔓 cell
  - [ ] Store `attempts`, `completed`, `gridSize` in `GameState.stageData.laser`
  - [ ] Add fragment "BABY" (encoded) to `GameState.fragments`
  - [ ] Call stage transition to Stage 4
  - [ ] `init()` and `destroy()` lifecycle methods
  - [ ] Clean up intervals on `destroy()`

---

## Phase 6 — Stage 4: The Vault (Combination Lock)

4-digit meta-puzzle lock with clues referencing previous stages.

- [ ] HTML: vault stage section
  - [ ] Vault door graphic container
  - [ ] 4-dial combination lock (each dial 0–9)
  - [ ] Up/down arrows per dial (desktop) + swipe support (mobile)
  - [ ] "CRACK" submit button
  - [ ] Classified dossier panel with 4 cryptic clue riddles
  - [ ] "REVIEW MISSION LOG" button (shows previous stage stats)
  - [ ] Wrong attempt counter ("ATTEMPT X/∞")
  - [ ] Stage completion overlay (vault opens, fragment reveal)
- [ ] CSS: vault stage styling
  - [ ] Vault door with CSS 3D perspective transform for swing-open
  - [ ] Dial carousel: vertical number scroll, `overflow: hidden`
  - [ ] Shake / "bzzt" animation on wrong code
  - [ ] Dials large enough for thumb interaction, ≥ 12px gap
  - [ ] Mission log modal/panel styling
  - [ ] Responsive layout for all breakpoints
- [ ] JS: `js/vault.js` game logic
  - [ ] Dial mechanic: swipe up/down (touch events) + click arrows (desktop)
  - [ ] Dynamic vault code computed from `GameState.stageData`:
    - [ ] Digit 1: 8 (memory pairs matched)
    - [ ] Digit 2: 3 (three-letter words in cipher phrase)
    - [ ] Digit 3: 8 (unique symbols minus free hint)
    - [ ] Digit 4: `GameState.stageData.laser.gridSize` (8 or 6)
  - [ ] "CRACK" button: validate combination
  - [ ] Wrong code: shake animation, reset dials, increment attempt counter
  - [ ] After 3 wrong attempts: show parenthetical clarifications on clue riddles
  - [ ] "REVIEW MISSION LOG": display previous stage key stats
  - [ ] Correct code: vault door swing-open animation
  - [ ] Store `attempts` and `completed` in `GameState.stageData.vault`
  - [ ] Add fragment "COUSIN" (encoded) to `GameState.fragments`
  - [ ] Call stage transition to Stage 5
  - [ ] `init()` and `destroy()` lifecycle methods

---

## Phase 7 — Stage 5: The Reveal

Deliver the secret message with dramatic reveal and confetti celebration.

- [ ] HTML: reveal stage section
  - [ ] Decrypting progress bar animation container
  - [ ] Fragment assembly display area
  - [ ] Full message display
  - [ ] Confetti canvas element
  - [ ] Personal note area
  - [ ] "REPLAY MISSION" button
  - [ ] "SHARE" button (copies link)
- [ ] CSS: reveal stage styling
  - [ ] Fake "DECRYPTING..." progress bar animation (~3s)
  - [ ] Typewriter text effect
  - [ ] Background transition: dark spy → celebratory warm gradient (pink/blue/yellow)
  - [ ] Full-screen overlay for color transition
  - [ ] Responsive text sizing
- [ ] JS: reveal logic (in `main.js` or dedicated reveal function)
  - [ ] Decrypting animation sequence (~3s)
  - [ ] Fragment assembly: decode and display one by one with typewriter effect ("A" → "NEW" → "BABY" → "COUSIN")
  - [ ] Assemble full message: "A NEW BABY IS ON THE WAY — YOU'RE GETTING A COUSIN!"
  - [ ] Trigger confetti
  - [ ] Show personal message from `CONFIG.PERSONAL_MESSAGE`
  - [ ] "REPLAY MISSION" button: reset `GameState`, return to Stage 0
  - [ ] "SHARE" button: copy page URL to clipboard
- [ ] JS: `js/confetti.js`
  - [ ] Canvas-based particle system
  - [ ] 200–300 particles with gravity, rotation, and fade
  - [ ] `requestAnimationFrame` loop
  - [ ] Performance cap for low-end devices
  - [ ] `init()` and `destroy()` lifecycle methods

---

## Phase 8 — Integration

Wire all stages together into a seamless flow.

- [ ] Stage transitions: smooth fade-out → "LOADING NEXT PROTOCOL..." interstitial → fade-in
- [ ] Progress bar updates on each stage completion with fill animation
- [ ] Agent name displayed throughout ("Good work, Agent [name]!")
- [ ] Fragment collection verified across all stages
- [ ] `DEBUG_MODE` stage-skip working (can jump to any stage)
- [ ] Secret message never appears in plaintext in HTML source
- [ ] Vault code dynamically derived from `GameState` (not hardcoded)
- [ ] All `init()` / `destroy()` lifecycle methods called correctly on transitions
- [ ] Full playthrough test: Stage 0 → 1 → 2 → 3 → 4 → 5 completes successfully

---

## Phase 9 — Polish

Animations, responsive refinements, accessibility, and cross-browser fixes.

**Responsive / Mobile**
- [ ] Test at 375×667 (iPhone SE)
- [ ] Test at 390×844 (iPhone 14)
- [ ] Test at 768×1024 (iPad portrait)
- [ ] Test at 1024×768 (iPad landscape)
- [ ] Test at 1280×800+ (desktop)
- [ ] No horizontal overflow on any screen ≥ 375px wide
- [ ] All tap targets ≥ 48×48px
- [ ] No hover-dependent interactions
- [ ] `dvh` used instead of `vh` for full-screen heights
- [ ] No fixed-pixel layouts — rem/em/vw/vh/dvh/clamp()/grid/flex only

**Accessibility**
- [ ] All interactive elements keyboard-navigable (tabindex, focus styles)
- [ ] ARIA labels on game elements (cards, dials, grid cells)
- [ ] Color contrast ≥ 4.5:1 ratio
- [ ] Information not conveyed by color alone
- [ ] `prefers-reduced-motion` disables animations

**Performance**
- [ ] Total payload < 200KB
- [ ] Animations use `transform` and `opacity` only (GPU-composited)
- [ ] No external dependencies or CDN loads
- [ ] Confetti capped for low-end devices
- [ ] Page loads < 2s on 3G

**Visual Polish**
- [ ] Scan-line overlay renders correctly
- [ ] All animations smooth at 60fps
- [ ] Stage transition timing feels right
- [ ] Card flip animation smooth
- [ ] Vault door 3D swing looks good
- [ ] Confetti celebration looks celebratory
- [ ] Color scheme consistent across all stages

---

## Phase 10 — Deploy

Push to GitHub Pages and verify on real devices.

- [ ] Initialize GitHub repository (if not already remote)
- [ ] Push to GitHub
- [ ] Enable GitHub Pages (serve from root)
- [ ] `404.html` redirect working
- [ ] Test on iPhone Safari (real device or Xcode Simulator)
- [ ] Test on Chrome Android (real device or emulator)
- [ ] Test on desktop Chrome, Safari, Firefox
- [ ] Full playthrough on mobile — all stages completable via touch only
- [ ] Share URL with family for final QA

---

## Quality Gate (from AGENTS.md)

Do not consider this project done until every item below is verified:

**Functionality**
- [ ] Every stage completable without getting permanently stuck
- [ ] Secret never visible in HTML source
- [ ] Personal message easy to change (single CONFIG constant)
- [ ] DEBUG_MODE allows skipping to any stage

**Mobile & Touch**
- [ ] Every stage completable with touch only
- [ ] iPhone Safari — fully functional
- [ ] Chrome Android — fully functional
- [ ] iPad portrait + landscape — functional
- [ ] No iOS Safari quirks (zoom, rubber-band, double-tap)
- [ ] D-pad works on laser grid (≥ 48×48px)
- [ ] Tap-to-select/place works on cipher
- [ ] Vault dials scrollable/tappable
- [ ] No horizontal overflow ≥ 375px
- [ ] Viewport meta tag present
- [ ] `dvh` used for full-screen height

**Cross-Browser**
- [ ] Chrome desktop + Android
- [ ] Safari macOS + iOS
- [ ] Firefox desktop
- [ ] Keyboard navigation on desktop

**Performance**
- [ ] < 2s load on 3G
- [ ] Confetti doesn't tank low-end devices
- [ ] No layout thrashing
