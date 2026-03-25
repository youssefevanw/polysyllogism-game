// localStorage wrapper for George and the Dragon
(function() {
  'use strict';

  var STORAGE_KEY = 'georgeAndDragon';
  var CURRENT_VERSION = 1;

  var DEFAULT_DATA = {
    version: CURRENT_VERSION,
    muted: false,
    levels: {
      '1': { beaten: false, attempts: 0, bestRun: null },
      '2': { beaten: false, attempts: 0, bestRun: null },
      '3': { beaten: false, attempts: 0, bestRun: null },
      '4': { beaten: false, attempts: 0, bestRun: null },
      '5': { beaten: false, attempts: 0, bestRun: null },
      '6': { beaten: false, attempts: 0, bestRun: null }
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

  function init() {
    var data = load();
    if (!data || data.version !== CURRENT_VERSION) {
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

  function getLevelData(levelNum) {
    var data = getData();
    return data.levels[String(levelNum)] || null;
  }

  function isLevelUnlocked(levelNum) {
    if (levelNum === 1) return true;
    var prev = getLevelData(levelNum - 1);
    return prev && prev.beaten;
  }

  function isLevelBeaten(levelNum) {
    var ld = getLevelData(levelNum);
    return ld && ld.beaten;
  }

  function allLevelsBeaten() {
    for (var i = 1; i <= 6; i++) {
      if (!isLevelBeaten(i)) return false;
    }
    return true;
  }

  function recordWin(levelNum, runStats) {
    var data = getData();
    var ld = data.levels[String(levelNum)];
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
    data.stats.totalCorrect += runStats.correct;
    data.stats.totalAttempts += runStats.correct + runStats.wrong;
    data.stats.totalReveals += runStats.reveals;
    setData(data);
  }

  function recordLoss(levelNum, runStats) {
    var data = getData();
    var ld = data.levels[String(levelNum)];
    ld.attempts++;
    data.stats.totalCorrect += runStats.correct;
    data.stats.totalAttempts += runStats.correct + runStats.wrong;
    data.stats.totalReveals += runStats.reveals;
    setData(data);
  }

  function getStats() {
    return getData().stats;
  }

  function getLevelsBeatenCount() {
    var count = 0;
    for (var i = 1; i <= 6; i++) {
      if (isLevelBeaten(i)) count++;
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
    importCode: importCode
  };
})();
