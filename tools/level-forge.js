/**
 * REFLECTO LEVEL FORGE
 * Builds 100 levels by constructing a real light path, adding decoys,
 * placing walls/clouds ONLY where a wrong move sends light, then verifying
 * every level with the exhaustive solver.
 *
 *   node tools/level-forge.js
 */
const fs = require('fs');
const path = require('path');
const Core = require('../js/optics-core.js');
const { DIRS, flip, key, buildCellMap, trace, solve, bestSolution } = Core;

const LEFT = { E: 'N', N: 'W', W: 'S', S: 'E' };
const RIGHT = { E: 'S', S: 'W', W: 'N', N: 'E' };
const mirrorFor = (inDir, outDir) => (Core.REFLECT['\\'][inDir] === outDir ? '\\' : '/');
const PALETTE = ['pink', 'blue', 'mint', 'yellow', 'lavender', 'peach'];

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CHAPTERS = {
  1: 'Sunny Start',
  2: 'Wobbly Walls',
  3: 'Twin Beams',
  4: 'Prism Pals',
  5: 'Color Magic',
  6: 'Portal Party'
};

function params(i) {
  const lerp = (a, b, t) => Math.round(a + (b - a) * Math.max(0, Math.min(1, t)));
  let p = { size: 8, M: 3, em: 1, spl: 0, fil: 0, por: 0, bombs: 0, locked: 0, walls: 1, minPar: 2, ch: 1 };
  if (i <= 10) {
    p = { ...p, ch: 1, size: 8, M: lerp(3, 5, (i - 1) / 9), walls: i > 4 ? 2 : 1, minPar: 2 };
  } else if (i <= 25) {
    p = { ...p, ch: 2, size: i <= 17 ? 8 : 9, M: lerp(5, 7, (i - 11) / 14), walls: lerp(2, 4, (i - 11) / 14), locked: 1, minPar: 3 };
  } else if (i <= 45) {
    p = { ...p, ch: 3, size: 9, M: lerp(6, 9, (i - 26) / 19), em: 2, walls: lerp(2, 4, (i - 26) / 19), locked: 1, minPar: 3 };
  } else if (i <= 65) {
    p = { ...p, ch: 4, size: i <= 55 ? 9 : 10, M: lerp(7, 10, (i - 46) / 19), spl: i > 58 ? 2 : 1, em: i % 3 === 0 ? 2 : 1, walls: 3, locked: 2, minPar: 4 };
  } else if (i <= 85) {
    p = { ...p, ch: 5, size: 10, M: lerp(8, 12, (i - 66) / 19), fil: i > 75 ? 2 : 1, spl: i % 2 ? 1 : 0, em: i % 4 === 0 ? 2 : 1, walls: lerp(3, 5, (i - 66) / 19), locked: 2, minPar: 4 };
  } else {
    p = { ...p, ch: 6, size: 10, M: lerp(10, 14, (i - 86) / 14), por: 1, fil: i % 2 ? 1 : 0, spl: i % 3 ? 1 : 0, em: i % 3 === 0 ? 2 : 1, walls: 4, locked: 2, minPar: 5 };
  }
  if (i <= 50) p.M = Math.min(p.M, 10);          // ages 5–8 half: cap mirrors
  if (i >= 51) p.bombs = i > 75 ? 2 : 1;         // Grumpy Clouds only in 8–12 half
  p.decoys = Math.max(1, Math.ceil(p.M * 0.3));
  p.turns = Math.max(1, Math.round((p.M - p.decoys) / p.em));
  return p;
}

