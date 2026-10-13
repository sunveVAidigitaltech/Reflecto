/**
 * REFLECTO - TOYBOX SANDBOX MODE
 * Creative playground where kids can place flashlights, bouncy mirrors,
 * wooden blocks, prisms, and sleepy stars to build custom light mazes!
 * Features live real-time optics simulation.
 */

class ToyboxController {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.VIRTUAL_SIZE = 600;
    this.gridSize = 8;

    this.selectedTool = 'mirror_slash'; // default tool
    this.emitterDir = 'E'; // E, S, W, N

    this.level = {
      gridSize: 8,
      emitters: [{ x: 0, y: 1, dir: 'E', color: 'blue' }],
      targets: [{ x: 7, y: 6, color: 'blue' }],
      mirrors: [],
      walls: [],
      splitters: [],
      filters: [],
      portals: [],
      bombs: []
    };

    this.pulseAngle = 0;
    this.animFrameId = null;
    this.particles = [];

    // Pastel beam palette
    this.palette = {
      blue:     { beam: '#2997FF', glow: 'rgba(41, 151, 255, 0.45)', core: '#E1F0FF', dark: '#0066CC' },
      pink:     { beam: '#FF4D88', glow: 'rgba(255, 77, 136, 0.45)', core: '#FFE5ED', dark: '#E01E5A' },
      yellow:   { beam: '#D97706', glow: 'rgba(245, 158, 11, 0.45)', core: '#FEF3C7', dark: '#B45309' },
      mint:     { beam: '#059669', glow: 'rgba(16, 185, 129, 0.45)', core: '#D1FAE5', dark: '#047857' },
      default:  { beam: '#2997FF', glow: 'rgba(41, 151, 255, 0.45)', core: '#FFFFFF', dark: '#0066CC' }
    };

