/**
 * REFLECTO - PASTEL KIDS OPTICS ENGINE
 * Uses OpticsCore for deterministic light physics.
 * Features ultra-cute pastel aesthetics:
 * - Sleepy stars that wake up and smile with squash-and-stretch pop when lit!
 * - Smooth spring-animated mirror rotation with candy bounce.
 * - Flowing animated photon beads streaming along the candy beams.
 * - Grumpy storm clouds that wobble when struck.
 * - Toy wooden building block walls.
 * - Prism splitters, jelly color filters, and magic donut portals!
 * - Built-in Hint System (up to 3 free hints per level).
 * - Interactive Tutorial Guide Hand on early levels.
 */

const Core = (typeof OpticsCore !== 'undefined') ? OpticsCore : (typeof require !== 'undefined' ? require('./optics-core.js') : null);

class OpticsEngine {
  constructor(canvas, onWinCallback, onMoveCallback, onPieceSelectCallback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onWin = onWinCallback;
    this.onMove = onMoveCallback;
    this.onPieceSelect = onPieceSelectCallback;

    this.VIRTUAL_SIZE = 600;
    this.gridSize = 8;
    this.level = null;
    this.mirrors = [];
    this.selectedMirrorIndex = -1;

    this.moves = 0;
    this.isLevelWon = false;
    this.isBombHit = false;
    this.currentLevelIndex = 0;
    this.hintsRemaining = 3;
    this.hintedMirrorIndex = -1;

    this.particles = [];
    this.confetti = [];
    this.pulseAngle = 0;
    this.animFrameId = null;
    this.undoStack = [];

    // Pastel Theme Color Palette
    this.palette = {
      pink:     { beam: '#FF4D88', glow: 'rgba(255, 77, 136, 0.45)', core: '#FFE5ED', dark: '#E01E5A' },
      blue:     { beam: '#2997FF', glow: 'rgba(41, 151, 255, 0.45)', core: '#E1F0FF', dark: '#0066CC' },
      mint:     { beam: '#059669', glow: 'rgba(16, 185, 129, 0.45)', core: '#D1FAE5', dark: '#047857' },
      yellow:   { beam: '#D97706', glow: 'rgba(245, 158, 11, 0.45)', core: '#FEF3C7', dark: '#B45309' },
      lavender: { beam: '#9333EA', glow: 'rgba(168, 85, 247, 0.45)', core: '#F3E8FF', dark: '#7E22CE' },
      peach:    { beam: '#EA580C', glow: 'rgba(249, 115, 22, 0.45)', core: '#FFEDD5', dark: '#C2410C' },
      default:  { beam: '#2997FF', glow: 'rgba(41, 151, 255, 0.45)', core: '#FFFFFF', dark: '#0066CC' }
    };

    this.initLevels();
    this.bindEvents();
    this.startAnimationLoop();
  }

  initLevels() {
    if (typeof LUMINA_LEVELS !== 'undefined' && Array.isArray(LUMINA_LEVELS) && LUMINA_LEVELS.length > 0) {
      this.levels = LUMINA_LEVELS;
    } else {
      console.warn("LUMINA_LEVELS not loaded. Using fallback.");
      this.levels = [{
        id: 1, chapter: 1, chapterTitle: "Sunny Start", title: "First Light",
        desc: "Tap the mirror to flip it and wake up the sleepy star!",
        gridSize: 8,
        emitters: [{ x: 1, y: 1, dir: 'E', color: 'blue' }],
        targets: [{ x: 5, y: 5, color: 'blue' }],
        mirrors: [{ x: 5, y: 1, type: '/', locked: false }],
        walls: [], splitters: [], filters: [], portals: [], bombs: [],
        parMoves: 1, solution: ['\\']
      }];
    }
  }

  loadLevel(index) {
    if (index < 0 || index >= this.levels.length) return;
    this.currentLevelIndex = index;
    const lvl = JSON.parse(JSON.stringify(this.levels[index]));
    this.level = lvl;
    this.gridSize = lvl.gridSize || 8;
    this.mirrors = lvl.mirrors || [];
    this.emitters = lvl.emitters || [];
    this.targets = lvl.targets || [];
    this.walls = lvl.walls || [];
    this.bombs = lvl.bombs || [];
    this.splitters = lvl.splitters || [];
    this.filters = lvl.filters || [];
    this.portals = lvl.portals || [];

    // Initialize smooth rotation & animation states for mirrors
    this.mirrors.forEach(m => {
      const isSlash = (m.type === '/');
      m.currentAngle = isSlash ? -Math.PI / 4 : Math.PI / 4;
      m.targetAngle = m.currentAngle;
      m.scale = 1.0;
    });

    // Initialize target star states
    this.targets.forEach(t => {
      t.wasLit = false;
      t.popScale = 1.0;
    });

    this.moves = 0;
    this.isLevelWon = false;
    this.isBombHit = false;
    this.hintsRemaining = 3;
    this.hintedMirrorIndex = -1;
    this.undoStack = [];
    this.particles = [];
    this.confetti = [];

    // Select first movable mirror
    const firstMovable = this.mirrors.findIndex(m => !m.locked);
    this.selectedMirrorIndex = firstMovable !== -1 ? firstMovable : 0;

    this.recalculateRays();
    if (this.onMove) this.onMove(this.moves, lvl.parMoves, this.hintsRemaining);
    this.notifyPieceSelected();
  }

