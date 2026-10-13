/**
 * AETHERIA: ENGINE CHROMA SLIDE (SPATIAL NOVA SHIFT) - V2 HIGH-PRECISION MOBILE-READY
 * Frictionless momentum sliding puzzle engine with virtual resolution scaling (600x600),
 * touch swipe support, on-screen D-pad controls, par efficiency ratings, and undo history.
 */

class SlideEngine {
  constructor(canvas, onWinCallback, onMoveCallback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onWin = onWinCallback;
    this.onMove = onMoveCallback;

    this.VIRTUAL_SIZE = 600;
    this.gridSize = 6;
    this.blocks = [];
    this.targets = [];
    this.walls = [];
    this.selectedBlock = null;

    this.moves = 0;
    this.history = [];
    this.isLevelWon = false;
    this.currentLevelIndex = 0;
    this.animFrameId = null;

    this.colors = {
      cyan: { fill: '#00f0ff', glow: 'rgba(0, 240, 255, 0.5)' },
      magenta: { fill: '#ff2a85', glow: 'rgba(255, 42, 133, 0.5)' },
      amber: { fill: '#ffb703', glow: 'rgba(255, 183, 3, 0.5)' },
      emerald: { fill: '#00ff88', glow: 'rgba(0, 255, 136, 0.5)' }
    };

    this.initLevels();
    this.bindEvents();
    this.startAnimationLoop();
  }