function genAttempt(i, attempt) {
  const R = rng(i * 100003 + attempt * 7919 + 17);
  const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const pick = (a) => a[Math.floor(R() * a.length)];
  const relax = Math.floor(attempt / 60);
  const P = params(i);
  const N = P.size;
  const turns = Math.max(1, P.turns - relax);
  const minPar = Math.max(1, P.minPar - relax);

  const L = {
    gridSize: N, emitters: [], targets: [], mirrors: [], splitters: [],
    filters: [], portals: [], walls: [], bombs: []
  };
  const pieces = new Map();
  const beam = new Set();
  const sol = [];
  const budget = { spl: P.spl, fil: P.fil, por: P.por };
  const inside = (x, y) => x >= 0 && y >= 0 && x < N && y < N;
  const free = (x, y) => inside(x, y) && !pieces.has(key(x, y));
  const usable = (x, y) => free(x, y) && !beam.has(key(x, y));
  const put = (x, y, k) => pieces.set(key(x, y), k);
  let portalId = 0;

  function walk(x, y, dir, len) {
    const cells = [];
    for (let s = 1; s <= len; s++) {
      const nx = x + DIRS[dir][0] * s, ny = y + DIRS[dir][1] * s;
      if (!free(nx, ny)) return null;
      cells.push([nx, ny]);
    }
    return cells;
  }

  function buildRay(x, y, dir, color, nTurns, depth) {
    for (let t = 0; t <= nTurns; t++) {
      const last = t === nTurns;
      let done = false;
      for (let tries = 0; tries < 16 && !done; tries++) {
        const len = ri(last ? 2 : 1, N - 1);
        const cells = walk(x, y, dir, len);
        if (!cells) continue;
        const [ex, ey] = cells[cells.length - 1];
        if (beam.has(key(ex, ey))) continue;
        const mids = cells.slice(0, -1);

        // optional colour filter on the first straight cell
        let filterCell = null;
        if (budget.fil > 0 && mids.length >= 1 && R() < 0.55 && !beam.has(key(mids[0][0], mids[0][1]))) {
          filterCell = mids[0];
        }
        // commit
        if (filterCell) {
          const nc = pick(PALETTE.filter((c) => c !== color));
          L.filters.push({ x: filterCell[0], y: filterCell[1], color: nc });
          put(filterCell[0], filterCell[1], 'filter');
          color = nc;
          budget.fil--;
        }
        mids.forEach(([mx, my]) => {
          if (!(filterCell && mx === filterCell[0] && my === filterCell[1])) beam.add(key(mx, my));
        });

        if (last) {
          L.targets.push({ x: ex, y: ey, color });
          put(ex, ey, 'target');
          return true;
        }

        // portal instead of a turn
        if (budget.por > 0 && t > 0 && R() < 0.6) {
          const cands = [];
          for (let px = 0; px < N; px++) for (let py = 0; py < N; py++) {
            const nx = px + DIRS[dir][0], ny = py + DIRS[dir][1];
            if (usable(px, py) && usable(nx, ny) && Math.abs(px - ex) + Math.abs(py - ey) > 3) cands.push([px, py]);
          }
          if (cands.length) {
            const [qx, qy] = pick(cands);
            const id = 'ABC'[portalId++];
            L.portals.push({ x: ex, y: ey, id }, { x: qx, y: qy, id });
            put(ex, ey, 'portal');
            put(qx, qy, 'portal');
            budget.por--;
            x = qx; y = qy;
            done = true;
            continue;
          }
        }

        const nd = R() < 0.5 ? LEFT[dir] : RIGHT[dir];
        const type = mirrorFor(dir, nd);
        if (budget.spl > 0 && depth === 0 && t < nTurns && R() < 0.6) {
          L.splitters.push({ x: ex, y: ey, type });
          put(ex, ey, 'splitter');
          budget.spl--;
          if (!buildRay(ex, ey, dir, color, ri(1, 2), depth + 1)) return false;
        } else {
          L.mirrors.push({ x: ex, y: ey, type: null, locked: false });
          sol.push(type);
          put(ex, ey, 'mirror');
        }
        x = ex; y = ey; dir = nd;
        done = true;
      }
      if (!done) return false;
    }
    return true;
  }

  // --- 1. Build the real light paths
  const usedColors = [];
  for (let e = 0; e < P.em; e++) {
    let placed = false;
    for (let tries = 0; tries < 40 && !placed; tries++) {
      const side = ri(0, 3);
      const k = ri(1, N - 2);
      const [x, y, dir] = [[0, k, 'E'], [N - 1, k, 'W'], [k, 0, 'S'], [k, N - 1, 'N']][side];
      if (!usable(x, y)) continue;
      const color = pick(PALETTE.filter((c) => !usedColors.includes(c)));
      usedColors.push(color);
      L.emitters.push({ x, y, dir, color });
      put(x, y, 'emitter');
      if (!buildRay(x, y, dir, color, turns, 0)) return null;
      placed = true;
    }
    if (!placed) return null;
  }
  const pathMirrors = L.mirrors.length;
  if (pathMirrors < Math.min(2, turns)) return null;

  // --- 2. Decoy mirrors, preferring cells in line with the light (tempting!)
  const decoyCount = Math.max(P.decoys, P.M - pathMirrors);
  const beamRows = new Set(), beamCols = new Set();
  beam.forEach((k) => { const [bx, by] = k.split(',').map(Number); beamRows.add(by); beamCols.add(bx); });
  for (let d = 0; d < decoyCount; d++) {
    const all = [], tempting = [];
    for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
      if (!usable(x, y)) continue;
      all.push([x, y]);
      if (beamRows.has(y) || beamCols.has(x)) tempting.push([x, y]);
    }
    const pool = tempting.length && R() < 0.8 ? tempting : all;
    if (!pool.length) break;
    const [x, y] = pick(pool);
    L.mirrors.push({ x, y, type: R() < 0.5 ? '\\' : '/', locked: false, decoy: true });
    sol.push(null);
    put(x, y, 'mirror');
  }

  // --- 3. Locked mirrors (already correct, cannot turn)
  const pathIdx = [...Array(pathMirrors).keys()];
  for (let l = 0; l < P.locked && pathIdx.length > minPar + 1; l++) {
    const j = pathIdx.splice(Math.floor(R() * pathIdx.length), 1)[0];
    L.mirrors[j].locked = true;
    L.mirrors[j].type = sol[j];
  }

  // --- 4. Scramble the starting position
  const free_ = pathIdx.slice();
  free_.forEach((j) => { L.mirrors[j].type = R() < 0.7 ? flip(sol[j]) : sol[j]; });
  let wrong = free_.filter((j) => L.mirrors[j].type !== sol[j]);
  const right = free_.filter((j) => L.mirrors[j].type === sol[j]);
  while (wrong.length < minPar && right.length) {
    const j = right.pop();
    L.mirrors[j].type = flip(sol[j]);
    wrong.push(j);
  }

  // --- 5. Walls / clouds ONLY where a wrong configuration sends light
  function temptedCells(onlyBase) {
    const cmap = buildCellMap(L);
    const base = L.mirrors.map((m) => m.type);
    const configs = [base];
    if (!onlyBase) L.mirrors.forEach((m, j) => {
      if (!m.locked) { const c = base.slice(); c[j] = flip(c[j]); configs.push(c); }
    });
    const out = new Map();
    for (const c of configs) {
      const r = trace(L, cmap, c);
      r.cells.forEach((k) => {
        const [x, y] = k.split(',').map(Number);
        if (usable(x, y)) out.set(k, (out.get(k) || 0) + 1);
      });
    }
    return [...out.keys()].map((k) => k.split(',').map(Number));
  }
  for (let w = 0; w < P.walls; w++) {
    const c = temptedCells(false);
    if (!c.length) break;
    const [x, y] = pick(c);
    L.walls.push({ x, y });
    put(x, y, 'wall');
  }
  for (let b = 0; b < P.bombs; b++) {
    const c = temptedCells(false);
    if (!c.length) break;
    const [x, y] = pick(c);
    L.bombs.push({ x, y });
    put(x, y, 'bomb');
  }
  if (P.bombs && L.bombs.length === 0) return null;

  // --- 6. Verify with the solver
  const sols = solve(L);
  if (!sols.length) return null;
  const best = bestSolution(L, sols);
  if (!best || best.par < minPar) return null;
  const start = trace(L, buildCellMap(L), L.mirrors.map((m) => m.type));
  if (start.ok) return null;

  L.parMoves = best.par;
  L.solution = best.solution;
  L.mirrors.forEach((m) => delete m.decoy);
  L._chapter = P.ch;
  return L;
}

