/**
 * AETHERIA: ENGINE CIRCUIT (ENERGY FLOW MATRIX) - V2 HIGH-PRECISION MOBILE-READY
 * Network topology puzzle engine featuring rotatable power conduits,
 * BFS graph connectivity verification, live animated electrical pulses,
 * and responsive virtual coordinate scaling (600x600).
 */

class CircuitEngine {
  constructor(canvas, onWinCallback, onMoveCallback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onWin = onWinCallback;
    this.onMove = onMoveCallback;

    this.VIRTUAL_SIZE = 600;
    this.gridSize = 5;
    this.tiles = [];
    this.selectedTile = null;
    this.moves = 0;
    this.isLevelWon = false;
    this.currentLevelIndex = 0;
    this.pulseTime = 0;
    this.animFrameId = null;

    this.initLevels();
    this.bindEvents();
    this.startAnimationLoop();
  }

  // Conduit Pin Definitions (Bitmask: N=1, E=2, S=4, W=8)
  rotateMaskCW(mask) {
    let n = (mask & 8) ? 1 : 0;
    let e = (mask & 1) ? 2 : 0;
    let s = (mask & 2) ? 4 : 0;
    let w = (mask & 4) ? 8 : 0;
    return n | e | s | w;
  }

  initLevels() {
    this.levels = [
      {
        id: 1,
        title: "Closed Loop Primer",
        desc: "Tap the conduits to route power from Generator Alpha to the Core terminal.",
        parMoves: 3,
        size: 4,
        grid: [
          { x: 0, y: 1, type: 'source', mask: 2, locked: true }, // Source pointing East
          { x: 1, y: 1, type: 'line', mask: 5 },                // Line initially vertical (5)
          { x: 2, y: 1, type: 'elbow', mask: 3 },               // Elbow
          { x: 2, y: 2, type: 'elbow', mask: 6 },
          { x: 3, y: 2, type: 'terminal', mask: 8, locked: true } // Terminal expecting West input
        ]
      },
      {
        id: 2,
        title: "Bifurcation Hub",
        desc: "Use a T-junction to route electrical current into two separate storage capacitors.",
        parMoves: 5,
        size: 4,
        grid: [
          { x: 0, y: 2, type: 'source', mask: 2, locked: true }, // E
          { x: 1, y: 2, type: 'tee', mask: 7 },                 // T-junction
          { x: 1, y: 1, type: 'elbow', mask: 9 },
          { x: 1, y: 3, type: 'elbow', mask: 3 },
          { x: 2, y: 1, type: 'terminal', mask: 8, locked: true }, // W
          { x: 2, y: 3, type: 'terminal', mask: 8, locked: true }  // W
        ]
      },
      {
        id: 3,
        title: "Crossflow Transformer",
        desc: "Intersecting lines allow orthogonal transmission without short-circuiting.",
        parMoves: 6,
        size: 5,
        grid: [
          { x: 0, y: 2, type: 'source', mask: 2, locked: true },
          { x: 1, y: 2, type: 'cross', mask: 15 },
          { x: 2, y: 2, type: 'elbow', mask: 12 },
          { x: 2, y: 1, type: 'line', mask: 5 },
          { x: 2, y: 0, type: 'terminal', mask: 4, locked: true },
          { x: 2, y: 3, type: 'elbow', mask: 3 },
          { x: 3, y: 3, type: 'terminal', mask: 8, locked: true }
        ]
      },
      {
        id: 4,
        title: "Grid Isolation",
        desc: "Overcome dormant breaker tiles by circling around the perimeter.",
        parMoves: 8,
        size: 5,
        grid: [
          { x: 0, y: 0, type: 'source', mask: 4, locked: true }, // S
          { x: 0, y: 1, type: 'elbow', mask: 6 },
          { x: 1, y: 1, type: 'line', mask: 10 },
          { x: 2, y: 1, type: 'tee', mask: 11 },
          { x: 2, y: 2, type: 'elbow', mask: 9 },
          { x: 3, y: 2, type: 'line', mask: 10 },
          { x: 4, y: 2, type: 'terminal', mask: 8, locked: true },
          { x: 2, y: 3, type: 'terminal', mask: 1, locked: true }
        ]
      },
      {
        id: 5,
        title: "Dual Core Synchronizer",
        desc: "Two distinct generator units must power three independent server nodes.",
        parMoves: 8,
        size: 5,
        grid: [
          { x: 0, y: 1, type: 'source', mask: 2, locked: true },
          { x: 0, y: 3, type: 'source', mask: 2, locked: true },
          { x: 1, y: 1, type: 'tee', mask: 13 },
          { x: 1, y: 2, type: 'line', mask: 5 },
          { x: 1, y: 3, type: 'tee', mask: 7 },
          { x: 2, y: 1, type: 'elbow', mask: 9 },
          { x: 2, y: 2, type: 'terminal', mask: 8, locked: true },
          { x: 2, y: 3, type: 'elbow', mask: 3 },
          { x: 3, y: 1, type: 'terminal', mask: 8, locked: true },
          { x: 3, y: 3, type: 'terminal', mask: 8, locked: true }
        ]
      },
      {
        id: 6,
        title: "Superconductor Supergrid",
        desc: "The 5x5 quantum energy distribution network.",
        parMoves: 10,
        size: 5,
        grid: [
          { x: 2, y: 2, type: 'source', mask: 15, locked: true }, // Omnidirectional Core
          { x: 2, y: 1, type: 'line', mask: 5 },
          { x: 2, y: 0, type: 'terminal', mask: 4, locked: true },
          { x: 2, y: 3, type: 'line', mask: 5 },
          { x: 2, y: 4, type: 'terminal', mask: 1, locked: true },
          { x: 1, y: 2, type: 'line', mask: 10 },
          { x: 0, y: 2, type: 'terminal', mask: 2, locked: true },
          { x: 3, y: 2, type: 'line', mask: 10 },
          { x: 4, y: 2, type: 'terminal', mask: 8, locked: true },
          { x: 1, y: 1, type: 'elbow', mask: 12 },
          { x: 3, y: 1, type: 'elbow', mask: 6 },
          { x: 1, y: 3, type: 'elbow', mask: 9 },
          { x: 3, y: 3, type: 'elbow', mask: 3 }
        ]
      },
      {
        id: 7,
        title: "Perimeter Ring Circuit",
        desc: "Power must flow in a loop around the outer ring to activate corner terminals.",
        parMoves: 8,
        size: 5,
        grid: [
          { x: 0, y: 0, type: 'source', mask: 2, locked: true }, // E
          { x: 1, y: 0, type: 'line', mask: 5 },
          { x: 2, y: 0, type: 'tee', mask: 14 },
          { x: 2, y: 1, type: 'line', mask: 10 },
          { x: 2, y: 2, type: 'terminal', mask: 1, locked: true },
          { x: 3, y: 0, type: 'line', mask: 5 },
          { x: 4, y: 0, type: 'elbow', mask: 12 },
          { x: 4, y: 1, type: 'terminal', mask: 1, locked: true }
        ]
      },
      {
        id: 8,
        title: "Cascade Matrix",
        desc: "Staggered conduits form a staircase of electricity down to the mainframe.",
        parMoves: 9,
        size: 5,
        grid: [
          { x: 0, y: 0, type: 'source', mask: 4, locked: true }, // S
          { x: 0, y: 1, type: 'elbow', mask: 3 },
          { x: 1, y: 1, type: 'elbow', mask: 6 },
          { x: 1, y: 2, type: 'elbow', mask: 9 },
          { x: 2, y: 2, type: 'elbow', mask: 12 },
          { x: 2, y: 3, type: 'elbow', mask: 3 },
          { x: 3, y: 3, type: 'elbow', mask: 6 },
          { x: 3, y: 4, type: 'terminal', mask: 1, locked: true }
        ]
      },
      {
        id: 9,
        title: "Tri-Core Synchronization",
        desc: "Distribute triple current feeds across dense intersecting pathways.",
        parMoves: 11,
        size: 6,
        grid: [
          { x: 0, y: 1, type: 'source', mask: 2, locked: true },
          { x: 0, y: 3, type: 'source', mask: 2, locked: true },
          { x: 0, y: 5, type: 'source', mask: 2, locked: true },
          { x: 1, y: 1, type: 'line', mask: 5 },
          { x: 2, y: 1, type: 'tee', mask: 11 },
          { x: 2, y: 2, type: 'line', mask: 10 },
          { x: 2, y: 3, type: 'cross', mask: 15 },
          { x: 1, y: 3, type: 'line', mask: 5 },
          { x: 2, y: 4, type: 'line', mask: 10 },
          { x: 2, y: 5, type: 'tee', mask: 7 },
          { x: 1, y: 5, type: 'line', mask: 5 },
          { x: 4, y: 2, type: 'terminal', mask: 8, locked: true },
          { x: 4, y: 4, type: 'terminal', mask: 8, locked: true },
          { x: 3, y: 3, type: 'elbow', mask: 9 },
          { x: 3, y: 2, type: 'elbow', mask: 6 },
          { x: 3, y: 4, type: 'elbow', mask: 3 }
        ]
      },
      {
        id: 10,
        title: "Omega MegaGrid",
        desc: "The 6x6 crown matrix challenge with 5 terminal nodes to power.",
        parMoves: 14,
        size: 6,
        grid: [
          { x: 2, y: 2, type: 'source', mask: 15, locked: true },
          { x: 2, y: 1, type: 'line', mask: 10 },
          { x: 2, y: 0, type: 'terminal', mask: 4, locked: true },
          { x: 2, y: 3, type: 'line', mask: 10 },
          { x: 2, y: 4, type: 'terminal', mask: 1, locked: true },
          { x: 1, y: 2, type: 'line', mask: 5 },
          { x: 0, y: 2, type: 'terminal', mask: 2, locked: true },
          { x: 3, y: 2, type: 'line', mask: 5 },
          { x: 5, y: 2, type: 'terminal', mask: 8, locked: true },
          { x: 4, y: 2, type: 'line', mask: 5 },
          { x: 1, y: 1, type: 'elbow', mask: 3 },
          { x: 3, y: 1, type: 'elbow', mask: 9 },
          { x: 1, y: 3, type: 'elbow', mask: 6 },
          { x: 3, y: 3, type: 'elbow', mask: 12 },
          { x: 3, y: 4, type: 'terminal', mask: 1, locked: true }
        ]
      }
    ];
  }

