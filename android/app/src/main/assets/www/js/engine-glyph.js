/**
 * AETHERIA: ENGINE GLYPH (GLYPH WEAVER: WORD ALCHEMY)
 * Linguistic rune connection puzzle engine. Trace contiguous letter paths
 * to forge ancient words, triggering elemental reactions to power ancient obelisks.
 */

class GlyphEngine {
  constructor(canvas, onWinCallback, onMoveCallback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onWin = onWinCallback;
    this.onMove = onMoveCallback;

    this.VIRTUAL_SIZE = 600;
    this.gridSize = 5;
    this.grid = [];
    this.selectedPath = []; // Array of { gx, gy, letter }
    this.isTracing = false;
    this.targetWords = [];
    this.foundWords = [];
    this.particles = [];

    this.moves = 0;
    this.isLevelWon = false;
    this.currentLevelIndex = 0;
    this.animFrameId = null;

    // Built-in English word vocabulary set for rapid offline validation
    this.vocab = new Set([
      'LIGHT', 'PRISM', 'LASER', 'BEAM', 'RAY', 'SOLAR', 'OPTIC',
      'POWER', 'FLOW', 'CIRCUIT', 'NODE', 'CORE', 'ENERGY', 'GRID',
      'NOVA', 'SLIDE', 'SHIFT', 'GEM', 'BLOCK', 'LOCK', 'STAR',
      'ORBIT', 'GRAVITY', 'PULSE', 'COMET', 'SPACE', 'ECHO', 'VOID',
      'RUNE', 'ALCHEM', 'WORD', 'SPELL', 'GLYPH', 'WEAVE', 'FORGE',
      'DUAL', 'TWIN', 'PORTAL', 'MAZE', 'MIRROR', 'SPLIT', 'NEXUS',
      'MATRIX', 'QUANTUM', 'SPARK', 'WAVE', 'ATOM', 'FLUX', 'ARC',
      'FIRE', 'COLD', 'ICE', 'ION', 'GLOW', 'HEAT', 'CHIP', 'UNIT',
      'WARP', 'SYNC', 'CODE', 'PATH', 'GATE', 'LINE', 'PEAK', 'ZERO'
    ]);

    this.initLevels();
    this.bindEvents();
    this.startAnimationLoop();
  }

  initLevels() {
    this.levels = [
      {
        id: 1,
        title: "Photonic Awakening",
        desc: "Trace adjacent letters to forge the target words: 'LIGHT' and 'BEAM'.",
        parMoves: 2,
        gridSize: 5,
        targets: ['LIGHT', 'BEAM'],
        layout: [
          ['L', 'I', 'G', 'X', 'B'],
          ['X', 'T', 'H', 'E', 'A'],
          ['X', 'X', 'X', 'M', 'X'],
          ['R', 'A', 'Y', 'X', 'X'],
          ['X', 'X', 'X', 'X', 'X']
        ]
      },
      {
        id: 2,
        title: "Prismatic Dispersion",
        desc: "Forge words: 'PRISM', 'RAY', and 'GLOW'.",
        parMoves: 3,
        gridSize: 5,
        targets: ['PRISM', 'RAY', 'GLOW'],
        layout: [
          ['P', 'R', 'I', 'S', 'M'],
          ['X', 'A', 'Y', 'X', 'G'],
          ['X', 'R', 'X', 'O', 'L'],
          ['X', 'X', 'X', 'W', 'X'],
          ['S', 'U', 'N', 'X', 'X']
        ]
      },
      {
        id: 3,
        title: "Energy Conduit",
        desc: "Forge words: 'POWER', 'CORE', and 'FLOW'.",
        parMoves: 3,
        gridSize: 5,
        targets: ['POWER', 'CORE', 'FLOW'],
        layout: [
          ['P', 'O', 'W', 'E', 'R'],
          ['C', 'O', 'R', 'E', 'X'],
          ['F', 'L', 'O', 'W', 'X'],
          ['X', 'G', 'R', 'I', 'D'],
          ['X', 'X', 'X', 'X', 'X']
        ]
      },
      {
        id: 4,
        title: "Stellar Resonance",
        desc: "Forge words: 'NOVA', 'STAR', and 'SOLAR'.",
        parMoves: 3,
        gridSize: 5,
        targets: ['NOVA', 'STAR', 'SOLAR'],
        layout: [
          ['N', 'O', 'V', 'A', 'X'],
          ['X', 'S', 'T', 'A', 'R'],
          ['S', 'O', 'L', 'A', 'R'],
          ['X', 'X', 'X', 'X', 'X'],
          ['M', 'O', 'O', 'N', 'X']
        ]
      },
      {
        id: 5,
        title: "Orbital Dynamics",
        desc: "Forge words: 'ORBIT', 'PULSE', and 'GRAVITY'.",
        parMoves: 3,
        gridSize: 5,
        targets: ['ORBIT', 'PULSE', 'SPACE'],
        layout: [
          ['O', 'R', 'B', 'I', 'T'],
          ['P', 'U', 'L', 'S', 'E'],
          ['S', 'P', 'A', 'C', 'E'],
          ['X', 'E', 'C', 'H', 'O'],
          ['V', 'O', 'I', 'D', 'X']
        ]
      },
      {
        id: 6,
        title: "Quantum Nexus",
        desc: "Forge words: 'NEXUS', 'ATOM', and 'WAVE'.",
        parMoves: 3,
        gridSize: 5,
        targets: ['NEXUS', 'ATOM', 'WAVE'],
        layout: [
          ['N', 'E', 'X', 'U', 'S'],
          ['A', 'T', 'O', 'M', 'X'],
          ['W', 'A', 'V', 'E', 'X'],
          ['F', 'L', 'U', 'X', 'X'],
          ['X', 'X', 'X', 'X', 'X']
        ]
      },
      {
        id: 7,
        title: "Elemental Alchemy",
        desc: "Forge words: 'FIRE', 'COLD', and 'SPARK'.",
        parMoves: 3,
        gridSize: 5,
        targets: ['FIRE', 'COLD', 'SPARK'],
        layout: [
          ['F', 'I', 'R', 'E', 'X'],
          ['C', 'O', 'L', 'D', 'X'],
          ['S', 'P', 'A', 'R', 'K'],
          ['I', 'O', 'N', 'X', 'X'],
          ['X', 'X', 'X', 'X', 'X']
        ]
      },
      {
        id: 8,
        title: "Matrix Transmutation",
        desc: "The ultimate rune matrix: Forge 'MATRIX', 'PORTAL', and 'ENERGY'.",
        parMoves: 3,
        gridSize: 5,
        targets: ['MATRIX', 'PORTAL', 'ENERGY'],
        layout: [
          ['M', 'A', 'T', 'R', 'I'],
          ['P', 'O', 'R', 'T', 'X'],
          ['X', 'A', 'L', 'X', 'X'],
          ['E', 'N', 'E', 'R', 'G'],
          ['X', 'X', 'X', 'X', 'Y']
        ]
      }
    ];
  }

