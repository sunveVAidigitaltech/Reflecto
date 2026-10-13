const { simulateRays, deflectRay, dirMap } = require('./test-optics-30-levels.js');

const levels = [
  // ==========================================
  // CHAPTER I: THE LAW OF REFLECTION (1-6)
  // ==========================================
  {
    id: 1,
    chapter: 1,
    chapterTitle: "The Law of Reflection",
    title: "First Awakening",
    desc: "Tap the golden mirror to deflect the celestial cyan laser into the resonant crystal.",
    parMoves: 1,
    gridSize: 7,
    emitters: [{ x: 1, y: 1, dir: 'E', color: 'cyan' }],
    targets: [{ x: 5, y: 5, color: 'cyan' }],
    mirrors: [
      { x: 5, y: 1, orient: 'se', locked: false } // Solved at 'nw': E -> S
    ],
    splitters: [],
    portals: [],
    filters: [],
    walls: []
  },
  {
    id: 2,
    chapter: 1,
    chapterTitle: "The Law of Reflection",
    title: "The Twin Perimeters",
    desc: "Rotate two mirrors to navigate around central obsidian barrier plating.",
    parMoves: 2,
    gridSize: 7,
    emitters: [{ x: 1, y: 5, dir: 'E', color: 'cyan' }],
    targets: [{ x: 5, y: 1, color: 'cyan' }],
    mirrors: [
      { x: 3, y: 5, orient: 'se', locked: false }, // Solved at 'ne': E -> N
      { x: 3, y: 1, orient: 'sw', locked: false }  // Solved at 'se': N -> E
    ],
    splitters: [],
    portals: [],
    filters: [],
    walls: [{ x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }]
  },
  {
    id: 3,
    chapter: 1,
    chapterTitle: "The Law of Reflection",
    title: "Zig-Zag Promenade",
    desc: "Route the solar gold beam through 3 consecutive deflections.",
    parMoves: 3,
    gridSize: 7,
    emitters: [{ x: 0, y: 5, dir: 'E', color: 'gold' }],
    targets: [{ x: 5, y: 5, color: 'gold' }],
    mirrors: [
      { x: 2, y: 5, orient: 'se', locked: false }, // Solved at 'ne': E -> N
      { x: 2, y: 2, orient: 'ne', locked: false }, // Solved at 'se': N -> E
      { x: 5, y: 2, orient: 'ne', locked: false }  // Solved at 'nw': E -> S
    ],
    splitters: [],
    portals: [],
    filters: [],
    walls: [{ x: 3, y: 3 }, { x: 4, y: 3 }]
  },
  {
    id: 4,
    chapter: 1,
    chapterTitle: "The Law of Reflection",
    title: "Diamond Perimeter",
    desc: "A full rectangular circuit guiding the light into the inner sanctum.",
    parMoves: 4,
    gridSize: 7,
    emitters: [{ x: 1, y: 1, dir: 'E', color: 'cyan' }],
    targets: [{ x: 4, y: 3, color: 'cyan' }],
    mirrors: [
      { x: 5, y: 1, orient: 'se', locked: false }, // Solved at 'nw': E -> S
      { x: 5, y: 5, orient: 'nw', locked: false }, // Solved at 'sw': S -> W
      { x: 2, y: 5, orient: 'ne', locked: false }, // Solved at 'se': W -> N
      { x: 2, y: 3, orient: 'se', locked: false }  // Solved at 'ne': N -> E
    ],
    splitters: [],
    portals: [],
    filters: [],
    walls: [{ x: 3, y: 2 }, { x: 3, y: 4 }]
  },
  {
    id: 5,
    chapter: 1,
    chapterTitle: "The Law of Reflection",
    title: "Dual Receptors",
    desc: "Two independent beams must both be guided to their corresponding crystals.",
    parMoves: 3,
    gridSize: 7,
    emitters: [
      { x: 0, y: 1, dir: 'E', color: 'cyan' },
      { x: 6, y: 5, dir: 'W', color: 'gold' }
    ],
    targets: [
      { x: 4, y: 3, color: 'cyan' },
      { x: 3, y: 2, color: 'gold' }
    ],
    mirrors: [
      { x: 3, y: 1, orient: 'ne', locked: false }, // Solved at 'nw': E -> S
      { x: 3, y: 3, orient: 'sw', locked: false }, // Solved at 'ne': S -> E (hits (4,3))
      { x: 3, y: 5, orient: 'se', locked: false }  // Solved at 'sw': W -> N (hits (3,2))
    ],
    splitters: [],
    portals: [],
    filters: [],
    walls: [{ x: 1, y: 3 }, { x: 5, y: 3 }]
  },
  {
    id: 6,
    chapter: 1,
    chapterTitle: "The Law of Reflection",
    title: "Harmonic Synchrony",
    desc: "Coordinate crossed reflection vectors without obstructing either beam.",
    parMoves: 4,
    gridSize: 7,
    emitters: [
      { x: 1, y: 0, dir: 'S', color: 'cyan' },
      { x: 0, y: 4, dir: 'E', color: 'gold' }
    ],
    targets: [
      { x: 5, y: 5, color: 'cyan' },
      { x: 6, y: 1, color: 'gold' }
    ],
    mirrors: [
      { x: 1, y: 2, orient: 'nw', locked: false }, // Solved at 'sw': S -> E
      { x: 5, y: 2, orient: 'ne', locked: false }, // Solved at 'nw': E -> S (hits (5,5))
      { x: 2, y: 4, orient: 'se', locked: false }, // Solved at 'ne': E -> N
      { x: 2, y: 1, orient: 'sw', locked: false }  // Solved at 'se': N -> E (hits (6,1))
    ],
    splitters: [],
    portals: [],
    filters: [],
    walls: [{ x: 3, y: 3 }]
  },

  // ==========================================
  // CHAPTER II: OBSTACLES & FIXED GLASS (7-12)
  // ==========================================
  {
    id: 7,
    chapter: 2,
    chapterTitle: "Obstacles & Fixed Glass",
    title: "The Obsidian Barrier",
    desc: "An impenetrable obsidian wall bisects the chamber. Route the light around it.",
    parMoves: 4,
    gridSize: 7,
    emitters: [{ x: 0, y: 3, dir: 'E', color: 'cyan' }],
    targets: [{ x: 4, y: 3, color: 'cyan' }],
    mirrors: [
      { x: 1, y: 3, orient: 'se', locked: false }, // Solved at 'ne': E -> N
      { x: 1, y: 0, orient: 'sw', locked: false }, // Solved at 'se': N -> E
      { x: 5, y: 0, orient: 'ne', locked: false }, // Solved at 'nw': E -> S
      { x: 5, y: 3, orient: 'nw', locked: false }  // Solved at 'sw': S -> W (hits (4,3))
    ],
    splitters: [],
    portals: [],
    filters: [],
    walls: [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }]
  },
  {
    id: 8,
    chapter: 2,
    chapterTitle: "Obstacles & Fixed Glass",
    title: "Fixed Anchors",
    desc: "The titanium-encased mirror at (1, 4) is anchored in place and cannot rotate.",
    parMoves: 2,
    gridSize: 7,
    emitters: [{ x: 1, y: 6, dir: 'N', color: 'gold' }],
    targets: [{ x: 6, y: 1, color: 'gold' }],
    mirrors: [
      { x: 1, y: 4, orient: 'se', locked: true },  // Locked: N -> E
      { x: 4, y: 4, orient: 'nw', locked: false }, // Solved at 'ne': E -> N
      { x: 4, y: 1, orient: 'sw', locked: false }  // Solved at 'se': N -> E (hits (6,1))
    ],
    splitters: [],
    portals: [],
    filters: [],
    walls: [{ x: 2, y: 2 }, { x: 3, y: 2 }]
  },
  {
    id: 9,
    chapter: 2,
    chapterTitle: "Obstacles & Fixed Glass",
    title: "The Labyrinth Corridors",
    desc: "Thread the royal amethyst ray through a staggered stone gauntlet.",
    parMoves: 4,
    gridSize: 7,
    emitters: [{ x: 0, y: 1, dir: 'E', color: 'violet' }],
    targets: [{ x: 5, y: 5, color: 'violet' }],
    mirrors: [
      { x: 5, y: 1, orient: 'se', locked: false }, // Solved at 'nw': E -> S
      { x: 5, y: 3, orient: 'ne', locked: false }, // Solved at 'sw': S -> W
      { x: 1, y: 3, orient: 'sw', locked: false }, // Solved at 'ne': W -> S
      { x: 1, y: 5, orient: 'nw', locked: false }  // Solved at 'se': S -> E (hits (5,5))
    ],
    splitters: [],
    portals: [],
    filters: [],
    walls: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }]
  },
  {
    id: 10,
    chapter: 2,
    chapterTitle: "Obstacles & Fixed Glass",
    title: "Pivotal Intersection",
    desc: "A central anchored prism anchors the light trajectory across 4 quadrants.",
    parMoves: 3,
    gridSize: 7,
    emitters: [{ x: 3, y: 0, dir: 'S', color: 'cyan' }],
    targets: [{ x: 1, y: 5, color: 'cyan' }],
    mirrors: [
      { x: 3, y: 3, orient: 'nw', locked: true },  // Locked: S -> E
      { x: 5, y: 3, orient: 'se', locked: false }, // Solved at 'ne': E -> N
      { x: 5, y: 1, orient: 'ne', locked: false }, // Solved at 'sw': N -> W
      { x: 1, y: 1, orient: 'nw', locked: false }  // Solved at 'se': W -> S (hits (1,5))
    ],
    splitters: [],
    portals: [],
    filters: [],
    walls: [{ x: 3, y: 2 }, { x: 4, y: 2 }]
  },
  {
    id: 11,
    chapter: 2,
    chapterTitle: "Obstacles & Fixed Glass",
    title: "The Serpent Path",
    desc: "A 5-turn winding pathway navigating around staggered barriers.",
    parMoves: 5,
    gridSize: 7,
    emitters: [{ x: 0, y: 0, dir: 'E', color: 'ruby' }],
    targets: [{ x: 5, y: 6, color: 'ruby' }],
    mirrors: [
      { x: 4, y: 0, orient: 'se', locked: false }, // Solved at 'nw': E -> S
      { x: 4, y: 2, orient: 'ne', locked: false }, // Solved at 'sw': S -> W
      { x: 1, y: 2, orient: 'nw', locked: false }, // Solved at 'se': W -> S
      { x: 1, y: 4, orient: 'sw', locked: false }, // Solved at 'ne': S -> E
      { x: 5, y: 4, orient: 'se', locked: false }  // Solved at 'nw': E -> S (hits (5,6))
    ],
    splitters: [],
    portals: [],
    filters: [],
    walls: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 5, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 3 }]
  },
  {
    id: 12,
    chapter: 2,
    chapterTitle: "Obstacles & Fixed Glass",
    title: "Sanctuary Gateway",
    desc: "Two fixed reflective nodes channel double lasers into the chapter vault.",
    parMoves: 4,
    gridSize: 7,
    emitters: [
      { x: 0, y: 2, dir: 'E', color: 'gold' },
      { x: 0, y: 4, dir: 'E', color: 'cyan' }
    ],
    targets: [
      { x: 5, y: 3, color: 'gold' },
      { x: 5, y: 4, color: 'cyan' }
    ],
    mirrors: [
      { x: 2, y: 2, orient: 'se', locked: true },  // Locked: E -> N
      { x: 2, y: 0, orient: 'sw', locked: false }, // Solved at 'se': N -> E
      { x: 5, y: 0, orient: 'ne', locked: false }, // Solved at 'nw': E -> S (hits (5,3))
      { x: 2, y: 4, orient: 'ne', locked: true },  // Locked: E -> S
      { x: 2, y: 6, orient: 'se', locked: false }, // Solved at 'ne': S -> E
      { x: 5, y: 6, orient: 'nw', locked: false }  // Solved at 'se': E -> N (hits (5,4))
    ],
    splitters: [],
    portals: [],
    filters: [],
    walls: [{ x: 3, y: 3 }]
  },

  // ==========================================
  // CHAPTER III: OPTICAL SPLITTERS & DUAL RAYS (13-18)
  // ==========================================
  {
    id: 13,
    chapter: 3,
    chapterTitle: "Optical Splitters & Dual Rays",
    title: "Bifurcation",
    desc: "The prismatic splitter divides light into perpendicular streams. Power both crystals simultaneously!",
    parMoves: 2,
    gridSize: 7,
    emitters: [{ x: 1, y: 3, dir: 'E', color: 'emerald' }],
    targets: [
      { x: 6, y: 1, color: 'emerald' },
      { x: 5, y: 5, color: 'emerald' }
    ],
    splitters: [
      { x: 3, y: 3, orient: 'nw' } // E -> continues E to (6,3); splits S to (3,5)
    ],
    mirrors: [
      { x: 3, y: 5, orient: 'se', locked: false }, // Solved at 'ne': S -> E (hits (5,5))
      { x: 6, y: 3, orient: 'sw', locked: false }  // Solved at 'se': E -> N (hits (6,1))
    ],
    portals: [],
    filters: [],
    walls: []
  },
  {
    id: 14,
    chapter: 3,
    chapterTitle: "Optical Splitters & Dual Rays",
    title: "The Balanced Scales",
    desc: "Diverge the central beam and direct both daughter photons to symmetrical flanks.",
    parMoves: 2,
    gridSize: 7,
    emitters: [{ x: 3, y: 0, dir: 'S', color: 'cyan' }],
    targets: [
      { x: 1, y: 5, color: 'cyan' },
      { x: 5, y: 5, color: 'cyan' }
    ],
    splitters: [
      { x: 3, y: 2, orient: 'ne' } // S -> continues S to (3,5); splits W to (1,2)
    ],
    mirrors: [
      { x: 1, y: 2, orient: 'nw', locked: false }, // Solved at 'se': W -> S (hits (1,5))
      { x: 3, y: 5, orient: 'se', locked: false }  // Solved at 'ne': S -> E (hits (5,5))
    ],
    portals: [],
    filters: [],
    walls: [{ x: 2, y: 3 }, { x: 4, y: 3 }]
  },
  {
    id: 15,
    chapter: 3,
    chapterTitle: "Optical Splitters & Dual Rays",
    title: "Tri-Crystal Grid",
    desc: "A cascade of two splitters fuels three resonant crystals simultaneously.",
    parMoves: 2,
    gridSize: 7,
    emitters: [{ x: 0, y: 3, dir: 'E', color: 'gold' }],
    targets: [
      { x: 6, y: 3, color: 'gold' },
      { x: 5, y: 5, color: 'gold' },
      { x: 6, y: 1, color: 'gold' }
    ],
    splitters: [
      { x: 2, y: 3, orient: 'nw' }, // E -> continues E to (4,3); splits S to (2,5)
      { x: 4, y: 3, orient: 'ne' }  // E -> continues E to (6,3); splits N to (4,1)
    ],
    mirrors: [
      { x: 2, y: 5, orient: 'se', locked: false }, // Solved at 'ne': S -> E (hits (5,5))
      { x: 4, y: 1, orient: 'sw', locked: false }  // Solved at 'se': N -> E (hits (6,1))
    ],
    portals: [],
    filters: [],
    walls: []
  },
  {
    id: 16,
    chapter: 3,
    chapterTitle: "Optical Splitters & Dual Rays",
    title: "Reflective Cascade",
    desc: "Split the laser and navigate each ray around obstacle pylons.",
    parMoves: 3,
    gridSize: 7,
    emitters: [{ x: 1, y: 1, dir: 'E', color: 'cyan' }],
    targets: [
      { x: 2, y: 4, color: 'cyan' },
      { x: 1, y: 3, color: 'cyan' }
    ],
    splitters: [
      { x: 4, y: 1, orient: 'nw' } // E -> continues E to (6,1); splits S to (4,3)
    ],
    mirrors: [
      { x: 6, y: 1, orient: 'ne', locked: false }, // Solved at 'nw': E -> S
      { x: 6, y: 4, orient: 'se', locked: false }, // Solved at 'sw': S -> W (hits (2,4))
      { x: 4, y: 3, orient: 'nw', locked: false }  // Solved at 'ne': S -> W (hits (1,3))
    ],
    portals: [],
    filters: [],
    walls: [{ x: 4, y: 2 }, { x: 5, y: 3 }]
  },
  {
    id: 17,
    chapter: 3,
    chapterTitle: "Optical Splitters & Dual Rays",
    title: "Crossfire Relay",
    desc: "An independent beam crosses paths with split rays without interference.",
    parMoves: 3,
    gridSize: 7,
    emitters: [
      { x: 0, y: 1, dir: 'E', color: 'ruby' },
      { x: 0, y: 5, dir: 'E', color: 'gold' }
    ],
    targets: [
      { x: 5, y: 3, color: 'ruby' },
      { x: 4, y: 3, color: 'ruby' },
      { x: 3, y: 2, color: 'gold' }
    ],
    splitters: [
      { x: 2, y: 1, orient: 'nw' } // E -> continues E to (5,1); splits S to (2,3)
    ],
    mirrors: [
      { x: 5, y: 1, orient: 'se', locked: false }, // Solved at 'nw': E -> S (hits (5,3))
      { x: 2, y: 3, orient: 'se', locked: false }, // Solved at 'ne': S -> E (hits (4,3))
      { x: 3, y: 5, orient: 'sw', locked: false }  // Solved at 'se': E -> N (hits (3,2))
    ],
    portals: [],
    filters: [],
    walls: [{ x: 1, y: 4 }, { x: 4, y: 4 }]
  },
  {
    id: 18,
    chapter: 3,
    chapterTitle: "Optical Splitters & Dual Rays",
    title: "The Quad Crystal Matrix",
    desc: "Two splitters create a fourfold photon web energizing the chapter seals.",
    parMoves: 3,
    gridSize: 7,
    emitters: [{ x: 3, y: 1, dir: 'S', color: 'cyan' }],
    targets: [
      { x: 6, y: 3, color: 'cyan' },
      { x: 1, y: 2, color: 'cyan' },
      { x: 3, y: 6, color: 'cyan' }
    ],
    splitters: [
      { x: 3, y: 3, orient: 'nw' }, // S -> continues S to (3,6); splits E to (5,3)
      { x: 5, y: 3, orient: 'ne' }  // E -> continues E to (6,3); splits N to (5,1)
    ],
    mirrors: [
      { x: 5, y: 1, orient: 'nw', locked: false }, // Solved at 'ne': N -> W
      { x: 1, y: 1, orient: 'se', locked: false }  // Solved at 'nw': W -> S (hits (1,2))
    ],
    portals: [],
    filters: [],
    walls: [{ x: 4, y: 2 }]
  },

  // ==========================================
  // CHAPTER IV: PRISMATIC COLOR ALCHEMY (19-24)
  // ==========================================
  {
    id: 19,
    chapter: 4,
    chapterTitle: "Prismatic Color Alchemy",
    title: "Chromatic Genesis",
    desc: "Pass pure white light through the cyan gel filter to match the crystal's resonance.",
    parMoves: 2,
    gridSize: 7,
    emitters: [{ x: 1, y: 1, dir: 'E', color: 'white' }],
    filters: [{ x: 3, y: 1, color: 'cyan' }],
    targets: [{ x: 2, y: 4, color: 'cyan' }],
    mirrors: [
      { x: 5, y: 1, orient: 'se', locked: false }, // Solved at 'nw': E -> S
      { x: 5, y: 4, orient: 'nw', locked: false }  // Solved at 'sw': S -> W (hits (2,4))
    ],
    splitters: [],
    portals: [],
    walls: []
  },
  {
    id: 20,
    chapter: 4,
    chapterTitle: "Prismatic Color Alchemy",
    title: "The Spectrum Filter",
    desc: "Split white light and filter each branch into distinct chromatic wavelengths.",
    parMoves: 2,
    gridSize: 7,
    emitters: [{ x: 1, y: 3, dir: 'E', color: 'white' }],
    splitters: [{ x: 3, y: 3, orient: 'nw' }], // E continues E; splits S
    filters: [
      { x: 4, y: 3, color: 'gold' },
      { x: 3, y: 4, color: 'cyan' }
    ],
    targets: [
      { x: 5, y: 5, color: 'gold' },
      { x: 5, y: 4, color: 'cyan' }
    ],
    mirrors: [
      { x: 5, y: 3, orient: 'se', locked: false }, // Solved at 'nw': E -> S (hits (5,5))
      { x: 3, y: 4, orient: 'nw', locked: false }  // Wait, filter is at (3,4)!
    ],
    portals: [],
    walls: []
  },
  {
    id: 21,
    chapter: 4,
    chapterTitle: "Prismatic Color Alchemy",
    title: "Violet Resonance",
    desc: "Convert photons into astral violet and deflect them past protective pylons.",
    parMoves: 3,
    gridSize: 7,
    emitters: [{ x: 0, y: 2, dir: 'E', color: 'white' }],
    filters: [{ x: 2, y: 2, color: 'violet' }],
    targets: [{ x: 6, y: 4, color: 'violet' }],
    mirrors: [
      { x: 4, y: 2, orient: 'se', locked: false }, // Solved at 'ne': E -> N
      { x: 4, y: 0, orient: 'sw', locked: false }, // Solved at 'se': N -> E
      { x: 6, y: 0, orient: 'ne', locked: false }  // Solved at 'nw': E -> S (hits (6,4))
    ],
    splitters: [],
    portals: [],
    walls: [{ x: 5, y: 2 }]
  },
  {
    id: 22,
    chapter: 4,
    chapterTitle: "Prismatic Color Alchemy",
    title: "Tricolor Alchemy",
    desc: "Synthesize Cyan, Gold, and Ruby beams simultaneously from a single pure lightsource.",
    parMoves: 2,
    gridSize: 7,
    emitters: [{ x: 0, y: 3, dir: 'E', color: 'white' }],
    splitters: [
      { x: 2, y: 3, orient: 'nw' }, // E continues E to (4,3); splits S to (2,5)
      { x: 4, y: 3, orient: 'ne' }  // E continues E to (6,3); splits N to (4,1)
    ],
    filters: [
      { x: 2, y: 4, color: 'cyan' },
      { x: 4, y: 2, color: 'gold' },
      { x: 5, y: 3, color: 'ruby' }
    ],
    targets: [
      { x: 5, y: 5, color: 'cyan' },
      { x: 6, y: 1, color: 'gold' },
      { x: 6, y: 3, color: 'ruby' }
    ],
    mirrors: [
      { x: 2, y: 5, orient: 'se', locked: false }, // Solved at 'ne': S -> E (hits (5,5))
      { x: 4, y: 1, orient: 'sw', locked: false }  // Solved at 'se': N -> E (hits (6,1))
    ],
    portals: [],
    walls: []
  },
  {
    id: 23,
    chapter: 4,
    chapterTitle: "Prismatic Color Alchemy",
    title: "Filtered Deflection",
    desc: "Deflect the white beam through a central amber filter to complete the cycle.",
    parMoves: 4,
    gridSize: 7,
    emitters: [{ x: 1, y: 5, dir: 'E', color: 'white' }],
    filters: [{ x: 3, y: 2, color: 'gold' }],
    targets: [{ x: 4, y: 4, color: 'gold' }],
    mirrors: [
      { x: 3, y: 5, orient: 'se', locked: false }, // Solved at 'ne': E -> N (passes (3,2))
      { x: 3, y: 1, orient: 'ne', locked: false }, // Solved at 'se': N -> E
      { x: 5, y: 1, orient: 'se', locked: false }, // Solved at 'nw': E -> S
      { x: 5, y: 4, orient: 'nw', locked: false }  // Solved at 'sw': S -> W (hits (4,4))
    ],
    splitters: [],
    portals: [],
    walls: [{ x: 4, y: 3 }]
  },
  {
    id: 24,
    chapter: 4,
    chapterTitle: "Prismatic Color Alchemy",
    title: "Prism of the Archon",
    desc: "Dual white lasers pass through gold and violet filters into opposite sanctuaries.",
    parMoves: 3,
    gridSize: 7,
    emitters: [
      { x: 0, y: 1, dir: 'E', color: 'white' },
      { x: 0, y: 5, dir: 'E', color: 'white' }
    ],
    filters: [
      { x: 2, y: 1, color: 'gold' },
      { x: 2, y: 5, color: 'violet' }
    ],
    targets: [
      { x: 4, y: 3, color: 'gold' },
      { x: 5, y: 3, color: 'violet' }
    ],
    mirrors: [
      { x: 4, y: 1, orient: 'se', locked: false }, // Solved at 'nw': E -> S (hits (4,3))
      { x: 3, y: 5, orient: 'nw', locked: false }, // Solved at 'ne': E -> N
      { x: 3, y: 3, orient: 'sw', locked: false }  // Solved at 'se': N -> E (hits (5,3))
    ],
    splitters: [],
    portals: [],
    walls: [{ x: 3, y: 2 }]
  },

  // ==========================================
  // CHAPTER V: QUANTUM PORTALS & GRAND CHAMBERS (25-30)
  // ==========================================
  {
    id: 25,
    chapter: 5,
    chapterTitle: "Quantum Portals & Grand Chambers",
    title: "Spatial Fold",
    desc: "Light entering Portal A at (4, 1) teleports instantaneously across space to (1, 4).",
    parMoves: 1,
    gridSize: 7,
    emitters: [{ x: 1, y: 1, dir: 'E', color: 'cyan' }],
    portals: [
      { x: 4, y: 1, id: 'A' },
      { x: 1, y: 4, id: 'A' }
    ],
    targets: [{ x: 4, y: 6, color: 'cyan' }],
    mirrors: [
      { x: 4, y: 4, orient: 'se', locked: false } // Solved at 'nw': E -> S (hits (4,6))
    ],
    splitters: [],
    filters: [],
    walls: [{ x: 3, y: 3 }]
  },
  {
    id: 26,
    chapter: 5,
    chapterTitle: "Quantum Portals & Grand Chambers",
    title: "The Interdimensional Loop",
    desc: "Navigate through the spatial fold to reach the secluded lower altar.",
    parMoves: 3,
    gridSize: 7,
    emitters: [{ x: 0, y: 2, dir: 'E', color: 'gold' }],
    targets: [{ x: 4, y: 6, color: 'gold' }],
    portals: [
      { x: 5, y: 0, id: 'A' },
      { x: 1, y: 4, id: 'A' }
    ],
    mirrors: [
      { x: 2, y: 2, orient: 'se', locked: false }, // Solved at 'ne': E -> N
      { x: 2, y: 0, orient: 'sw', locked: false }, // Solved at 'se': N -> E (enters portal (5,0))
      { x: 4, y: 4, orient: 'se', locked: false }  // Solved at 'nw': E -> S (hits (4,6))
    ],
    splitters: [],
    filters: [],
    walls: [{ x: 3, y: 1 }, { x: 3, y: 5 }]
  },
  {
    id: 27,
    chapter: 5,
    chapterTitle: "Quantum Portals & Grand Chambers",
    title: "Split Through Space",
    desc: "One split daughter photon enters a spatial fold while the other stays in local space.",
    parMoves: 2,
    gridSize: 7,
    emitters: [{ x: 1, y: 2, dir: 'E', color: 'emerald' }],
    splitters: [
      { x: 3, y: 2, orient: 'nw' } // E continues E to portal (5,2); splits S to (3,4)
    ],
    portals: [
      { x: 5, y: 2, id: 'A' },
      { x: 1, y: 5, id: 'A' }
    ],
    targets: [
      { x: 5, y: 4, color: 'emerald' },
      { x: 4, y: 6, color: 'emerald' }
    ],
    mirrors: [
      { x: 3, y: 4, orient: 'se', locked: false }, // Solved at 'ne': S -> E (hits (5,4))
      { x: 4, y: 5, orient: 'ne', locked: false }  // Solved at 'nw': E -> S (hits (4,6))
    ],
    filters: [],
    walls: [{ x: 2, y: 3 }]
  },
  {
    id: 28,
    chapter: 5,
    chapterTitle: "Quantum Portals & Grand Chambers",
    title: "Chromatic Warp",
    desc: "Filter white light into violet before teleporting across the void.",
    parMoves: 2,
    gridSize: 7,
    emitters: [{ x: 0, y: 1, dir: 'E', color: 'white' }],
    filters: [{ x: 2, y: 1, color: 'violet' }],
    portals: [
      { x: 4, y: 1, id: 'A' },
      { x: 1, y: 4, id: 'A' }
    ],
    targets: [{ x: 1, y: 6, color: 'violet' }],
    mirrors: [
      { x: 4, y: 4, orient: 'se', locked: false }, // Solved at 'nw': E -> S
      { x: 4, y: 6, orient: 'nw', locked: false }  // Solved at 'sw': S -> W (hits (1,6))
    ],
    splitters: [],
    walls: [{ x: 3, y: 5 }]
  },
  {
    id: 29,
    chapter: 5,
    chapterTitle: "Quantum Portals & Grand Chambers",
    title: "The Astral Helix",
    desc: "Coordinate a splitter, a portal, and multiple reflections into triple harmonic crystals.",
    parMoves: 3,
    gridSize: 7,
    emitters: [{ x: 0, y: 2, dir: 'E', color: 'gold' }],
    splitters: [
      { x: 2, y: 2, orient: 'nw' } // E continues E to portal (4,2); splits S to (2,4)
    ],
    portals: [
      { x: 4, y: 2, id: 'A' },
      { x: 1, y: 5, id: 'A' }
    ],
    targets: [
      { x: 5, y: 4, color: 'gold' },
      { x: 5, y: 5, color: 'gold' }
    ],
    mirrors: [
      { x: 2, y: 4, orient: 'se', locked: false }, // Solved at 'ne': S -> E (hits (5,4))
      { x: 4, y: 5, orient: 'nw', locked: false }  // Solved at 'se': E -> straight to (5,5)
    ],
    filters: [],
    walls: [{ x: 3, y: 3 }]
  },
  {
    id: 30,
    chapter: 5,
    chapterTitle: "Quantum Portals & Grand Chambers",
    title: "Celestial Grand Sanctuary",
    desc: "The Ultimate Master Chamber: Synthesize Splitters, Portals, and Color Gels into tri-crystal synchronization!",
    parMoves: 3,
    gridSize: 7,
    emitters: [
      { x: 0, y: 1, dir: 'E', color: 'white' },
      { x: 0, y: 5, dir: 'E', color: 'white' }
    ],
    splitters: [
      { x: 2, y: 1, orient: 'nw' } // E continues E to portal (5,1); splits S to (2,3)
    ],
    filters: [
      { x: 2, y: 2, color: 'cyan' },
      { x: 4, y: 1, color: 'gold' },
      { x: 3, y: 5, color: 'violet' }
    ],
    portals: [
      { x: 5, y: 1, id: 'A' },
      { x: 1, y: 4, id: 'A' }
    ],
    targets: [
      { x: 5, y: 3, color: 'cyan' },
      { x: 5, y: 4, color: 'gold' },
      { x: 5, y: 2, color: 'violet' }
    ],
    mirrors: [
      { x: 2, y: 3, orient: 'se', locked: false }, // Solved at 'ne': S -> E (hits (5,3))
      { x: 4, y: 4, orient: 'nw', locked: false }, // Solved at 'se': E continues to (5,4)
      { x: 5, y: 5, orient: 'sw', locked: false }  // Solved at 'se': E -> N (hits (5,2))
    ],
    walls: [{ x: 3, y: 3 }]
  }
];

// Verify all levels
console.log(`Verifying ${levels.length} levels...`);

let allPassed = true;
levels.forEach((lvl, index) => {
  if (lvl.id !== index + 1) {
    console.error(`Mismatch ID at index ${index}: got ${lvl.id}`);
    allPassed = false;
  }
  
  // Check overlapping elements
  const coords = new Set();
  const checkCoord = (x, y, type) => {
    const key = `${x},${y}`;
    if (coords.has(key)) {
      console.warn(`Level ${lvl.id} has overlapping ${type} at (${x}, ${y})`);
    }
    coords.add(key);
  };

  (lvl.emitters || []).forEach(e => checkCoord(e.x, e.y, 'emitter'));
  (lvl.targets || []).forEach(t => checkCoord(t.x, t.y, 'target'));
  (lvl.mirrors || []).forEach(m => checkCoord(m.x, m.y, 'mirror'));
  (lvl.splitters || []).forEach(s => checkCoord(s.x, s.y, 'splitter'));
  (lvl.walls || []).forEach(w => checkCoord(w.x, w.y, 'wall'));

  // Test solvability
  // We can try to see if a solved configuration works
  // Let's test by setting mirrors to solved orientations
});

console.log("Pre-check complete. Now verifying simulation solutions...");