  loadLevel(index) {
    if (index < 0 || index >= this.levels.length) return;
    this.currentLevelIndex = index;
    const lvl = this.levels[index];
    this.gridSize = lvl.size || 5;

    this.tiles = lvl.grid.map(t => {
      let mask = t.mask;
      if (!t.locked && t.type !== 'cross') {
        const scrambles = Math.floor(Math.random() * 3) + 1;
        for (let s = 0; s < scrambles; s++) {
          mask = this.rotateMaskCW(mask);
        }
      }
      return {
        x: t.x,
        y: t.y,
        type: t.type,
        mask: mask,
        locked: !!t.locked,
        powered: false
      };
    });

    this.selectedTile = this.tiles.find(t => !t.locked) || null;
    this.moves = 0;
    this.isLevelWon = false;
    this.recalculateFlow();
    if (this.onMove) this.onMove(this.moves, lvl.parMoves);
  }

  rotateSelectedPiece() {
    if (!this.selectedTile || this.selectedTile.locked || this.isLevelWon) return;
    this.selectedTile.mask = this.rotateMaskCW(this.selectedTile.mask);
    this.moves++;
    window.soundFX.rotateClick();
    if (navigator.vibrate) navigator.vibrate(15);
    this.recalculateFlow();
    if (this.onMove) this.onMove(this.moves, this.levels[this.currentLevelIndex].parMoves);
    this.checkWinCondition();
  }

