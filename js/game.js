// Core game engine for George and the Dragon
(function() {
  'use strict';

  var LOSE_POS = 1;   // George pushed here = lose

  var state = null;

  function createState(levelNum, levelData, questionCount) {
    questionCount = questionCount || 10;
    var trackSize = (questionCount * 2) + 2;
    var georgeStart = Math.floor(trackSize / 2);
    var dragonStart = georgeStart + 1;

    // Shuffle and select problems
    var allProblems = levelData.problems.slice();
    shuffle(allProblems);
    var problems;
    if (allProblems.length >= questionCount) {
      problems = allProblems.slice(0, questionCount);
    } else {
      // Cycle through problems if fewer than requested
      problems = [];
      while (problems.length < questionCount) {
        shuffle(allProblems);
        for (var i = 0; i < allProblems.length && problems.length < questionCount; i++) {
          problems.push(allProblems[i]);
        }
      }
    }

    return {
      levelNum: levelNum,
      levelData: levelData,
      problems: problems,
      currentIndex: 0,
      trackSize: trackSize,
      georgePos: georgeStart,
      dragonPos: dragonStart,
      questionCount: questionCount,
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

  function startBattle(levelNum, levelData, questionCount) {
    state = createState(levelNum, levelData, questionCount);
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

    // Build expected answers from problem rows (bridge-aware)
    var expected = {};
    var flatIdx = 0;
    problem.rows.forEach(function(row) {
      if (row.type === 'bridge') {
        row.rows.forEach(function(subRow) {
          var subjKey = 'zone-' + flatIdx + '-subject';
          var subjAnswer = Array.isArray(subRow.subject) ? subRow.subject : [subRow.subject];
          expected[subjKey] = subjAnswer;
          var predKey = 'zone-' + flatIdx + '-predicate';
          var predAnswer = Array.isArray(subRow.predicate) ? subRow.predicate : [subRow.predicate];
          expected[predKey] = predAnswer;
          flatIdx++;
        });
      } else {
        var subjKey = 'zone-' + flatIdx + '-subject';
        var subjAnswer = Array.isArray(row.subject) ? row.subject : [row.subject];
        expected[subjKey] = subjAnswer;
        var predKey = 'zone-' + flatIdx + '-predicate';
        var predAnswer = Array.isArray(row.predicate) ? row.predicate : [row.predicate];
        expected[predKey] = predAnswer;
        flatIdx++;
      }
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
    if (state.dragonPos >= state.trackSize) {
      state.dragonPos = state.trackSize;
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
    return state ? state.trackSize : 22;
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
    LOSE_POS: LOSE_POS
  };
})();
