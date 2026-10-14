/**
 * REFLECTO - MASTER CONTROLLER
 * Coordinates 100 Handcrafted Levels, HiDPI Virtual Canvas,
 * Pastel UI HUD, Chapter Selection Modal, Hint System,
 * Global Star Counter, Progressive Level Unlocking,
 * Chapter Story Cards, Zen Free Play Mode, Cozy Twilight Theme,
 * Toybox Sandbox Playground, Background Music, and Sound FX.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Canvas
  const canvas = document.getElementById('optics-canvas');
  const canvasContainer = document.getElementById('canvas-container');

  // Header & HUD Elements
  const headerChamberLabel = document.getElementById('header-chamber-label');
  const hudChapterBadge = document.getElementById('hud-chapter-badge');
  const hudChapterBadgeText = document.getElementById('hud-chapter-badge-text');
  const hudChamberTitle = document.getElementById('hud-chamber-title');
  const hudMovesPill = document.getElementById('hud-moves-pill');
  const hudMovesLabel = document.getElementById('hud-moves-label');
  const hudMoves = document.getElementById('hud-moves');
  const hudParLabel = document.getElementById('hud-par-label');
  const hudPar = document.getElementById('hud-par');
  const hudStars = document.getElementById('hud-stars');
  const hudObjectiveText = document.getElementById('hud-objective-text');
  const hudTotalStars = document.getElementById('hud-total-stars');

  // Inspector Bar
  const inspectorIcon = document.getElementById('inspector-icon');
  const inspectorText = document.getElementById('inspector-text');
  const inspectorHint = document.getElementById('inspector-hint');

  // Action Buttons
  const btnRotate = document.getElementById('btn-action-rotate');
  const btnUndo = document.getElementById('btn-action-undo');
  const btnHint = document.getElementById('btn-action-hint');
  const hintBtnLabel = document.getElementById('hint-btn-label');
  const btnReset = document.getElementById('btn-action-reset');
  const btnToggleSound = document.getElementById('btn-toggle-sound');
  const iconSound = document.getElementById('icon-sound');
  const btnToggleMusic = document.getElementById('btn-toggle-music');
  const iconMusic = document.getElementById('icon-music');
  const btnToggleTheme = document.getElementById('btn-toggle-theme');
  const iconTheme = document.getElementById('icon-theme');
  const btnToggleZen = document.getElementById('btn-toggle-zen');
  const iconZen = document.getElementById('icon-zen');
  const btnOpenToybox = document.getElementById('btn-open-toybox');

  // Modals & Navigation
  const btnOpenChapters = document.getElementById('btn-open-chapters');
  const chaptersModal = document.getElementById('chapters-modal');
  const btnCloseChaptersModal = document.getElementById('btn-close-chapters-modal');
  const btnUnlockAll = document.getElementById('btn-unlock-all');
  const chapterFilterTabs = document.querySelectorAll('.chapter-tab-btn');
  const chambersGridContainer = document.getElementById('chambers-grid-container');

  // Story Card Modal Elements
  const storyCardModal = document.getElementById('story-card-modal');
  const storyAvatar = document.getElementById('story-avatar');
  const storyChapterTag = document.getElementById('story-chapter-tag');
  const storyCardTitle = document.getElementById('story-card-title');
  const storyDialogue = document.getElementById('story-dialogue');
  const storyTip = document.getElementById('story-tip');
  const btnCloseStory = document.getElementById('btn-close-story');

  // Toybox Modal Elements
  const toyboxModal = document.getElementById('toybox-modal');
  const toyboxCanvas = document.getElementById('toybox-canvas');
  const btnCloseToybox = document.getElementById('btn-close-toybox');
  const btnToyboxPreset = document.getElementById('btn-toybox-preset');
  const btnToyboxClear = document.getElementById('btn-toybox-clear');
  const toyToolButtons = document.querySelectorAll('.toy-tool-btn');
  let toyboxController = null;

  // Victory Modal Elements
  const victoryModal = document.getElementById('victory-modal');
  const winLevelNum = document.getElementById('win-level-num');
  const winMoves = document.getElementById('win-moves');
  const winPar = document.getElementById('win-par');
  const winStarSlots = [
    document.getElementById('win-star-1'),
    document.getElementById('win-star-2'),
    document.getElementById('win-star-3')
  ];
  const btnReplayChamber = document.getElementById('btn-replay-chamber');
  const btnNextChamber = document.getElementById('btn-next-chamber');
  const btnMenuChambers = document.getElementById('btn-menu-chambers');

  // Rewarded Ad & Simulator Modals
  const rewardPromptModal = document.getElementById('rewarded-prompt-modal');
  const btnWatchReward = document.getElementById('btn-watch-reward');
  const btnCancelReward = document.getElementById('btn-cancel-reward');
  const adSimulatorModal = document.getElementById('browser-ad-simulator-modal');

  // Screen Views & Main Menu Elements
  const viewLevelSelect = document.getElementById('view-level-select');
  const viewGameplay = document.getElementById('view-gameplay');
  const btnBackToMenu = document.getElementById('btn-back-to-menu');
  const btnMenuContinue = document.getElementById('btn-menu-continue');
  const menuContinueLvl = document.getElementById('menu-continue-lvl');
  const quickFilterButtons = document.querySelectorAll('.filter-pill-btn');
  const batchTabButtons = document.querySelectorAll('.batch-tab-btn');
  const batchStatusTitle = document.getElementById('batch-status-title');
  const batchStatusStats = document.getElementById('batch-status-stats');
  const batchProgressBarFill = document.getElementById('batch-progress-bar-fill');
  const menuLevelsGrid = document.getElementById('menu-levels-grid');
  const btnUnlockAllMenu = document.getElementById('btn-unlock-all-menu');

  // Game Engine & State
  let opticsEngine = null;
  let currentLevelIdx = 0;
  let activeChapterFilter = 'all';
  let activeBatchFilter = 'batch-1-10';
  let isUnlockAllMode = localStorage.getItem('reflecto_unlock_all') === 'true';
  let isZenMode = localStorage.getItem('reflecto_zen_mode') === 'true';
  let currentTheme = localStorage.getItem('reflecto_theme') || 'sunny';

  // Persistence Helpers
  function getSavedLevel() {
    const saved = localStorage.getItem('reflecto_current_chamber') || localStorage.getItem('lumina_current_chamber');
    return saved !== null ? parseInt(saved, 10) : 0;
  }

  function saveCurrentLevel(idx) {
    localStorage.setItem('reflecto_current_chamber', idx.toString());
  }

  function getLevelStars() {
    const data = localStorage.getItem('reflecto_stars_record') || localStorage.getItem('lumina_stars_record');
    return data ? JSON.parse(data) : {};
  }

  function saveLevelStars(levelId, stars) {
    const records = getLevelStars();
    const existing = records[levelId] || 0;
    if (stars > existing) {
      records[levelId] = stars;
      localStorage.setItem('reflecto_stars_record', JSON.stringify(records));
    }
  }

  function getTotalStars() {
    const records = getLevelStars();
    let total = 0;
    for (const key in records) {
      total += records[key] || 0;
    }
    return total;
  }

  function updateTotalStarsHUD() {
    if (hudTotalStars) {
      hudTotalStars.textContent = getTotalStars();
    }
  }

  function getHighestUnlockedLevel() {
    if (isUnlockAllMode) return 99;
    const records = getLevelStars();
    let highest = 0;
    for (let i = 0; i < 99; i++) {
      if (records[i + 1] && records[i + 1] > 0) {
        highest = i + 1;
      } else {
        break;
      }
    }
    return highest;
  }

  function getNextLevelToPlay() {
    const records = getLevelStars();
    for (let i = 0; i < 100; i++) {
      if (isLevelUnlocked(i) && (!records[i + 1] || records[i + 1] === 0)) {
        return i;
      }
    }
    return getHighestUnlockedLevel();
  }

  function saveHighestUnlockedLevel(levelId) {
    const current = getHighestUnlockedLevel();
    if (levelId > current) {
      localStorage.setItem('reflecto_highest_unlocked', levelId.toString());
    }
  }

  function isLevelUnlocked(idx) {
    if (isUnlockAllMode) return true;
    if (idx === 0) return true; // Level 1 is always unlocked
    const records = getLevelStars();
    // Level N+1 (idx) unlocks strictly when Level N (levelId = idx) has >= 1 star
    return (records[idx] !== undefined && records[idx] > 0);
  }

  // Story Cards Tracking
  function getViewedStories() {
    const saved = localStorage.getItem('reflecto_viewed_stories');
    return saved ? JSON.parse(saved) : {};
  }

  function markStoryViewed(chapter) {
    const viewed = getViewedStories();
    viewed[chapter] = true;
    localStorage.setItem('reflecto_viewed_stories', JSON.stringify(viewed));
  }

  function showStoryCard(chapterNum, force = false) {
    if (typeof REFLECTO_STORIES === 'undefined') return;
    const story = REFLECTO_STORIES[chapterNum];
    if (!story) return;

    const viewed = getViewedStories();
    if (!force && viewed[chapterNum]) return; // already viewed

    markStoryViewed(chapterNum);

    if (storyAvatar) storyAvatar.textContent = story.characterAvatar || '⭐';
    if (storyChapterTag) storyChapterTag.textContent = `Chapter ${story.chapter}: ${story.chapterTitle}`;
    if (storyCardTitle) storyCardTitle.textContent = story.title || `${story.characterName}!`;
    if (storyDialogue) storyDialogue.textContent = story.dialogue;
    if (storyTip) storyTip.textContent = story.tip;

    if (storyCardModal) storyCardModal.classList.add('active');
    if (window.soundFX && window.soundFX.starWakeupChime) window.soundFX.starWakeupChime();
  }

  // Setup HiDPI Canvas Scaling
  function setupCanvasDPI(c) {
    const target = c || canvas;
    if (!target) return;
    const dpr = window.devicePixelRatio || 1;
    const size = 600;

    target.width = size * dpr;
    target.height = size * dpr;
    target.style.width = '100%';
    target.style.height = '100%';

    const ctx = target.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  // Initialize Game Engine
  function initEngine() {
    setupCanvasDPI(canvas);

    opticsEngine = new OpticsEngine(
      canvas,
      handleLevelWin,
      handleMoveChange,
      handlePieceSelect
    );

    applyTheme(currentTheme);
    applyZenMode(isZenMode);
    updateTotalStarsHUD();
    updateAudioIcons();

    // Start on Main Menu / Level Selection Hub
    showLevelSelectView();
  }

  // =========================================================================
  // SCREEN VIEW NAVIGATION (MAIN MENU vs GAMEPLAY)
  // =========================================================================
  function showLevelSelectView() {
    closeModals();
    if (viewGameplay) viewGameplay.style.display = 'none';
    if (viewLevelSelect) viewLevelSelect.style.display = 'flex';
    if (btnBackToMenu) btnBackToMenu.style.display = 'none';
    if (btnOpenChapters) btnOpenChapters.style.display = 'none';
    const mainHeader = document.getElementById('main-header');
    if (mainHeader) mainHeader.classList.remove('in-gameplay');
    renderBatchLevelsGrid();
    updateTotalStarsHUD();
  }

  function showGameplayView(idx) {
    closeModals();
    if (viewLevelSelect) viewLevelSelect.style.display = 'none';
    if (viewGameplay) viewGameplay.style.display = 'flex';
    if (btnBackToMenu) btnBackToMenu.style.display = 'inline-flex';
    if (btnOpenChapters) btnOpenChapters.style.display = 'none';
    const mainHeader = document.getElementById('main-header');
    if (mainHeader) mainHeader.classList.add('in-gameplay');
    loadChamber(idx);
  }

  function getLevelRangeForFilter(filter) {
    if (filter === 'first-20') return [1, 20];
    if (filter === 'first-30') return [1, 30];
    if (filter === 'all') return [1, 100];
    const match = filter.match(/^batch-(\d+)(?:-(\d+))?$/);
    if (match) {
      if (match[2]) {
        return [parseInt(match[1], 10), parseInt(match[2], 10)];
      }
      const bNum = parseInt(match[1], 10);
      const start = (bNum - 1) * 10 + 1;
      return [start, Math.min(start + 9, 100)];
    }
    return [1, 10];
  }

  function renderBatchLevelsGrid() {
    if (!menuLevelsGrid || !opticsEngine) return;
    menuLevelsGrid.innerHTML = '';

    const records = getLevelStars();
    const nextToPlay = getNextLevelToPlay();

    if (menuContinueLvl) {
      menuContinueLvl.textContent = (nextToPlay + 1);
    }

    if (btnUnlockAllMenu) {
      btnUnlockAllMenu.textContent = isUnlockAllMode ? '🔒 Normal Mode' : '🔓 Unlock All';
    }
    if (btnUnlockAll) {
      btnUnlockAll.textContent = isUnlockAllMode ? '🔒 Normal Mode' : '🔓 Unlock All';
    }

    const [startLvl, endLvl] = getLevelRangeForFilter(activeBatchFilter);
    const levelsInBatch = [];
    for (let i = startLvl - 1; i <= endLvl - 1 && i < opticsEngine.levels.length; i++) {
      levelsInBatch.push({ lvl: opticsEngine.levels[i], idx: i });
    }

    // Batch Status Calculations
    let solvedCount = 0;
    let starsEarned = 0;
    levelsInBatch.forEach(({ lvl }) => {
      const stars = records[lvl.id] || 0;
      if (stars > 0) solvedCount++;
      starsEarned += stars;
    });

    const totalBatchLevels = levelsInBatch.length;
    const maxBatchStars = totalBatchLevels * 3;

    if (batchStatusTitle) {
      if (activeBatchFilter === 'all') {
        batchStatusTitle.textContent = 'All 100 Levels';
      } else if (activeBatchFilter === 'first-20') {
        batchStatusTitle.textContent = 'First 20 Levels (1–20)';
      } else if (activeBatchFilter === 'first-30') {
        batchStatusTitle.textContent = 'First 30 Levels (1–30)';
      } else {
        const bIdx = Math.floor((startLvl - 1) / 10) + 1;
        const bNames = [
          'Sunny Start', 'Wobbly Walls', 'Mirror Maze', 'Double Beams', 'Prism Party',
          'Rainbow Sparkle', 'Color Match', 'Color Blend', 'Donut Portals', 'Grand Master'
        ];
        batchStatusTitle.textContent = `Series ${bIdx}: ${bNames[bIdx - 1] || 'Optics'} (${startLvl}–${endLvl})`;
      }
    }

    if (batchStatusStats) {
      batchStatusStats.textContent = `Solved: ${solvedCount}/${totalBatchLevels} • Stars: ${starsEarned}/${maxBatchStars} ⭐`;
    }

    if (batchProgressBarFill) {
      const pct = totalBatchLevels > 0 ? Math.round((solvedCount / totalBatchLevels) * 100) : 0;
      batchProgressBarFill.style.width = `${pct}%`;
    }

    // Render Cards
    levelsInBatch.forEach(({ lvl, idx }) => {
      const isUnlocked = isLevelUnlocked(idx);
      const stars = records[lvl.id] || 0;
      const isCurrent = (idx === nextToPlay && isUnlocked);
      const isSolved = (stars > 0);

      const card = document.createElement('div');
      card.className = 'level-card-item';
      if (!isUnlocked) {
        card.classList.add('locked');
      } else if (isSolved) {
        card.classList.add('solved');
      } else if (isCurrent) {
        card.classList.add('current');
      }

      let starsHtml = '';
      if (!isUnlocked) {
        starsHtml = '🔒 Locked';
      } else if (stars === 3) {
        starsHtml = '⭐⭐⭐';
      } else if (stars === 2) {
        starsHtml = '⭐⭐<span class="empty-star">☆</span>';
      } else if (stars === 1) {
        starsHtml = '⭐<span class="empty-star">☆☆</span>';
      } else {
        starsHtml = '<span class="empty-star">☆☆☆</span>';
      }

      let statusBadgeHtml = '';
      if (!isUnlocked) {
        statusBadgeHtml = '<span class="level-card-status-badge">🔒</span>';
      } else if (isSolved) {
        statusBadgeHtml = `<span class="level-card-status-badge">✓ ${stars}★</span>`;
      } else if (isCurrent) {
        statusBadgeHtml = '<span class="level-card-status-badge">▶ Play</span>';
      } else {
        statusBadgeHtml = '<span class="level-card-status-badge">Open</span>';
      }

      card.innerHTML = `
        <div class="level-card-header">
          <span class="level-card-num">${lvl.id}</span>
          ${statusBadgeHtml}
        </div>
        <div class="level-card-title">${lvl.title || `Level ${lvl.id}`}</div>
        <div class="level-card-stars">${starsHtml}</div>
        <div class="level-card-par">Par: ${lvl.parMoves}</div>
      `;

      card.addEventListener('click', () => {
        if (!isUnlocked) {
          if (window.soundFX && window.soundFX.softThud) window.soundFX.softThud();
          alert(`Level ${lvl.id} is locked! Complete Level ${lvl.id - 1} first.`);
        } else {
          showGameplayView(idx);
        }
      });

      menuLevelsGrid.appendChild(card);
    });
  }

  // Theme Management
  function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('reflecto_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    if (iconTheme) {
      iconTheme.textContent = (theme === 'twilight') ? '☀️' : '🌙';
    }
  }

  function toggleTheme() {
    const nextTheme = (currentTheme === 'twilight') ? 'sunny' : 'twilight';
    applyTheme(nextTheme);
    if (window.soundFX && window.soundFX.candyPop) window.soundFX.candyPop();
  }

  // Zen Mode Management
  function applyZenMode(active) {
    isZenMode = active;
    localStorage.setItem('reflecto_zen_mode', active.toString());

    if (iconZen) {
      iconZen.textContent = isZenMode ? '🏆' : '🧘';
    }

    if (hudMovesPill) {
      if (isZenMode) {
        hudMovesPill.classList.add('zen-active');
        if (hudMovesLabel) hudMovesLabel.textContent = 'Mode';
        if (hudMoves) hudMoves.textContent = 'Zen';
        if (hudParLabel) hudParLabel.textContent = '';
        if (hudPar) hudPar.textContent = '✨';
      } else {
        hudMovesPill.classList.remove('zen-active');
        if (hudMovesLabel) hudMovesLabel.textContent = 'Moves';
        if (hudMoves) hudMoves.textContent = opticsEngine ? opticsEngine.moves : '0';
        if (hudParLabel) hudParLabel.textContent = '/ Par';
        if (hudPar && opticsEngine && opticsEngine.level) hudPar.textContent = opticsEngine.level.parMoves || '1';
      }
    }
  }

  function toggleZenMode() {
    applyZenMode(!isZenMode);
    if (window.soundFX && window.soundFX.candyPop) window.soundFX.candyPop();
  }

  // Chamber Loader
  function loadChamber(index) {
    if (!opticsEngine || index < 0 || index >= opticsEngine.levels.length) return;
    currentLevelIdx = index;
    saveCurrentLevel(index);

    opticsEngine.loadLevel(index);
    const lvl = opticsEngine.levels[index];

    // Update HUD
    const formattedId = String(lvl.id).padStart(2, '0');
    if (headerChamberLabel) headerChamberLabel.textContent = `Level ${formattedId} / ${opticsEngine.levels.length}`;

    const chapterTitleText = lvl.chapterTitle ? `Chapter ${lvl.chapter}: ${lvl.chapterTitle}` : `Chapter ${lvl.chapter}`;
    if (hudChapterBadgeText) {
      hudChapterBadgeText.textContent = chapterTitleText;
    } else if (hudChapterBadge) {
      hudChapterBadge.textContent = `${chapterTitleText} 📖`;
    }

    if (hudChamberTitle) hudChamberTitle.textContent = lvl.title || `Level ${lvl.id}`;

    if (!isZenMode) {
      if (hudMoves) hudMoves.textContent = '0';
      if (hudPar) hudPar.textContent = lvl.parMoves || 1;
    }

    if (hudStars) hudStars.textContent = '⭐⭐⭐';
    if (hudObjectiveText) hudObjectiveText.textContent = lvl.desc || 'Tap a mirror to bounce the light into the sleepy star!';
    if (hintBtnLabel) hintBtnLabel.textContent = `Hint (${opticsEngine.hintsRemaining})`;

    updateTotalStarsHUD();

    // Close any open modals
    closeModals();

    // Check if new chapter story should pop up
    showStoryCard(lvl.chapter, false);
  }

  // Move Change Listener
  function handleMoveChange(moves, par, hintsRemaining) {
    if (!isZenMode && hudMoves) {
      hudMoves.textContent = moves;
    }

    const diff = moves - par;
    if (hudStars) {
      if (isZenMode || diff <= 0) {
        hudStars.textContent = '⭐⭐⭐';
      } else if (diff <= 2) {
        hudStars.textContent = '⭐⭐';
      } else {
        hudStars.textContent = '⭐';
      }
    }

    if (hintBtnLabel) {
      const remaining = (typeof hintsRemaining === 'number') ? hintsRemaining : (opticsEngine ? opticsEngine.hintsRemaining : 3);
      hintBtnLabel.textContent = `Hint (${remaining})`;
    }
  }

  // Piece Selection Listener
  function handlePieceSelect(info) {
    if (!inspectorIcon || !inspectorText || !inspectorHint) return;

    if (!info) {
      inspectorIcon.textContent = '✨';
      inspectorText.innerHTML = '<strong>No Mirror Selected</strong>';
      inspectorHint.textContent = 'Tap any mirror on the board';
      return;
    }

    if (info.locked) {
      inspectorIcon.textContent = '🔒';
      inspectorText.innerHTML = `<strong>Fixed Mirror</strong> at (${info.x}, ${info.y})`;
      inspectorHint.textContent = 'This mirror cannot be turned';
    } else {
      inspectorIcon.textContent = '🪞';
      inspectorText.innerHTML = `<strong>Bouncy Mirror</strong> at (${info.x}, ${info.y})`;
      inspectorHint.textContent = 'Tap mirror or press Flip!';
    }
  }

  // Victory Celebration Handler
  function handleLevelWin(levelId, stars, moves, par) {
    // In Zen Mode, always grant 3 stars
    const awardedStars = isZenMode ? 3 : stars;

    saveLevelStars(levelId, awardedStars);
    saveHighestUnlockedLevel(levelId); // unlock next level
    updateTotalStarsHUD();

    if (winLevelNum) winLevelNum.textContent = levelId;
    if (winMoves) winMoves.textContent = moves;
    if (winPar) winPar.textContent = isZenMode ? 'Zen' : par;

    // Reset star slots
    winStarSlots.forEach(slot => {
      if (slot) slot.classList.remove('earned');
    });

    if (victoryModal) victoryModal.classList.add('active');

    // Sequential Star Pop Animation & Dings
    for (let i = 0; i < awardedStars; i++) {
      setTimeout(() => {
        if (winStarSlots[i]) {
          winStarSlots[i].classList.add('earned');
        }
        if (window.soundFX && window.soundFX.starAwardDing) {
          window.soundFX.starAwardDing(i);
        }
      }, 260 + i * 240);
    }
  }

  // Populate 100-Level Selector Sheet
  function renderChamberMap() {
    if (!chambersGridContainer || !opticsEngine) return;
    chambersGridContainer.innerHTML = '';
    const starsRecord = getLevelStars();

    if (btnUnlockAll) {
      btnUnlockAll.textContent = isUnlockAllMode ? '🔒 Normal Mode' : '🔓 Unlock All';
    }

    opticsEngine.levels.forEach((lvl, idx) => {
      // Filter check
      if (activeChapterFilter !== 'all' && String(lvl.chapter) !== activeChapterFilter) {
        return;
      }

      const isUnlocked = isLevelUnlocked(idx);
      const btn = document.createElement('button');
      btn.className = 'chamber-cell-btn';
      if (idx === currentLevelIdx) btn.classList.add('active-current');

      if (!isUnlocked) {
        btn.classList.add('locked');
        btn.innerHTML = `
          <span class="chamber-cell-num">${lvl.id}</span>
          <span class="chamber-cell-stars">🔒</span>
          <span class="chamber-cell-par">Locked</span>
        `;
        btn.addEventListener('click', () => {
          if (window.soundFX && window.soundFX.softThud) window.soundFX.softThud();
        });
      } else {
        const starsCount = starsRecord[lvl.id] || 0;
        const starsDisplay = starsCount > 0 ? '⭐'.repeat(starsCount) : '···';

        btn.innerHTML = `
          <span class="chamber-cell-num">${lvl.id}</span>
          <span class="chamber-cell-stars">${starsDisplay}</span>
          <span class="chamber-cell-par">Par: ${lvl.parMoves}</span>
        `;

        btn.addEventListener('click', () => {
          loadChamber(idx);
        });
      }

      chambersGridContainer.appendChild(btn);
    });
  }

  // Update Audio Icons based on state
  function updateAudioIcons() {
    if (window.soundFX) {
      if (iconSound) {
        if (window.soundFX.isMuted) {
          iconSound.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
        } else {
          iconSound.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>';
        }
      }
      if (iconMusic) {
        iconMusic.textContent = window.soundFX.isMusicMuted ? '🔇' : '🎵';
      }
    }
  }

  // Modal Controls
  function openChaptersModal() {
    renderChamberMap();
    if (chaptersModal) chaptersModal.classList.add('active');
  }

  function closeModals() {
    if (chaptersModal) chaptersModal.classList.remove('active');
    if (victoryModal) victoryModal.classList.remove('active');
    if (storyCardModal) storyCardModal.classList.remove('active');
    if (toyboxModal) toyboxModal.classList.remove('active');
    if (rewardPromptModal) rewardPromptModal.classList.remove('active');
    if (adSimulatorModal) adSimulatorModal.classList.remove('active');
  }

  // Bind UI Events
  if (btnBackToMenu) btnBackToMenu.addEventListener('click', showLevelSelectView);
  if (btnOpenChapters) btnOpenChapters.addEventListener('click', showLevelSelectView);
  if (btnCloseChaptersModal) btnCloseChaptersModal.addEventListener('click', closeModals);
  if (btnCloseStory) btnCloseStory.addEventListener('click', closeModals);

  // Main Menu Continue Button
  if (btnMenuContinue) {
    btnMenuContinue.addEventListener('click', () => {
      const nextIdx = getNextLevelToPlay();
      showGameplayView(nextIdx);
    });
  }

  // Quick Filter Preset Buttons (All 100, First 20, First 30)
  quickFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      quickFilterButtons.forEach(b => b.classList.remove('active'));
      batchTabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeBatchFilter = btn.getAttribute('data-filter');
      renderBatchLevelsGrid();
      if (window.soundFX && window.soundFX.rotateClick) window.soundFX.rotateClick();
    });
  });

  // Batch Series Tab Buttons (1–10, 11–20, ..., 91–100)
  batchTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      batchTabButtons.forEach(b => b.classList.remove('active'));
      quickFilterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const bNum = btn.getAttribute('data-batch');
      activeBatchFilter = `batch-${bNum}`;
      renderBatchLevelsGrid();
      if (window.soundFX && window.soundFX.rotateClick) window.soundFX.rotateClick();
    });
  });

  // Unlock All Levels Toggle Buttons
  if (btnUnlockAllMenu) {
    btnUnlockAllMenu.addEventListener('click', () => {
      isUnlockAllMode = !isUnlockAllMode;
      localStorage.setItem('reflecto_unlock_all', isUnlockAllMode.toString());
      renderBatchLevelsGrid();
      renderChamberMap();
      if (window.soundFX && window.soundFX.candyPop) window.soundFX.candyPop();
    });
  }

  // Chapter Badge Click: Opens Story Card anytime
  if (hudChapterBadge) {
    hudChapterBadge.addEventListener('click', () => {
      if (opticsEngine && opticsEngine.level) {
        showStoryCard(opticsEngine.level.chapter, true);
      }
    });
  }

  // Theme & Zen Mode Toggles
  if (btnToggleTheme) btnToggleTheme.addEventListener('click', toggleTheme);
  if (btnToggleZen) btnToggleZen.addEventListener('click', toggleZenMode);

  // Unlock All Levels Toggle Buttons
  if (btnUnlockAll) {
    btnUnlockAll.addEventListener('click', () => {
      isUnlockAllMode = !isUnlockAllMode;
      localStorage.setItem('reflecto_unlock_all', isUnlockAllMode.toString());
      renderBatchLevelsGrid();
      renderChamberMap();
      if (window.soundFX && window.soundFX.candyPop) window.soundFX.candyPop();
    });
  }

  // Chapter Filter Tabs (in quick modal if opened)
  chapterFilterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      chapterFilterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeChapterFilter = tab.getAttribute('data-chapter');
      renderChamberMap();
    });
  });

  // Action Buttons
  if (btnRotate) {
    btnRotate.addEventListener('click', () => {
      if (opticsEngine) opticsEngine.flipSelectedMirror();
    });
  }

  if (btnUndo) {
    btnUndo.addEventListener('click', () => {
      if (opticsEngine) {
        const ok = opticsEngine.undo();
        if (!ok && window.soundFX && window.soundFX.softThud) {
          window.soundFX.softThud();
        }
      }
    });
  }

  if (btnHint) {
    btnHint.addEventListener('click', () => {
      if (!opticsEngine) return;
      if (opticsEngine.hintsRemaining <= 0) {
        if (rewardPromptModal) rewardPromptModal.classList.add('active');
        if (window.soundFX && window.soundFX.softThud) window.soundFX.softThud();
        return;
      }
      const hint = opticsEngine.useHint();
      if (!hint) {
        if (window.soundFX && window.soundFX.softThud) window.soundFX.softThud();
      }
    });
  }

  // Rewarded Video Prompt Buttons
  if (btnCancelReward) {
    btnCancelReward.addEventListener('click', () => {
      if (rewardPromptModal) rewardPromptModal.classList.remove('active');
    });
  }

  if (btnWatchReward) {
    btnWatchReward.addEventListener('click', () => {
      if (rewardPromptModal) rewardPromptModal.classList.remove('active');
      if (window.adsManager) {
        window.adsManager.requestRewardedAdForHints((awarded) => {
          if (opticsEngine) {
            opticsEngine.hintsRemaining = (opticsEngine.hintsRemaining || 0) + awarded;
            handleMoveChange(opticsEngine.moves, opticsEngine.level.parMoves, opticsEngine.hintsRemaining);
            if (window.soundFX && window.soundFX.starAwardDing) window.soundFX.starAwardDing(2);
          }
        });
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (opticsEngine) {
        opticsEngine.loadLevel(currentLevelIdx);
        if (window.soundFX && window.soundFX.rotateClick) window.soundFX.rotateClick();
      }
    });
  }

  // SFX Sound Toggle
  if (btnToggleSound) {
    btnToggleSound.addEventListener('click', () => {
      if (window.soundFX) {
        window.soundFX.toggleMute();
        updateAudioIcons();
      }
    });
  }

  // Music Toggle
  if (btnToggleMusic) {
    btnToggleMusic.addEventListener('click', () => {
      if (window.soundFX) {
        window.soundFX.toggleMusic();
        updateAudioIcons();
      }
    });
  }

  // Victory Dialog Buttons
  if (btnReplayChamber) {
    btnReplayChamber.addEventListener('click', () => {
      closeModals();
      loadChamber(currentLevelIdx);
    });
  }

  if (btnNextChamber) {
    btnNextChamber.addEventListener('click', () => {
      closeModals();
      const nextIdx = currentLevelIdx + 1;
      if (nextIdx >= opticsEngine.levels.length) {
        showLevelSelectView();
        return;
      }
      if (window.adsManager) {
        window.adsManager.onLevelWon(() => {
          showGameplayView(nextIdx);
        });
      } else {
        showGameplayView(nextIdx);
      }
    });
  }

  if (btnMenuChambers) {
    btnMenuChambers.addEventListener('click', () => {
      closeModals();
      showLevelSelectView();
    });
  }

  // =========================================================================
  // TOYBOX SANDBOX MODAL SETUP
  // =========================================================================
  function initToybox() {
    if (!toyboxCanvas) return;
    setupCanvasDPI(toyboxCanvas);

    if (!toyboxController && typeof ToyboxController !== 'undefined') {
      toyboxController = new ToyboxController(toyboxCanvas);
    }
  }

  if (btnOpenToybox) {
    btnOpenToybox.addEventListener('click', () => {
      initToybox();
      if (toyboxModal) toyboxModal.classList.add('active');
      if (toyboxController) toyboxController.recalculate();
    });
  }

  if (btnCloseToybox) {
    btnCloseToybox.addEventListener('click', () => {
      if (toyboxModal) toyboxModal.classList.remove('active');
    });
  }

  if (btnToyboxPreset) {
    btnToyboxPreset.addEventListener('click', () => {
      if (toyboxController) toyboxController.loadPreset();
    });
  }

  if (btnToyboxClear) {
    btnToyboxClear.addEventListener('click', () => {
      if (toyboxController) toyboxController.clearBoard();
    });
  }

  toyToolButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toyToolButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tool = btn.getAttribute('data-tool');
      if (toyboxController) toyboxController.setTool(tool);
    });
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key.toLowerCase() === 'r' || e.key === 'Enter') {
      e.preventDefault();
      if (opticsEngine) opticsEngine.flipSelectedMirror();
    } else if (e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (opticsEngine) opticsEngine.undo();
    } else if (e.key.toLowerCase() === 'h' || e.key === '?') {
      e.preventDefault();
      if (opticsEngine) opticsEngine.useHint();
    } else if (e.key.toLowerCase() === 'm') {
      if (window.soundFX) {
        window.soundFX.toggleMusic();
        updateAudioIcons();
      }
    } else if (e.key.toLowerCase() === 't') {
      toggleTheme();
    } else if (e.key === 'Escape') {
      closeModals();
    } else if (e.key === 'ArrowRight') {
      if (opticsEngine && currentLevelIdx < opticsEngine.levels.length - 1) {
        const nextIdx = currentLevelIdx + 1;
        if (isLevelUnlocked(nextIdx)) loadChamber(nextIdx);
      }
    } else if (e.key === 'ArrowLeft') {
      if (currentLevelIdx > 0) {
        loadChamber(currentLevelIdx - 1);
      }
    }
  });

  // Window Resize Debounce
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setupCanvasDPI(canvas);
      if (opticsEngine) opticsEngine.render();
      if (toyboxCanvas && toyboxController) {
        setupCanvasDPI(toyboxCanvas);
        toyboxController.render();
      }
    }, 150);
  });

  // Start Application
  initEngine();
});