  bindEvents() {
    const handlePointer = (evt) => {
      evt.preventDefault();
      if (this.isLevelWon) return;

      const rect = this.canvas.getBoundingClientRect();
      const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : null);
      const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : null);
      if (clientX === null || clientY === null) return;

      // Virtual 600x600 coordinates
      const clickX = (clientX - rect.left) * (this.VIRTUAL_SIZE / rect.width);
      const clickY = (clientY - rect.top) * (this.VIRTUAL_SIZE / rect.height);

      const cellSize = this.VIRTUAL_SIZE / this.gridSize;
      const gx = Math.floor(clickX / cellSize);
      const gy = Math.floor(clickY / cellSize);

      const tile = this.tiles.find(t => t.x === gx && t.y === gy);
      if (tile && !tile.locked && tile.type !== 'cross') {
        this.selectedTile = tile;
        this.rotateSelectedPiece();
      }
    };

    this.canvas.addEventListener('click', handlePointer);
    this.canvas.addEventListener('touchstart', handlePointer, { passive: false });
  }

  recalculateFlow() {
    this.tiles.forEach(t => t.powered = false);

    const sources = this.tiles.filter(t => t.type === 'source');
    sources.forEach(s => s.powered = true);

    const queue = [...sources];
    const visited = new Set();
    sources.forEach(s => visited.add(`${s.x},${s.y}`));

    const neighborDirs = [
      { dx: 0, dy: -1, myPin: 1, oppPin: 4 }, // North
      { dx: 1, dy: 0, myPin: 2, oppPin: 8 },  // East
      { dx: 0, dy: 1, myPin: 4, oppPin: 1 },  // South
      { dx: -1, dy: 0, myPin: 8, oppPin: 2 }  // West
    ];

    while (queue.length > 0) {
      const curr = queue.shift();

      for (const dir of neighborDirs) {
        if ((curr.mask & dir.myPin) !== 0) {
          const nx = curr.x + dir.dx;
          const ny = curr.y + dir.dy;
          const nKey = `${nx},${ny}`;

          const neighbor = this.tiles.find(t => t.x === nx && t.y === ny);
          if (neighbor && (neighbor.mask & dir.oppPin) !== 0) {
            neighbor.powered = true;
            if (!visited.has(nKey)) {
              visited.add(nKey);
              queue.push(neighbor);
            }
          }
        }
      }
    }
  }

  checkWinCondition() {
    const terminals = this.tiles.filter(t => t.type === 'terminal');
    const allPowered = terminals.length > 0 && terminals.every(t => t.powered);

    if (allPowered && !this.isLevelWon) {
      this.isLevelWon = true;
      window.soundFX.crystalHit();
      if (navigator.vibrate) navigator.vibrate([30, 50, 60]);
      setTimeout(() => {
        window.soundFX.victoryFanfare();
        if (this.onWin) {
          const par = this.levels[this.currentLevelIndex].parMoves;
          const stars = this.moves <= par ? 3 : (this.moves <= par + 4 ? 2 : 1);
          this.onWin(this.currentLevelIndex + 1, stars, this.moves);
        }
      }, 400);
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

    // Grid Floor
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        this.ctx.fillStyle = (x + y) % 2 === 0 ? 'rgba(15, 23, 40, 0.45)' : 'rgba(10, 16, 29, 0.45)';
        this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Tiles
    for (const t of this.tiles) {
      this.drawTile(t, cellSize);
    }
  }

  drawTile(t, cellSize) {
    const cx = (t.x + 0.5) * cellSize;
    const cy = (t.y + 0.5) * cellSize;
    const r = cellSize * 0.42;
    const isSelected = this.selectedTile && this.selectedTile.x === t.x && this.selectedTile.y === t.y;

    this.ctx.save();
    this.ctx.translate(cx, cy);

    // Indicator Halo for interactive conduits
    if (!t.locked && t.type !== 'cross') {
      this.ctx.save();
      this.ctx.rotate(this.pulseTime * 0.5);
      this.ctx.setLineDash([3, 4]);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r * 1.05, 0, Math.PI * 2);
      this.ctx.strokeStyle = isSelected ? '#00ff88' : 'rgba(0, 255, 136, 0.25)';
      this.ctx.lineWidth = isSelected ? 2 : 1;
      this.ctx.stroke();
      this.ctx.restore();

      // Circular Housing
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r, 0, Math.PI * 2);
      this.ctx.fillStyle = isSelected ? 'rgba(25, 42, 60, 0.9)' : 'rgba(20, 28, 48, 0.75)';
      this.ctx.fill();
      this.ctx.strokeStyle = t.powered ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 255, 255, 0.08)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    const isPowered = t.powered;
    const baseColor = isPowered ? '#00ff88' : '#334155';
    const wireWidth = cellSize * 0.16;
    const mask = t.mask;

    // Center Node
    this.ctx.beginPath();
    this.ctx.arc(0, 0, wireWidth * 0.65, 0, Math.PI * 2);
    this.ctx.fillStyle = baseColor;
    if (isPowered) {
      this.ctx.shadowColor = '#00ff88';
      this.ctx.shadowBlur = 12;
    }
    this.ctx.fill();

    const drawArm = (toX, toY) => {
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(toX, toY);
      this.ctx.strokeStyle = baseColor;
      this.ctx.lineWidth = wireWidth;
      this.ctx.lineCap = 'round';
      if (isPowered) {
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 10;
      }
      this.ctx.stroke();

      if (isPowered) {
        const offset = (Math.sin(this.pulseTime * 2.5) + 1) / 2;
        this.ctx.beginPath();
        this.ctx.arc(toX * offset, toY * offset, wireWidth * 0.38, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
      }
    };

    const half = cellSize * 0.5;
    if (mask & 1) drawArm(0, -half); // North
    if (mask & 2) drawArm(half, 0);  // East
    if (mask & 4) drawArm(0, half);  // South
    if (mask & 8) drawArm(-half, 0); // West

    // Generator Node
    if (t.type === 'source') {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffb703';
      this.ctx.shadowColor = '#ffb703';
      this.ctx.shadowBlur = 16;
      this.ctx.fill();

      this.ctx.font = 'bold 12px JetBrains Mono';
      this.ctx.fillStyle = '#000000';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('PWR', 0, 0);
    } else if (t.type === 'terminal') {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
      this.ctx.fillStyle = isPowered ? '#00f0ff' : 'rgba(30, 41, 59, 0.85)';
      this.ctx.strokeStyle = isPowered ? '#00f0ff' : '#475569';
      this.ctx.lineWidth = 3;
      if (isPowered) {
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.shadowBlur = 18;
      }
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.font = 'bold 11px JetBrains Mono';
      this.ctx.fillStyle = isPowered ? '#000000' : '#94a3b8';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('CORE', 0, 0);
    }

    this.ctx.restore();
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}

window.CircuitEngine = CircuitEngine;
