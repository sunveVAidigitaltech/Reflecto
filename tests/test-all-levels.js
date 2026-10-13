/**
 * Comprehensive Test Suite for Reflecto (100 Handcrafted & Solver-Verified Levels)
 */
const fs = require('fs');

global.window = {
  soundFX: {
    rotateClick: () => {},
    crystalHit: () => {},
    victoryFanfare: () => {},
    portalWarp: () => {},
    splitterPulse: () => {},
    filterTone: () => {},
    undoTick: () => {},
    softThud: () => {}
  },
  addEventListener: () => {}
};

global.navigator = {
  vibrate: () => {}
};

global.OpticsCore = require('../js/optics-core.js');
global.LUMINA_LEVELS = require('../js/levels-data.js');

const mockCanvas = {
  getContext: () => ({
    clearRect: () => {}, beginPath: () => {}, stroke: () => {}, fill: () => {},
    arc: () => {}, moveTo: () => {}, lineTo: () => {}, save: () => {}, restore: () => {},
    translate: () => {}, rotate: () => {}, fillRect: () => {}, strokeRect: () => {},
    setTransform: () => {}, scale: () => {}, setLineDash: () => {}, roundRect: () => {},
    fillText: () => {}, createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    closePath: () => {}, quadraticCurveTo: () => {}
  }),
  addEventListener: () => {},
  width: 600,
  height: 600,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 600 })
};

global.requestAnimationFrame = () => 1;
global.cancelAnimationFrame = () => {};

const OpticsEngine = require('../js/engine-optics.js');

console.log('=== Validating Reflecto (100 Levels with Solver Verification) ===');
const engine = new OpticsEngine(mockCanvas);

if (engine.levels.length !== 100) {
  console.error(`Expected 100 levels, found ${engine.levels.length}`);
  process.exit(1);
}

let totalStars = 0;
let totalMirrors = 0;
let totalWalls = 0;
let totalClouds = 0;
let solvedCount = 0;

for (let i = 0; i < 100; i++) {
  const lvl = engine.levels[i];
  if (lvl.id !== i + 1) throw new Error(`Level id mismatch: expected ${i + 1}, got ${lvl.id}`);
  if (!lvl.emitters || lvl.emitters.length === 0) throw new Error(`Level ${lvl.id} has no emitters!`);
  if (!lvl.targets || lvl.targets.length === 0) throw new Error(`Level ${lvl.id} has no targets!`);
  if (!lvl.solution || lvl.solution.length !== lvl.mirrors.length) throw new Error(`Level ${lvl.id} solution length mismatch!`);

  totalStars += lvl.targets.length;
  totalMirrors += lvl.mirrors.length;
  totalWalls += (lvl.walls || []).length;
  totalClouds += (lvl.bombs || []).length;

  // Load level in engine
  engine.loadLevel(i);

  // Apply solution to mirrors
  lvl.solution.forEach((solType, mIdx) => {
    engine.mirrors[mIdx].type = solType;
  });
  engine.recalculateRays();

  if (!engine.traceResult.ok) {
    throw new Error(`Level ${lvl.id} (${lvl.title}) failed solution verification!`);
  }
  solvedCount++;
}

console.log(`✓ All 100 levels tested and verified with their exact solutions!`);
console.log(`  - Total Stars to Wake Up: ${totalStars}`);
console.log(`  - Total Interactive Mirrors: ${totalMirrors}`);
console.log(`  - Total Wooden Toy Walls: ${totalWalls}`);
console.log(`  - Total Grumpy Clouds: ${totalClouds}`);
console.log(`  - Solved: ${solvedCount} / 100`);

// Test Hint System on Level 1
engine.loadLevel(0);
const initialHints = engine.hintsRemaining;
const hint = engine.useHint();
if (!hint) throw new Error('Hint failed to return target mirror!');
if (engine.hintsRemaining !== initialHints - 1) throw new Error('Hint counter did not decrement!');
console.log(`✓ Hint system tested: highlighted mirror at (${hint.x}, ${hint.y}) needing ${hint.neededType}`);

console.log('ALL TESTS PASSED WITH 100% SOLVER FIDELITY! 🌟');
