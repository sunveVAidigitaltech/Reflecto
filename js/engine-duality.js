/**
 * AETHERIA: ENGINE DUALITY (SPLIT DIMENSION: MIRRORED COORDINATION)
 * Symmetrical / Asymmetrical dual-avatar puzzle engine.
 * Control Avatar Alpha (Cyan) while Avatar Beta (Magenta) moves with inverted/mirrored
 * physics. Coordinate pressure plates and dual exit gates to win!
 */

class DualityEngine {
  constructor(canvas, onWinCallback, onMoveCallback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onWin = onWinCallback;
    this.onMove = onMoveCallback;

    this.VIRTUAL_SIZE = 600;
    this.gridSize = 7;
    this.alpha = { x: 1, y: 3 }; // Plane 1 (Cyan)
    this.beta = { x: 5, y: 3 };  // Plane 2 (Magenta, Mirrored)
    this.exitAlpha = { x: 1, y: 1 };
    this.exitBeta = { x: 5, y: 1 };
    this.walls = [];
    this.plates = []; // Pressure plates { x, y, gateX, gateY, active }
    this.gates = [];  // Laser gates { x, y, open }

    this.moves = 0;
    this.isLevelWon = false;
    this.currentLevelIndex = 0;
    this.pulseTime = 0;
    this.animFrameId = null;

    this.initLevels();
    this.bindEvents();
    this.startAnimationLoop();
  }

  initLevels() {
    this.levels = [
      {
        id: 1,
        title: "Mirrored Reflections",
        desc: "Use arrow keys or swipe. Alpha (Cyan) moves normally; Beta (Magenta) moves horizontally inverted. Reach both portals!",
        parMoves: 4,
        alpha: { x: 1, y: 5 },
        beta: { x: 5, y: 5 },
        exitAlpha: { x: 1, y: 1 },
        exitBeta: { x: 5, y: 1 },
        walls: [
          // Central dividing bulkhead
          { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 },
          { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 }
        ],
        plates: [],
        gates: []
      },
      {
        id: 2,
        title: "Asymmetric Obstacles",
        desc: "Alpha's chamber has an obstacle at (1, 3); Beta's chamber has an obstacle at (5, 4). Use walls to desynchronize your position.",
        parMoves: 6,
        alpha: { x: 1, y: 5 },
        beta: { x: 5, y: 5 },
        exitAlpha: { x: 2, y: 1 },
        exitBeta: { x: 4, y: 1 },
        walls: [
          { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 },
          { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 },
          { x: 1, y: 3 }, { x: 5, y: 4 }
        ],
        plates: [],
        gates: []
      },
      {
        id: 3,
        title: "Pressure Coupling",
        desc: "Step Alpha onto the cyan pressure plate to lower the laser gate blocking Beta's portal.",
        parMoves: 7,
        alpha: { x: 1, y: 5 },
        beta: { x: 5, y: 5 },
        exitAlpha: { x: 1, y: 1 },
        exitBeta: { x: 5, y: 1 },
        walls: [
          { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 },
          { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 }
        ],
        plates: [
          { x: 2, y: 4, gateX: 5, gateY: 2, active: false }
        ],
        gates: [
          { x: 5, y: 2, open: false }
        ]
      },
      {
        id: 4,
        title: "Dual Pressure Gates",
        desc: "Both avatars must alternate standing on pressure plates to unlock each other's path.",
        parMoves: 8,
        alpha: { x: 1, y: 6 },
        beta: { x: 5, y: 6 },
        exitAlpha: { x: 1, y: 0 },
        exitBeta: { x: 5, y: 0 },
        walls: [
          { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 },
          { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 }
        ],
        plates: [
          { x: 0, y: 4, gateX: 5, gateY: 3, active: false },
          { x: 6, y: 4, gateX: 1, gateY: 2, active: false }
        ],
        gates: [
          { x: 5, y: 3, open: false },
          { x: 1, y: 2, open: false }
        ]
      },
      {
        id: 5,
        title: "Corridor Squeeze",
        desc: "Maneuver through narrow choke points without getting stranded.",
        parMoves: 9,
        alpha: { x: 0, y: 3 },
        beta: { x: 6, y: 3 },
        exitAlpha: { x: 2, y: 0 },
        exitBeta: { x: 4, y: 0 },
        walls: [
          { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 },
          { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 },
          { x: 1, y: 1 }, { x: 1, y: 5 },
          { x: 5, y: 2 }, { x: 5, y: 4 }
        ],
        plates: [],
        gates: []
      },
      {
        id: 6,
        title: "The Inverted Shift",
        desc: "Both X AND Y axes are inverted for Beta! Up moves Down, Left moves Right.",
        parMoves: 8,
        alpha: { x: 1, y: 5 },
        beta: { x: 5, y: 1 },
        exitAlpha: { x: 1, y: 1 },
        exitBeta: { x: 5, y: 5 },
        walls: [
          { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 },
          { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 },
          { x: 2, y: 3 }, { x: 4, y: 3 }
        ],
        plates: [],
        gates: []
      },
      {
        id: 7,
        title: "Laser Gridlock",
        desc: "Cross through interlocking gate barriers by coordinating step orders.",
        parMoves: 10,
        alpha: { x: 0, y: 6 },
        beta: { x: 6, y: 6 },
        exitAlpha: { x: 2, y: 1 },
        exitBeta: { x: 4, y: 1 },
        walls: [
          { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 },
          { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 }
        ],
        plates: [
          { x: 1, y: 5, gateX: 4, gateY: 3, active: false },
          { x: 5, y: 5, gateX: 2, gateY: 3, active: false }
        ],
        gates: [
          { x: 4, y: 3, open: false },
          { x: 2, y: 3, open: false }
        ]
      },
      {
        id: 8,
        title: "Quantum Entanglement Master",
        desc: "The final synchronization test: dual gates, asymmetric corridors, and dual exits.",
        parMoves: 12,
        alpha: { x: 0, y: 6 },
        beta: { x: 6, y: 6 },
        exitAlpha: { x: 0, y: 0 },
        exitBeta: { x: 6, y: 0 },
        walls: [
          { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 },
          { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 },
          { x: 1, y: 2 }, { x: 1, y: 4 },
          { x: 5, y: 1 }, { x: 5, y: 5 }
        ],
        plates: [
          { x: 2, y: 5, gateX: 5, gateY: 2, active: false },
          { x: 4, y: 4, gateX: 1, gateY: 1, active: false }
        ],
        gates: [
          { x: 5, y: 2, open: false },
          { x: 1, y: 1, open: false }
        ]
      }
    ];
  }

