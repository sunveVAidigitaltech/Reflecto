/**
 * AETHERIA: SANDBOX & LEVEL DESIGN LAB
 * Interactive level builder allowing designers to place emitters, mirrors,
 * splitters, targets, and walls, test ray-tracing in real time, and export JSON.
 */

class SandboxLab {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridSize = 7;

    this.activeTool = 'mirror'; // 'emitter', 'target', 'mirror', 'splitter', 'wall', 'eraser'
    this.emitterColor = 'cyan';

    this.emitters = [{ x: 1, y: 1, dir: 'E', color: 'cyan' }];
    this.targets = [{ x: 5, y: 5, color: 'cyan', satisfied: false }];
    this.mirrors = [{ x: 5, y: 1, orient: 'sw', locked: false }];
    this.splitters = [];
    this.portals = [];
    this.walls = [];
    this.rays = [];

    this.colors = {
      cyan: { main: '#00f0ff', glow: 'rgba(0, 240, 255, 0.45)' },
      magenta: { main: '#ff2a85', glow: 'rgba(255, 42, 133, 0.45)' },
      emerald: { main: '#00ff88', glow: 'rgba(0, 255, 136, 0.45)' },
      amber: { main: '#ffb703', glow: 'rgba(255, 183, 3, 0.45)' },
      violet: { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)' }
    };

