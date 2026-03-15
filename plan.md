# Plan — Mission: Classified

Tracking checklist for the spy puzzle game. Each phase maps to the development sequence in `AGENTS.md`. Check items off as they are completed. Commit after each phase.

---

## Phase 1 — Scaffold

Set up the project skeleton: HTML structure, base CSS theme, JS app controller, and file/folder layout.

- [x] Create folder structure: `css/`, `js/`, `assets/`
- [x] Create `index.html` with:
  - [x] Viewport meta tag (`width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`)
  - [x] `<section>` shells for all 6 stages (briefing, memory, cipher, laser, vault, reveal), all hidden by default
  - [x] Progress bar / clearance meter element (persistent across stages)
  - [x] `<script>` tags for all JS modules (main, memory, cipher, laser, vault, confetti)
  - [x] Link to `css/styles.css`
- [x] Create `css/styles.css` with:
  - [x] CSS reset / base styles
  - [x] Dark spy theme: color palette (`#0a0a0f`, `#f5a623`, `#00ff88`, `#e63946`, white)
  - [x] Typography: monospace for terminal elements, sans-serif for headings
  - [x] Scan-line overlay effect (CSS pseudo-element)
  - [x] Mobile-first base layout (375px baseline)
  - [x] iOS Safari preventions: `overscroll-behavior: none`, `touch-action: manipulation`, `user-select: none`, `-webkit-tap-highlight-color: transparent`, `overflow: hidden` on html/body
  - [x] Safe area inset padding (`env(safe-area-inset-*)`)
  - [x] Use `dvh` instead of `vh` for full-screen heights
  - [x] Stage visibility classes (`.stage-active` / hidden)
  - [x] Transition animations for stage changes (opacity fade, 400ms)
  - [x] Progress bar styling (security clearance meter)
  - [x] `prefers-reduced-motion` media query to disable animations
- [x] Create `js/main.js` with:
  - [x] `CONFIG` object (personal message, reveal message, enable sound, debug mode)
  - [x] `GameState` object (agentName, currentStage, fragments[], stageData)
  - [x] Stage transition controller (fade-out → interstitial → fade-in)
  - [x] Progress bar update logic
  - [x] `DEBUG_MODE` stage-skip capability
  - [x] Fragment collection and encoding (secret never in plaintext source)
- [x] Create stub files: `js/memory.js`, `js/cipher.js`, `js/laser.js`, `js/vault.js`, `js/confetti.js` — each with `init()` and `destroy()` exports
- [x] Create `404.html` (redirect to `index.html` for GitHub Pages SPA fallback)

---

## Phase 2 — Stage 0: Mission Briefing

Landing screen that sets the spy tone and collects the player's codename.

- [x] HTML: briefing section content
  - [x] "CLASSIFIED" stamp element
  - [x] Manila folder graphic container
  - [x] Mission briefing text
  - [x] Codename input field (font-size ≥ 16px to prevent iOS zoom)
  - [x] "ACCEPT MISSION" button (min 48×48px tap target)
- [x] CSS: briefing screen styling
  - [x] "CLASSIFIED" stamp fade-in with thud animation
  - [x] Manila folder open/close animation
  - [x] Input and button styling (spy theme)
  - [x] Responsive layout for all breakpoints
- [x] JS: briefing logic in `main.js`
  - [x] Store agent name in `GameState.agentName`
  - [x] Validate non-empty codename before proceeding
  - [x] Trigger folder close animation → transition to Stage 1
  - [x] Show progress bar on transition

---

## Phase 3 — Stage 1: Memory Matrix

16-card matching game with mid-game shuffle twist.

- [x] HTML: memory stage section
  - [x] 4×4 card grid container
  - [x] Move counter display ("ATTEMPTS: 0")
  - [x] Stage completion overlay (ACCESS GRANTED, efficiency rating, fragment reveal)
- [x] CSS: memory stage styling
  - [x] Card grid: responsive — 4×4 on tablet/desktop, 3-col layout on phones
  - [x] Card flip animation (`transform: rotateY(180deg)`, `backface-visibility: hidden`)
  - [x] "TOP SECRET" card back design
  - [x] Card face styling (emoji + spy label)
  - [x] Shuffle animation (slide transitions for repositioned cards)
  - [x] "SECURITY ROTATION" warning banner animation
  - [x] Min 48×48px card tap targets