  notifyPieceSelected() {
    if (!this.onPieceSelect) return;
    if (this.selectedMirrorIndex >= 0 && this.selectedMirrorIndex < this.mirrors.length) {
      const m = this.mirrors[this.selectedMirrorIndex];
      this.onPieceSelect({
        type: 'mirror',
        x: m.x,
        y: m.y,
        orient: m.type,
        locked: !!m.locked,
        desc: m.locked ? "Locked Mirror (cannot flip)" : "Bouncy Mirror (tap to flip 45°)"
      });
    } else {
      this.onPieceSelect(null);
    }
  }

  recalculateRays() {
    if (!this.level || !this.mirrors) return;
    const cmap = Core.buildCellMap(this.level);
    const types = this.mirrors.map(m => m.type);
    this.traceResult = Core.trace(this.level, cmap, types);

    this.isBombHit = this.traceResult.bomb;

    // Check win condition
    if (this.traceResult.ok && !this.isLevelWon) {
      this.triggerWin();
    }
  }

  flipMirror(index) {
    if (this.isLevelWon || index < 0 || index >= this.mirrors.length) return false;
    const m = this.mirrors[index];
    if (m.locked) {
      if (window.soundFX && window.soundFX.softThud) window.soundFX.softThud();
      return false;
    }

    // Save for undo
    this.undoStack.push({
      index,
      prevType: m.type
    });
    if (this.undoStack.length > 40) this.undoStack.shift();

    // Flip \ <-> /
    m.type = Core.flip(m.type);
    const isSlash = (m.type === '/');
    m.targetAngle = isSlash ? -Math.PI / 4 : Math.PI / 4;
    m.scale = 1.25; // bouncy scale pop

    this.moves++;
    this.selectedMirrorIndex = index;

    // If hinted mirror was flipped to correct solution, clear hint highlight
    if (this.hintedMirrorIndex === index) {
      if (this.level.solution && this.level.solution[index] === m.type) {
        this.hintedMirrorIndex = -1;
      }
    }

    if (window.soundFX && window.soundFX.candyPop) {
      window.soundFX.candyPop();
    } else if (window.soundFX && window.soundFX.rotateClick) {
      window.soundFX.rotateClick();
    }

    if (navigator.vibrate) navigator.vibrate(18);

    // Spawn cute little candy puff at mirror
    this.spawnPuff(m.x, m.y);

    this.recalculateRays();
    if (this.onMove) this.onMove(this.moves, this.level.parMoves, this.hintsRemaining);
    this.notifyPieceSelected();
    return true;
  }

  flipSelectedMirror() {
    if (this.selectedMirrorIndex >= 0) {
      return this.flipMirror(this.selectedMirrorIndex);
    }
    return false;
  }

  rotateSelectedMirror(forward = true) {
    return this.flipSelectedMirror();
  }

  undo() {
    if (this.isLevelWon || this.undoStack.length === 0) return false;
    const item = this.undoStack.pop();
    if (this.mirrors[item.index]) {
      const m = this.mirrors[item.index];
      m.type = item.prevType;
      const isSlash = (m.type === '/');
      m.targetAngle = isSlash ? -Math.PI / 4 : Math.PI / 4;
      m.scale = 1.18;

      this.selectedMirrorIndex = item.index;
      if (this.moves > 0) this.moves--;
      if (window.soundFX && window.soundFX.undoTick) window.soundFX.undoTick();
      this.recalculateRays();
      if (this.onMove) this.onMove(this.moves, this.level.parMoves, this.hintsRemaining);
      this.notifyPieceSelected();
      return true;
    }
    return false;
  }

  useHint() {
    if (this.isLevelWon || this.hintsRemaining <= 0 || !this.level.solution) return null;

    // Find a mirror that is currently incorrect and not locked
    const incorrectIndices = [];
    for (let i = 0; i < this.mirrors.length; i++) {
      if (!this.mirrors[i].locked && this.mirrors[i].type !== this.level.solution[i]) {
        incorrectIndices.push(i);
      }
    }

    if (incorrectIndices.length === 0) {
      return null;
    }

    // Pick first incorrect mirror
    const targetIdx = incorrectIndices[0];
    this.hintedMirrorIndex = targetIdx;
    this.selectedMirrorIndex = targetIdx;
    this.hintsRemaining--;

    if (window.soundFX && window.soundFX.filterTone) window.soundFX.filterTone();
    if (navigator.vibrate) navigator.vibrate([20, 30, 20]);

    if (this.onMove) this.onMove(this.moves, this.level.parMoves, this.hintsRemaining);
    this.notifyPieceSelected();

    const m = this.mirrors[targetIdx];
    return {
      index: targetIdx,
      x: m.x,
      y: m.y,
      neededType: this.level.solution[targetIdx]
    };
  }

