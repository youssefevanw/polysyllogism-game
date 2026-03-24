// Core game engine for George and the Dragon
(function() {
  'use strict';

  var TRACK_SIZE = 22;
  var GEORGE_START = 11;
  var DRAGON_START = 12;
  var WIN_POS = 22;   // Dragon pushed here = win
  var LOSE_POS = 1;   // George pushed here = lose

  var state = null;

  function createState(levelNum, levelData) {
    // Shuffle problems
    var problems = levelData.problems.slice();
    shuffle(problems);

    return {
      levelNum: levelNum,
      levelData: levelData,
      problems: problems,
      currentIndex: 0,
      georgePos: GEORGE_START,
      dragonPos: DRAGON_START,
      runStats: { correct: 0, wrong: 0, reveals: 0 },
      questionState: createQuestionState(),
      gameOver: false,
      won: false
    };
  }

  function createQuestionState() {
    return {
      firstAttemptMade: false,
      penaltyApplied: false,
      solved: false,
      revealed: false
    };
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function startBattle(levelNum, levelData) {
    state = createState(levelNum, levelData);
    return state;
  }

  function getState() {
    return state;
  }

  function getCurrentProblem() {
    if (!state) return null;
    return state.problems[state.currentIndex % state.problems.length];
  }

  function checkAnswer(userAnswers) {
    // userAnswers: array of {zoneId, value} or object mapping zoneId to value
    // Returns: { allCorrect, results: [{zoneId, correct, expected, got}] }
    if (!state || state.gameOver) return null;

    var problem = getCurrentProblem();
    var results = [];
    var allCorrect = true;

    // Build expected answers from problem rows
    var expected = {};
    problem.rows.forEach(function(row, rowIdx) {
      // subject zone
      var subjKey = 'zone-' + rowIdx + '-subject';
      var subjAnswer = Array.isArray(row.subject) ? row.subject : [row.subject];
      expected[subjKey] = subjAnswer;

      // predicate zone
      var predKey = 'zone-' + rowIdx + '-predicate';
      var predAnswer = Array.isArray(row.predicate) ? row.predicate : [row.predicate];
      expected[predKey] = predAnswer;
    });

    Object.keys(expected).forEach(function(zoneId) {
      var got = userAnswers[zoneId] || '';
      var exp = expected[zoneId];
      var isCorrect = exp.indexOf(got) !== -1;
      if (!isCorrect) allCorrect = false;
      results.push({ zoneId: zoneId, correct: isCorrect, expected: exp, got: got });
    });

    return { allCorrect: allCorrect, results: results };
  }

  function handleCorrect() {
    if (!state || state.gameOver) return null;

    var qs = state.questionState;

    if (qs.penaltyApplied) {
      // Correct after retry — no movement, just mark solved
      qs.solved = true;
      return { action: 'retry-correct', georgePos: state.georgePos, dragonPos: state.dragonPos };
    }

    // First-try correct — both shift right
    state.georgePos++;
    state.dragonPos++;
    state.runStats.correct++;
    qs.solved = true;
    qs.firstAttemptMade = true;

    // Check win
    if (state.dragonPos >= WIN_POS) {
      state.dragonPos = WIN_POS;
      state.gameOver = true;
      state.won = true;
      Game.Storage.recordWin(state.levelNum, state.runStats);
      return { action: 'win', georgePos: state.georgePos, dragonPos: state.dragonPos };
    }

    return { action: 'correct', georgePos: state.georgePos, dragonPos: state.dragonPos };
  }

  function handleWrong() {
    if (!state || state.gameOver) return null;

    var qs = state.questionState;

    if (qs.penaltyApplied) {
      // Retry wrong — no movement
      return { action: 'retry-wrong', georgePos: state.georgePos, dragonPos: state.dragonPos };
    }

    // First wrong — both shift left
    state.georgePos--;
    state.dragonPos--;
    state.runStats.wrong++;
    qs.firstAttemptMade = true;
    qs.penaltyApplied = true;

    // Check lose
    if (state.georgePos <= LOSE_POS) {
      state.georgePos = LOSE_POS;
      state.gameOver = true;
      state.won = false;
      Game.Storage.recordLoss(state.levelNum, state.runStats);
      return { action: 'lose', georgePos: state.georgePos, dragonPos: state.dragonPos };
    }

    return { action: 'wrong', georgePos: state.georgePos, dragonPos: state.dragonPos };
  }

  function handleReveal() {
    if (!state || state.gameOver) return null;

    var qs = state.questionState;

    if (!qs.penaltyApplied) {
      // Reveal counts as a penalty — both shift left
      state.georgePos--;
      state.dragonPos--;
      state.runStats.reveals++;
    }

    qs.revealed = true;
    qs.solved = true;

    // Check lose
    if (state.georgePos <= LOSE_POS) {
      state.georgePos = LOSE_POS;
      state.gameOver = true;
      state.won = false;
      Game.Storage.recordLoss(state.levelNum, state.runStats);
      return { action: 'lose', georgePos: state.georgePos, dragonPos: state.dragonPos };
    }

    return { action: 'revealed', georgePos: state.georgePos, dragonPos: state.dragonPos };
  }

  function nextQuestion() {
    if (!state || state.gameOver) return null;

    state.currentIndex++;
    // If we've used all problems, reshuffle
    if (state.currentIndex >= state.problems.length) {
      shuffle(state.problems);
      state.currentIndex = 0;
    }
    state.questionState = createQuestionState();
    return getCurrentProblem();
  }

  function getTrackSize() {
    return TRACK_SIZE;
  }

  Game.Engine = {
    startBattle: startBattle,
    getState: getState,
    getCurrentProblem: getCurrentProblem,
    checkAnswer: checkAnswer,
    handleCorrect: handleCorrect,
    handleWrong: handleWrong,
    handleReveal: handleReveal,
    nextQuestion: nextQuestion,
    getTrackSize: getTrackSize,
    TRACK_SIZE: TRACK_SIZE,
    WIN_POS: WIN_POS,
    LOSE_POS: LOSE_POS
  };
})();