  initLevels() {
    this.levels = [
      {
        id: 1,
        title: "Inertia Vector",
        desc: "Tap the Cyan core, then swipe or use directional arrows to slide into the docking port.",
        parMoves: 3,
        size: 5,
        blocks: [{ id: 'b1', x: 0, y: 0, color: 'cyan' }],
        targets: [{ x: 4, y: 2, color: 'cyan' }],
        walls: [{ x: 4, y: 0 }, { x: 2, y: 2 }]
      },
      {
        id: 2,
        title: "Mutual Interception",
        desc: "One block can act as a mid-air brake for another block in open terrain.",
        parMoves: 4,
        size: 5,
        blocks: [
          { id: 'b1', x: 0, y: 1, color: 'cyan' },
          { id: 'b2', x: 4, y: 4, color: 'magenta' }
        ],
        targets: [
          { x: 3, y: 1, color: 'cyan' },
          { x: 1, y: 4, color: 'magenta' }
        ],
        walls: [{ x: 3, y: 3 }]
      },
      {
        id: 3,
        title: "Orbital Ricochet",
        desc: "Coordinate dual cores around central barrier blocks.",
        parMoves: 6,
        size: 6,
        blocks: [
          { id: 'b1', x: 1, y: 1, color: 'cyan' },
          { id: 'b2', x: 4, y: 4, color: 'amber' }
        ],
        targets: [
          { x: 5, y: 2, color: 'cyan' },
          { x: 0, y: 3, color: 'amber' }
        ],
        walls: [
          { x: 2, y: 2 }, { x: 3, y: 2 },
          { x: 2, y: 3 }, { x: 3, y: 3 }
        ]
      },
      {
        id: 4,
        title: "Tri-Color Calibration",
        desc: "Three colored blocks must find their designated coordinates.",
        parMoves: 7,
        size: 6,
        blocks: [
          { id: 'b1', x: 0, y: 0, color: 'cyan' },
          { id: 'b2', x: 5, y: 0, color: 'magenta' },
          { id: 'b3', x: 0, y: 5, color: 'emerald' }
        ],
        targets: [
          { x: 3, y: 2, color: 'cyan' },
          { x: 2, y: 3, color: 'magenta' },
          { x: 4, y: 4, color: 'emerald' }
        ],
        walls: [
          { x: 1, y: 2 }, { x: 4, y: 2 }, { x: 2, y: 4 }
        ]
      },
      {
        id: 5,
        title: "The Narrow Trench",
        desc: "Navigating deep corridors requires precise leapfrogging moves.",
        parMoves: 9,
        size: 6,
        blocks: [
          { id: 'b1', x: 0, y: 2, color: 'cyan' },
          { id: 'b2', x: 5, y: 3, color: 'magenta' }
        ],
        targets: [
          { x: 2, y: 1, color: 'cyan' },
          { x: 3, y: 4, color: 'magenta' }
        ],
        walls: [
          { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 3 },
          { x: 4, y: 2 }, { x: 4, y: 4 }, { x: 4, y: 5 }
        ]
      },
      {
        id: 6,
        title: "Quantum Gridlock",
        desc: "High density puzzle: 3 cores, intricate maze corridors.",
        parMoves: 10,
        size: 6,
        blocks: [
          { id: 'b1', x: 0, y: 0, color: 'cyan' },
          { id: 'b2', x: 5, y: 5, color: 'magenta' },
          { id: 'b3', x: 2, y: 2, color: 'amber' }
        ],
        targets: [
          { x: 4, y: 1, color: 'cyan' },
          { x: 1, y: 4, color: 'magenta' },
          { x: 3, y: 3, color: 'amber' }
        ],
        walls: [
          { x: 1, y: 1 }, { x: 4, y: 4 }, { x: 2, y: 5 }, { x: 3, y: 0 }
        ]
      },
      {
        id: 7,
        title: "Corner Escapade",
        desc: "Unpin cores stuck in corners by sliding helper blocks into buffer slots.",
        parMoves: 8,
        size: 6,
        blocks: [
          { id: 'b1', x: 0, y: 0, color: 'cyan' },
          { id: 'b2', x: 5, y: 0, color: 'emerald' }
        ],
        targets: [
          { x: 2, y: 3, color: 'cyan' },
          { x: 3, y: 3, color: 'emerald' }
        ],
        walls: [{ x: 2, y: 1 }, { x: 3, y: 5 }, { x: 1, y: 4 }]
      },
      {
        id: 8,
        title: "Cross Corridor",
        desc: "Navigate through cross-shaped corridors without colliding.",
        parMoves: 9,
        size: 6,
        blocks: [
          { id: 'b1', x: 0, y: 2, color: 'magenta' },
          { id: 'b2', x: 3, y: 5, color: 'amber' }
        ],
        targets: [
          { x: 5, y: 2, color: 'magenta' },
          { x: 3, y: 0, color: 'amber' }
        ],
        walls: [
          { x: 1, y: 1 }, { x: 4, y: 1 },
          { x: 1, y: 4 }, { x: 4, y: 4 }
        ]
      },
      {
        id: 9,
        title: "Quadrant Alignment",
        desc: "Four colored cores must each dock into their respective quadrant.",
        parMoves: 12,
        size: 6,
        blocks: [
          { id: 'b1', x: 0, y: 0, color: 'cyan' },
          { id: 'b2', x: 5, y: 0, color: 'magenta' },
          { id: 'b3', x: 0, y: 5, color: 'amber' },
          { id: 'b4', x: 5, y: 5, color: 'emerald' }
        ],
        targets: [
          { x: 2, y: 2, color: 'cyan' },
          { x: 3, y: 2, color: 'magenta' },
          { x: 2, y: 3, color: 'amber' },
          { x: 3, y: 3, color: 'emerald' }
        ],
        walls: [{ x: 1, y: 2 }, { x: 4, y: 3 }]
      },
      {
        id: 10,
        title: "Singularity Chamber",
        desc: "The pinnacle of momentum sliding: 3 blocks, complex labyrinth buffers.",
        parMoves: 14,
        size: 6,
        blocks: [
          { id: 'b1', x: 1, y: 0, color: 'cyan' },
          { id: 'b2', x: 4, y: 0, color: 'magenta' },
          { id: 'b3', x: 2, y: 5, color: 'emerald' }
        ],
        targets: [
          { x: 1, y: 4, color: 'cyan' },
          { x: 4, y: 4, color: 'magenta' },
          { x: 3, y: 1, color: 'emerald' }
        ],
        walls: [
          { x: 0, y: 2 }, { x: 5, y: 2 },
          { x: 2, y: 2 }, { x: 3, y: 2 },
          { x: 2, y: 4 }, { x: 3, y: 4 }
        ]
      }
    ];
  }