  triggerWin() {
    this.isLevelWon = true;
    if (window.soundFX && window.soundFX.crystalHit) window.soundFX.crystalHit();
    if (navigator.vibrate) navigator.vibrate([40, 60, 80]);

    // Spawn party confetti
    this.spawnConfetti();

    setTimeout(() => {
      if (window.soundFX && window.soundFX.victoryFanfare) window.soundFX.victoryFanfare();
      if (this.onWin) {
        const par = this.level.parMoves;
        const diff = this.moves - par;
        const stars = diff <= 0 ? 3 : (diff <= 2 ? 2 : 1);
        this.onWin(this.currentLevelIndex + 1, stars, this.moves, par);
      }
    }, 450);
  }

  bindEvents() {
    const handlePointer = (evt) => {
      evt.preventDefault();
      if (this.isLevelWon) return;

      const rect = this.canvas.getBoundingClientRect();
      const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : null);
      const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : null);
      if (clientX === null || clientY === null) return;

      // Virtual coordinate mapping (600x600)
      const scaleX = this.VIRTUAL_SIZE / rect.width;
      const scaleY = this.VIRTUAL_SIZE / rect.height;
      const clickX = (clientX - rect.left) * scaleX;
      const clickY = (clientY - rect.top) * scaleY;

      const cellSize = this.VIRTUAL_SIZE / this.gridSize;
      const gx = Math.floor(clickX / cellSize);
      const gy = Math.floor(clickY / cellSize);

