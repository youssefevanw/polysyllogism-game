// UI rendering for George and the Dragon
(function() {
  'use strict';
  var LEVEL_NAMES = [
    '',
    'Syllogisms: Notated',
    'Syllogisms: Terms',
    'Polysyllogisms: Notated',
    'Polysyllogisms: Terms',
    'Aristotelian Sorites',
    'Goclenian Sorites'
  ];
  // ===== MAP VIEW =====
  function renderMap() {
    var mapView = document.getElementById('map-view');
    var allBeaten = Game.Storage.allLevelsBeaten();
    var html = '<div class="map-container">';
    // Header
    html += '<div class="map-header">';
    html += '<h1 class="game-title">George &amp; the Dragon</h1>';
    html += '<div class="map-controls">';
    html += '<button class="btn-icon" id="btn-stats" title="Stats">' + createStatsIcon() + '</button>';
    html += '<button class="btn-icon" id="btn-mute" title="Toggle Sound">' + getMuteIcon() + '</button>';
    html += '</div>';
    html += '</div>';
    // Garden at top
    html += '<div class="garden-area" id="garden-area">';
    if (allBeaten) {
      html += '<div class="garden-unlocked">' + Game.Sprites.createGardenUnlocked(320, 100) + '</div>';
      html += '<div class="garden-text">The Kingdom is Saved!</div>';
    } else {
      html += '<div class="garden-locked">' + Game.Sprites.createGardenLocked(320, 100) + '</div>';
      html += '<div class="garden-text-locked">Complete all levels to unlock</div>';
    }
    html += '</div>';
    // Castle path with doors (6 to 1, top to bottom)
    html += '<div class="castle-path">';
    for (var i = 6; i >= 1; i--) {
      var beaten = Game.Storage.isLevelBeaten(i);
      var unlocked = Game.Storage.isLevelUnlocked(i);
      var doorState = beaten ? 'beaten' : (unlocked ? 'unlocked' : 'locked');
      var clickable = unlocked ? 'clickable' : '';
      html += '<div class="path-segment">';
      html += '<div class="path-line"></div>';
      html += '<div class="door-wrapper ' + clickable + '" data-level="' + i + '">';
      html += '<div class="door-sprite">' + Game.Sprites.createDoor(doorState, i) + '</div>';
      html += '<div class="door-info">';
      html += '<div class="door-level">Level ' + i + '</div>';
      html += '<div class="door-name">' + LEVEL_NAMES[i] + '</div>';
      if (beaten) {
        html += '<div class="door-star">' + Game.Sprites.createStar(16) + '</div>';
      } else if (!unlocked) {
        html += '<div class="door-lock">' + Game.Sprites.createLock(14) + '</div>';
      }
      html += '</div>';
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>'; // map-container
    mapView.innerHTML = html;
    // Attach event listeners
    mapView.querySelectorAll('.door-wrapper.clickable').forEach(function(door) {
      door.addEventListener('click', function() {
        var level = parseInt(this.dataset.level);
        Game.Sound.playDoorClick();
        Game.App.navigate('battle', { level: level });
      });
    });
    document.getElementById('btn-stats').addEventListener('click', function() {
      Game.App.navigate('stats');
    });
    document.getElementById('btn-mute').addEventListener('click', function() {
      Game.Storage.setMuted(!Game.Storage.isMuted());
      document.getElementById('btn-mute').innerHTML = getMuteIcon();
      Game.Sound.ensureContext();
    });
  }
  function getMuteIcon() {
    var muted = Game.Storage.isMuted();
    if (muted) {
      return '<svg viewBox="0 0 16 16" width="20" height="20" style="image-rendering:pixelated"><rect x="1" y="5" width="3" height="6" fill="#888"/><polygon points="4,5 9,2 9,14 4,11" fill="#888"/><line x1="11" y1="4" x2="15" y2="12" stroke="#f44" stroke-width="2"/><line x1="15" y1="4" x2="11" y2="12" stroke="#f44" stroke-width="2"/></svg>';
    }
    return '<svg viewBox="0 0 16 16" width="20" height="20" style="image-rendering:pixelated"><rect x="1" y="5" width="3" height="6" fill="#4ade80"/><polygon points="4,5 9,2 9,14 4,11" fill="#4ade80"/><path d="M11,5 Q14,8 11,11" fill="none" stroke="#4ade80" stroke-width="1.5"/><path d="M12,3 Q16,8 12,13" fill="none" stroke="#4ade80" stroke-width="1" opacity="0.6"/></svg>';
  }
  function createStatsIcon() {
    return '<svg viewBox="0 0 16 16" width="20" height="20" style="image-rendering:pixelated"><rect x="1" y="10" width="3" height="5" fill="#ffd700"/><rect x="6" y="6" width="3" height="9" fill="#ffd700"/><rect x="11" y="2" width="3" height="13" fill="#ffd700"/></svg>';
  }
  // ===== STATS VIEW =====
  function renderStats() {
    var statsView = document.getElementById('stats-view');
    var stats = Game.Storage.getStats();
    var data = Game.Storage.getData();
    var html = '<div class="stats-container">';
    html += '<div class="stats-header">';
    html += '<button class="btn btn-secondary" id="btn-stats-back">Back to Map</button>';
    html += '<h2>Statistics</h2>';
    html += '</div>';
    // Overall stats
    html += '<div class="stats-card">';
    html += '<h3>Overall</h3>';
    html += '<div class="stats-grid">';
    html += '<div class="stat-item"><div class="stat-value">' + stats.totalCorrect + '</div><div class="stat-label">Correct</div></div>';
    html += '<div class="stat-item"><div class="stat-value">' + stats.totalAttempts + '</div><div class="stat-label">Attempts</div></div>';
    html += '<div class="stat-item"><div class="stat-value">' + stats.totalReveals + '</div><div class="stat-label">Reveals</div></div>';
    html += '<div class="stat-item"><div class="stat-value">' + Game.Storage.getLevelsBeatenCount() + '/6</div><div class="stat-label">Levels</div></div>';
    html += '</div>';
    html += '</div>';
    // Per-level stats
    html += '<div class="stats-card">';
    html += '<h3>Per Level</h3>';
    html += '<table class="stats-table">';
    html += '<thead><tr><th>Level</th><th>Status</th><th>Attempts</th><th>Best Run</th></tr></thead>';
    html += '<tbody>';
    for (var i = 1; i <= 6; i++) {
      var ld = data.levels[String(i)];
      var statusText = ld.beaten ? 'Beaten' : (Game.Storage.isLevelUnlocked(i) ? 'Unlocked' : 'Locked');
      var statusClass = ld.beaten ? 'stat-beaten' : (Game.Storage.isLevelUnlocked(i) ? 'stat-unlocked' : 'stat-locked');
      var bestRun = ld.bestRun ? (ld.bestRun.correct + ' correct, ' + ld.bestRun.wrong + ' wrong, ' + ld.bestRun.reveals + ' reveals') : '-';
      html += '<tr>';
      html += '<td>' + LEVEL_NAMES[i] + '</td>';
      html += '<td class="' + statusClass + '">' + statusText + '</td>';
      html += '<td>' + ld.attempts + '</td>';
      html += '<td>' + bestRun + '</td>';
      html += '</tr>';
    }
    html += '</tbody></table>';
    html += '</div>';
    // Reset button
    html += '<div class="stats-reset">';
    html += '<button class="btn btn-danger" id="btn-reset">Reset All Progress</button>';
    html += '</div>';
    html += '</div>';
    statsView.innerHTML = html;
    document.getElementById('btn-stats-back').addEventListener('click', function() {
      Game.App.navigate('map');
    });
    document.getElementById('btn-reset').addEventListener('click', function() {
      if (confirm('Are you sure? This will reset ALL progress and cannot be undone.')) {
        Game.Storage.resetAll();
        Game.App.navigate('map');
      }
    });
  }
  // ===== BATTLE VIEW =====
  function renderBattle(levelNum) {
    var battleView = document.getElementById('battle-view');
    var state = Game.Engine.getState();
    if (!state) return;
    var html = '<div class="battle-container">';
    // Top bar
    html += '<div class="battle-header">';
    html += '<button class="btn btn-secondary btn-sm" id="btn-back-map">Retreat</button>';
    html += '<div class="battle-title">' + LEVEL_NAMES[levelNum] + '</div>';
    html += '<button class="btn-icon" id="btn-mute-battle">' + getMuteIcon() + '</button>';
    html += '</div>';
    // Battle arena
    html += '<div class="battle-arena">';
    html += renderTrack(state);
    html += '</div>';
    // Question area
    html += '<div class="question-area" id="question-area"></div>';
    html += '</div>';
    battleView.innerHTML = html;
    // Render current question
    renderQuestion();
    // Init drag system
    Game.Drag.init(document.getElementById('question-area'), function() {
      // On change callback — nothing special needed
    });
    // Event listeners
    document.getElementById('btn-back-map').addEventListener('click', function() {
      if (confirm('Leave this battle? Your progress will be lost.')) {
        Game.App.navigate('map');
      }
    });
    document.getElementById('btn-mute-battle').addEventListener('click', function() {
      Game.Storage.setMuted(!Game.Storage.isMuted());
      document.getElementById('btn-mute-battle').innerHTML = getMuteIcon();
    });
  }
  function renderTrack(state) {
    var trackSize = Game.Engine.TRACK_SIZE;
    var html = '<div class="track-wrapper">';
    // George sprite
    html += '<div class="sprite-george" id="sprite-george" style="left:' + posToPercent(state.georgePos, trackSize) + '%">';
    html += Game.Sprites.createGeorge(48);
    html += '</div>';
    // Dragon sprite
    html += '<div class="sprite-dragon" id="sprite-dragon" style="left:' + posToPercent(state.dragonPos, trackSize) + '%">';
    html += Game.Sprites.createDragon(48);
    html += '</div>';
    // Track cells
    html += '<div class="track-cells" id="track-cells">';
    for (var i = 1; i <= trackSize; i++) {
      var cls = 'track-cell';
      if (i <= state.georgePos) cls += ' george-territory';
      else if (i >= state.dragonPos) cls += ' dragon-territory';
      html += '<div class="' + cls + '"></div>';
    }
    html += '</div>';
    // Attack effects
    html += '<div class="attack-effect" id="attack-effect"></div>';
    html += '</div>';
    return html;
  }
  function posToPercent(pos, trackSize) {
    // pos is 1-based, map to 0-100%
    return ((pos - 1) / (trackSize - 1)) * 100;
  }
  function updateTrack() {
    var state = Game.Engine.getState();
    if (!state) return;
    var trackSize = Game.Engine.TRACK_SIZE;
    // Update sprite positions
    var george = document.getElementById('sprite-george');
    var dragon = document.getElementById('sprite-dragon');
    if (george) george.style.left = posToPercent(state.georgePos, trackSize) + '%';
    if (dragon) dragon.style.left = posToPercent(state.dragonPos, trackSize) + '%';
    // Update track cell colors
    var cells = document.querySelectorAll('.track-cell');
    cells.forEach(function(cell, idx) {
      var pos = idx + 1;
      cell.className = 'track-cell';
      if (pos <= state.georgePos) cell.classList.add('george-territory');
      else if (pos >= state.dragonPos) cell.classList.add('dragon-territory');
    });
  }
  function showAttackEffect(type) {
    var effect = document.getElementById('attack-effect');
    if (!effect) return;
    if (type === 'sword') {
      effect.innerHTML = Game.Sprites.createSwordSlash(40);
      effect.className = 'attack-effect show sword-effect';
    } else if (type === 'fire') {
      effect.innerHTML = Game.Sprites.createFireBreath(60);
      effect.className = 'attack-effect show fire-effect';
    }
    setTimeout(function() {
      effect.className = 'attack-effect';
      effect.innerHTML = '';
    }, 600);
  }
  // ===== QUESTION RENDERING =====
  function renderQuestion() {
    var state = Game.Engine.getState();
    if (!state) return;
    var problem = Game.Engine.getCurrentProblem();
    var levelData = state.levelData;
    var area = document.getElementById('question-area');
    if (!area) return;
    var html = '';
    // Problem name
    html += '<div class="question-header">';
    if (problem.name) {
      html += '<span class="question-name">' + problem.name + '</span>';
    }
    if (problem.code) {
      html += '<span class="question-code">' + problem.code + '</span>';
    }
    html += '</div>';
    // Instructions
    if (levelData.instructions) {
      html += '<div class="question-instructions">' + levelData.instructions + '</div>';
    }
    // Premise rows
    html += '<div class="premises-container">';
    problem.rows.forEach(function(row, rowIdx) {
      html += '<div class="premise-row">';
      html += '<div class="premise-label">' + row.label + '</div>';
      html += '<div class="premise-content">';
      html += '<span class="premise-text">' + row.quantifier + '</span>';
      html += '<div class="drop-zone" data-zone-id="zone-' + rowIdx + '-subject" draggable="false"></div>';
      html += '<span class="premise-text">' + row.copula + '</span>';
      html += '<div class="drop-zone" data-zone-id="zone-' + rowIdx + '-predicate" draggable="false"></div>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
    // Token tray
    html += '<div class="token-tray">';
    html += '<div class="token-tray-label">Drag or click to place:</div>';
    html += '<div class="token-list">';
    var tokens = levelData.tokens || [];
    // For levels with per-problem terms
    if (problem.terms) {
      tokens = problem.terms.slice();
      if (problem.distractors) {
        tokens = tokens.concat(problem.distractors);
      }
      // Shuffle the tokens so distractors aren't always at the end
      shuffleArray(tokens);
    }
    tokens.forEach(function(token) {
      var isImage = levelData.tokenType === 'image';
      html += '<div class="game-token" draggable="true" ';
      html += 'data-token-id="' + token.id + '" ';
      html += 'data-token-label="' + (token.label || token.id) + '" ';
      html += 'data-token-color="' + (token.color || Game.Sprites.hashColor(token.id)) + '" ';
      html += 'data-token-sublabel="' + (token.sublabel || '') + '" ';
      html += 'data-token-type="' + (isImage ? 'image' : 'notation') + '">';
      if (isImage) {
        html += '<div class="token-image">' + Game.Sprites.createTermToken(token.id, token.label, 36) + '</div>';
        html += '<div class="token-text">' + (token.label || token.id) + '</div>';
      } else {
        html += '<div class="token-notation" style="background:' + (token.color || '#666') + '">';
        html += '<span class="token-letter">' + (token.label || token.id) + '</span>';
        html += '</div>';
        if (token.sublabel) {
          html += '<div class="token-sublabel">' + token.sublabel + '</div>';
        }
      }
      html += '</div>';
    });
    html += '</div></div>';
    // Action buttons
    html += '<div class="action-buttons">';
    html += '<button class="btn btn-primary" id="btn-check">Check</button>';
    html += '<button class="btn btn-warning" id="btn-reveal">Reveal</button>';
    html += '<button class="btn btn-secondary" id="btn-reset-q">Reset</button>';
    html += '<button class="btn btn-primary hidden" id="btn-next">Next</button>';
    html += '</div>';
    area.innerHTML = html;
    // Wire up buttons
    document.getElementById('btn-check').addEventListener('click', handleCheck);
    document.getElementById('btn-reveal').addEventListener('click', handleRevealClick);
    document.getElementById('btn-reset-q').addEventListener('click', function() {
      Game.Drag.clearAllZones(area);
    });
    document.getElementById('btn-next').addEventListener('click', handleNext);
  }
  function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
  }
  function handleCheck() {
    var state = Game.Engine.getState();
    if (!state || state.gameOver) return;
    var area = document.getElementById('question-area');
    var answers = Game.Drag.getAnswers(area);
    // Check if all zones are filled
    var allFilled = true;
    Object.keys(answers).forEach(function(key) {
      if (!answers[key]) allFilled = false;
    });
    if (!allFilled) {
      // Flash empty zones
      area.querySelectorAll('.drop-zone').forEach(function(zone) {
        if (!zone.dataset.filled) {
          zone.classList.add('shake');
          setTimeout(function() { zone.classList.remove('shake'); }, 500);
        }
      });
      return;
    }
    var result = Game.Engine.checkAnswer(answers);
    Game.Drag.markFeedback(area, result.results);
    if (result.allCorrect) {
      var moveResult = Game.Engine.handleCorrect();
      if (moveResult.action === 'win') {
        Game.Sound.playCorrect();
        showAttackEffect('sword');
        setTimeout(function() {
          updateTrack();
          showWinOverlay();
        }, 400);
      } else if (moveResult.action === 'retry-correct') {
        // Correct after retry — no movement, lock and show Next
        Game.Drag.lockAllZones(area);
        showNextButton();
      } else {
        // First-try correct — advance, lock, and show Next
        Game.Sound.playCorrect();
        showAttackEffect('sword');
        setTimeout(function() {
          updateTrack();
          Game.Drag.lockAllZones(area);
          showNextButton();
        }, 400);
      }
    } else {
      var moveResult = Game.Engine.handleWrong();
      if (moveResult.action === 'lose') {
        Game.Sound.playWrong();
        showAttackEffect('fire');
        setTimeout(function() {
          updateTrack();
          showLoseOverlay();
        }, 400);
      } else if (moveResult.action === 'wrong') {
        // First wrong — penalty applied, student can retry
        Game.Sound.playWrong();
        showAttackEffect('fire');
        setTimeout(function() {
          updateTrack();
        }, 400);
      }
      // retry-wrong: feedback already updated via markFeedback above
    }
  }
  function handleRevealClick() {
    var state = Game.Engine.getState();
    if (!state || state.gameOver || state.questionState.revealed) return;
    var area = document.getElementById('question-area');
    var problem = Game.Engine.getCurrentProblem();
    Game.Drag.showCorrectAnswers(area, problem, state.levelData);
    Game.Drag.lockAllZones(area);
    var moveResult = Game.Engine.handleReveal();
    Game.Sound.playReveal();
    setTimeout(function() {
      updateTrack();
      if (moveResult.action === 'lose') {
        showLoseOverlay();
      } else {
        showNextButton();
      }
    }, 400);
  }
  function showNextButton() {
    var btnCheck = document.getElementById('btn-check');
    var btnReveal = document.getElementById('btn-reveal');
    var btnReset = document.getElementById('btn-reset-q');
    var btnNext = document.getElementById('btn-next');
    if (btnCheck) btnCheck.classList.add('hidden');
    if (btnReveal) btnReveal.classList.add('hidden');
    if (btnReset) btnReset.classList.add('hidden');
    if (btnNext) btnNext.classList.remove('hidden');
  }
  function handleNext() {
    Game.Engine.nextQuestion();
    renderQuestion();
    Game.Drag.init(document.getElementById('question-area'), function() {});
  }
  // ===== WIN/LOSE OVERLAYS =====
  function showWinOverlay() {
    var state = Game.Engine.getState();
    Game.Sound.playWin();
    var overlay = document.createElement('div');
    overlay.className = 'game-overlay';
    overlay.innerHTML = '<div class="overlay-content win-overlay">' +
      '<div class="overlay-sprite">' + Game.Sprites.createGeorge(96) + '</div>' +
      '<h2>Victory!</h2>' +
      '<p>The dragon has been defeated!</p>' +
      '<div class="run-stats">' +
      '<div class="stat-item"><span class="stat-value">' + state.runStats.correct + '</span><span class="stat-label">Correct</span></div>' +
      '<div class="stat-item"><span class="stat-value">' + state.runStats.wrong + '</span><span class="stat-label">Wrong</span></div>' +
      '<div class="stat-item"><span class="stat-value">' + state.runStats.reveals + '</span><span class="stat-label">Reveals</span></div>' +
      '</div>' +
      '<button class="btn btn-primary" id="btn-win-map">Return to Map</button>' +
      '</div>';
    document.getElementById('battle-view').appendChild(overlay);
    document.getElementById('btn-win-map').addEventListener('click', function() {
      Game.App.navigate('map');
    });
  }
  function showLoseOverlay() {
    var state = Game.Engine.getState();
    Game.Sound.playLose();
    var overlay = document.createElement('div');
    overlay.className = 'game-overlay';
    overlay.innerHTML = '<div class="overlay-content lose-overlay">' +
      '<div class="overlay-sprite">' + Game.Sprites.createDragon(96) + '</div>' +
      '<h2>Defeated!</h2>' +
      '<p>The dragon has won this time! Study up and try again.</p>' +
      '<div class="overlay-buttons">' +
      '<button class="btn btn-primary" id="btn-retry">Retry Level</button>' +
      '<button class="btn btn-secondary" id="btn-lose-map">Return to Map</button>' +
      '</div>' +
      '</div>';
    document.getElementById('battle-view').appendChild(overlay);
    document.getElementById('btn-retry').addEventListener('click', function() {
      Game.App.navigate('battle', { level: state.levelNum });
    });
    document.getElementById('btn-lose-map').addEventListener('click', function() {
      Game.App.navigate('map');
    });
  }
  // ===== ERROR OVERLAY =====
  function showError(message) {
    var battleView = document.getElementById('battle-view');
    battleView.innerHTML = '<div class="error-container">' +
      '<h2>Oops!</h2>' +
      '<p>' + message + '</p>' +
      '<button class="btn btn-primary" id="btn-error-back">Return to Map</button>' +
      '</div>';
    document.getElementById('btn-error-back').addEventListener('click', function() {
      Game.App.navigate('map');
    });
  }
  Game.UI = {
    renderMap: renderMap,
    renderBattle: renderBattle,
    renderStats: renderStats,
    renderQuestion: renderQuestion,
    updateTrack: updateTrack,
    showError: showError,
    LEVEL_NAMES: LEVEL_NAMES
  };
})();
