/**
 * AETHERIA: PUZZLE GAME BLUEPRINTS & CONCEPT CATALOG
 * In-depth analytical design documents covering game mechanics, psychology,
 * multiplayer netcode, and mobile export pipelines for all 6 playable games.
 */

const PUZZLE_BLUEPRINTS = [
  {
    id: 'lumina',
    title: 'Quantum Lumina: Optics & Lasers',
    genre: 'Optics & Ray-Casting Geometric Puzzle',
    theme: 'Cyber-Neon Optics Lab',
    colorClass: 'cyan',
    icon: '⚡',
    status: 'PLAYABLE NOW (12 Levels)',
    playableEngine: 'optics',
    summary: 'Direct concentrated multi-colored laser beams through dense chambers using rotatable angled mirrors, refracting prisms, and quantum portals to energize harmonic crystals.',
    mechanics: [
      'Additive RGB beam physics (combining colors or filtering wavelengths).',
      'Reflective mirrors with 4-orientation 90° deflection.',
      'Beam splitters dividing light into multiple simultaneous paths.',
      'One-way barriers and quantum teleportation wormholes.'
    ],
    ahaMoment: 'When rotating that final mirror causes an intricate chain of reflections to cascade across the entire grid and simultaneously illuminate all target crystals with an explosive glowing bloom.',
    multiplayerPotential: '1v1 Laser Duel: Real-time board race to divert laser beams into opponent goal zones or obstruct incoming beams with mobile reflectors.',
    monetization: 'Cosmetic laser trails (rainbow, lightning, plasma), level expansion packs, and custom crystal soundboards.',
    techStack: 'HTML5 Canvas 2D / WebGL for web, easily packaged into iOS / Android via Capacitor or React Native Skia.'
  },
  {
    id: 'circuit',
    title: 'Circuit Flow: Energy Matrix',
    genre: 'Network Topology & Closed Loop Puzzle',
    theme: 'Deep Space Power Grid Restoration',
    colorClass: 'emerald',
    icon: '🔌',
    status: 'PLAYABLE NOW (10 Levels)',
    playableEngine: 'circuit',
    summary: 'Calming, hyper-satisfying puzzle where players rotate disoriented circuit nodes (lines, elbows, tees, and cross-junctions) to restore closed-loop conductivity from power generators to reactor cores.',
    mechanics: [
      'Rotatable conduits with discrete bitmask connection pins (N, E, S, W).',
      'Dynamic BFS graph traversal calculating active power flow.',
      'Live traveling current pulse animations along connected tracks.',
      'Omnidirectional generators and isolated terminal relays.'
    ],
    ahaMoment: 'The feeling of "snapping" the final T-junction into place and watching power instantly pulse across the entire board, activating all dead nodes in a wave of light.',
    multiplayerPotential: 'Territory Connect: Turn-based board game where players alternate rotating tiles to claim power nodes for their team score.',
    monetization: 'Zen infinite procedural level generator, dark/synthwave ambient soundtracks, themed conduit skins.',
    techStack: 'Lightweight DOM / Canvas rendering. Perfect for instant mobile apps and mini-games.'
  },
  {
    id: 'slide',
    title: 'Chroma Slide: Nova Shift',
    genre: 'Frictionless Spatial Sliding Gridlock',
    theme: 'Zero-G Gem Docking Station',
    colorClass: 'magenta',
    icon: '💎',
    status: 'PLAYABLE NOW (10 Levels)',
    playableEngine: 'slide',
    summary: 'A cerebral spatial reasoning puzzle inspired by ice-sliding mazes and Rush Hour. Swipe colored energy cores that slide indefinitely until striking an obstacle or wall.',
    mechanics: [
      'Frictionless continuous vector sliding until obstruction.',
      'Inter-block stopping: using one block to create a tactical wall for another.',
      'Fixed walls, narrow trenches, and designated docking pedestals.',
      'Par move efficiency scoring and full undo history.'
    ],
    ahaMoment: 'Realizing that moving Block B to a seemingly useless spot actually provides the exact backstop Block A needs to stop precisely in line with its target socket.',
    multiplayerPotential: '1v1 Simultaneous Sprint: Both players receive the exact same board scramble. First player to solve sends penalty barriers to opponent.',
    monetization: 'Ranked competitive ladder, daily challenge seeds, cosmetic core gems and trail shaders.',
    techStack: 'Pure 2D grid engine with tweening / spring animations. 60+ FPS on any low-end mobile phone.'
  },
  {
    id: 'gravity',
    title: 'Echo Gravity: Celestial Slingshot',
    genre: 'Orbital Physics & Trajectory Prediction',
    theme: 'Cosmic Stellar Cartography',
    colorClass: 'violet',
    icon: '🌌',
    status: 'PLAYABLE NOW (8 Levels)',
    playableEngine: 'gravity',
    summary: 'Position gravitational attractor nodes and repulsion fields to slingshot research probes through asteroid belts, collecting cosmic fragments into event horizons.',
    mechanics: [
      'Inverse-square law gravity simulations with trajectory ghost trails.',
      'Pulsar repulsors that invert gravitational attraction.',
      'Moving planetary bodies with dynamic orbital decay.',
      'Fuel / node placement limit per level.'
    ],
    ahaMoment: 'Watching a complex double slingshot swing a probe millimeter-close past an asteroid to sweep up the final star and hit the singularity safely.',
    multiplayerPotential: 'Gravity Wars: 2 players place gravity wells simultaneously to pull a central neutral comet into their goal vortex.',
    monetization: 'Solar system exploration campaigns, celestial ambient soundscapes, realistic planetary skin sets.',
    techStack: 'Verlet integration physics in Canvas 2D / WebGL.'
  },
  {
    id: 'glyph',
    title: 'Glyph Weaver: Word Alchemy',
    genre: 'Linguistic Tile Fusion & Anagrams',
    theme: 'Arcane Rune Forging',
    colorClass: 'amber',
    icon: '📜',
    status: 'PLAYABLE NOW (8 Levels)',
    playableEngine: 'glyph',
    summary: 'Spell words by connecting adjacent ancient runes. Longer words trigger elemental rune reactions (Fire, Ice, Lightning) that clear surrounding board hazards and unlock hidden mysteries.',
    mechanics: [
      'Contiguous 8-directional letter tracing.',
      'Elemental prefixes / suffixes that transmute tiles.',
      'Dictionary validation with target word objectives.',
      'Multi-word chain clears with particle cascades.'
    ],
    ahaMoment: 'Discovering an unexpected target word hidden diagonally that triggers an elemental chain reaction, wiping an entire board in one move.',
    multiplayerPotential: '90-Second Anagram Duel: Both players share an identical rune board; claiming a word steals those letters and score points from the opponent.',
    monetization: 'Rune skin collections, mythology expansions (Norse, Egyptian, Celtic), solo story campaign.',
    techStack: 'Rapid dictionary lookup in WebAssembly or JavaScript.'
  },
  {
    id: 'duality',
    title: 'Duality: Split Dimension',
    genre: 'Symmetrical / Asymmetrical Coordination',
    theme: 'Parallel Reality Synchronization',
    colorClass: 'blue',
    icon: '🪞',
    status: 'PLAYABLE NOW (8 Levels)',
    playableEngine: 'duality',
    summary: 'Control two linked avatars on split-screen canvases. One avatar responds normally, while the other moves inverted or adheres to mirrored physical rules. Guide both safely to their portals.',
    mechanics: [
      'Synchronized directional inputs controlling two parallel screens.',
      'Complementary pressure switches (one avatar holds a door open for the other).',
      'Inverted physics (up is down, left is right for Beta avatar).',
      'Phase-shifting gates that swap avatar colors and properties.'
    ],
    ahaMoment: 'Mentally decoupling left-hand and right-hand spatial expectations to maneuver both avatars past lethal spikes simultaneously.',
    multiplayerPotential: '2-Player Co-op: Player 1 controls Avatar A, Player 2 controls Avatar B, requiring live voice chat coordination.',
    monetization: 'Co-op story chapters, two-player bundle passes, emotive avatar skins.',
    techStack: 'Dual viewport rendering, WebRTC / WebSockets for peer-to-peer co-op.'
  }
];