- [x] JS: `js/memory.js` game logic
  - [x] Card data: 8 pairs with emoji + spy names
  - [x] Fisher-Yates shuffle
  - [x] Card flip mechanic (tap to flip, max 2 face-up at a time)
  - [x] Board lock while checking a pair (prevent rapid-tap exploits)
  - [x] Match detection: matched pairs stay revealed
  - [x] Mismatch: flip back after 800ms
  - [x] Move counter increment on each pair attempt
  - [x] Mid-game shuffle trigger: after 4 pairs matched, shuffle remaining unmatched card positions with visible slide animation
  - [x] Completion detection: all 8 pairs matched
  - [x] Efficiency rating calculation (★★★ / ★★ / ★ based on move count)
  - [x] Store `moves` and `completed` in `GameState.stageData.memory`
  - [x] Add fragment "A" (encoded) to `GameState.fragments`
  - [x] Call stage transition to Stage 2
  - [x] `init()` and `destroy()` lifecycle methods

---

## Phase 4 — Stage 2: Code Breaker (Substitution Cipher)

Decode "NEW BABY ON THE WAY" from symbol cipher using tap-to-select, tap-to-place.

- [x] HTML: cipher stage section
  - [x] Encoded message display (symbols with spaces preserved)
  - [x] Cipher key grid (symbol → blank letter slot for each of 9 unique symbols)
  - [x] On-screen alphabet for letter assignment
  - [x] "INTEL INTERCEPT" free hint display (★ = N)
  - [x] "FREQUENCY ANALYSIS" button
  - [x] "HINT" button (limited to 2 uses)
  - [x] Frequency analysis display area (bar chart / counts)
  - [x] Stage completion overlay (DECRYPTION COMPLETE, fragment reveal)
- [x] CSS: cipher stage styling
  - [x] Symbol tiles styling (selectable, highlight on select)
  - [x] Alphabet grid layout
  - [x] Correct assignment: green reveal animation
  - [x] Wrong assignment: red flash + bounce-back animation
  - [x] Frequency analysis panel styling
  - [x] Responsive: single-row scrollable tray on phones, multi-row grid on tablet/desktop
  - [x] Min 48×48px tap targets on all tiles
- [x] JS: `js/cipher.js` game logic
  - [x] 9 unique symbol-to-letter mappings (N, E, W, B, A, Y, O, T, H)
  - [x] Render encoded message with symbols
  - [x] Tap-to-select, tap-to-place interaction (NO HTML5 Drag and Drop API)
    - [x] Tap symbol → highlights as selected
    - [x] Tap letter from alphabet → assigns to selected symbol
  - [x] Correct/incorrect feedback (green reveal / red flash)
  - [x] Free hint pre-populated (★ = N)
  - [x] "HINT" button: reveals one correct mapping (max 2 uses)
  - [x] "FREQUENCY ANALYSIS" button: shows symbol frequency counts (usable once)
  - [x] Completion detection: all 9 mappings correct
  - [x] Store `hintsUsed` and `completed` in `GameState.stageData.cipher`
  - [x] Add fragment "NEW" (encoded) to `GameState.fragments`
  - [x] Call stage transition to Stage 3
  - [x] `init()` and `destroy()` lifecycle methods

---

## Phase 5 — Stage 3: Laser Grid (Path Puzzle)

Navigate agent through a grid with timed lasers and fog of war.

- [x] HTML: laser stage section
  - [x] Grid container
  - [x] On-screen D-pad (up/down/left/right buttons, anchored to bottom)
  - [x] Agent icon (🕵️) and goal icon (🔓)
  - [x] "DETECTED!" flash overlay
  - [x] Strike counter display
  - [x] "SCAN" button (2 uses)
  - [x] Stage completion overlay (SECURITY BYPASSED, fragment reveal)
- [x] CSS: laser stage styling
  - [x] CSS Grid layout: 8×8 on tablet/desktop, 6×6 on phones
  - [x] Laser beam animations (red glowing lines, horizontal/vertical)
  - [x] Two timing cycle visual distinction
  - [x] Fog of war: cells outside 2-cell radius dimmed via opacity
  - [x] D-pad styling: thumb-friendly, 48×48px min buttons, anchored to bottom
  - [x] "DETECTED!" flash animation
  - [x] Responsive breakpoints for grid size switch
- [x] JS: `js/laser.js` game logic
  - [x] Grid state as 2D array
  - [x] Responsive grid size detection (6×6 vs 8×8) — store in `GameState.stageData.laser.gridSize`
  - [x] Laser placement with solvable path guaranteed
  - [x] Two timing cycles: `setInterval` at 1.5s and 2.5s for laser toggling
  - [x] Player movement via D-pad (touch events) and arrow keys (keyboard fallback)
  - [x] Collision detection: active laser → reset to start, increment strikes
  - [x] Fog of war: visibility radius of 2 cells from player position
  - [x] "SCAN" button: reveals full grid for 3 seconds (2 uses)
  - [x] Goal detection: player reaches 🔓 cell
  - [x] Store `attempts`, `completed`, `gridSize` in `GameState.stageData.laser`
  - [x] Add fragment "BABY" (encoded) to `GameState.fragments`
  - [x] Call stage transition to Stage 4
  - [x] `init()` and `destroy()` lifecycle methods
  - [x] Clean up intervals on `destroy()`