  loadLevel(index) {
    if (index < 0 || index >= this.levels.length) return;
    this.currentLevelIndex = index;
    const lvl = this.levels[index];
    this.gridSize = lvl.gridSize || 5;

    this.grid = [];
    for (let r = 0; r < this.gridSize; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.gridSize; c++) {
        const char = (lvl.layout[r] && lvl.layout[r][c]) ? lvl.layout[r][c] : 'X';
        this.grid[r][c] = { letter: char, cleared: false };
      }
    }

    this.targetWords = [...lvl.targets];
    this.foundWords = [];
    this.selectedPath = [];
    this.isTracing = false;
    this.moves = 0;
    this.isLevelWon = false;

    if (this.onMove) this.onMove(this.moves, lvl.parMoves);
  }

  bindEvents() {
    const getGridPos = (evt) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : null);
      const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : null);
      if (clientX === null || clientY === null) return null;

      const clickX = (clientX - rect.left) * (this.VIRTUAL_SIZE / rect.width);
      const clickY = (clientY - rect.top) * (this.VIRTUAL_SIZE / rect.height);
      const cellSize = this.VIRTUAL_SIZE / this.gridSize;

      const gx = Math.floor(clickX / cellSize);
      const gy = Math.floor(clickY / cellSize);
      if (gx < 0 || gx >= this.gridSize || gy < 0 || gy >= this.gridSize) return null;
      return { gx, gy };
    };

    const handleDown = (evt) => {
      if (this.isLevelWon) return;
      const pos = getGridPos(evt);
      if (!pos) return;

      const tile = this.grid[pos.gy][pos.gx];
      if (tile.letter === 'X') return;

      this.isTracing = true;
      this.selectedPath = [{ gx: pos.gx, gy: pos.gy, letter: tile.letter }];
      window.soundFX.rotateClick();
      if (navigator.vibrate) navigator.vibrate(10);
    };

    const handleMove = (evt) => {
      if (!this.isTracing || this.isLevelWon) return;
      const pos = getGridPos(evt);
      if (!pos) return;

      const last = this.selectedPath[this.selectedPath.length - 1];
      if (pos.gx === last.gx && pos.gy === last.gy) return;

      // Check adjacency (horizontal, vertical, diagonal)
      const dx = Math.abs(pos.gx - last.gx);
      const dy = Math.abs(pos.gy - last.gy);
      if (dx <= 1 && dy <= 1) {
        // Avoid self-intersection
        const alreadyInPath = this.selectedPath.some(p => p.gx === pos.gx && p.gy === pos.gy);
        if (!alreadyInPath) {
          const tile = this.grid[pos.gy][pos.gx];
          if (tile.letter !== 'X') {
            this.selectedPath.push({ gx: pos.gx, gy: pos.gy, letter: tile.letter });
            window.soundFX.rotateClick();
            if (navigator.vibrate) navigator.vibrate(8);
          }
        }
      }
    };

    const handleUp = () => {
      if (!this.isTracing) return;
      this.isTracing = false;

      const word = this.selectedPath.map(p => p.letter).join('');
      if (word.length >= 3) {
        this.submitWord(word);
      }
      this.selectedPath = [];
    };

    this.canvas.addEventListener('mousedown', handleDown);
    this.canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    this.canvas.addEventListener('touchstart', handleDown, { passive: false });
    this.canvas.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp, { passive: false });
  }

  submitWord(word) {
    if (this.targetWords.includes(word) && !this.foundWords.includes(word)) {
      this.foundWords.push(word);
      this.moves++;
      window.soundFX.crystalHit();
      if (navigator.vibrate) navigator.vibrate([20, 30, 40]);

      // Particle explosion at path nodes
      this.selectedPath.forEach(p => {
        const cellSize = this.VIRTUAL_SIZE / this.gridSize;
        for (let i = 0; i < 3; i++) {
          this.particles.push({
            x: (p.gx + 0.5) * cellSize,
            y: (p.gy + 0.5) * cellSize,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1.0,
            color: '#ffb703'
          });
        }
      });

      if (this.onMove) this.onMove(this.moves, this.levels[this.currentLevelIndex].parMoves);
      this.checkWinCondition();
    } else {
      window.soundFX.softThud();
    }
  }

  checkWinCondition() {
    const allFound = this.targetWords.every(t => this.foundWords.includes(t));
    if (allFound && !this.isLevelWon) {
      this.isLevelWon = true;
      window.soundFX.crystalHit();
      if (navigator.vibrate) navigator.vibrate([30, 50, 60]);
      setTimeout(() => {
        window.soundFX.victoryFanfare();
        if (this.onWin) {
          const par = this.levels[this.currentLevelIndex].parMoves;
          const stars = this.moves <= par ? 3 : 2;
          this.onWin(this.currentLevelIndex + 1, stars, this.moves);
        }
      }, 350);
    }
  }

  startAnimationLoop() {
    const render = () => {
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
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const tile = this.grid[r][c];
        const isX = tile.letter === 'X';

        this.ctx.fillStyle = isX ? 'rgba(10, 14, 24, 0.4)' : 'rgba(20, 28, 48, 0.65)';
        this.ctx.fillRect(c * cellSize + 4, r * cellSize + 4, cellSize - 8, cellSize - 8);

        this.ctx.strokeStyle = isX ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 183, 3, 0.25)';
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(c * cellSize + 4, r * cellSize + 4, cellSize - 8, cellSize - 8);

        if (!isX) {
          this.ctx.font = 'bold 28px Outfit, sans-serif';
          this.ctx.fillStyle = '#f8fafc';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(tile.letter, (c + 0.5) * cellSize, (r + 0.5) * cellSize);
        }
      }
    }

    // 2. Tracing Path
    if (this.selectedPath.length > 1) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo((this.selectedPath[0].gx + 0.5) * cellSize, (this.selectedPath[0].gy + 0.5) * cellSize);
      for (let i = 1; i < this.selectedPath.length; i++) {
        this.ctx.lineTo((this.selectedPath[i].gx + 0.5) * cellSize, (this.selectedPath[i].gy + 0.5) * cellSize);
      }
      this.ctx.strokeStyle = '#ffb703';
      this.ctx.shadowColor = '#ffb703';
      this.ctx.shadowBlur = 14;
      this.ctx.lineWidth = 6;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 3. Highlight selected tiles
    for (const p of this.selectedPath) {
      this.ctx.fillStyle = 'rgba(255, 183, 3, 0.35)';
      this.ctx.fillRect(p.gx * cellSize + 4, p.gy * cellSize + 4, cellSize - 8, cellSize - 8);
    }

    // 4. Objective Banner
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(10, 14, 24, 0.9)';
    this.ctx.fillRect(10, this.VIRTUAL_SIZE - 46, this.VIRTUAL_SIZE - 20, 36);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.strokeRect(10, this.VIRTUAL_SIZE - 46, this.VIRTUAL_SIZE - 20, 36);

    this.ctx.font = 'bold 13px JetBrains Mono';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    let textX = 24;

    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText('TARGETS: ', textX, this.VIRTUAL_SIZE - 28);
    textX += 74;

    this.targetWords.forEach(w => {
      const isFound = this.foundWords.includes(w);
      this.ctx.fillStyle = isFound ? '#00ff88' : '#f8fafc';
      this.ctx.fillText((isFound ? '✓ ' : '') + w + '   ', textX, this.VIRTUAL_SIZE - 28);
      textX += w.length * 10 + 26;
    });
    this.ctx.restore();

    // 5. Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
    }
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}

window.GlyphEngine = GlyphEngine;