    this.loadSavedCreation();
    this.bindEvents();
    this.startLoop();
  }

  setTool(tool) {
    this.selectedTool = tool;
    if (window.soundFX && window.soundFX.candyPop) window.soundFX.candyPop();
  }

  loadSavedCreation() {
    const saved = localStorage.getItem('reflecto_toybox_creation');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data && Array.isArray(data.emitters)) {
          this.level = data;
          this.gridSize = data.gridSize || 8;
        }
      } catch (e) {
        console.warn('Failed to parse saved toybox creation:', e);
      }
    }
    this.recalculate();
  }

  saveCreation() {
    localStorage.setItem('reflecto_toybox_creation', JSON.stringify(this.level));
    if (window.soundFX && window.soundFX.starWakeupChime) window.soundFX.starWakeupChime();
  }

  clearBoard() {
    this.level = {
      gridSize: 8,
      emitters: [{ x: 0, y: 1, dir: 'E', color: 'blue' }],
      targets: [{ x: 7, y: 6, color: 'blue' }],
      mirrors: [],
      walls: [],
      splitters: [],
      filters: [],
      portals: [],
      bombs: []
    };
    this.saveCreation();
    this.recalculate();
    if (window.soundFX && window.soundFX.softThud) window.soundFX.softThud();
  }

  loadPreset() {
    this.level = {
      gridSize: 8,
      emitters: [{ x: 1, y: 1, dir: 'E', color: 'blue' }],
      targets: [
        { x: 6, y: 6, color: 'blue' },
        { x: 1, y: 6, color: 'blue' }
      ],
      mirrors: [
        { x: 6, y: 1, type: '\\', locked: false, currentAngle: Math.PI / 4, targetAngle: Math.PI / 4 },
        { x: 1, y: 3, type: '/', locked: false, currentAngle: -Math.PI / 4, targetAngle: -Math.PI / 4 }
      ],
      splitters: [{ x: 6, y: 3, type: '/' }],
      walls: [{ x: 4, y: 3 }],
      filters: [],
      portals: [],
      bombs: []
    };
    this.saveCreation();
    this.recalculate();
    if (window.soundFX && window.soundFX.victoryFanfare) window.soundFX.victoryFanfare();
  }

  recalculate() {
    if (!this.level || typeof OpticsCore === 'undefined') return;
    const cmap = OpticsCore.buildCellMap(this.level);
    const types = (this.level.mirrors || []).map(m => m.type);
    this.traceResult = OpticsCore.trace(this.level, cmap, types);
  }

  handleCellTap(gx, gy) {
    if (gx < 0 || gx >= this.gridSize || gy < 0 || gy >= this.gridSize) return;

    // Check if cell already contains something
    const mIdx = (this.level.mirrors || []).findIndex(m => m.x === gx && m.y === gy);
    const eIdx = (this.level.emitters || []).findIndex(e => e.x === gx && e.y === gy);
    const tIdx = (this.level.targets || []).findIndex(t => t.x === gx && t.y === gy);
    const wIdx = (this.level.walls || []).findIndex(w => w.x === gx && w.y === gy);
    const sIdx = (this.level.splitters || []).findIndex(s => s.x === gx && s.y === gy);
    const bIdx = (this.level.bombs || []).findIndex(b => b.x === gx && b.y === gy);

    // Eraser Tool
    if (this.selectedTool === 'eraser') {
      if (mIdx !== -1) this.level.mirrors.splice(mIdx, 1);
      if (eIdx !== -1) this.level.emitters.splice(eIdx, 1);
      if (tIdx !== -1) this.level.targets.splice(tIdx, 1);
      if (wIdx !== -1) this.level.walls.splice(wIdx, 1);
      if (sIdx !== -1) this.level.splitters.splice(sIdx, 1);
      if (bIdx !== -1) this.level.bombs.splice(bIdx, 1);
      if (window.soundFX && window.soundFX.undoTick) window.soundFX.undoTick();
      this.saveCreation();
      this.recalculate();
      return;
    }

    // If cell already has a mirror and user taps with mirror tool, flip it!
    if (mIdx !== -1 && (this.selectedTool === 'mirror_slash' || this.selectedTool === 'mirror_backslash')) {
      const m = this.level.mirrors[mIdx];
      m.type = (m.type === '/') ? '\\' : '/';
      m.targetAngle = (m.type === '/') ? -Math.PI / 4 : Math.PI / 4;
      if (window.soundFX && window.soundFX.candyPop) window.soundFX.candyPop();
      this.saveCreation();
      this.recalculate();
      return;
    }

    // If cell has an emitter and user taps with emitter tool, cycle direction!
    if (eIdx !== -1 && this.selectedTool === 'emitter') {
      const e = this.level.emitters[eIdx];
      const cycle = { E: 'S', S: 'W', W: 'N', N: 'E' };
      e.dir = cycle[e.dir] || 'E';
      if (window.soundFX && window.soundFX.candyPop) window.soundFX.candyPop();
      this.saveCreation();
      this.recalculate();
      return;
    }

    // Remove any existing item at this tile before placing new tool
    if (mIdx !== -1) this.level.mirrors.splice(mIdx, 1);
    if (eIdx !== -1) this.level.emitters.splice(eIdx, 1);
    if (tIdx !== -1) this.level.targets.splice(tIdx, 1);
    if (wIdx !== -1) this.level.walls.splice(wIdx, 1);
    if (sIdx !== -1) this.level.splitters.splice(sIdx, 1);
    if (bIdx !== -1) this.level.bombs.splice(bIdx, 1);

    // Place selected tool
    switch (this.selectedTool) {
      case 'mirror_slash':
        this.level.mirrors.push({ x: gx, y: gy, type: '/', currentAngle: -Math.PI / 4, targetAngle: -Math.PI / 4 });
        break;
      case 'mirror_backslash':
        this.level.mirrors.push({ x: gx, y: gy, type: '\\', currentAngle: Math.PI / 4, targetAngle: Math.PI / 4 });
        break;
      case 'emitter':
        this.level.emitters.push({ x: gx, y: gy, dir: this.emitterDir, color: 'blue' });
        break;
      case 'target':
        this.level.targets.push({ x: gx, y: gy, color: 'blue' });
        break;
      case 'wall':
        this.level.walls.push({ x: gx, y: gy });
        break;
      case 'splitter':
        this.level.splitters.push({ x: gx, y: gy, type: '/' });
        break;
      case 'bomb':
        this.level.bombs.push({ x: gx, y: gy });
        break;
    }

    if (window.soundFX && window.soundFX.candyPop) window.soundFX.candyPop();
    this.saveCreation();
    this.recalculate();
  }

  bindEvents() {
    const handleTap = (evt) => {
      evt.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : null);
      const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : null);
      if (clientX === null || clientY === null) return;

      const scaleX = this.VIRTUAL_SIZE / rect.width;
      const scaleY = this.VIRTUAL_SIZE / rect.height;
      const clickX = (clientX - rect.left) * scaleX;
      const clickY = (clientY - rect.top) * scaleY;

      const cellSize = this.VIRTUAL_SIZE / this.gridSize;
      const gx = Math.floor(clickX / cellSize);
      const gy = Math.floor(clickY / cellSize);

      this.handleCellTap(gx, gy);
    };

    this.canvas.addEventListener('click', handleTap);
    this.canvas.addEventListener('touchstart', handleTap, { passive: false });
  }

  startLoop() {
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

    const cellSize = this.VIRTUAL_SIZE / this.gridSize;

    // Board grid
    this.drawBoard(cellSize);

    // Walls
    this.drawWalls(cellSize);

    // Splitters
    this.drawSplitters(cellSize);

    // Bombs
    this.drawBombs(cellSize);

    // Beams with flowing photons
    this.drawLightBeams(cellSize);

    // Stars
    this.drawStars(cellSize);

    // Emitters
    this.drawEmitters(cellSize);

    // Mirrors
    this.drawMirrors(cellSize);
  }

  drawBoard(cellSize) {
    const bgGrad = this.ctx.createLinearGradient(0, 0, this.VIRTUAL_SIZE, this.VIRTUAL_SIZE);
    bgGrad.addColorStop(0, '#FFFDF8');
    bgGrad.addColorStop(1, '#F7FAFC');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.VIRTUAL_SIZE, this.VIRTUAL_SIZE);

    this.ctx.strokeStyle = '#E2E8F0';
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
  }

  drawWalls(cellSize) {
    (this.level.walls || []).forEach(w => {
      const x = w.x * cellSize + 5;
      const y = w.y * cellSize + 5;
      const s = cellSize - 10;
      this.ctx.fillStyle = '#D1A36B';
      this.ctx.strokeStyle = '#BA8B52';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, s, s, 8);
      this.ctx.fill();
      this.ctx.stroke();
    });
  }

  drawSplitters(cellSize) {
    (this.level.splitters || []).forEach(s => {
      const cx = (s.x + 0.5) * cellSize;
      const cy = (s.y + 0.5) * cellSize;
      const sz = cellSize * 0.38;

      this.ctx.save();
      this.ctx.translate(cx, cy);

      // Diamond Outer Boundary
      this.ctx.beginPath();
      this.ctx.moveTo(0, -sz);
      this.ctx.lineTo(sz, 0);
      this.ctx.lineTo(0, sz);
      this.ctx.lineTo(-sz, 0);
      this.ctx.closePath();

      // High-Contrast Gemstone Gradient Fill
      const pGrad = this.ctx.createLinearGradient(-sz, -sz, sz, sz);
      pGrad.addColorStop(0, '#0284C7');
      pGrad.addColorStop(0.5, '#7C3AED');
      pGrad.addColorStop(1, '#DB2777');
      this.ctx.fillStyle = pGrad;
      this.ctx.shadowColor = 'rgba(124, 58, 237, 0.55)';
      this.ctx.shadowBlur = 10;
      this.ctx.fill();

      // 3D Specular Highlight Facet
      this.ctx.shadowColor = 'transparent';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
      this.ctx.beginPath();
      this.ctx.moveTo(0, -sz);
      this.ctx.lineTo(sz, 0);
      this.ctx.lineTo(0, 0);
      this.ctx.closePath();
      this.ctx.fill();

      // Heavy Border
      this.ctx.strokeStyle = '#2E1065';
      this.ctx.lineWidth = 3.5;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -sz);
      this.ctx.lineTo(sz, 0);
      this.ctx.lineTo(0, sz);
      this.ctx.lineTo(-sz, 0);
      this.ctx.closePath();
      this.ctx.stroke();

      // Splitting Diagonal (Dark outline + pure white core)
      const isSlash = (s.type === '/');
      const startX = -sz * 0.65;
      const startY = isSlash ? sz * 0.65 : -sz * 0.65;
      const endX = sz * 0.65;
      const endY = isSlash ? -sz * 0.65 : sz * 0.65;

      this.ctx.strokeStyle = '#0F172A';
      this.ctx.lineWidth = 5;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();

      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();

      this.ctx.restore();
    });
  }

  drawBombs(cellSize) {
    (this.level.bombs || []).forEach(b => {
      const cx = (b.x + 0.5) * cellSize;
      const cy = (b.y + 0.5) * cellSize;
      const r = cellSize * 0.35;
      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.fillStyle = '#94A3B8';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
      this.ctx.arc(-r * 0.4, 0, r * 0.5, 0, Math.PI * 2);
      this.ctx.arc(r * 0.4, 0, r * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  drawLightBeams(cellSize) {
    if (!this.traceResult || !this.traceResult.segs) return;

    for (const seg of this.traceResult.segs) {
      if (!seg.pts || seg.pts.length < 2) continue;
      const pal = this.palette[seg.color] || this.palette.default;

      // Glow aura
      this.ctx.save();
      this.ctx.strokeStyle = pal.glow;
      this.ctx.lineWidth = 14;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      for (let i = 0; i < seg.pts.length; i++) {
        const [gx, gy] = seg.pts[i];
        const px = (gx + 0.5) * cellSize;
        const py = (gy + 0.5) * cellSize;
        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.stroke();

      // Main beam
      this.ctx.strokeStyle = pal.beam;
      this.ctx.lineWidth = 5;
      this.ctx.stroke();

      // White core
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Flowing photon beads
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
          this.ctx.beginPath();
          this.ctx.arc(bx, by, 3, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
      this.ctx.restore();
    }
  }

  drawStars(cellSize) {
    (this.level.targets || []).forEach((t, idx) => {
      const cx = (t.x + 0.5) * cellSize;
      const cy = (t.y + 0.5) * cellSize;
      const isLit = this.traceResult && this.traceResult.lit && this.traceResult.lit.has(idx);

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.font = `${cellSize * 0.65}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(isLit ? '⭐' : '😴', 0, 0);
      this.ctx.restore();
    });
  }

  drawEmitters(cellSize) {
    (this.level.emitters || []).forEach(e => {
      const cx = (e.x + 0.5) * cellSize;
      const cy = (e.y + 0.5) * cellSize;
      const r = cellSize * 0.38;

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.fillStyle = '#2997FF';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
      this.ctx.fill();

      const angleMap = { E: 0, S: Math.PI / 2, W: Math.PI, N: -Math.PI / 2 };
      this.ctx.rotate(angleMap[e.dir] || 0);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.moveTo(r * 0.2, -4);
      this.ctx.lineTo(r * 0.65, 0);
      this.ctx.lineTo(r * 0.2, 4);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  drawMirrors(cellSize) {
    (this.level.mirrors || []).forEach(m => {
      const cx = (m.x + 0.5) * cellSize;
      const cy = (m.y + 0.5) * cellSize;
      const s = cellSize * 0.8;

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.strokeStyle = '#38BDF8';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.roundRect(-s / 2, -s / 2, s, s, 10);
      this.ctx.fill();
      this.ctx.stroke();

      const isSlash = (m.type === '/');
      this.ctx.rotate(isSlash ? -Math.PI / 4 : Math.PI / 4);
      this.ctx.fillStyle = '#0284C7';
      this.ctx.beginPath();
      this.ctx.roundRect(-s * 0.4, -3.5, s * 0.8, 7, 3);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToyboxController;
}