class BlueprintRenderer {
  static renderCards(containerEl, onPlayGameCallback) {
    containerEl.innerHTML = '';

    PUZZLE_BLUEPRINTS.forEach(bp => {
      const card = document.createElement('div');
      card.className = `blueprint-card ${bp.colorClass}`;

      const playButtonHtml = bp.playableEngine
        ? `<button class="btn-cyber primary blueprint-play-btn" data-engine="${bp.playableEngine}">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
             Play This Game
           </button>`
        : `<button class="btn-cyber blueprint-play-btn" style="opacity: 0.6; cursor: default;" disabled>
             Blueprint Specification
           </button>`;

      card.innerHTML = `
        <div class="blueprint-header">
          <div class="blueprint-icon-box">${bp.icon}</div>
          <span class="blueprint-tag" style="background: rgba(0, 240, 255, 0.15); border: 1px solid var(--neon-cyan); color: var(--neon-cyan);">${bp.status}</span>
        </div>
        <h3 class="blueprint-title">${bp.title}</h3>
        <p class="blueprint-description">${bp.summary}</p>
        
        <table class="blueprint-meta-table">
          <tr>
            <td class="label">Genre</td>
            <td class="value">${bp.genre}</td>
          </tr>
          <tr>
            <td class="label">Aha! Factor</td>
            <td class="value" style="font-size: 0.78rem; text-align: left; padding-left: 12px; color: #cbd5e1;">${bp.ahaMoment}</td>
          </tr>
          <tr>
            <td class="label">Multiplayer</td>
            <td class="value">${bp.multiplayerPotential.split(':')[0]}</td>
          </tr>
          <tr>
            <td class="label">Tech Stack</td>
            <td class="value" style="font-size: 0.78rem;">${bp.techStack.split(',')[0]}</td>
          </tr>
        </table>

        ${playButtonHtml}
      `;

      const btn = card.querySelector('.blueprint-play-btn[data-engine]');
      if (btn) {
        btn.addEventListener('click', () => {
          if (onPlayGameCallback) onPlayGameCallback(bp.playableEngine);
        });
      }

      containerEl.appendChild(card);
    });
  }
}

window.PUZZLE_BLUEPRINTS = PUZZLE_BLUEPRINTS;
window.BlueprintRenderer = BlueprintRenderer;