// ---------- Names & text ----------
const ADJ = ['Sunny', 'Bouncy', 'Giggly', 'Sparkly', 'Sleepy', 'Wiggly', 'Fluffy', 'Jolly', 'Twinkly', 'Breezy',
  'Cozy', 'Zippy', 'Dizzy', 'Puffy', 'Merry', 'Snuggly', 'Peppy', 'Shiny', 'Silly', 'Dreamy', 'Happy', 'Tiny'];
const NOUN = ['Garden', 'Rainbow', 'Cupcake', 'Meadow', 'Bubbles', 'Kitten', 'Lantern', 'Puddle', 'Cloud', 'Balloon',
  'Lollipop', 'Pebble', 'Daisy', 'Honey', 'Tunnel', 'Castle', 'Comet', 'Marble', 'Pancake', 'Button', 'Treehouse', 'Jellybean'];

const TUTORIAL = {
  1: 'Tap a mirror to flip it. Bounce the light into the sleepy star to wake it up!',
  11: 'Grey mirrors with a lock can\u2019t move. Use them to help you!',
  26: 'Two lights! Each star wakes up only for light of its own color.',
  46: 'A prism splits light in two \u2014 one beam goes straight, one turns!',
  51: 'Watch out for Grumpy Clouds! Don\u2019t let any light touch them.',
  66: 'Jelly windows change the color of light passing through them.',
  86: 'Magic portals! Light jumps from one portal to its twin.'
};