  loadLevel(index) {
    if (index < 0 || index >= this.levels.length) return;
    this.currentLevelIndex = index;
    const lvl = this.levels[index];

    this.alpha = { ...lvl.alpha };
    this.beta = { ...lvl.beta };
    this.exitAlpha = { ...lvl.exitAlpha };
    this.exitBeta = { ...lvl.exitBeta };
    this.walls = JSON.parse(JSON.stringify(lvl.walls));
    this.plates = JSON.parse(JSON.stringify(lvl.plates || []));
    this.gates = JSON.parse(JSON.stringify(lvl.gates || []));

    this.moves = 0;
    this.isLevelWon = false;
    this.checkPlates();

    if (this.onMove) this.onMove(this.moves, lvl.parMoves);
  }

  bindEvents() {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (evt) => {
      const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : null);
      const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : null);
      if (clientX === null || clientY === null) return;
      touchStartX = clientX;
      touchStartY = clientY;
    };

    const handleTouchEnd = (evt) => {
      const clientX = evt.clientX !== undefined ? evt.clientX : (evt.changedTouches && evt.changedTouches[0] ? evt.changedTouches[0].clientX : null);
      const clientY = evt.clientY !== undefined ? evt.clientY : (evt.changedTouches && evt.changedTouches[0] ? evt.changedTouches[0].clientY : null);
      if (clientX === null || clientY === null) return;

      const dx = clientX - touchStartX;
      const dy = clientY - touchStartY;
      const minSwipe = 20;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > minSwipe) this.move(1, 0);       // Right
        else if (dx < -minSwipe) this.move(-1, 0); // Left
      } else {
        if (dy > minSwipe) this.move(0, 1);       // Down
        else if (dy < -minSwipe) this.move(0, -1); // Up
      }
    };

    window.addEventListener('keydown', (e) => {
      if (this.isLevelWon) return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) { e.preventDefault(); this.move(0, -1); }
      if (['ArrowDown', 'KeyS'].includes(e.code)) { e.preventDefault(); this.move(0, 1); }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) { e.preventDefault(); this.move(-1, 0); }
      if (['ArrowRight', 'KeyD'].includes(e.code)) { e.preventDefault(); this.move(1, 0); }
    });

    this.canvas.addEventListener('mousedown', handleTouchStart);
    this.canvas.addEventListener('mouseup', handleTouchEnd);
    this.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
  }

  move(dx, dy) {
    if (this.isLevelWon) return;

    // Alpha moves normally
    const nextAlphaX = this.alpha.x + dx;
    const nextAlphaY = this.alpha.y + dy;

    // Beta moves horizontally inverted (dx inverted).
    // In Level 6, both X and Y are inverted!
    const invertY = this.currentLevelIndex === 5 ? -dy : dy;
    const nextBetaX = this.beta.x - dx;
    const nextBetaY = this.beta.y + invertY;

    let movedAlpha = false;
    let movedBeta = false;

    // Check Alpha move valid
    if (this.canMoveTo(nextAlphaX, nextAlphaY)) {
      this.alpha.x = nextAlphaX;
      this.alpha.y = nextAlphaY;
      movedAlpha = true;
    }

    // Check Beta move valid
    if (this.canMoveTo(nextBetaX, nextBetaY)) {
      this.beta.x = nextBetaX;
      this.beta.y = nextBetaY;
      movedBeta = true;
    }

    if (movedAlpha || movedBeta) {
      this.moves++;
      window.soundFX.rotateClick();
      if (navigator.vibrate) navigator.vibrate(12);

      this.checkPlates();
      if (this.onMove) this.onMove(this.moves, this.levels[this.currentLevelIndex].parMoves);
      this.checkWinCondition();
    } else {
      window.soundFX.softThud();
    }
  }

  canMoveTo(x, y) {
    if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) return false;
    if (this.walls.some(w => w.x === x && w.y === y)) return false;
    if (this.gates.some(g => g.x === x && g.y === y && !g.open)) return false;
    return true;
  }

  checkPlates() {
    this.plates.forEach(p => {
      const isStepped = (this.alpha.x === p.x && this.alpha.y === p.y) ||
                        (this.beta.x === p.x && this.beta.y === p.y);
      p.active = isStepped;

      // Toggle linked gate
      const gate = this.gates.find(g => g.x === p.gateX && g.y === p.gateY);
      if (gate) {
        gate.open = isStepped;
      }
    });
  }

  checkWinCondition() {
    const alphaAtExit = this.alpha.x === this.exitAlpha.x && this.alpha.y === this.exitAlpha.y;
    const betaAtExit = this.beta.x === this.exitBeta.x && this.beta.y === this.exitBeta.y;

    if (alphaAtExit && betaAtExit && !this.isLevelWon) {
      this.isLevelWon = true;
      window.soundFX.crystalHit();
      if (navigator.vibrate) navigator.vibrate([30, 50, 60]);
      setTimeout(() => {
        window.soundFX.victoryFanfare();
        if (this.onWin) {
          const par = this.levels[this.currentLevelIndex].parMoves;
          const stars = this.moves <= par ? 3 : (this.moves <= par + 3 ? 2 : 1);
          this.onWin(this.currentLevelIndex + 1, stars, this.moves);
        }
      }, 350);
    }
  }

  startAnimationLoop() {
    const render = () => {
      this.pulseTime += 0.05;
      this.render();
      this.animFrameId = requestAnimationFrame(render);
    };
    this.animFrameId = requestAnimationFrame(render);
  }

  render() {
    const dpr = window.devicePixelRatio || 1;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.ctx.clearRect(0, 0, this.VIRTUAL_SIZE, this.VIRTUAL_SIZE);

    const cellSize = this.VIRTUAL_SIZE / this.gridSize;

    // 1. Grid Background
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        // Subtle plane tint: Left side cyan tint, Right side magenta tint
        this.ctx.fillStyle = x < 3 ? 'rgba(0, 240, 255, 0.03)' : (x > 3 ? 'rgba(255, 42, 133, 0.03)' : 'rgba(10, 16, 28, 0.6)');
        this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        this.ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // 2. Pressure Plates
    for (const p of this.plates) {
      const cx = (p.x + 0.5) * cellSize;
      const cy = (p.y + 0.5) * cellSize;
      this.ctx.save();
      this.ctx.translate(cx, cy);

      this.ctx.beginPath();
      this.ctx.arc(0, 0, cellSize * 0.32, 0, Math.PI * 2);
      this.ctx.fillStyle = p.active ? '#00ff88' : 'rgba(255, 183, 3, 0.25)';
      this.ctx.strokeStyle = p.active ? '#00ff88' : '#ffb703';
      this.ctx.lineWidth = 2;
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.font = 'bold 11px JetBrains Mono';
      this.ctx.fillStyle = '#000000';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('P', 0, 0);

      this.ctx.restore();
    }

    // 3. Laser Gates
    for (const g of this.gates) {
      this.ctx.save();
      if (!g.open) {
        // Closed laser barrier
        this.ctx.fillStyle = 'rgba(255, 42, 133, 0.35)';
        this.ctx.fillRect(g.x * cellSize + 4, g.y * cellSize + 4, cellSize - 8, cellSize - 8);
        this.ctx.strokeStyle = '#ff2a85';
        this.ctx.shadowColor = '#ff2a85';
        this.ctx.shadowBlur = 10;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(g.x * cellSize + 6, g.y * cellSize + 6, cellSize - 12, cellSize - 12);
      } else {
        // Open gate
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
        this.ctx.setLineDash([4, 4]);
        this.ctx.strokeRect(g.x * cellSize + 4, g.y * cellSize + 4, cellSize - 8, cellSize - 8);
      }
      this.ctx.restore();
    }

    // 4. Exit Portals
    this.drawPortal(this.exitAlpha, '#00f0ff', cellSize);
    this.drawPortal(this.exitBeta, '#ff2a85', cellSize);

    // 5. Obstacle Bulkheads / Walls
    for (const w of this.walls) {
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(w.x * cellSize + 2, w.y * cellSize + 2, cellSize - 4, cellSize - 4);
      this.ctx.strokeStyle = '#334155';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(w.x * cellSize + 2, w.y * cellSize + 2, cellSize - 4, cellSize - 4);
    }

    // 6. Avatars
    this.drawAvatar(this.alpha, '#00f0ff', 'α', cellSize);
    this.drawAvatar(this.beta, '#ff2a85', 'β', cellSize);
  }

  drawPortal(exit, col, cellSize) {
    const cx = (exit.x + 0.5) * cellSize;
    const cy = (exit.y + 0.5) * cellSize;
    const r = cellSize * 0.36;

    this.ctx.save();
    this.ctx.translate(cx, cy);

    this.ctx.beginPath();
    this.ctx.arc(0, 0, r, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(10, 16, 28, 0.8)';
    this.ctx.fill();
    this.ctx.strokeStyle = col;
    this.ctx.shadowColor = col;
    this.ctx.shadowBlur = 12;
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();

    this.ctx.rotate(this.pulseTime);
    this.ctx.setLineDash([4, 4]);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawAvatar(avatar, col, symbol, cellSize) {
    const cx = (avatar.x + 0.5) * cellSize;
    const cy = (avatar.y + 0.5) * cellSize;
    const r = cellSize * 0.35;

    this.ctx.save();
    this.ctx.translate(cx, cy);

    // Halo pulse
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    this.ctx.strokeStyle = col;
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Body
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r, 0, Math.PI * 2);
    this.ctx.fillStyle = col;
    this.ctx.shadowColor = col;
    this.ctx.shadowBlur = 16;
    this.ctx.fill();

    // Glyph Symbol
    this.ctx.font = 'bold 16px Outfit, sans-serif';
    this.ctx.fillStyle = '#050811';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(symbol, 0, 0);

    this.ctx.restore();
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}

window.DualityEngine = DualityEngine;