    this.bindEvents();
    this.recalculateRays();
    this.startLoop();
  }

  setTool(tool, color = 'cyan') {
    this.activeTool = tool;
    if (color) this.emitterColor = color;
  }

  bindEvents() {
    const handlePointer = (evt) => {
      evt.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const clientX = evt.clientX || (evt.touches && evt.touches[0].clientX);
      const clientY = evt.clientY || (evt.touches && evt.touches[0].clientY);
      if (clientX === undefined || clientY === undefined) return;

      const clickX = (clientX - rect.left) * scaleX;
      const clickY = (clientY - rect.top) * scaleY;

      const cellSize = this.canvas.width / this.gridSize;
      const gx = Math.floor(clickX / cellSize);
      const gy = Math.floor(clickY / cellSize);

      if (gx < 0 || gx >= this.gridSize || gy < 0 || gy >= this.gridSize) return;

      this.applyTool(gx, gy);
    };

    this.canvas.addEventListener('click', handlePointer);
    this.canvas.addEventListener('touchstart', handlePointer, { passive: false });
  }

  applyTool(gx, gy) {
    if (this.activeTool === 'eraser') {
      this.emitters = this.emitters.filter(e => !(e.x === gx && e.y === gy));
      this.targets = this.targets.filter(t => !(t.x === gx && t.y === gy));
      this.mirrors = this.mirrors.filter(m => !(m.x === gx && m.y === gy));
      this.splitters = this.splitters.filter(s => !(s.x === gx && s.y === gy));
      this.walls = this.walls.filter(w => !(w.x === gx && w.y === gy));
      window.soundFX.rotateClick();
      this.recalculateRays();
      return;
    }

    // Check if clicking existing mirror to rotate it
    const existingMirror = this.mirrors.find(m => m.x === gx && m.y === gy);
    if (existingMirror && this.activeTool === 'mirror') {
      const nextOrient = { 'ne': 'se', 'se': 'sw', 'sw': 'nw', 'nw': 'ne' };
      existingMirror.orient = nextOrient[existingMirror.orient] || 'ne';
      window.soundFX.rotateClick();
      this.recalculateRays();
      return;
    }

    // Check if clicking existing emitter to rotate direction
    const existingEmitter = this.emitters.find(e => e.x === gx && e.y === gy);
    if (existingEmitter && this.activeTool === 'emitter') {
      const nextDir = { 'E': 'S', 'S': 'W', 'W': 'N', 'N': 'E' };
      existingEmitter.dir = nextDir[existingEmitter.dir] || 'E';
      window.soundFX.rotateClick();
      this.recalculateRays();
      return;
    }

    // Clear whatever is in this cell first before placing new item
    this.emitters = this.emitters.filter(e => !(e.x === gx && e.y === gy));
    this.targets = this.targets.filter(t => !(t.x === gx && t.y === gy));
    this.mirrors = this.mirrors.filter(m => !(m.x === gx && m.y === gy));
    this.splitters = this.splitters.filter(s => !(s.x === gx && s.y === gy));
    this.walls = this.walls.filter(w => !(w.x === gx && w.y === gy));

    if (this.activeTool === 'mirror') {
      this.mirrors.push({ x: gx, y: gy, orient: 'ne', locked: false });
    } else if (this.activeTool === 'emitter') {
      this.emitters.push({ x: gx, y: gy, dir: 'E', color: this.emitterColor });
    } else if (this.activeTool === 'target') {
      this.targets.push({ x: gx, y: gy, color: this.emitterColor, satisfied: false });
    } else if (this.activeTool === 'splitter') {
      this.splitters.push({ x: gx, y: gy, orient: 'vertical' });
    } else if (this.activeTool === 'wall') {
      this.walls.push({ x: gx, y: gy });
    }

    window.soundFX.rotateClick();
    this.recalculateRays();
  }

  recalculateRays() {
    this.rays = [];
    this.targets.forEach(t => t.satisfied = false);

    for (const emitter of this.emitters) {
      this.traceRay(emitter.x, emitter.y, emitter.dir, emitter.color);
    }
  }

  traceRay(startX, startY, startDir, rayColor) {
    let currentX = startX;
    let currentY = startY;
    let currentDir = startDir;
    let color = rayColor;

    const dirMap = {
      'E': { dx: 1, dy: 0 },
      'W': { dx: -1, dy: 0 },
      'N': { dx: 0, dy: -1 },
      'S': { dx: 0, dy: 1 }
    };

    let segments = [{ x: currentX, y: currentY }];
    let stepCount = 0;

    while (stepCount < 30) {
      stepCount++;
      const delta = dirMap[currentDir];
      currentX += delta.dx;
      currentY += delta.dy;

      if (currentX < 0 || currentX >= this.gridSize || currentY < 0 || currentY >= this.gridSize) {
        segments.push({ x: currentX, y: currentY });
        break;
      }

      segments.push({ x: currentX, y: currentY });

      if (this.walls.some(w => w.x === currentX && w.y === currentY)) break;

      const target = this.targets.find(t => t.x === currentX && t.y === currentY);
      if (target) {
        if (target.color === color) target.satisfied = true;
        break;
      }

      const splitter = this.splitters.find(s => s.x === currentX && s.y === currentY);
      if (splitter) {
        this.rays.push({ segments, color });
        this.traceRay(currentX, currentY, 'N', color);
        this.traceRay(currentX, currentY, 'S', color);
        break;
      }

      const mirror = this.mirrors.find(m => m.x === currentX && m.y === currentY);
      if (mirror) {
        const reflectTable = {
          'ne': { 'W': 'N', 'S': 'E' },
          'se': { 'W': 'S', 'N': 'E' },
          'sw': { 'E': 'S', 'N': 'W' },
          'nw': { 'E': 'N', 'S': 'W' }
        };
        const newDir = reflectTable[mirror.orient] ? reflectTable[mirror.orient][currentDir] : null;
        if (newDir) currentDir = newDir;
        else break;
      }
    }

    if (segments.length > 1) {
      this.rays.push({ segments, color });
    }
  }

  clearBoard() {
    this.emitters = [];
    this.targets = [];
    this.mirrors = [];
    this.splitters = [];
    this.walls = [];
    this.recalculateRays();
    window.soundFX.rotateClick();
  }

  exportJSON() {
    const data = {
      gridSize: this.gridSize,
      emitters: this.emitters,
      targets: this.targets,
      mirrors: this.mirrors,
      splitters: this.splitters,
      walls: this.walls
    };
    return JSON.stringify(data, null, 2);
  }

  startLoop() {
    const loop = () => {
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cellSize = w / this.gridSize;

    this.ctx.clearRect(0, 0, w, h);

    // Draw Grid
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.gridSize; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * cellSize, 0);
      this.ctx.lineTo(i * cellSize, h);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * cellSize);
      this.ctx.lineTo(w, i * cellSize);
      this.ctx.stroke();
    }

    // Walls
    for (const wall of this.walls) {
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(wall.x * cellSize + 2, wall.y * cellSize + 2, cellSize - 4, cellSize - 4);
      this.ctx.strokeStyle = '#334155';
      this.ctx.strokeRect(wall.x * cellSize + 2, wall.y * cellSize + 2, cellSize - 4, cellSize - 4);
    }

    // Splitters
    for (const s of this.splitters) {
      const cx = (s.x + 0.5) * cellSize;
      const cy = (s.y + 0.5) * cellSize;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, cellSize * 0.35, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
      this.ctx.fill();
      this.ctx.strokeStyle = '#a855f7';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    // Mirrors
    for (const m of this.mirrors) {
      const cx = (m.x + 0.5) * cellSize;
      const cy = (m.y + 0.5) * cellSize;
      const r = cellSize * 0.38;

      this.ctx.save();
      this.ctx.translate(cx, cy);
      const angleMap = { 'ne': -Math.PI / 4, 'se': Math.PI / 4, 'sw': (3 * Math.PI) / 4, 'nw': -(3 * Math.PI) / 4 };
      this.ctx.rotate(angleMap[m.orient] || 0);

      this.ctx.beginPath();
      this.ctx.moveTo(-r * 0.8, 0);
      this.ctx.lineTo(r * 0.8, 0);
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 4;
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 8;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Targets
    for (const t of this.targets) {
      const cx = (t.x + 0.5) * cellSize;
      const cy = (t.y + 0.5) * cellSize;
      const col = this.colors[t.color]?.main || '#00f0ff';

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, cellSize * 0.3, 0, Math.PI * 2);
      this.ctx.fillStyle = t.satisfied ? col : 'rgba(255, 255, 255, 0.1)';
      this.ctx.fill();
      this.ctx.strokeStyle = col;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Emitters
    for (const e of this.emitters) {
      const cx = (e.x + 0.5) * cellSize;
      const cy = (e.y + 0.5) * cellSize;
      const col = this.colors[e.color]?.main || '#00f0ff';

      this.ctx.save();
      this.ctx.translate(cx, cy);
      const dirRotations = { 'E': 0, 'S': Math.PI / 2, 'W': Math.PI, 'N': -Math.PI / 2 };
      this.ctx.rotate(dirRotations[e.dir] || 0);

      this.ctx.beginPath();
      this.ctx.arc(0, 0, cellSize * 0.28, 0, Math.PI * 2);
      this.ctx.fillStyle = '#0d1322';
      this.ctx.fill();
      this.ctx.strokeStyle = col;
      this.ctx.stroke();

      this.ctx.fillStyle = col;
      this.ctx.beginPath();
      this.ctx.moveTo(cellSize * 0.22, -cellSize * 0.08);
      this.ctx.lineTo(cellSize * 0.38, 0);
      this.ctx.lineTo(cellSize * 0.22, cellSize * 0.08);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    }

    // Laser Beams
    for (const ray of this.rays) {
      if (ray.segments.length < 2) continue;
      const col = this.colors[ray.color]?.main || '#00f0ff';
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo((ray.segments[0].x + 0.5) * cellSize, (ray.segments[0].y + 0.5) * cellSize);
      for (let i = 1; i < ray.segments.length; i++) {
        this.ctx.lineTo((ray.segments[i].x + 0.5) * cellSize, (ray.segments[i].y + 0.5) * cellSize);
      }
      this.ctx.strokeStyle = col;
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = col;
      this.ctx.shadowBlur = 12;
      this.ctx.stroke();
      this.ctx.restore();
    }
  }
}

window.SandboxLab = SandboxLab;