function describe(L, id) {
  if (TUTORIAL[id]) return TUTORIAL[id];
  const n = L.targets.length;
  const bits = [n > 1 ? `Wake up all ${n} stars!` : 'Wake up the star!'];
  if (L.bombs.length) bits.push('Keep away from the Grumpy Clouds.');
  if (L.mirrors.length >= 8) bits.push('Some mirrors are tricksters \u2014 you won\u2019t need them all.');
  return bits.join(' ');
}

// ---------- Main ----------
function main() {
  const levels = [];
  const fingerprints = new Set();
  const nameR = rng(4242);
  const names = new Set();
  const stats = [];

  for (let i = 1; i <= 100; i++) {
    let L = null;
    let attempt = 0;
    while (!L && attempt < 600) {
      const cand = genAttempt(i, attempt++);
      if (!cand) continue;
      const fp = JSON.stringify([cand.mirrors.map((m) => [m.x, m.y]), cand.walls, cand.emitters.map((e) => [e.x, e.y])]);
      if (fingerprints.has(fp)) continue;
      fingerprints.add(fp);
      L = cand;
    }
    if (!L) throw new Error(`Could not forge level ${i}`);

    let title;
    do { title = ADJ[Math.floor(nameR() * ADJ.length)] + ' ' + NOUN[Math.floor(nameR() * NOUN.length)]; } while (names.has(title));
    names.add(title);

    const ch = L._chapter;
    delete L._chapter;
    levels.push({
      id: i, chapter: ch, chapterTitle: CHAPTERS[ch], title,
      desc: describe(L, i), ...L
    });
    stats.push(`#${String(i).padStart(3)} ch${ch} ${L.gridSize}x${L.gridSize} mirrors=${String(L.mirrors.length).padStart(2)} par=${L.parMoves} walls=${L.walls.length} stars=${L.targets.length} bombs=${L.bombs.length} spl=${L.splitters.length} fil=${L.filters.length} por=${L.portals.length / 2} (tries ${attempt})`);
  }

  const out = path.join(__dirname, '..', 'js', 'levels-data.js');
  fs.writeFileSync(out, `/** REFLECTO - 100 solver-verified levels (generated by tools/level-forge.js) */
const LUMINA_LEVELS = ${JSON.stringify(levels)};
if (typeof module !== 'undefined' && module.exports) module.exports = LUMINA_LEVELS;
`);
  console.log(stats.join('\n'));
  console.log(`\nWrote ${levels.length} levels to ${out}`);
}

if (require.main === module) main();
module.exports = { genAttempt, params };
