/**
 * AETHERIA: ENGINE GRAVITY (ECHO GRAVITY: CELESTIAL SLINGSHOT)
 * Orbital physics and gravitational trajectory puzzle engine.
 * Place attractor wells and pulsar repulsors to slingshot energy probes
 * through asteroid belts, collect stardust, and dock into wormhole event horizons.
 */

class GravityEngine {
  constructor(canvas, onWinCallback, onMoveCallback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onWin = onWinCallback;
    this.onMove = onMoveCallback;

    this.VIRTUAL_SIZE = 600;
    this.wells = []; // Gravitational attractor/repulsor nodes
    this.selectedWell = null;
    this.probe = { x: 50, y: 300, vx: 3.5, vy: 0, state: 'idle', trail: [] };
    this.startProbe = { x: 50, y: 300, vx: 3.5, vy: 0 };
    this.destination = { x: 540, y: 300, radius: 26 };
    this.hazards = []; // Asteroids
    this.stardust = []; // Collectibles
    this.collectedStars = 0;

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
        title: "Orbital Primer",
        desc: "Drag the blue Gravity Well to bend the probe's trajectory around the asteroid into the wormhole.",
        parMoves: 2,
        probe: { x: 80, y: 300, vx: 3.2, vy: 0 },
        destination: { x: 520, y: 300, radius: 26 },
        wells: [
          { x: 300, y: 200, mass: 1200, type: 'attractor' } // Pulls upward
        ],
        hazards: [
          { x: 300, y: 300, radius: 36 } // Asteroid in straight path
        ],
        stardust: [
          { x: 300, y: 150, collected: false },
          { x: 420, y: 240, collected: false }
        ]
      },
      {
        id: 2,
        title: "Twin Attractors",
        desc: "Balance two gravitational wells to slingshot in an S-curve past double asteroid barriers.",
        parMoves: 3,
        probe: { x: 60, y: 450, vx: 3.0, vy: -0.5 },
        destination: { x: 540, y: 150, radius: 26 },
        wells: [
          { x: 200, y: 280, mass: 1100, type: 'attractor' },
          { x: 400, y: 320, mass: 1100, type: 'attractor' }
        ],
        hazards: [
          { x: 200, y: 440, radius: 30 },
          { x: 400, y: 160, radius: 30 }
        ],
        stardust: [
          { x: 200, y: 200, collected: false },
          { x: 300, y: 300, collected: false },
          { x: 400, y: 400, collected: false }
        ]
      },
      {
        id: 3,
        title: "Pulsar Repulsion",
        desc: "Orange Pulsars repel probes. Use the repulsor to push the probe away from the lethal barrier.",
        parMoves: 3,
        probe: { x: 80, y: 150, vx: 3.2, vy: 0.5 },
        destination: { x: 520, y: 480, radius: 26 },
        wells: [
          { x: 260, y: 220, mass: -1200, type: 'repulsor' }, // Push away
          { x: 420, y: 360, mass: 1000, type: 'attractor' }
        ],
        hazards: [
          { x: 260, y: 120, radius: 34 }
        ],
        stardust: [
          { x: 260, y: 320, collected: false },
          { x: 420, y: 460, collected: false }
        ]
      },
      {
        id: 4,
        title: "The Slingshot Trench",
        desc: "Thread the needle between dense asteroid fields using a high-gravity swing.",
        parMoves: 4,
        probe: { x: 60, y: 300, vx: 3.0, vy: 0 },
        destination: { x: 540, y: 300, radius: 26 },
        wells: [
          { x: 300, y: 150, mass: 1400, type: 'attractor' },
          { x: 300, y: 450, mass: 1400, type: 'attractor' }
        ],
        hazards: [
          { x: 200, y: 300, radius: 30 },
          { x: 400, y: 300, radius: 30 }
        ],
        stardust: [
          { x: 300, y: 230, collected: false },
          { x: 300, y: 370, collected: false }
        ]
      },
      {
        id: 5,
        title: "Celestial Triad",
        desc: "Three gravity wells create a stable triangular orbit to scoop all cosmic dust.",
        parMoves: 4,
        probe: { x: 80, y: 100, vx: 2.8, vy: 1.2 },
        destination: { x: 300, y: 520, radius: 26 },
        wells: [
          { x: 180, y: 280, mass: 1100, type: 'attractor' },
          { x: 420, y: 280, mass: 1100, type: 'attractor' },
          { x: 300, y: 380, mass: -900, type: 'repulsor' }
        ],
        hazards: [
          { x: 300, y: 240, radius: 36 }
        ],
        stardust: [
          { x: 180, y: 180, collected: false },
          { x: 420, y: 180, collected: false },
          { x: 300, y: 440, collected: false }
        ]
      },
      {
        id: 6,
        title: "Gravitational Lensing",
        desc: "A massive gravity well curves spacetime. Execute a dramatic loop around the super-singularity.",
        parMoves: 4,
        probe: { x: 60, y: 200, vx: 3.4, vy: 0 },
        destination: { x: 120, y: 420, radius: 26 },
        wells: [
          { x: 360, y: 300, mass: 1800, type: 'attractor' }
        ],
        hazards: [
          { x: 360, y: 300, radius: 38 } // Don't crash into center!
        ],
        stardust: [
          { x: 440, y: 200, collected: false },
          { x: 460, y: 360, collected: false },
          { x: 300, y: 440, collected: false }
        ]
      },
      {
        id: 7,
        title: "Perimeter Slingshot",
        desc: "Circumnavigate outer space debris using perimeter repulsors.",
        parMoves: 5,
        probe: { x: 60, y: 500, vx: 3.2, vy: -1.0 },
        destination: { x: 500, y: 100, radius: 26 },
        wells: [
          { x: 220, y: 360, mass: -1100, type: 'repulsor' },
          { x: 380, y: 240, mass: 1200, type: 'attractor' }
        ],
        hazards: [
          { x: 280, y: 480, radius: 28 },
          { x: 320, y: 120, radius: 28 }
        ],
        stardust: [
          { x: 180, y: 240, collected: false },
          { x: 340, y: 320, collected: false },
          { x: 480, y: 220, collected: false }
        ]
      },
      {
        id: 8,
        title: "Cosmic Singularity Master",
        desc: "Coordinate dual attractors and a repulsor to guide the probe through a gauntlet of 4 asteroids.",
        parMoves: 6,
        probe: { x: 60, y: 300, vx: 3.0, vy: 0 },
        destination: { x: 540, y: 300, radius: 26 },
        wells: [
          { x: 220, y: 180, mass: 1200, type: 'attractor' },
          { x: 380, y: 420, mass: 1200, type: 'attractor' },
          { x: 300, y: 300, mass: -1300, type: 'repulsor' }
        ],
        hazards: [
          { x: 160, y: 300, radius: 26 },
          { x: 440, y: 300, radius: 26 },
          { x: 300, y: 160, radius: 26 },
          { x: 300, y: 440, radius: 26 }
        ],
        stardust: [
          { x: 220, y: 260, collected: false },
          { x: 380, y: 340, collected: false },
          { x: 500, y: 300, collected: false }
        ]
      }
    ];
  }

  loadLevel(index) {
    if (index < 0 || index >= this.levels.length) return;
    this.currentLevelIndex = index;
    const lvl = this.levels[index];

    this.wells = lvl.wells.map(w => ({ ...w }));
    this.hazards = lvl.hazards.map(h => ({ ...h }));
    this.stardust = lvl.stardust.map(s => ({ ...s, collected: false }));
    this.destination = { ...lvl.destination };
    this.startProbe = { ...lvl.probe };
    this.resetProbe();

    this.selectedWell = this.wells[0] || null;
    this.moves = 0;
    this.isLevelWon = false;

    if (this.onMove) this.onMove(this.moves, lvl.parMoves);
  }

  resetProbe() {
    this.probe = {
      x: this.startProbe.x,
      y: this.startProbe.y,
      vx: this.startProbe.vx,
      vy: this.startProbe.vy,
      state: 'idle',
      trail: []
    };
    this.stardust.forEach(s => s.collected = false);
    this.collectedStars = 0;
  }

  launchProbe() {
    if (this.probe.state === 'flying' || this.isLevelWon) return;
    this.resetProbe();
    this.probe.state = 'flying';
    this.moves++;
    window.soundFX.laserHum();
    if (navigator.vibrate) navigator.vibrate(20);
    if (this.onMove) this.onMove(this.moves, this.levels[this.currentLevelIndex].parMoves);
  }

  bindEvents() {
    let isDragging = false;

    const getPos = (evt) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : null);
      const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : null);
      if (clientX === null || clientY === null) return null;

      return {
        x: (clientX - rect.left) * (this.VIRTUAL_SIZE / rect.width),
        y: (clientY - rect.top) * (this.VIRTUAL_SIZE / rect.height)
      };
    };

    const handleDown = (evt) => {
      const pos = getPos(evt);
      if (!pos) return;

      const well = this.wells.find(w => Math.hypot(w.x - pos.x, w.y - pos.y) <= 36);
      if (well) {
        this.selectedWell = well;
        isDragging = true;
        window.soundFX.rotateClick();
        if (navigator.vibrate) navigator.vibrate(10);
      }
    };

    const handleMove = (evt) => {
      if (!isDragging || !this.selectedWell || this.probe.state === 'flying') return;
      const pos = getPos(evt);
      if (!pos) return;

      this.selectedWell.x = Math.max(50, Math.min(550, pos.x));
      this.selectedWell.y = Math.max(50, Math.min(550, pos.y));
    };

    const handleUp = () => {
      if (isDragging) {
        isDragging = false;
        if (this.probe.state === 'idle') {
          // Live trajectory will update
        }
      }
    };

    this.canvas.addEventListener('mousedown', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    this.canvas.addEventListener('touchstart', handleDown, { passive: false });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp, { passive: false });
  }

  calculateTrajectoryArc(steps = 180) {
    const points = [];
    let px = this.startProbe.x;
    let py = this.startProbe.y;
    let pvx = this.startProbe.vx;
    let pvy = this.startProbe.vy;
    const dt = 0.8;

    for (let i = 0; i < steps; i++) {
      points.push({ x: px, y: py });

      // Gravitational acceleration: F = G * M / r^2
      let ax = 0, ay = 0;
      for (const w of this.wells) {
        const dx = w.x - px;
        const dy = w.y - py;
        const distSq = Math.max(600, dx * dx + dy * dy);
        const dist = Math.sqrt(distSq);
        const force = w.mass / distSq;
        ax += (dx / dist) * force;
        ay += (dy / dist) * force;
      }

      pvx += ax * dt;
      pvy += ay * dt;
      px += pvx * dt;
      py += pvy * dt;

      // Stop arc on bounds, hazard, or destination
      if (px < 0 || px > this.VIRTUAL_SIZE || py < 0 || py > this.VIRTUAL_SIZE) break;
      if (Math.hypot(px - this.destination.x, py - this.destination.y) <= this.destination.radius) {
        points.push({ x: px, y: py });
        break;
      }
      if (this.hazards.some(h => Math.hypot(px - h.x, py - h.y) <= h.radius)) {
        points.push({ x: px, y: py });
        break;
      }
    }
    return points;
  }

  updatePhysics() {
    if (this.probe.state !== 'flying') return;

    const dt = 0.8;
    let ax = 0, ay = 0;

    for (const w of this.wells) {
      const dx = w.x - this.probe.x;
      const dy = w.y - this.probe.y;
      const distSq = Math.max(600, dx * dx + dy * dy);
      const dist = Math.sqrt(distSq);
      const force = w.mass / distSq;
      ax += (dx / dist) * force;
      ay += (dy / dist) * force;
    }

    this.probe.vx += ax * dt;
    this.probe.vy += ay * dt;
    this.probe.x += this.probe.vx * dt;
    this.probe.y += this.probe.vy * dt;

    this.probe.trail.push({ x: this.probe.x, y: this.probe.y });
    if (this.probe.trail.length > 50) this.probe.trail.shift();

    // Check Stardust collection
    for (const star of this.stardust) {
      if (!star.collected && Math.hypot(this.probe.x - star.x, this.probe.y - star.y) <= 22) {
        star.collected = true;
        this.collectedStars++;
        window.soundFX.crystalHit();
      }
    }

    // Check Destination arrival (Win)
    if (Math.hypot(this.probe.x - this.destination.x, this.probe.y - this.destination.y) <= this.destination.radius) {
      this.probe.state = 'docked';
      this.isLevelWon = true;
      window.soundFX.crystalHit();
      if (navigator.vibrate) navigator.vibrate([30, 50, 60]);
      setTimeout(() => {
        window.soundFX.victoryFanfare();
        if (this.onWin) {
          const par = this.levels[this.currentLevelIndex].parMoves;
          const stars = this.collectedStars >= this.stardust.length ? 3 : 2;
          this.onWin(this.currentLevelIndex + 1, stars, this.moves);
        }
      }, 350);
      return;
    }

    // Check Hazards
    if (this.hazards.some(h => Math.hypot(this.probe.x - h.x, this.probe.y - h.y) <= h.radius + 6)) {
      this.probe.state = 'lost';
      window.soundFX.softThud();
      if (navigator.vibrate) navigator.vibrate(40);
      setTimeout(() => this.resetProbe(), 800);
      return;
    }

    // Check Out of Bounds
    if (this.probe.x < -20 || this.probe.x > this.VIRTUAL_SIZE + 20 ||
        this.probe.y < -20 || this.probe.y > this.VIRTUAL_SIZE + 20) {
      this.probe.state = 'lost';
      window.soundFX.softThud();
      setTimeout(() => this.resetProbe(), 600);
    }
  }

  startAnimationLoop() {
    const render = () => {
      this.pulseTime += 0.04;
      this.updatePhysics();
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

    // 1. Deep Space Grid Background
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.VIRTUAL_SIZE; i += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.VIRTUAL_SIZE);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.VIRTUAL_SIZE, i);
      this.ctx.stroke();
    }

    // 2. Predictive Trajectory Ghost Line
    if (this.probe.state === 'idle') {
      const arc = this.calculateTrajectoryArc(220);
      if (arc.length > 1) {
        this.ctx.save();
        this.ctx.setLineDash([4, 6]);
        this.ctx.beginPath();
        this.ctx.moveTo(arc[0].x, arc[0].y);
        for (let i = 1; i < arc.length; i++) {
          this.ctx.lineTo(arc[i].x, arc[i].y);
        }
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.restore();
      }
    }

    // 3. Wormhole Destination
    this.drawDestination();

    // 4. Hazards (Asteroids)
    this.drawHazards();

    // 5. Stardust Collectibles
    this.drawStardust();

    // 6. Gravity Wells
    this.drawGravityWells();

    // 7. Probe & Trail
    this.drawProbe();
  }

  drawDestination() {
    const d = this.destination;
    this.ctx.save();
    this.ctx.translate(d.x, d.y);

    this.ctx.beginPath();
    this.ctx.arc(0, 0, d.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#080d18';
    this.ctx.fill();
    this.ctx.strokeStyle = '#a855f7';
    this.ctx.shadowColor = '#a855f7';
    this.ctx.shadowBlur = 18;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Swirling portal rings
    this.ctx.rotate(this.pulseTime);
    this.ctx.setLineDash([6, 6]);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, d.radius * 0.7, 0, Math.PI * 2);
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawHazards() {
    for (const h of this.hazards) {
      this.ctx.save();
      this.ctx.translate(h.x, h.y);

      this.ctx.beginPath();
      this.ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#1e1e2d';
      this.ctx.fill();
      this.ctx.strokeStyle = '#ff2a85';
      this.ctx.shadowColor = '#ff2a85';
      this.ctx.shadowBlur = 10;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Asteroid texture lines
      this.ctx.beginPath();
      this.ctx.moveTo(-h.radius * 0.5, -h.radius * 0.3);
      this.ctx.lineTo(h.radius * 0.4, h.radius * 0.4);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      this.ctx.stroke();

      this.ctx.restore();
    }
  }

  drawStardust() {
    for (const s of this.stardust) {
      if (s.collected) continue;
      this.ctx.save();
      this.ctx.translate(s.x, s.y);

      this.ctx.font = '16px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.shadowColor = '#ffb703';
      this.ctx.shadowBlur = 12;
      this.ctx.fillText('⭐', 0, 0);

      this.ctx.restore();
    }
  }

  drawGravityWells() {
    for (const w of this.wells) {
      const isAttractor = w.type === 'attractor';
      const col = isAttractor ? '#00f0ff' : '#ffb703';
      const isSelected = this.selectedWell === w;

      this.ctx.save();
      this.ctx.translate(w.x, w.y);

      // Pulsing gravitational field rings
      const pulseR = 36 + Math.sin(this.pulseTime * 2) * 4;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
      this.ctx.strokeStyle = col;
      this.ctx.globalAlpha = 0.25;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
      this.ctx.globalAlpha = 1.0;

      // Core Well Body
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
      this.ctx.fillStyle = isSelected ? '#ffffff' : col;
      this.ctx.shadowColor = col;
      this.ctx.shadowBlur = 16;
      this.ctx.fill();

      // Sign icon (+ for attractor pull, - for repulsor push)
      this.ctx.font = 'bold 16px monospace';
      this.ctx.fillStyle = '#050811';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(isAttractor ? '▼' : '▲', 0, 0);

      this.ctx.restore();
    }
  }

  drawProbe() {
    // Flight trail
    if (this.probe.trail.length > 1) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(this.probe.trail[0].x, this.probe.trail[0].y);
      for (let i = 1; i < this.probe.trail.length; i++) {
        this.ctx.lineTo(this.probe.trail[i].x, this.probe.trail[i].y);
      }
      this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Probe Core
    this.ctx.save();
    this.ctx.translate(this.probe.x, this.probe.y);

    this.ctx.beginPath();
    this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
    this.ctx.fillStyle = '#00ff88';
    this.ctx.shadowColor = '#00ff88';
    this.ctx.shadowBlur = 14;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();

    this.ctx.restore();
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}

window.GravityEngine = GravityEngine;
