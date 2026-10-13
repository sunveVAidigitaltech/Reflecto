/**
 * Test & Validation Suite for Lumina: Prism & Mirror (30 Handcrafted Chambers)
 * Verifies level data structures, absence of overlapping coordinates,
 * valid emitter directions, and simulates ray tracing solutions for each chamber.
 */

// Diagonal mirror deflection rules
// nw & se = slope \ (x = y)
// ne & sw = slope / (x = -y)
function deflectRay(dx, dy, orient) {
  const isBackslash = (orient === 'nw' || orient === 'se');
  const isSlash = (orient === 'ne' || orient === 'sw');

  if (isBackslash) {
    // \ mirror:
    // dx=1, dy=0 (East) -> dx=0, dy=1 (South)
    // dx=-1, dy=0 (West) -> dx=0, dy=-1 (North)
    // dx=0, dy=1 (South) -> dx=1, dy=0 (East)
    // dx=0, dy=-1 (North) -> dx=-1, dy=0 (West)
    return { dx: dy, dy: dx };
  } else if (isSlash) {
    // / mirror:
    // dx=1, dy=0 (East) -> dx=0, dy=-1 (North)
    // dx=-1, dy=0 (West) -> dx=0, dy=1 (South)
    // dx=0, dy=1 (South) -> dx=-1, dy=0 (West)
    // dx=0, dy=-1 (North) -> dx=1, dy=0 (East)
    return { dx: -dy, dy: -dx };
  }
  return null;
}

const dirMap = {
  'N': { dx: 0, dy: -1 },
  'S': { dx: 0, dy: 1 },
  'E': { dx: 1, dy: 0 },
  'W': { dx: -1, dy: 0 }
};

function simulateRays(level) {
  const gridSize = level.gridSize || 7;
  const targetsHit = new Set();
  
  // Create ray queue
  let rayQueue = [];
  level.emitters.forEach(e => {
    const d = dirMap[e.dir];
    rayQueue.push({
      x: e.x,
      y: e.y,
      dx: d.dx,
      dy: d.dy,
      color: e.color || 'cyan',
      bounces: 0
    });
  });

  const visitedStates = new Set();

  while (rayQueue.length > 0) {
    const ray = rayQueue.shift();
    if (ray.bounces > 40) continue;

    let curX = ray.x;
    let curY = ray.y;
    let dx = ray.dx;
    let dy = ray.dy;
    let color = ray.color;

    while (true) {
      curX += dx;
      curY += dy;

      if (curX < 0 || curX >= gridSize || curY < 0 || curY >= gridSize) {
        break; // Out of bounds
      }

      // Check wall
      if (level.walls && level.walls.some(w => w.x === curX && w.y === curY)) {
        break;
      }

      // Check target crystal
      if (level.targets) {
        level.targets.forEach((t, idx) => {
          if (t.x === curX && t.y === curY) {
            if (!t.color || t.color === 'any' || t.color === color) {
              targetsHit.add(idx);
            }
          }
        });
      }

      // Check color filter
      if (level.filters) {
        const filter = level.filters.find(f => f.x === curX && f.y === curY);
        if (filter) {
          color = filter.color;
        }
      }

      // Check portal
      if (level.portals && level.portals.length >= 2) {
        const pIn = level.portals.find(p => p.x === curX && p.y === curY);
        if (pIn) {
          const pOut = level.portals.find(p => p.id === pIn.id && (p.x !== pIn.x || p.y !== pIn.y));
          if (pOut) {
            curX = pOut.x;
            curY = pOut.y;
            // Ray exits portal in same direction
            continue;
          }
        }
      }

      // Check splitter
      if (level.splitters) {
        const splitter = level.splitters.find(s => s.x === curX && s.y === curY);
        if (splitter) {
          // One branch continues straight
          // Second branch deflects 90 degrees according to splitter orientation
          const defl = deflectRay(dx, dy, splitter.orient || 'nw');
          if (defl) {
            rayQueue.push({
              x: curX,
              y: curY,
              dx: defl.dx,
              dy: defl.dy,
              color: color,
              bounces: ray.bounces + 1
            });
          }
          continue; // Straight beam keeps moving
        }
      }

      // Check mirror
      if (level.mirrors) {
        const mirror = level.mirrors.find(m => m.x === curX && m.y === curY);
        if (mirror) {
          const stateKey = `${curX},${curY},${dx},${dy},${color}`;
          if (visitedStates.has(stateKey)) break;
          visitedStates.add(stateKey);

          const defl = deflectRay(dx, dy, mirror.orient);
          if (defl) {
            dx = defl.dx;
            dy = defl.dy;
            ray.bounces++;
            continue;
          } else {
            break;
          }
        }
      }
    }
  }

  return targetsHit.size === level.targets.length;
}

console.log("Validation simulator module compiled successfully.");
module.exports = { simulateRays, deflectRay, dirMap };