      // Check if user tapped a mirror
      const mIdx = this.mirrors.findIndex(m => m.x === gx && m.y === gy);
      if (mIdx !== -1) {
        this.flipMirror(mIdx);
      }
    };

    this.canvas.addEventListener('click', handlePointer);
    this.canvas.addEventListener('touchstart', handlePointer, { passive: false });
  }

  spawnPuff(gx, gy) {
    const cellSize = this.VIRTUAL_SIZE / this.gridSize;
    const px = (gx + 0.5) * cellSize;
    const py = (gy + 0.5) * cellSize;
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: px, y: py,
        vx: (Math.random() - 0.5) * 3.5,
        vy: (Math.random() - 0.5) * 3.5,
        size: Math.random() * 8 + 4,
        color: '#BAE6FD',
        life: 1.0, decay: 0.05
      });
    }
  }

  spawnStarSparkles(px, py, color) {
    const emojis = ['✨', '⭐', '💖', '🌟'];
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8 + Math.random() * 0.2;
      const speed = 2 + Math.random() * 3.5;
      this.particles.push({
        x: px, y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.8,
        size: 16,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        life: 1.0,
        decay: 0.022
      });
    }
  }

  spawnConfetti() {
    const colors = ['#FF8FAB', '#70C1FF', '#B8F0D8', '#FFE59A', '#D4C4FF', '#FFCBA4'];
    for (let i = 0; i < 65; i++) {
      this.confetti.push({
        x: this.VIRTUAL_SIZE / 2,
        y: this.VIRTUAL_SIZE / 2,
        vx: (Math.random() - 0.5) * 13,
        vy: (Math.random() - 0.7) * 15,
        size: Math.random() * 9 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.22,
        life: 1.0,
        decay: 0.012 + Math.random() * 0.008
      });
    }
  }

  startAnimationLoop() {
    const loop = () => {
      this.pulseAngle += 0.04;
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  render() {
    const dpr = window.devicePixelRatio || 1;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.ctx.clearRect(0, 0, this.VIRTUAL_SIZE, this.VIRTUAL_SIZE);

    if (!this.level) return;
    const cellSize = this.VIRTUAL_SIZE / this.gridSize;

    // 1. Cozy Pastel Board Canvas
    this.drawBoard(cellSize);

    // 2. Wooden Building Block Walls
    this.drawWalls(cellSize);

    // 3. Jelly Stained-Glass Filters
    this.drawFilters(cellSize);

    // 4. Magic Donut Portals
    this.drawPortals(cellSize);

    // 5. Prism Gem Splitters
    this.drawSplitters(cellSize);

    // 6. Grumpy Storm Clouds (Avoid them!)
    this.drawBombs(cellSize);

    // 7. Light Rays (Multi-pass vibrant candy beam with animated flowing photon beads)
    this.drawLightBeams(cellSize);

    // 8. Sleepy / Happy Wake-up Stars (Targets)
    this.drawStars(cellSize);

    // 9. Friendly Sun / Flashlight Emitters
    this.drawEmitters(cellSize);

    // 10. Candy-Coated Mirrors with Spring Rotation
    this.drawMirrors(cellSize);

    // 11. Interactive Tutorial Hand (on early levels)
    this.drawTutorialHand(cellSize);

    // 12. Animated Particles & Confetti
    this.drawParticles();
  }

  drawBoard(cellSize) {
    const bgGrad = this.ctx.createLinearGradient(0, 0, this.VIRTUAL_SIZE, this.VIRTUAL_SIZE);
    bgGrad.addColorStop(0, '#FFFDF8');
    bgGrad.addColorStop(1, '#F7FAFC');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.VIRTUAL_SIZE, this.VIRTUAL_SIZE);

    // Delicate pastel grid lines
    this.ctx.strokeStyle = '#EBF2F7';
    this.ctx.lineWidth = 1.5;
    for (let i = 0; i <= this.gridSize; i++) {
      const pos = i * cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(pos, 0);
      this.ctx.lineTo(pos, this.VIRTUAL_SIZE);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, pos);
      this.ctx.lineTo(this.VIRTUAL_SIZE, pos);
      this.ctx.stroke();
    }

    // Gentle dots at grid intersections
    for (let x = 1; x < this.gridSize; x++) {
      for (let y = 1; y < this.gridSize; y++) {
        this.ctx.fillStyle = '#CBDCEB';
        this.ctx.beginPath();
        this.ctx.arc(x * cellSize, y * cellSize, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  drawWalls(cellSize) {
    if (!this.level.walls) return;
    this.level.walls.forEach(w => {
      const x = w.x * cellSize + 5;
      const y = w.y * cellSize + 5;
      const s = cellSize - 10;
      const r = 10;

      this.ctx.save();
      this.ctx.shadowColor = 'rgba(180, 140, 100, 0.25)';
      this.ctx.shadowBlur = 6;
      this.ctx.shadowOffsetY = 3;

      const wood = this.ctx.createLinearGradient(x, y, x, y + s);
      wood.addColorStop(0, '#E8C18C');
      wood.addColorStop(1, '#D1A36B');
      this.ctx.fillStyle = wood;
      this.roundRect(x, y, s, s, r);
      this.ctx.fill();

      this.ctx.shadowColor = 'transparent';
      this.ctx.strokeStyle = '#BA8B52';
      this.ctx.lineWidth = 2;
      this.roundRect(x, y, s, s, r);
      this.ctx.stroke();

      // Top highlight
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.roundRect(x + 3, y + 3, s - 6, (s - 6) * 0.35, 6);
      this.ctx.fill();

      // Soft center circle
      this.ctx.fillStyle = '#C4945A';
      this.ctx.beginPath();
      this.ctx.arc(x + s / 2, y + s / 2, s * 0.22, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  drawFilters(cellSize) {
    if (!this.level.filters) return;
    this.level.filters.forEach(f => {
      const cx = (f.x + 0.5) * cellSize;
      const cy = (f.y + 0.5) * cellSize;
      const s = cellSize * 0.76;
      const pal = this.palette[f.color] || this.palette.pink;

      this.ctx.save();
      this.ctx.fillStyle = pal.core;
      this.roundRect(cx - s / 2, cy - s / 2, s, s, 12);
      this.ctx.fill();

      this.ctx.strokeStyle = pal.beam;
      this.ctx.lineWidth = 3;
      this.roundRect(cx - s / 2, cy - s / 2, s, s, 12);
      this.ctx.stroke();

      this.ctx.fillStyle = pal.glow;
      this.roundRect(cx - s * 0.35, cy - s * 0.35, s * 0.7, s * 0.7, 8);
      this.ctx.fill();

      this.ctx.fillStyle = pal.beam;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, s * 0.16, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  drawPortals(cellSize) {
    if (!this.level.portals) return;
    this.level.portals.forEach(p => {
      const cx = (p.x + 0.5) * cellSize;
      const cy = (p.y + 0.5) * cellSize;
      const r = cellSize * 0.36;

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.rotate(this.pulseAngle * 1.5);

      const grad = this.ctx.createRadialGradient(0, 0, 4, 0, 0, r);
      grad.addColorStop(0, '#E9D5FF');
      grad.addColorStop(0.6, 'rgba(192, 132, 252, 0.5)');
      grad.addColorStop(1, 'rgba(192, 132, 252, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = '#A855F7';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
      this.ctx.stroke();

      // Cute sprinkles on donut portal
      this.ctx.fillStyle = '#F472B6';
      this.ctx.beginPath();
      this.ctx.arc(0, -r * 0.7, 3, 0, Math.PI * 2);
      this.ctx.arc(r * 0.7, 0, 3, 0, Math.PI * 2);
      this.ctx.arc(0, r * 0.7, 3, 0, Math.PI * 2);
      this.ctx.arc(-r * 0.7, 0, 3, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.rotate(-this.pulseAngle * 1.5);
      this.ctx.fillStyle = '#6B21A8';
      this.ctx.font = 'bold 12px "Fredoka", "Baloo 2", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(p.id, 0, 0);

      this.ctx.restore();
    });
  }

  drawSplitters(cellSize) {
    if (!this.level.splitters) return;
    this.level.splitters.forEach(s => {
      const cx = (s.x + 0.5) * cellSize;
      const cy = (s.y + 0.5) * cellSize;
      const sz = cellSize * 0.38;

      this.ctx.save();
      this.ctx.translate(cx, cy);

      // 1. Diamond Outer Boundary
      this.ctx.beginPath();
      this.ctx.moveTo(0, -sz);
      this.ctx.lineTo(sz, 0);
      this.ctx.lineTo(0, sz);
      this.ctx.lineTo(-sz, 0);
      this.ctx.closePath();

      // 2. High-Contrast Dark Neon Blue Gradient Fill
      const pGrad = this.ctx.createLinearGradient(-sz, -sz, sz, sz);
      pGrad.addColorStop(0, '#00F0FF');    // Electric Neon Cyan Highlight
      pGrad.addColorStop(0.3, '#0077B6');  // Vivid Neon Blue
      pGrad.addColorStop(0.7, '#052347');  // Deep Dark Neon Blue
      pGrad.addColorStop(1, '#020F1F');    // Cosmic Midnight Base
      this.ctx.fillStyle = pGrad;
      this.ctx.shadowColor = 'rgba(0, 240, 255, 0.95)';
      this.ctx.shadowBlur = 16;
      this.ctx.fill();

      // 3. 3D Crystal Specular Facets (High Contrast Highlights)
      this.ctx.shadowColor = 'transparent';

      // Top-Right Facet (Glossy Specular Gleam)
      this.ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
      this.ctx.beginPath();
      this.ctx.moveTo(0, -sz);
      this.ctx.lineTo(sz, 0);
      this.ctx.lineTo(0, 0);
      this.ctx.closePath();
      this.ctx.fill();

      // Bottom-Left Facet (Deep Contrast Shade)
      this.ctx.fillStyle = 'rgba(0, 10, 25, 0.65)';
      this.ctx.beginPath();
      this.ctx.moveTo(0, sz);
      this.ctx.lineTo(-sz, 0);
      this.ctx.lineTo(0, 0);
      this.ctx.closePath();
      this.ctx.fill();

      // 4. Heavy High-Contrast Outer Border
      this.ctx.strokeStyle = '#00F0FF';
      this.ctx.lineWidth = 3.2;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -sz);
      this.ctx.lineTo(sz, 0);
      this.ctx.lineTo(0, sz);
      this.ctx.lineTo(-sz, 0);
      this.ctx.closePath();
      this.ctx.stroke();

      // Inner Dark Base outline for depth
      this.ctx.strokeStyle = '#020F1F';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -sz + 2.5);
      this.ctx.lineTo(sz - 2.5, 0);
      this.ctx.lineTo(0, sz - 2.5);
      this.ctx.lineTo(-sz + 2.5, 0);
      this.ctx.closePath();
      this.ctx.stroke();

      // 5. Central Splitting Mirror Diagonal (Dark Backing + Pure White Core)
      const isSlash = (s.type === '/');
      const startX = -sz * 0.65;
      const startY = isSlash ? sz * 0.65 : -sz * 0.65;
      const endX = sz * 0.65;
      const endY = isSlash ? -sz * 0.65 : sz * 0.65;

      // Dark Backing Line for 100% contrast on any beam/background
      this.ctx.strokeStyle = '#030712';
      this.ctx.lineWidth = 6.0;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();

      // Electric Neon Glow Strip
      this.ctx.strokeStyle = '#00F0FF';
      this.ctx.lineWidth = 4.0;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();

      // Crisp White Mirror Reflection Line
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 2.2;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();

      // Corner Sparkle
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(0, -sz * 0.65, 3, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  drawBombs(cellSize) {
    if (!this.level.bombs) return;
    this.level.bombs.forEach(b => {
      const cx = (b.x + 0.5) * cellSize;
      const cy = (b.y + 0.5) * cellSize;
      const r = cellSize * 0.36;

      this.ctx.save();
      // Grumpy wobble if hit
      const wobble = this.isBombHit ? Math.sin(this.pulseAngle * 12) * 4 : 0;
      this.ctx.translate(cx + wobble, cy);

      this.ctx.fillStyle = this.isBombHit ? '#F87171' : '#94A3B8';
      this.ctx.shadowColor = this.isBombHit ? 'rgba(239, 68, 68, 0.5)' : 'rgba(148, 163, 184, 0.3)';
      this.ctx.shadowBlur = 8;

      this.ctx.beginPath();
      this.ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
      this.ctx.arc(-r * 0.5, 0, r * 0.5, 0, Math.PI * 2);
      this.ctx.arc(r * 0.5, 0, r * 0.5, 0, Math.PI * 2);
      this.ctx.arc(-r * 0.25, -r * 0.45, r * 0.55, 0, Math.PI * 2);
      this.ctx.arc(r * 0.25, -r * 0.45, r * 0.55, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.shadowColor = 'transparent';

      // Grumpy Eyes & Brow
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(-r * 0.25, -r * 0.1, 3, 0, Math.PI * 2);
      this.ctx.arc(r * 0.25, -r * 0.1, 3, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = '#1E293B';
      this.ctx.lineWidth = 1.8;
      this.ctx.beginPath();
      this.ctx.moveTo(-r * 0.38, -r * 0.28);
      this.ctx.lineTo(-r * 0.12, -r * 0.18);
      this.ctx.moveTo(r * 0.38, -r * 0.28);
      this.ctx.lineTo(r * 0.12, -r * 0.18);
      this.ctx.stroke();

      // Pouting mouth
      this.ctx.beginPath();
      this.ctx.arc(0, r * 0.22, 4, Math.PI, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.restore();
    });
  }

  drawLightBeams(cellSize) {
    if (!this.traceResult || !this.traceResult.segs) return;

    for (const seg of this.traceResult.segs) {
      if (!seg.pts || seg.pts.length < 2) continue;
      const pal = this.palette[seg.color] || this.palette.default;

      // Pass 1: Soft diffuse glow aura
      this.ctx.save();
      this.ctx.strokeStyle = pal.glow;
      this.ctx.lineWidth = 15;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();
      for (let i = 0; i < seg.pts.length; i++) {
        const [gx, gy] = seg.pts[i];
        const px = (gx + 0.5) * cellSize;
        const py = (gy + 0.5) * cellSize;
        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.stroke();
      this.ctx.restore();

      // Pass 2: Main vibrant candy beam
      this.ctx.save();
      this.ctx.strokeStyle = pal.beam;
      this.ctx.lineWidth = 5.5;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();
      for (let i = 0; i < seg.pts.length; i++) {
        const [gx, gy] = seg.pts[i];
        const px = (gx + 0.5) * cellSize;
        const py = (gy + 0.5) * cellSize;
        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.stroke();
      this.ctx.restore();

      // Pass 3: White center core
      this.ctx.save();
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 2.2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();
      for (let i = 0; i < seg.pts.length; i++) {
        const [gx, gy] = seg.pts[i];
        const px = (gx + 0.5) * cellSize;
        const py = (gy + 0.5) * cellSize;
        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.stroke();
      this.ctx.restore();

      // Pass 4: Animated Glowing Photon Candy Beads
      this.ctx.save();
      const photonSpacing = 26;
      const flowOffset = (this.pulseAngle * 22) % photonSpacing;

      for (let i = 0; i < seg.pts.length - 1; i++) {
        const [x1, y1] = seg.pts[i];
        const [x2, y2] = seg.pts[i + 1];
        const px1 = (x1 + 0.5) * cellSize;
        const py1 = (y1 + 0.5) * cellSize;
        const px2 = (x2 + 0.5) * cellSize;
        const py2 = (y2 + 0.5) * cellSize;

        const dx = px2 - px1;
        const dy = py2 - py1;
        const dist = Math.hypot(dx, dy);
        if (dist <= 0) continue;

        const ux = dx / dist;
        const uy = dy / dist;

        for (let d = flowOffset; d < dist; d += photonSpacing) {
          const bx = px1 + ux * d;
          const by = py1 + uy * d;

          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.shadowColor = pal.glow;
          this.ctx.shadowBlur = 6;
          this.ctx.beginPath();
          this.ctx.arc(bx, by, 3, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
      this.ctx.restore();
    }
  }

  drawStars(cellSize) {
    if (!this.level.targets) return;

    this.level.targets.forEach((t, idx) => {
      const cx = (t.x + 0.5) * cellSize;
      const cy = (t.y + 0.5) * cellSize;
      const r = cellSize * 0.40;
      const isLit = this.traceResult && this.traceResult.lit && this.traceResult.lit.has(idx);
      const pal = this.palette[t.color] || this.palette.yellow;

      // Initialize pop scale & sparkle trigger on wake-up
      if (!t.popScale) t.popScale = 1.0;
      const wasLit = !!t.wasLit;
      t.wasLit = isLit;

      if (!wasLit && isLit) {
        t.popScale = 1.42; // Squash-and-stretch pop!
        this.spawnStarSparkles(cx, cy, pal.beam);
        if (window.soundFX && window.soundFX.starWakeupChime) {
          window.soundFX.starWakeupChime();
        }
      }
      // Spring back to 1.0
      t.popScale += (1.0 - t.popScale) * 0.16;

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.scale(t.popScale, t.popScale);

      // Star shape points
      const spikes = 5;
      const outerR = isLit ? r * 1.05 + Math.sin(this.pulseAngle * 3) * 1.5 : r * 0.85;
      const innerR = outerR * 0.5;

      if (isLit) {
        // Glowing celebration aura
        const aGrad = this.ctx.createRadialGradient(0, 0, 4, 0, 0, outerR * 1.8);
        aGrad.addColorStop(0, pal.glow);
        aGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = aGrad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, outerR * 1.8, 0, Math.PI * 2);
        this.ctx.fill();

        // Rotating sunbeam spikes
        this.ctx.rotate(this.pulseAngle);
        this.ctx.strokeStyle = pal.core;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI) / 4;
          this.ctx.moveTo(Math.cos(ang) * outerR * 1.1, Math.sin(ang) * outerR * 1.1);
          this.ctx.lineTo(Math.cos(ang) * outerR * 1.45, Math.sin(ang) * outerR * 1.45);
        }
        this.ctx.stroke();
        this.ctx.rotate(-this.pulseAngle);
      }

      // Draw Star Body
      this.ctx.beginPath();
      let rot = (Math.PI / 2) * 3;
      let step = Math.PI / spikes;
      this.ctx.moveTo(0, -outerR);
      for (let i = 0; i < spikes; i++) {
        let x = Math.cos(rot) * outerR;
        let y = Math.sin(rot) * outerR;
        this.ctx.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerR;
        y = Math.sin(rot) * innerR;
        this.ctx.lineTo(x, y);
        rot += step;
      }
      this.ctx.lineTo(0, -outerR);
      this.ctx.closePath();

      this.ctx.fillStyle = isLit ? pal.beam : '#CBD5E1';
      this.ctx.shadowColor = isLit ? pal.glow : 'transparent';
      this.ctx.shadowBlur = isLit ? 14 : 0;
      this.ctx.fill();

      this.ctx.shadowColor = 'transparent';
      this.ctx.strokeStyle = isLit ? pal.dark : '#94A3B8';
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();

      // Cute Little Star Face!
      this.ctx.fillStyle = isLit ? '#FFFFFF' : '#64748B';
      this.ctx.strokeStyle = isLit ? '#FFFFFF' : '#64748B';
      this.ctx.lineWidth = 1.8;

      if (isLit) {
        // Happy Awake Eyes
        this.ctx.beginPath();
        this.ctx.arc(-outerR * 0.22, -outerR * 0.08, 2.5, 0, Math.PI * 2);
        this.ctx.arc(outerR * 0.22, -outerR * 0.08, 2.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Cheerful Smile
        this.ctx.beginPath();
        this.ctx.arc(0, 0, outerR * 0.25, 0.1, Math.PI - 0.1);
        this.ctx.stroke();

        // Rosy Cheeks
        this.ctx.fillStyle = '#FF8FAB';
        this.ctx.beginPath();
        this.ctx.arc(-outerR * 0.35, outerR * 0.08, 3, 0, Math.PI * 2);
        this.ctx.arc(outerR * 0.35, outerR * 0.08, 3, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Sleepy Star Eyes (closed smiling crescents)
        this.ctx.beginPath();
        this.ctx.arc(-outerR * 0.22, -outerR * 0.05, 3.5, 0, Math.PI);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(outerR * 0.22, -outerR * 0.05, 3.5, 0, Math.PI);
        this.ctx.stroke();

        // Cute "Zzz" sleeping mouth
        this.ctx.beginPath();
        this.ctx.arc(0, outerR * 0.18, 2.5, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      this.ctx.restore();
    });
  }

  drawEmitters(cellSize) {
    if (!this.level.emitters) return;

    this.level.emitters.forEach(e => {
      const cx = (e.x + 0.5) * cellSize;
      const cy = (e.y + 0.5) * cellSize;
      const r = cellSize * 0.38;
      const pal = this.palette[e.color] || this.palette.yellow;

      this.ctx.save();
      this.ctx.translate(cx, cy);

      this.ctx.fillStyle = pal.beam;
      this.ctx.shadowColor = pal.glow;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.shadowColor = 'transparent';
      this.ctx.strokeStyle = pal.dark;
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();

      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
      this.ctx.fill();

      const angleMap = { E: 0, S: Math.PI / 2, W: Math.PI, N: -Math.PI / 2 };
      this.ctx.rotate(angleMap[e.dir] || 0);

      this.ctx.fillStyle = pal.dark;
      this.ctx.beginPath();
      this.ctx.moveTo(r * 0.3, -4);
      this.ctx.lineTo(r * 0.75, 0);
      this.ctx.lineTo(r * 0.3, 4);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  drawMirrors(cellSize) {
    if (!this.mirrors) return;

    this.mirrors.forEach((m, idx) => {
      const cx = (m.x + 0.5) * cellSize;
      const cy = (m.y + 0.5) * cellSize;
      const s = cellSize * 0.82;
      const isSelected = (this.selectedMirrorIndex === idx);
      const isHinted = (this.hintedMirrorIndex === idx);

      // Spring-animate rotation toward target angle
      if (m.currentAngle === undefined) {
        const isSlash = (m.type === '/');
        m.currentAngle = isSlash ? -Math.PI / 4 : Math.PI / 4;
        m.targetAngle = m.currentAngle;
      }
      m.currentAngle += (m.targetAngle - m.currentAngle) * 0.35;

      // Spring-animate scale bounce
      if (m.scale === undefined) m.scale = 1.0;
      m.scale += (1.0 - m.scale) * 0.18;

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.scale(m.scale, m.scale);

      // Hint Golden Glow Indicator
      if (isHinted) {
        this.ctx.save();
        this.ctx.strokeStyle = '#F59E0B';
        this.ctx.lineWidth = 3.5;
        this.ctx.shadowColor = '#F59E0B';
        this.ctx.shadowBlur = 16;
        const bounce = Math.sin(this.pulseAngle * 4) * 4;
        this.roundRect(-s / 2 - 6 - bounce, -s / 2 - 6 - bounce, s + 12 + bounce * 2, s + 12 + bounce * 2, 18);
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Selection Halo
      if (isSelected && !m.locked) {
        this.ctx.strokeStyle = '#38BDF8';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
        this.ctx.shadowBlur = 10;
        this.roundRect(-s / 2 - 4, -s / 2 - 4, s + 8, s + 8, 16);
        this.ctx.stroke();
        this.ctx.shadowColor = 'transparent';
      }

      // Dark Neon Blue Mirror/Prism Tile Base (Replaced white with rich cosmic Dark Neon Blue)
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowOffsetY = 3;

      if (m.locked) {
        this.ctx.fillStyle = '#1E293B';
      } else {
        const tileGrad = this.ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
        tileGrad.addColorStop(0, '#041733');   // Dark Midnight Neon Blue
        tileGrad.addColorStop(0.5, '#07254D'); // Deep Royal Navy
        tileGrad.addColorStop(1, '#0C3D75');   // Rich Neon Blue Depth
        this.ctx.fillStyle = tileGrad;
      }
      this.roundRect(-s / 2, -s / 2, s, s, 14);
      this.ctx.fill();

      this.ctx.shadowColor = 'transparent';
      // High-contrast glowing border: Neon Cyan when unselected, intense neon glow when selected
      this.ctx.strokeStyle = m.locked ? '#475569' : (isSelected ? '#00F0FF' : '#00D2FF');
      this.ctx.lineWidth = isSelected ? 3.5 : 2.8;
      if (isSelected && !m.locked) {
        this.ctx.shadowColor = 'rgba(0, 240, 255, 0.95)';
        this.ctx.shadowBlur = 14;
      }
      this.roundRect(-s / 2, -s / 2, s, s, 14);
      this.ctx.stroke();
      this.ctx.shadowColor = 'transparent';

      // Inner Neon Inset Accent
      if (!m.locked) {
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
        this.ctx.lineWidth = 1.2;
        this.roundRect(-s / 2 + 3, -s / 2 + 3, s - 6, s - 6, 11);
        this.ctx.stroke();
      }

      // Smooth Animated Mirror Blade
      this.ctx.save();
      this.ctx.rotate(m.currentAngle);

      // Mirror blade dark outline / back for 100% contrast
      this.ctx.fillStyle = m.locked ? '#334155' : '#000000';
      this.roundRect(-s * 0.43, -4.5, s * 0.86, 9, 4.5);
      this.ctx.fill();

      // Mirror blade vibrant neon blue body
      this.ctx.fillStyle = m.locked ? '#64748B' : '#00F0FF';
      this.roundRect(-s * 0.40, -3, s * 0.80, 6, 3);
      this.ctx.fill();

      // Pure white specular reflection core
      this.ctx.fillStyle = '#FFFFFF';
      this.roundRect(-s * 0.32, -1.2, s * 0.64, 2.4, 2);
      this.ctx.fill();

      this.ctx.restore();

      // Lock Emblem for non-movable mirrors
      if (m.locked) {
        this.ctx.fillStyle = '#94A3B8';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🔒', 0, s * 0.28);
      } else {
        // High-contrast Electric Neon Blue Pivot Dots
        this.ctx.fillStyle = '#00F0FF';
        this.ctx.beginPath();
        this.ctx.arc(s * 0.32, -s * 0.32, 3.2, 0, Math.PI * 2);
        this.ctx.arc(-s * 0.32, s * 0.32, 3.2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(s * 0.32, -s * 0.32, 1.5, 0, Math.PI * 2);
        this.ctx.arc(-s * 0.32, s * 0.32, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    });
  }

  // Interactive Tutorial Guide Hand (Levels 1-3)
  drawTutorialHand(cellSize) {
    if (this.currentLevelIndex > 2 || this.moves > 0 || this.isLevelWon) return;

    const targetMirror = this.mirrors.find(m => !m.locked);
    if (!targetMirror) return;

    const cx = (targetMirror.x + 0.5) * cellSize;
    const cy = (targetMirror.y + 0.5) * cellSize;
    const bob = Math.sin(this.pulseAngle * 5) * 8;

    this.ctx.save();
    this.ctx.translate(cx, cy - cellSize * 0.6 + bob);

    // Animated Guide Hand
    this.ctx.font = '32px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('👇', 0, 0);

    // Cute Pill Tag
    this.ctx.font = 'bold 12px "Fredoka", "Baloo 2", sans-serif';
    const tagText = "Tap me!";
    const textWidth = this.ctx.measureText(tagText).width;

    this.ctx.fillStyle = '#FEF3C7';
    this.ctx.strokeStyle = '#F59E0B';
    this.ctx.lineWidth = 2;
    this.roundRect(-textWidth / 2 - 8, -26, textWidth + 16, 20, 10);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#92400E';
    this.ctx.fillText(tagText, 0, -16);

    this.ctx.restore();
  }

  drawParticles() {
    // Sparkle puffs & emoji floaters
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.life;

      if (p.emoji) {
        this.ctx.font = `${p.size}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(p.emoji, p.x, p.y);
      } else {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    // Win Confetti
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.35;
      c.rotation += c.vr;
      c.life -= c.decay;

      if (c.life <= 0) {
        this.confetti.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(c.x, c.y);
      this.ctx.rotate(c.rotation);
      this.ctx.globalAlpha = c.life;
      this.ctx.fillStyle = c.color;
      this.ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
      this.ctx.restore();
    }
  }

  roundRect(x, y, w, h, r) {
    if (this.ctx.roundRect) {
      this.ctx.roundRect(x, y, w, h, r);
    } else {
      this.ctx.beginPath();
      this.ctx.moveTo(x + r, y);
      this.ctx.lineTo(x + w - r, y);
      this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      this.ctx.lineTo(x + w, y + h - r);
      this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      this.ctx.lineTo(x + r, y + h);
      this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      this.ctx.lineTo(x, y + r);
      this.ctx.quadraticCurveTo(x, y, x + r, y);
      this.ctx.closePath();
    }
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = OpticsEngine;
}
