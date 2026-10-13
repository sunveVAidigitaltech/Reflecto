# Aetheria: Puzzle Lab & Game Design Studio (Mobile-Ready)

> Next-Generation Cross-Platform Mobile Puzzle Game Studio, 6 Playable Game Engines, 56 Levels, and Level Builder.

---

## 🎮 All 6 Playable Games Included

### 1. ⚡ Quantum Lumina (Optics & Laser Routing)
* **Mechanics:** Direct laser beams across reflective chambers using rotatable angled mirrors, prisms, beam splitters, and wormhole portals.
* **Levels:** 12 progressively challenging handcrafted chambers.
* **Controls:** Tap cell directly or use on-screen **Rotate Piece (↻)** button.

### 2. 🔌 Circuit Flow (Energy Matrix Topology)
* **Mechanics:** Restore power to critical core terminals by rotating conduit segments (lines, elbows, T-junctions, crossbars) with live animated electricity waves.
* **Levels:** 10 progressive levels from 4x4 up to 6x6 supergrids.
* **Controls:** Tap conduit directly or use **Rotate Piece (↻)** button.

### 3. 💎 Chroma Slide (Nova Shift)
* **Mechanics:** Directional momentum sliding puzzles. Colored gems slide indefinitely until obstructed; dock into matching pedestals.
* **Levels:** 10 spatial challenges with par moves and full undo history (`Z`).
* **Controls:** Swipe in any direction or use the on-screen **D-Pad**.

### 4. 🌌 Echo Gravity (Celestial Slingshot) *(NEW)*
* **Mechanics:** Orbital physics puzzle. Position gravitational attractor wells (pull) and pulsar repulsors (push) to curve probe trajectories past asteroid belts into event horizons.
* **Levels:** 8 cosmic levels with real-time **predictive trajectory arc**.
* **Controls:** Drag gravity wells; tap **Launch Probe** or press Space.

### 5. 📜 Glyph Weaver (Word Alchemy) *(NEW)*
* **Mechanics:** Linguistic rune puzzle. Drag/trace contiguous adjacent letter paths to forge target words, triggering elemental reactions.
* **Levels:** 8 word-craft challenge levels with built-in dictionary verification.
* **Controls:** Drag across contiguous letter tiles with touch or mouse.

### 6. 🪞 Duality (Split-Dimension Coordination) *(NEW)*
* **Mechanics:** Symmetrical / Asymmetrical maze puzzle. Control Avatar Alpha (Cyan) while Avatar Beta (Magenta) moves with mirrored/inverted physics. Coordinate pressure plates and dual exit gates.
* **Levels:** 8 coordination levels.
* **Controls:** Swipe or use the on-screen **D-Pad**.

---

## 🛠️ Architecture & Features

* **Universal Virtual Resolution (`600x600`)**: Eliminates High-DPI / Retina canvas clipping bugs, guaranteeing crisp rendering and exact touch mapping on every mobile and desktop display.
* **Tactile Mobile Controls**: On-screen D-Pad, contextual action buttons, vibration haptic feedback (`navigator.vibrate`), and thumb-zone bottom navigation bar.
* **Zero External Dependencies**: Pure semantic HTML5, CSS Glassmorphism design system, and modern modular JavaScript.
* **Web Audio API Procedural Synthesizer**: Procedural oscillator bank for clicks, hums, crystal resonance, and victory fanfares without external audio files.
* **Level Builder & Sandbox**: Interactive tool for designing custom laser puzzle boards and exporting JSON.
* **Cross-Platform Capacitor Support**: Ready to wrap into native Android (`.apk`) and iOS packages.

---

## 🚀 Running Locally

```bash
# Run tests (validates all 6 engines & 56 levels)
npm test

# Start local server
npm start
```

Open your browser to: **`http://localhost:8080`**

---

## 📱 Mobile Native Packaging (Capacitor)

```bash
# Sync web assets to native mobile project
npx @capacitor/cli sync

# Open in Android Studio
npx @capacitor/cli open android

# Open in Xcode (macOS)
npx @capacitor/cli open ios
```
