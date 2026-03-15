# AGENTS.md — Mission: Classified

## Project Overview

A single-page interactive puzzle game hosted on GitHub Pages. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step. The player assumes the role of a junior secret agent who must complete a series of missions to unlock a classified file. The classified secret: **"A new baby is on the way — you're getting a cousin!"**

The target audience is the developer's nieces and nephews. The game should take 5–10 minutes to complete and feel like a genuine spy mission with satisfying puzzle mechanics, atmospheric theming, and a celebratory final reveal.

---

## Target Audience

- **Age**: ~12 years old
- **Profile**: Sharp kids who are into STEM — comfortable with logic, patterns, math, and problem-solving
- **What this means for design**:
  - Puzzles must offer **genuine intellectual challenge**, not busywork. These kids will be bored by trivial matching or obvious ciphers. Each stage should have a mechanic that makes them think.
  - Lean into real concepts they'd find cool: cryptography (frequency analysis), spatial reasoning (fog of war), polyrhythmic timing patterns, meta-puzzles that connect data across stages.
  - Avoid being patronizing — no excessive hand-holding, no "Great job!" after every click. The tone is a cool spy briefing, not a preschool app. Feedback should feel tactical: "ACCESS GRANTED", "DECRYPTION COMPLETE", "SECURITY BYPASSED".
  - Hints should exist as a safety net (so nobody gets permanently stuck), but they should cost something or be limited, so using them feels like a choice, not a freebie.
  - The mid-game shuffle in the memory stage, the dual-rhythm lasers, the riddle-style vault clues, and the frequency analysis tool are all designed to respect this audience's intelligence.

---

## Hard Requirement: Mobile & Tablet First

**This game MUST be fully playable on tablets and phones.** The primary target browsers are **Google Chrome (Android/desktop)** and **iPhone Safari (iOS)**. Every design and implementation decision must treat touch devices as the default — desktop is the fallback, not the other way around.

### Mandatory Mobile/Tablet Rules

1. **Touch is the primary input.** Every interaction — card flips, drag-and-drop, grid navigation, dial scrolling — must work flawlessly with touch events (`touchstart`, `touchmove`, `touchend`). Never rely solely on mouse events or the HTML Drag and Drop API (it has no native touch support in mobile Safari).
2. **No hover-dependent interactions.** Hover states are visual polish only; no game mechanic can require hover to function.
3. **Viewport meta tag is required.** `index.html` must include `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` to prevent pinch-zoom interfering with gameplay and to lock the layout to the device width.
4. **Prevent unwanted browser behaviors on iOS Safari:**
   - Disable pull-to-refresh: `overscroll-behavior: none` on `html` and `body`
   - Disable double-tap zoom on interactive elements: `touch-action: manipulation` on all buttons, cards, and game surfaces
   - Disable text selection during gameplay: `user-select: none` on game containers
   - Disable the iOS tap highlight: `-webkit-tap-highlight-color: transparent`
   - Prevent elastic scroll on the body: `position: fixed; overflow: hidden` on `body` during active gameplay, or use `overflow: hidden` on `html, body` globally since this is a single-screen app
5. **Safe area insets.** Account for iPhone notch/Dynamic Island using `env(safe-area-inset-top)` etc. in padding, especially for the progress bar and bottom controls.
6. **Minimum tap target size: 48×48px.** Apple HIG recommends 44pt; use 48px to be safe. This applies to all buttons, cards, dials, grid cells, and arrow controls.
7. **On-screen controls for everything.** Arrow keys don't exist on phones. The laser grid stage MUST have an on-screen D-pad (up/down/left/right buttons) as the primary control, with keyboard arrows as a secondary desktop enhancement.
8. **No drag-and-drop via the HTML5 Drag and Drop API.** It does not work on mobile Safari. The cipher stage must implement drag-and-drop using a custom pointer/touch event system — or use a tap-to-select, tap-to-place interaction pattern which is more natural on touch screens.
9. **Responsive layout tested at these sizes:**
   - 375×667 (iPhone SE / small phone — the minimum supported size)
   - 390×844 (iPhone 14 / modern phone)
   - 768×1024 (iPad / tablet portrait)
   - 1024×768 (iPad / tablet landscape)
   - 1280×800+ (desktop)