  loadLevel(index) {
    if (index < 0 || index >= this.levels.length) return;
    this.currentLevelIndex = index;
    const lvl = this.levels[index];
    this.gridSize = lvl.size || 6;

    this.blocks = lvl.blocks.map(b => ({ ...b, renderX: b.x, renderY: b.y }));
    this.targets = JSON.parse(JSON.stringify(lvl.targets));
    this.walls = JSON.parse(JSON.stringify(lvl.walls));
    this.selectedBlock = this.blocks[0] || null;

    this.moves = 0;
    this.history = [];
    this.isLevelWon = false;

    if (this.onMove) this.onMove(this.moves, lvl.parMoves);
  }

  bindEvents() {
    let touchStartX = 0;
    let touchStartY = 0;

    const handlePointerDown = (evt) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : null);
      const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : null);
      if (clientX === null || clientY === null) return;

      touchStartX = clientX;
      touchStartY = clientY;

      // Virtual 600x600 coordinates
      const clickX = (clientX - rect.left) * (this.VIRTUAL_SIZE / rect.width);
      const clickY = (clientY - rect.top) * (this.VIRTUAL_SIZE / rect.height);

      const cellSize = this.VIRTUAL_SIZE / this.gridSize;
      const gx = Math.floor(clickX / cellSize);
      const gy = Math.floor(clickY / cellSize);

      const clickedBlock = this.blocks.find(b => b.x === gx && b.y === gy);
      if (clickedBlock) {
        this.selectedBlock = clickedBlock;
        window.soundFX.rotateClick();
        if (navigator.vibrate) navigator.vibrate(10);
      }
    };

    const handlePointerUp = (evt) => {
      if (!this.selectedBlock || this.isLevelWon) return;

      const clientX = evt.clientX !== undefined ? evt.clientX : (evt.changedTouches && evt.changedTouches[0] ? evt.changedTouches[0].clientX : null);
      const clientY = evt.clientY !== undefined ? evt.clientY : (evt.changedTouches && evt.changedTouches[0] ? evt.changedTouches[0].clientY : null);
      if (clientX === null || clientY === null) return;

      const dx = clientX - touchStartX;
      const dy = clientY - touchStartY;
      const minSwipe = 20;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > minSwipe) this.slide(1, 0);
        else if (dx < -minSwipe) this.slide(-1, 0);
      } else {
        if (dy > minSwipe) this.slide(0, 1);
        else if (dy < -minSwipe) this.slide(0, -1);
      }
    };

    window.addEventListener('keydown', (e) => {
      if (this.isLevelWon || !this.selectedBlock) return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) { e.preventDefault(); this.slide(0, -1); }
      if (['ArrowDown', 'KeyS'].includes(e.code)) { e.preventDefault(); this.slide(0, 1); }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) { e.preventDefault(); this.slide(-1, 0); }
      if (['ArrowRight', 'KeyD'].includes(e.code)) { e.preventDefault(); this.slide(1, 0); }
      if (e.code === 'KeyZ') { this.undo(); }
    });

    this.canvas.addEventListener('mousedown', handlePointerDown);
    this.canvas.addEventListener('mouseup', handlePointerUp);
    this.canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    this.canvas.addEventListener('touchend', handlePointerUp, { passive: false });
  }

  slide(dx, dy) {
    if (!this.selectedBlock || this.isLevelWon) return;

    const block = this.selectedBlock;
    let nextX = block.x;
    let nextY = block.y;

    const stateSnapshot = this.blocks.map(b => ({ id: b.id, x: b.x, y: b.y }));

    while (true) {
      const candX = nextX + dx;
      const candY = nextY + dy;

      if (candX < 0 || candX >= this.gridSize || candY < 0 || candY >= this.gridSize) break;
      if (this.walls.some(w => w.x === candX && w.y === candY)) break;
      if (this.blocks.some(b => b.id !== block.id && b.x === candX && b.y === candY)) break;

      nextX = candX;
      nextY = candY;
    }

    if (nextX !== block.x || nextY !== block.y) {
      this.history.push(stateSnapshot);
      block.x = nextX;
      block.y = nextY;
      this.moves++;
      window.soundFX.slideSwoosh();
      if (navigator.vibrate) navigator.vibrate(15);

      if (this.onMove) this.onMove(this.moves, this.levels[this.currentLevelIndex].parMoves);
      this.checkWinCondition();
    } else {
      window.soundFX.softThud();
    }
  }

  undo() {
    if (this.history.length === 0 || this.isLevelWon) return;
    const prev = this.history.pop();
    prev.forEach(p => {
      const b = this.blocks.find(item => item.id === p.id);
      if (b) {
        b.x = p.x;
        b.y = p.y;
      }
    });
    this.moves++;
    window.soundFX.rotateClick();
    if (this.onMove) this.onMove(this.moves, this.levels[this.currentLevelIndex].parMoves);
  }

  checkWinCondition() {
    const allMatches = this.targets.every(t => {
      return this.blocks.some(b => b.x === t.x && b.y === t.y && b.color === t.color);
    });

    if (allMatches && !this.isLevelWon) {
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
      for (const b of this.blocks) {
        b.renderX = b.renderX === undefined ? b.x : b.renderX + (b.x - b.renderX) * 0.35;
        b.renderY = b.renderY === undefined ? b.y : b.renderY + (b.y - b.renderY) * 0.35;
      }
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
        this.ctx.fillStyle = (x + y) % 2 === 0 ? 'rgba(15, 23, 42, 0.5)' : 'rgba(10, 15, 29, 0.5)';
        this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        this.ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Target Dock Sockets
    for (const t of this.targets) {
      const cx = (t.x + 0.5) * cellSize;
      const cy = (t.y + 0.5) * cellSize;
      const r = cellSize * 0.35;
      const col = this.colors[t.color]?.fill || '#00f0ff';

      this.ctx.save();
      this.ctx.translate(cx, cy);

      this.ctx.beginPath();
      this.ctx.arc(0, 0, r, 0, Math.PI * 2);
      this.ctx.strokeStyle = col;
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();

      this.ctx.setLineDash([4, 4]);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Obstacle Walls
    for (const wall of this.walls) {
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(wall.x * cellSize + 2, wall.y * cellSize + 2, cellSize - 4, cellSize - 4);
      this.ctx.strokeStyle = '#334155';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(wall.x * cellSize + 2, wall.y * cellSize + 2, cellSize - 4, cellSize - 4);
    }

    // Sliding Blocks
    for (const b of this.blocks) {
      const cx = (b.renderX + 0.5) * cellSize;
      const cy = (b.renderY + 0.5) * cellSize;
      const size = cellSize * 0.76;
      const col = this.colors[b.color]?.fill || '#00f0ff';
      const isSelected = this.selectedBlock && this.selectedBlock.id === b.id;

      this.ctx.save();
      this.ctx.translate(cx, cy);

      if (isSelected) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.68, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = 12;
        this.ctx.stroke();
      }

      this.ctx.beginPath();
      const hw = size / 2;
      this.ctx.roundRect(-hw, -hw, size, size, 8);
      this.ctx.fillStyle = col;
      this.ctx.shadowColor = col;
      this.ctx.shadowBlur = 14;
      this.ctx.fill();

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      this.ctx.beginPath();
      this.ctx.roundRect(-hw * 0.5, -hw * 0.5, size * 0.5, size * 0.5, 4);
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}

window.SlideEngine = SlideEngine;
