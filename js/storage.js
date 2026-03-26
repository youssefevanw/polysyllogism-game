// localStorage wrapper for George and the Dragon
(function() {
  'use strict';

  var STORAGE_KEY = 'georgeAndDragon';
  var CURRENT_VERSION = 3;

  var MAIN_LEVELS = [1, 2, 3, 4];
  var SIDE_QUESTS = ['sq-a', 'sq-b'];
  var ALL_LEVELS = [1, 2, 3, 4, 'sq-a', 'sq-b'];

  function defaultLevelEntry() {
    return { beaten: false, attempts: 0, bestRun: null, bestTime: null };
  }

  var DEFAULT_DATA = {
    version: CURRENT_VERSION,
    muted: false,
    timerVisible: true,
    levels: {
      '1': defaultLevelEntry(),
      '2': defaultLevelEntry(),
      '3': defaultLevelEntry(),
      '4': defaultLevelEntry(),
      'sq-a': defaultLevelEntry(),
      'sq-b': defaultLevelEntry()
    },
    stats: {
      totalCorrect: 0,
      totalAttempts: 0,
      totalReveals: 0,
      totalTimePlayed: 0
    }
  };

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  // Migrate from v2 (6 linear levels) to v3 (4 main + 2 side quests)
  function migrateV2toV3(oldData) {
    var data = deepClone(DEFAULT_DATA);
    // Preserve settings
    data.muted = !!oldData.muted;
    // Preserve cumulative stats
    if (oldData.stats) {
      data.stats.totalCorrect = oldData.stats.totalCorrect || 0;
      data.stats.totalAttempts = oldData.stats.totalAttempts || 0;
      data.stats.totalReveals = oldData.stats.totalReveals || 0;
      data.stats.totalTimePlayed = oldData.stats.totalTimePlayed || 0;
    }
    // Map old levels to new structure
    // Old 1 (Syllogisms: Notated)  → New 1 (same)
    // Old 2 (Syllogisms: Terms)    → New sq-a
    // Old 3 (Syllogism Pairings)   → New 2
    // Old 4 (Polysyllogisms)       → New 3
    // Old 5, 6 (sorites stubs)     → discard
    var oldLevels = oldData.levels || {};
    if (oldLevels['1']) {
      data.levels['1'] = copyLevel(oldLevels['1']);
    }
    if (oldLevels['2']) {
      data.levels['sq-a'] = copyLevel(oldLevels['2']);
    }
    if (oldLevels['3']) {
      data.levels['2'] = copyLevel(oldLevels['3']);
    }
    if (oldLevels['4']) {
      data.levels['3'] = copyLevel(oldLevels['4']);
    }
    // New level 4 and sq-b start fresh
    data.version = CURRENT_VERSION;
    return data;
  }

  function copyLevel(old) {
    return {
      beaten: !!old.beaten,
      attempts: old.attempts || 0,
      bestRun: old.bestRun ? {
        correct: old.bestRun.correct || 0,
        wrong: old.bestRun.wrong || 0,
        reveals: old.bestRun.reveals || 0
      } : null,
      bestTime: old.bestTime || null
    };
  }

  function init() {
    var data = load();
    if (!data) {
      data = deepClone(DEFAULT_DATA);
      save(data);
    } else if (data.version === 2) {
      data = migrateV2toV3(data);
      save(data);
    } else if (data.version !== CURRENT_VERSION) {
      data = deepClone(DEFAULT_DATA);
      save(data);
    }
    return data;
  }

  function getData() {
    var data = load();
    if (!data) data = init();
    return data;
  }

  function setData(data) {
    save(data);
  }

  function isMuted() {
    return getData().muted;
  }

  function setMuted(val) {
    var data = getData();
    data.muted = !!val;
    setData(data);
  }

  function isTimerVisible() {
    var data = getData();
    return data.timerVisible !== false;
  }

  function setTimerVisible(val) {
    var data = getData();
    data.timerVisible = !!val;
    setData(data);
  }

  function getLevelData(levelId) {
    var data = getData();
    return data.levels[String(levelId)] || null;
  }

  // Unlock rules:
  // Level 1: always unlocked
  // Level 2: Level 1 beaten
  // Level 3: Level 2 beaten
  // Level 4: Level 3 beaten
  // Side Quest A: Level 1 beaten
  // Side Quest B: Level 3 beaten
  var UNLOCK_REQUIREMENTS = {
    1: null,
    2: 1,
    3: 2,
    4: 3,
    'sq-a': 1,
    'sq-b': 3
  };

  function isLevelUnlocked(levelId) {
    var key = String(levelId);
    if (key === '1') return true;
    var req = UNLOCK_REQUIREMENTS[key];
    if (req === null || req === undefined) return false;
    var reqData = getLevelData(req);
    return reqData && reqData.beaten;
  }

  function isLevelBeaten(levelId) {
    var ld = getLevelData(levelId);
    return ld && ld.beaten;
  }

  function allLevelsBeaten() {
    for (var i = 0; i < MAIN_LEVELS.length; i++) {
      if (!isLevelBeaten(MAIN_LEVELS[i])) return false;
    }
    return true;
  }

  function recordWin(levelId, runStats, elapsedTime) {
    var data = getData();
    var ld = data.levels[String(levelId)];
    if (!ld) return;
    ld.beaten = true;
    ld.attempts++;
    if (!ld.bestRun || runStats.correct > ld.bestRun.correct ||
        (runStats.correct === ld.bestRun.correct && runStats.wrong < ld.bestRun.wrong)) {
      ld.bestRun = {
        correct: runStats.correct,
        wrong: runStats.wrong,
        reveals: runStats.reveals
      };
    }
    if (elapsedTime != null && (ld.bestTime === null || elapsedTime < ld.bestTime)) {
      ld.bestTime = elapsedTime;
    }
    data.stats.totalCorrect += runStats.correct;
    data.stats.totalAttempts += runStats.correct + runStats.wrong;
    data.stats.totalReveals += runStats.reveals;
    if (elapsedTime != null) {
      data.stats.totalTimePlayed += elapsedTime;
    }
    setData(data);
  }

  function recordLoss(levelId, runStats, elapsedTime) {
    var data = getData();
    var ld = data.levels[String(levelId)];
    if (!ld) return;
    ld.attempts++;
    data.stats.totalCorrect += runStats.correct;
    data.stats.totalAttempts += runStats.correct + runStats.wrong;
    data.stats.totalReveals += runStats.reveals;
    if (elapsedTime != null) {
      data.stats.totalTimePlayed += elapsedTime;
    }
    setData(data);
  }

  function getStats() {
    return getData().stats;
  }

  function getLevelsBeatenCount() {
    var count = 0;
    for (var i = 0; i < MAIN_LEVELS.length; i++) {
      if (isLevelBeaten(MAIN_LEVELS[i])) count++;
    }
    return count;
  }

  function resetAll() {
    var data = deepClone(DEFAULT_DATA);
    save(data);
  }

  function exportCode() {
    var data = getData();
    return btoa(JSON.stringify(data));
  }

  function importCode(code) {
    try {
      var decoded = JSON.parse(atob(code));
      if (!decoded || !decoded.version || !decoded.levels || !decoded.stats) {
        return { success: false, error: 'Invalid save code — try again.' };
      }
      save(decoded);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Invalid save code — try again.' };
    }
  }

  Game.Storage = {
    init: init,
    isMuted: isMuted,
    setMuted: setMuted,
    isTimerVisible: isTimerVisible,
    setTimerVisible: setTimerVisible,
    isLevelUnlocked: isLevelUnlocked,
    isLevelBeaten: isLevelBeaten,
    allLevelsBeaten: allLevelsBeaten,
    getLevelData: getLevelData,
    recordWin: recordWin,
    recordLoss: recordLoss,
    getStats: getStats,
    getLevelsBeatenCount: getLevelsBeatenCount,
    resetAll: resetAll,
    getData: getData,
    exportCode: exportCode,
    importCode: importCode,
    MAIN_LEVELS: MAIN_LEVELS,
    SIDE_QUESTS: SIDE_QUESTS,
    ALL_LEVELS: ALL_LEVELS
  };
})();