10. **No fixed-pixel layouts.** Use `rem`, `em`, `vw`, `vh`, `dvh`, `clamp()`, and CSS Grid / Flexbox for sizing. Use `dvh` (dynamic viewport height) instead of `vh` where full-screen height is needed, since `vh` is unreliable on mobile Safari (it doesn't account for the collapsing URL bar).
11. **Font sizes must be at least 16px on inputs.** iOS Safari auto-zooms on input focus if the font is under 16px. The codename input on the briefing screen must use `font-size: 16px` or larger.
12. **Test on actual devices or simulators.** Chrome DevTools device mode is insufficient — iOS Safari has unique quirks (rubber-banding, 300ms tap delay on older versions, `vh` bugs). Use Xcode Simulator or a real iPhone for final QA.

---

## Theme & Aesthetic

- **Visual style**: Dark command-terminal aesthetic mixed with a playful "spy dossier" look. Think manila folders, redacted text, scan-line overlays, glowing green/amber accents on dark backgrounds.
- **Typography**: Monospace font for terminal/readout elements (`Courier New`, `Source Code Pro`), a bold sans-serif for headings (`Inter`, `Poppins`).
- **Color palette**: Near-black background (`#0a0a0f`), amber accent (`#f5a623`), green terminal glow (`#00ff88`), red classified stamps (`#e63946`), white text.
- **Sound**: Optional subtle UI sounds (click, success chime, unlock). All sound must be user-initiated (no autoplay). Sounds are enhancement only — the game must work fully without them.
- **Animations**: CSS transitions and keyframe animations for page transitions, card flips, lock rotations, and the final confetti reveal. Use `requestAnimationFrame` for any canvas-based effects (confetti).

---

## Game Flow (5 Stages)

### Stage 0 — Mission Briefing (Landing Screen)

**Purpose**: Set the tone, collect the player's name, and kick off the mission.

**UI Elements**:
- Full-screen dark background with subtle scan-line CSS overlay
- Centered "CLASSIFIED" stamp that fades in with a thud animation
- A manila folder graphic that "opens" to reveal mission briefing text
- Text reads: *"Agent, we've intercepted a top-secret transmission. The intel is locked behind a series of security protocols. Your mission: crack each layer to decode the message. Do you accept?"*
- Input field: "Enter your codename, Agent ___"
- A large "ACCEPT MISSION" button

**Behavior**:
- Agent name is stored and used throughout ("Good work, Agent [name]!")
- On accept, the folder "closes" and slides away, transitioning to Stage 1
- A progress bar (styled as a security clearance meter) appears at the top and persists through all stages: `[■■□□□] CLEARANCE LEVEL 1/5`

---

### Stage 1 — Memory Matrix

**Purpose**: A memory card-matching game with a twist — match 8 pairs (16 cards) to unlock the first security layer. More pairs than a basic memory game to give STEM-minded kids a real workout.

**Puzzle Mechanic**:
- 16 cards in a 4×4 grid, face-down with a "TOP SECRET" back design
- Cards contain icons/emoji of seemingly random "evidence items" — but all items are secretly baby-related, disguised with spy language:
  - 🍼 "Unidentified Liquid Container" (baby bottle)
  - 🧒 "Miniature Asset" (baby/child)
  - 🧸 "Surveillance Bear" (teddy bear)
  - 👶 "New Recruit" (baby face)
  - 🎀 "Signal Ribbon" (bow)
  - 🧩 "Intel Fragment" (puzzle piece)
  - 🧷 "Micro Fastener" (safety pin)
  - 🌙 "Night Ops Symbol" (moon / nighttime)
- Player flips two cards at a time. Matched pairs stay revealed. Mismatches flip back after 800ms.
- A move counter tracks attempts: "ATTEMPTS: 0" — counts up, creating an implicit challenge to minimize moves
- **Added challenge**: After 4 pairs are matched, the remaining unmatched cards briefly shuffle positions (with a "SECURITY ROTATION" warning), forcing the player to re-learn positions. This rewards attention and keeps STEM kids engaged.

**On Completion**:
- All cards matched → brief "ACCESS GRANTED" flash
- A performance rating based on move count: "EFFICIENCY RATING: ★★★" (for fun, not blocking)
- A decoded fragment appears: the word **"A"** (first word of the final message)
- Smooth transition to Stage 2

**Technical Notes**:
- Cards are shuffled with Fisher-Yates algorithm
- Use CSS `transform: rotateY(180deg)` with `backface-visibility: hidden` for flip animation
- Prevent rapid clicking exploits: lock board while two unmatched cards are face-up
- The mid-game shuffle only moves unmatched cards and uses a visible slide animation so it feels fair, not random

---

### Stage 2 — Code Breaker (Substitution Cipher)

**Purpose**: Decode a substitution cipher — a real cryptography exercise that will appeal to STEM-oriented kids. They must use pattern recognition and deduction to crack the code.

**Puzzle Mechanic**:
- Display an encoded message using custom symbols (e.g., geometric shapes, arrows, and glyphs mapped to letters)
- The encoded phrase is: **"NEW BABY ON THE WAY"** — but the player only sees symbols
- Word boundaries (spaces) are preserved so the player can use word-length as a clue
- Below the encoded message, show a **cipher key grid**: each symbol has a blank slot next to it for the player to assign a letter
- Provide one free mapping as a starting hint: "INTEL INTERCEPT: The symbol ★ = N"
- The player must deduce the remaining mappings. Logical footholds:
  - The 3-letter words ("NEW", "THE", "WAY") constrain possibilities
  - Repeated letters across words narrow it further (e.g., the "Y" in "BABY" and "WAY" uses the same symbol)
  - The 2-letter word "ON" is a strong anchor
- Player taps a symbol in the cipher key, then taps a letter from an on-screen alphabet to assign it
- As correct assignments are made, the decoded letters appear in the message above in green
- Wrong assignments get a red flash and the letter bounces back to the alphabet
- A **"FREQUENCY ANALYSIS"** button (usable once) shows how many times each symbol appears — a real cryptanalysis technique that will delight STEM kids

**On Completion**:
- Full phrase decoded → "DECRYPTION COMPLETE" banner
- The decoded fragment revealed: **"NEW"**
- Transition to Stage 3

**Technical Notes**:
- **Do NOT use the HTML5 Drag and Drop API** — it does not work on mobile Safari. Instead, implement a **tap-to-select, tap-to-place** interaction: player taps a symbol tile (it highlights as "selected"), then taps a letter from the alphabet to assign it. This is the most intuitive pattern on touch screens. Optionally support a pointer-event-based drag for desktop polish, but tap-to-place is the primary mechanic.
- Use 10 unique symbols for the 10 unique letters in the phrase (N, E, W, B, A, Y, O, T, H)... wait, that's 9. Double-check: N-E-W-B-A-B-Y-O-N-T-H-E-W-A-Y → unique letters: {N, E, W, B, A, Y, O, T, H} = 9 symbols
- Show a "HINT" button that reveals one correct mapping (limited to 2 uses — fewer than before since these kids can handle it)
- The frequency analysis button should display a small bar chart or count next to each symbol — a teaching moment about real codebreaking

---

### Stage 3 — Laser Grid (Path Puzzle)

**Purpose**: Navigate an agent icon through a grid, avoiding "laser beams," to reach the exit. This stage tests spatial reasoning and pattern recognition — core STEM skills.

**Puzzle Mechanic**:
- An 8×8 grid rendered with CSS Grid (6×6 on phones — see responsive design section)
- Some cells contain horizontal or vertical "laser" lines (animated red glowing lines)
- Lasers operate on **two different timing cycles** — some toggle every 1.5s, others every 2.5s. The player must observe and internalize both patterns to plan a route. This polyrhythmic timing is the kind of pattern-recognition challenge that STEM kids love.
- Player moves their agent icon (🕵️) using on-screen D-pad buttons (primary) or arrow keys (desktop enhancement)
- Touching an active laser resets position to start (with a brief "DETECTED!" flash and a strike counter)
- Goal: reach the 🔓 cell on the opposite corner
- **Added layer**: Some cells are "dark zones" (dimmed out) — the player can only see laser states for cells within a 2-cell radius of their current position, simulating limited intel. A "SCAN" button (usable twice) temporarily reveals the full grid's laser states for 3 seconds.

**On Completion**:
- Reach the exit → "SECURITY BYPASSED" message
- The decoded fragment revealed: **"BABY"**
- Transition to Stage 4

**Technical Notes**:
- Grid state managed as a 2D array
- Laser toggle uses `setInterval` with CSS animation sync; two separate intervals for the two timing cycles
- Difficulty tuned so it's solvable in 3–8 attempts, ~2–3 minutes. The multiple timing cycles add depth but the grid has a clear "corridor" path that observant players will spot.
- "Fog of war" (limited visibility) implemented via CSS opacity on cells outside the view radius — simple distance check from player position
- On mobile, the D-pad is anchored to the bottom of the screen, large and thumb-friendly (48×48px buttons minimum)

---

### Stage 4 — The Vault (Combination Lock)

**Purpose**: Enter a 4-digit code to crack the vault. This is a meta-puzzle — the clues are embedded across all previous stages, rewarding players who paid attention. Smart kids will enjoy the "aha!" moment of connecting information across missions.

**Puzzle Mechanic**:
- A large animated vault door with a 4-dial combination lock
- Each dial scrolls 0–9 (swipe up/down on mobile, click arrows on desktop)
- The clues are presented as cryptic riddles in a "classified dossier" panel — not spelled out plainly. The player must think:
  - Clue 1: *"Protocol Alpha — count the matched evidence pairs from the Matrix"* → **8** (8 pairs in the Memory Matrix)
  - Clue 2: *"Protocol Bravo — the decoded message had this many words with exactly 3 letters"* → **3** ("NEW", "THE", "WAY")
  - Clue 3: *"Protocol Charlie — unique symbols in the cipher, minus the one given free"* → **8** (9 unique symbols − 1 free hint)
  - Clue 4: *"Protocol Delta — your grid was this many rows tall"* → **8** (8×8 grid, or 6 on mobile — this must use the grid size the player actually played)
- The code is: **8 - 3 - 8 - 8** (desktop) or **8 - 3 - 8 - 6** (mobile, if they played the 6×6 grid)
- **Implementation note**: The vault code is dynamically derived from `GameState.stageData`, not hardcoded. This makes it tamper-proof and correctly adapts to the responsive grid size.
- A "CRACK" button submits the combination
- Wrong code → vault shakes with a "bzzt" animation, dials reset
- A "REVIEW MISSION LOG" button lets them revisit each stage's key stats (pairs matched, cipher details, grid size)

**On Completion**:
- Correct code → vault door swings open with dramatic animation
- The decoded fragment revealed: **"COUSIN"**
- Transition to Final Reveal

**Technical Notes**:
- Dial implemented as a vertical number carousel with CSS `overflow: hidden` and transform translate; swipe gesture on mobile via touch events
- Vault door uses CSS 3D perspective transform for the swing-open effect
- Wrong attempt counter: "ATTEMPT 2/∞" — no lockout, but after 3 wrong attempts the clue riddles get a parenthetical clarification to keep kids from getting stuck
- The dynamic vault code is computed in `main.js` from `GameState` so the answer is never a visible constant in source code

---

### Stage 5 — The Reveal (Final Screen)

**Purpose**: Deliver the secret message with maximum impact and celebration.

**Sequence**:
1. Screen goes dark. A loading/decrypting animation plays (fake "DECRYPTING..." progress bar, ~3 seconds)
2. Fragments from each stage assemble on screen one by one with a typewriter effect:
   **A** ... **NEW** ... **BABY** ... (pause) ... **COUSIN** ...
3. Full message assembles and enlarges: **"A NEW BABY IS ON THE WAY — YOU'RE GETTING A COUSIN!"**
4. Confetti explosion fills the screen (canvas-based particle system)
5. Background transitions from dark spy theme to warm, celebratory colors (soft pink/blue/yellow gradient)
6. Optional: a personal note fades in below — "Love, [Family names]" (hardcoded or configurable)
7. A "REPLAY MISSION" button and a "SHARE" button (copies a link)

**Technical Notes**:
- Confetti: lightweight canvas particle system — 200–300 particles with gravity, rotation, and fade
- Typewriter effect: `setTimeout` chain with variable timing per character
- Background color transition: CSS `transition` on a full-screen overlay
- The personal message at the bottom should be easy to customize (clearly marked constant at top of JS file)

---

## File Structure

```
/puzzle
├── AGENTS.md            # This file — project plan
├── index.html           # Single HTML file, all stages rendered as sections
├── css/
│   └── styles.css       # All styling, animations, responsive design
├── js/
│   ├── main.js          # App controller: stage management, transitions, state
│   ├── memory.js        # Stage 1 — Memory Matrix game logic
│   ├── cipher.js        # Stage 2 — Code Breaker game logic
│   ├── laser.js         # Stage 3 — Laser Grid game logic
│   ├── vault.js         # Stage 4 — Vault combination lock logic
│   └── confetti.js      # Final reveal confetti particle system
└── assets/
    └── favicon.ico      # Spy-themed favicon (magnifying glass or lock)
```

All JS files are loaded via `<script>` tags in `index.html` (no bundler). Each game module exposes an `init()` and `destroy()` function called by `main.js` during stage transitions.

---

## Technical Architecture

### State Management

A single global state object in `main.js`:

```javascript
const GameState = {
  agentName: '',
  currentStage: 0,         // 0=briefing, 1=memory, 2=cipher, 3=laser, 4=vault, 5=reveal
  fragments: [],            // collected message fragments
  stageData: {
    memory: { moves: 0, completed: false },
    cipher: { hintsUsed: 0, completed: false },
    laser: { attempts: 0, completed: false },
    vault: { attempts: 0, completed: false }
  }
};
```

### Stage Transitions

- Each stage is a `<section>` in `index.html` with `display: none` by default
- `main.js` manages visibility: fade-out current → update progress bar → fade-in next
- Transition animation: 400ms CSS opacity transition with a brief "LOADING NEXT PROTOCOL..." interstitial

### Progress Bar

Persistent across stages. Styled as a horizontal security clearance meter:

```
CLEARANCE: [■ ■ □ □ □] LEVEL 2 / 5
```

Updates on each stage completion with a fill animation.

### Responsive Design

See **"Hard Requirement: Mobile & Tablet First"** above — that section is the authoritative source for all mobile rules. Summary of layout adaptations:

- **Mobile-first CSS** — write base styles for 375px width, then use `min-width` media queries to enhance for larger screens
- Breakpoints: 375px (small phone baseline), 480px (large phone), 768px (tablet), 1024px+ (desktop)
- Memory cards: 3×4 grid on phones (3 columns, 4 rows), 4×3 on tablets and up
- Laser grid: 6×6 on phones (with fewer lasers), 8×8 on tablets and desktop
- Cipher tiles: single-row scrollable tray on phones, multi-row grid on tablets/desktop
- Vault dials: large enough for thumb interaction, spaced with at least 12px gap
- All game containers use `max-width` with auto margins to stay centered and readable on large screens
- No interaction relies on hover, drag-and-drop API, or keyboard-only input

### Accessibility

- All interactive elements are keyboard-navigable
- ARIA labels on game elements ("Card 1 of 12, face down")
- Sufficient color contrast (4.5:1 minimum)
- Game does not rely solely on color to convey information
- Reduced-motion media query: disable animations for users who prefer reduced motion

### Performance

- No external dependencies or CDNs — fully self-contained
- Total payload target: < 200KB (no heavy assets)
- All animations use `transform` and `opacity` (GPU-composited, no layout thrashing)
- Images: inline SVG or emoji only — no raster image downloads

---

## Configurable Constants

At the top of `main.js`, expose easy-to-edit constants:

```javascript
const CONFIG = {
  PERSONAL_MESSAGE: "Love, Sunny & [Partner]",
  REVEAL_MESSAGE: "A NEW BABY IS ON THE WAY!\nYOU'RE GETTING A COUSIN!",
  // VAULT_CODE is NOT hardcoded — it is computed dynamically from GameState
  // so the answer can't be found by reading source code
  ENABLE_SOUND: false,
  DEBUG_MODE: false  // skip to any stage for testing
};
```

---

## GitHub Pages Deployment

- Repository root serves the site (no `/docs` subfolder needed)
- No build step — push and it's live
- Add a minimal `404.html` that redirects to `index.html` (SPA fallback)
- No `CNAME` unless custom domain is desired

---

## Development Sequence

Build in this order, testing each stage in isolation before connecting:

1. **Scaffold**: `index.html` with all section shells, `styles.css` with base theme, `main.js` with stage controller
2. **Stage 0**: Landing screen with name input and accept button
3. **Stage 1**: Memory Matrix — fully playable standalone
4. **Stage 2**: Code Breaker — fully playable standalone
5. **Stage 3**: Laser Grid — fully playable standalone
6. **Stage 4**: Vault Lock — fully playable standalone
7. **Stage 5**: Final reveal with confetti
8. **Integration**: Wire all stages together with transitions and progress bar
9. **Polish**: Animations, responsive tweaks, accessibility pass
10. **Deploy**: Push to GitHub, enable Pages, test on mobile devices

---

## Quality Checklist

Before calling this done:

**Functionality**
- [ ] Every stage is completable without getting permanently stuck (hints, resets, or fallbacks exist)
- [ ] The secret ("baby/cousin") is never visible in the HTML source — the reveal text is constructed at runtime from encoded fragments so a curious kid inspecting source doesn't spoil it
- [ ] The personal message is easy to change (single constant)
- [ ] `DEBUG_MODE` allows skipping directly to any stage for testing

**Mobile & Touch (HARD REQUIREMENT)**
- [ ] Every stage is completable using only touch input — no keyboard, no mouse, no hover required
- [ ] Tested and fully functional on **iPhone Safari** (latest iOS)
- [ ] Tested and fully functional on **Chrome for Android** (latest)
- [ ] Tested on iPad / tablet in both portrait and landscape orientations
- [ ] No iOS Safari quirks: no unwanted zoom on input focus, no rubber-band scroll during gameplay, no double-tap zoom on buttons
- [ ] On-screen D-pad works reliably on the laser grid stage (touch targets ≥ 48×48px)
- [ ] Tap-to-select, tap-to-place works reliably on the cipher stage
- [ ] Vault dials are scrollable/tappable with a thumb
- [ ] No horizontal overflow or scroll on any screen ≥ 375px wide
- [ ] `viewport` meta tag is present with `user-scalable=no`
- [ ] `dvh` is used instead of `vh` for full-screen height calculations

**Cross-Browser**
- [ ] Works on Chrome (desktop + Android), Safari (macOS + iOS), Firefox (desktop)
- [ ] Keyboard navigation works for all puzzles (desktop enhancement)

**Performance**
- [ ] Page loads in under 2 seconds on a 3G connection
- [ ] Confetti doesn't tank performance on low-end devices (cap particle count, use `requestAnimationFrame`)
- [ ] No layout thrashing — animations use `transform` and `opacity` only
