/**
 * REFLECTO OPTICS CORE
 * Shared, pure light-physics used by BOTH the game engine (browser)
 * and the level generator / solver (node). One source of truth means
 * every generated level is guaranteed to behave identically in-game.
 *
 * Mirror types:  '\\'  E->S, S->E, W->N, N->W
 *                '/'   E->N, N->E, W->S, S->W
 */
(function (root) {
  const DIRS = { E: [1, 0], W: [-1, 0], N: [0, -1], S: [0, 1] };
  const REFLECT = {
    '\\': { E: 'S', S: 'E', W: 'N', N: 'W' },
    '/': { E: 'N', N: 'E', W: 'S', S: 'W' }
  };
  const flip = (t) => (t === '\\' ? '/' : '\\');
  const key = (x, y) => x + ',' + y;

  function buildCellMap(L) {
    const m = new Map();
    const add = (arr, k) => (arr || []).forEach((p, i) => m.set(key(p.x, p.y), { k, i }));
    add(L.walls, 'wall');
    add(L.mirrors, 'mirror');
    add(L.splitters, 'splitter');
    add(L.filters, 'filter');
    add(L.portals, 'portal');
    add(L.bombs, 'bomb');
    add(L.targets, 'target');
    add(L.emitters, 'emitter');
    return m;
  }

  function partner(L, i) {
    const p = L.portals[i];
    return L.portals.findIndex((q, j) => j !== i && q.id === p.id);
  }

  /**
   * Trace all light. `types[i]` = current type of mirror i.
   * If a mirror with a null type is reached, returns { branch: i } (used by the solver).
   */
  function trace(L, cmap, types) {
    const N = L.gridSize;
    const segs = [];
    const lit = new Set();
    const cells = new Set();
    let bomb = false;
    const bombsHit = new Set();
    const queue = L.emitters.map((e) => ({ x: e.x, y: e.y, dir: e.dir, color: e.color }));
    const seen = new Set();
    let guard = 0;

    while (queue.length && guard++ < 64) {
      const r = queue.shift();
      let x = r.x, y = r.y, dir = r.dir, color = r.color;
      let pts = [[x, y]];

      for (let s = 0; s < 400; s++) {
        const d = DIRS[dir];
        x += d[0];
        y += d[1];
        if (x < 0 || y < 0 || x >= N || y >= N) {
          pts.push([x - d[0] * 0.5, y - d[1] * 0.5]);
          break;
        }
        const sk = x + ',' + y + ',' + dir + ',' + color;
        if (seen.has(sk)) { pts.push([x, y]); break; }
        seen.add(sk);
        cells.add(key(x, y));

        const p = cmap.get(key(x, y));
        if (!p) continue;

        if (p.k === 'wall' || p.k === 'emitter') {
          pts.push([x - d[0] * 0.5, y - d[1] * 0.5]);
          break;
        }
        if (p.k === 'target') {
          pts.push([x, y]);
          if (L.targets[p.i].color === color) lit.add(p.i);
          break;
        }
        if (p.k === 'bomb') {
          pts.push([x, y]);
          bomb = true;
          bombsHit.add(p.i);
          break;
        }
        if (p.k === 'filter') {
          pts.push([x, y]);
          segs.push({ pts, color });
          color = L.filters[p.i].color;
          pts = [[x, y]];
          continue;
        }
        if (p.k === 'portal') {
          pts.push([x, y]);
          segs.push({ pts, color });
          const j = partner(L, p.i);
          if (j < 0) { pts = null; break; }
          x = L.portals[j].x;
          y = L.portals[j].y;
          cells.add(key(x, y));
          pts = [[x, y]];
          continue;
        }
        if (p.k === 'splitter') {
          pts.push([x, y]);
          queue.push({ x, y, dir: REFLECT[L.splitters[p.i].type][dir], color });
          continue;
        }
        if (p.k === 'mirror') {
          const t = types[p.i];
          if (t == null) return { branch: p.i };
          pts.push([x, y]);
          dir = REFLECT[t][dir];
          continue;
        }
      }
      if (pts && pts.length > 1) segs.push({ pts, color });
    }

    return {
      segs, lit, cells, bomb, bombsHit,
      ok: lit.size === L.targets.length && !bomb
    };
  }

  /** Exhaustive solver: branches only on mirrors the light actually reaches. */
  function solve(L, cap = 3000) {
    const cmap = buildCellMap(L);
    const init = L.mirrors.map((m) => (m.locked ? m.type : null));
    const stack = [init];
    const sols = [];
    let iter = 0;
    while (stack.length && iter++ < 300000) {
      const a = stack.pop();
      const r = trace(L, cmap, a);
      if (r.branch !== undefined) {
        const b1 = a.slice(); b1[r.branch] = '\\';
        const b2 = a.slice(); b2[r.branch] = '/';
        stack.push(b1, b2);
      } else if (r.ok) {
        sols.push(a);
        if (sols.length >= cap) break;
      }
    }
    return sols;
  }

  /** Minimum number of taps from the level's starting state. */
  function bestSolution(L, sols) {
    let best = null, par = Infinity;
    for (const s of sols) {
      let cost = 0;
      for (let i = 0; i < s.length; i++) {
        if (s[i] != null && s[i] !== L.mirrors[i].type) cost++;
      }
      if (cost < par) { par = cost; best = s; }
    }
    if (!best) return null;
    return { par, solution: best.map((t, i) => (t == null ? L.mirrors[i].type : t)) };
  }

  const api = { DIRS, REFLECT, flip, key, buildCellMap, trace, solve, bestSolution };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.OpticsCore = api;
})(typeof window !== 'undefined' ? window : this);
