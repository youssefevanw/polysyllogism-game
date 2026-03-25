// Drag-and-drop + click-to-place for George and the Dragon
(function() {
  'use strict';

  var selectedToken = null; // For click-to-place
  var onChangeCallback = null;

  function init(container, onChange) {
    onChangeCallback = onChange || function() {};
    setupDragListeners(container);
    setupClickListeners(container);
  }

  function setupDragListeners(container) {
    // Drag start on tokens
    container.addEventListener('dragstart', function(e) {
      var token = e.target.closest('.game-token');
      if (!token) return;
      e.dataTransfer.setData('text/plain', token.dataset.tokenId);
      e.dataTransfer.effectAllowed = 'copy';
      token.classList.add('dragging');
      clearSelectedToken();
    });

    container.addEventListener('dragend', function(e) {
      var token = e.target.closest('.game-token');
      if (token) token.classList.remove('dragging');
    });

    // Drag over/enter/leave on drop zones
    container.addEventListener('dragover', function(e) {
      var zone = e.target.closest('.drop-zone');
      if (zone && !zone.classList.contains('locked')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        zone.classList.add('dragover');
      }
    });

    container.addEventListener('dragleave', function(e) {
      var zone = e.target.closest('.drop-zone');
      if (zone) zone.classList.remove('dragover');
    });

    // Drop
    container.addEventListener('drop', function(e) {
      e.preventDefault();
      var zone = e.target.closest('.drop-zone');
      if (!zone || zone.classList.contains('locked')) return;
      zone.classList.remove('dragover');

      var tokenId = e.dataTransfer.getData('text/plain');
      if (tokenId) {
        placeToken(zone, tokenId);
      }
    });
  }

  function setupClickListeners(container) {
    container.addEventListener('click', function(e) {
      // Click on token — select it
      var token = e.target.closest('.game-token');
      if (token) {
        if (selectedToken === token) {
          clearSelectedToken();
        } else {
          clearSelectedToken();
          selectedToken = token;
          token.classList.add('selected');
        }
        return;
      }

      // Click on drop zone — place selected token
      var zone = e.target.closest('.drop-zone');
      if (zone && !zone.classList.contains('locked')) {
        if (selectedToken) {
          placeToken(zone, selectedToken.dataset.tokenId);
          clearSelectedToken();
        } else {
          // Click on filled zone to clear it
          if (zone.dataset.filled) {
            clearZone(zone);
          }
        }
        return;
      }
    });
  }

  function placeToken(zone, tokenId) {
    zone.dataset.filled = tokenId;

    // Find the token element to get its display info
    var tokenEl = document.querySelector('.game-token[data-token-id="' + tokenId + '"]');
    var label = tokenId;
    var color = '#666';
    var sublabel = '';
    var isImageToken = false;

    if (tokenEl) {
      label = tokenEl.dataset.tokenLabel || tokenId;
      color = tokenEl.dataset.tokenColor || '#666';
      sublabel = tokenEl.dataset.tokenSublabel || '';
      isImageToken = tokenEl.dataset.tokenType === 'image';
    }

    // Clear existing content
    zone.innerHTML = '';
    zone.className = 'drop-zone filled';
    zone.style.borderColor = color;
    zone.style.background = color + '22';

    if (isImageToken) {
      // Show the term token image + label
      var inner = document.createElement('div');
      inner.className = 'zone-content-image';
      inner.innerHTML = Game.Sprites.createTermToken(tokenId, label, 28);
      var labelEl = document.createElement('span');
      labelEl.className = 'zone-label';
      labelEl.textContent = label;
      inner.appendChild(labelEl);
      zone.appendChild(inner);
    } else {
      // Notation token — show label
      var span = document.createElement('span');
      span.className = 'zone-label';
      span.textContent = label;
      span.style.color = color;
      span.style.fontWeight = 'bold';
      zone.appendChild(span);
    }

    if (onChangeCallback) onChangeCallback();
  }

  function clearZone(zone) {
    zone.dataset.filled = '';
    zone.innerHTML = '';
    zone.className = 'drop-zone';
    zone.style.borderColor = '';
    zone.style.background = '';

    if (onChangeCallback) onChangeCallback();
  }

  function clearSelectedToken() {
    if (selectedToken) {
      selectedToken.classList.remove('selected');
      selectedToken = null;
    }
  }

  function clearAllZones(container) {
    var zones = container.querySelectorAll('.drop-zone');
    zones.forEach(function(zone) {
      clearZone(zone);
    });
    zone_resetFeedback(container);
  }

  function zone_resetFeedback(container) {
    var zones = container.querySelectorAll('.drop-zone');
    zones.forEach(function(zone) {
      zone.classList.remove('correct', 'incorrect');
    });
  }

  function getAnswers(container) {
    var answers = {};
    var zones = container.querySelectorAll('.drop-zone');
    zones.forEach(function(zone) {
      if (zone.dataset.zoneId) {
        answers[zone.dataset.zoneId] = zone.dataset.filled || '';
      }
    });
    return answers;
  }

  function markFeedback(container, results) {
    results.forEach(function(r) {
      var zone = container.querySelector('.drop-zone[data-zone-id="' + r.zoneId + '"]');
      if (!zone) return;
      zone.classList.remove('correct', 'incorrect');
      zone.classList.add(r.correct ? 'correct' : 'incorrect');
    });
  }

  function showCorrectAnswers(container, problem, levelData) {
    var flatIdx = 0;
    problem.rows.forEach(function(row) {
      if (row.type === 'bridge') {
        row.rows.forEach(function(subRow) {
          revealRow(container, subRow, flatIdx, levelData);
          flatIdx++;
        });
      } else {
        revealRow(container, row, flatIdx, levelData);
        flatIdx++;
      }
    });
  }

  function revealRow(container, row, idx, levelData) {
    var subjZone = container.querySelector('.drop-zone[data-zone-id="zone-' + idx + '-subject"]');
    var predZone = container.querySelector('.drop-zone[data-zone-id="zone-' + idx + '-predicate"]');
    var subjAnswer = Array.isArray(row.subject) ? row.subject[0] : row.subject;
    var predAnswer = Array.isArray(row.predicate) ? row.predicate[0] : row.predicate;
    if (subjZone) {
      revealZone(subjZone, subjAnswer, levelData);
      subjZone.classList.add('correct');
    }
    if (predZone) {
      revealZone(predZone, predAnswer, levelData);
      predZone.classList.add('correct');
    }
  }

  function revealZone(zone, answer, levelData) {
    zone.dataset.filled = answer;
    zone.innerHTML = '';
    zone.className = 'drop-zone filled correct';

    // Find token info
    var tokenInfo = null;
    if (levelData.tokens) {
      tokenInfo = levelData.tokens.find(function(t) { return t.id === answer; });
    }

    var isImage = levelData.tokenType === 'image';

    if (isImage && tokenInfo) {
      var inner = document.createElement('div');
      inner.className = 'zone-content-image';
      inner.innerHTML = Game.Sprites.createTermToken(answer, tokenInfo.label, 28);
      var labelEl = document.createElement('span');
      labelEl.className = 'zone-label';
      labelEl.textContent = tokenInfo.label;
      inner.appendChild(labelEl);
      zone.appendChild(inner);
    } else {
      var color = (tokenInfo && tokenInfo.color) || '#4ade80';
      zone.style.borderColor = color;
      zone.style.background = color + '22';
      var span = document.createElement('span');
      span.className = 'zone-label';
      span.textContent = answer;
      span.style.color = color;
      span.style.fontWeight = 'bold';
      zone.appendChild(span);
    }
  }

  function lockAllZones(container) {
    var zones = container.querySelectorAll('.drop-zone');
    zones.forEach(function(zone) {
      zone.classList.add('locked');
    });
  }

  Game.Drag = {
    init: init,
    clearAllZones: clearAllZones,
    getAnswers: getAnswers,
    markFeedback: markFeedback,
    showCorrectAnswers: showCorrectAnswers,
    lockAllZones: lockAllZones,
    resetFeedback: zone_resetFeedback
  };
})();