---

## Phase 6 — Stage 4: The Vault (Combination Lock)

4-digit meta-puzzle lock with clues referencing previous stages.

- [x] HTML: vault stage section
  - [x] Vault door graphic container
  - [x] 4-dial combination lock (each dial 0–9)
  - [x] Up/down arrows per dial (desktop) + swipe support (mobile)
  - [x] "CRACK" submit button
  - [x] Classified dossier panel with 4 cryptic clue riddles
  - [x] "REVIEW MISSION LOG" button (shows previous stage stats)
  - [x] Wrong attempt counter ("ATTEMPT X/∞")
  - [x] Stage completion overlay (vault opens, fragment reveal)
- [x] CSS: vault stage styling
  - [x] Vault door with CSS 3D perspective transform for swing-open
  - [x] Dial carousel: vertical number scroll, `overflow: hidden`
  - [x] Shake / "bzzt" animation on wrong code
  - [x] Dials large enough for thumb interaction, ≥ 12px gap
  - [x] Mission log modal/panel styling
  - [x] Responsive layout for all breakpoints
- [x] JS: `js/vault.js` game logic
  - [x] Dial mechanic: swipe up/down (touch events) + click arrows (desktop)
  - [x] Dynamic vault code computed from `GameState.stageData`:
    - [x] Digit 1: 8 (memory pairs matched)
    - [x] Digit 2: 3 (three-letter words in cipher phrase)
    - [x] Digit 3: 8 (unique symbols minus free hint)
    - [x] Digit 4: `GameState.stageData.laser.gridSize` (8 or 6)
  - [x] "CRACK" button: validate combination
  - [x] Wrong code: shake animation, reset dials, increment attempt counter
  - [x] After 3 wrong attempts: show parenthetical clarifications on clue riddles
  - [x] "REVIEW MISSION LOG": display previous stage key stats
  - [x] Correct code: vault door swing-open animation
  - [x] Store `attempts` and `completed` in `GameState.stageData.vault`
  - [x] Add fragment "COUSIN" (encoded) to `GameState.fragments`
  - [x] Call stage transition to Stage 5
  - [x] `init()` and `destroy()` lifecycle methods

---

## Phase 7 — Stage 5: The Reveal

Deliver the secret message with dramatic reveal and confetti celebration.

- [x] HTML: reveal stage section
  - [x] Decrypting progress bar animation container
  - [x] Fragment assembly display area
  - [x] Full message display
  - [x] Confetti canvas element
  - [x] Personal note area
  - [x] "REPLAY MISSION" button
  - [x] "SHARE" button (copies link)
- [x] CSS: reveal stage styling
  - [x] Fake "DECRYPTING..." progress bar animation (~3s)
  - [x] Typewriter text effect
  - [x] Background transition: dark spy → celebratory warm gradient (pink/blue/yellow)
  - [x] Full-screen overlay for color transition
  - [x] Responsive text sizing
- [x] JS: reveal logic (in `main.js` or dedicated reveal function)
  - [x] Decrypting animation sequence (~3s)
  - [x] Fragment assembly: decode and display one by one with typewriter effect ("A" → "NEW" → "BABY" → "COUSIN")
  - [x] Assemble full message: "A NEW BABY IS ON THE WAY — YOU'RE GETTING A COUSIN!"
  - [x] Trigger confetti
  - [x] Show personal message from `CONFIG.PERSONAL_MESSAGE`
  - [x] "REPLAY MISSION" button: reset `GameState`, return to Stage 0
  - [x] "SHARE" button: copy page URL to clipboard
- [x] JS: `js/confetti.js`
  - [x] Canvas-based particle system
  - [x] 200–300 particles with gravity, rotation, and fade
  - [x] `requestAnimationFrame` loop
  - [x] Performance cap for low-end devices
  - [x] `init()` and `destroy()` lifecycle methods

---

## Phase 8 — Integration

Wire all stages together into a seamless flow.

- [x] Stage transitions: smooth fade-out → "LOADING NEXT PROTOCOL..." interstitial → fade-in
- [x] Progress bar updates on each stage completion with fill animation
- [ ] Agent name displayed throughout ("Good work, Agent [name]!")
- [x] Fragment collection verified across all stages
- [x] `DEBUG_MODE` stage-skip working (can jump to any stage)
- [x] Secret message never appears in plaintext in HTML source
- [x] Vault code dynamically derived from `GameState` (not hardcoded)
- [x] All `init()` / `destroy()` lifecycle methods called correctly on transitions
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
