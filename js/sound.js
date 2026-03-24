// Web Audio API sound effects for George and the Dragon
(function() {
  'use strict';

  var ctx = null;

  function ensureContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  function playTone(freq, duration, type, startTime, gainVal) {
    var c = ensureContext();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainVal || 0.15, startTime || c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, (startTime || c.currentTime) + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(startTime || c.currentTime);
    osc.stop((startTime || c.currentTime) + duration);
  }

  function playNoise(duration, startTime, gainVal) {
    var c = ensureContext();
    var bufferSize = c.sampleRate * duration;
    var buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    var source = c.createBufferSource();
    source.buffer = buffer;
    var gain = c.createGain();
    gain.gain.setValueAtTime(gainVal || 0.1, startTime || c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, (startTime || c.currentTime) + duration);
    source.connect(gain);
    gain.connect(c.destination);
    source.start(startTime || c.currentTime);
  }

  // Sword clang — short metallic hit
  function playCorrect() {
    if (Game.Storage.isMuted()) return;
    var c = ensureContext();
    var t = c.currentTime;
    playTone(800, 0.08, 'square', t, 0.2);
    playTone(1200, 0.06, 'square', t + 0.02, 0.15);
    playNoise(0.05, t, 0.08);
    playTone(600, 0.15, 'triangle', t + 0.05, 0.1);
  }

  // Fire breath — descending noise burst
  function playWrong() {
    if (Game.Storage.isMuted()) return;
    var c = ensureContext();
    var t = c.currentTime;
    playNoise(0.3, t, 0.15);
    playTone(200, 0.3, 'sawtooth', t, 0.1);
    playTone(100, 0.2, 'sawtooth', t + 0.1, 0.08);
  }

  // Soft negative tone
  function playReveal() {
    if (Game.Storage.isMuted()) return;
    var c = ensureContext();
    var t = c.currentTime;
    playTone(400, 0.15, 'sine', t, 0.12);
    playTone(300, 0.2, 'sine', t + 0.15, 0.1);
  }

  // Victory fanfare — ascending 4-note
  function playWin() {
    if (Game.Storage.isMuted()) return;
    var c = ensureContext();
    var t = c.currentTime;
    playTone(523, 0.15, 'square', t, 0.15);
    playTone(659, 0.15, 'square', t + 0.18, 0.15);
    playTone(784, 0.15, 'square', t + 0.36, 0.15);
    playTone(1047, 0.4, 'square', t + 0.54, 0.18);
  }

  // Defeat — descending sad notes
  function playLose() {
    if (Game.Storage.isMuted()) return;
    var c = ensureContext();
    var t = c.currentTime;
    playTone(400, 0.25, 'square', t, 0.12);
    playTone(350, 0.25, 'square', t + 0.3, 0.12);
    playTone(300, 0.25, 'square', t + 0.6, 0.12);
    playTone(200, 0.5, 'square', t + 0.9, 0.1);
  }

  // Door click — short blip
  function playDoorClick() {
    if (Game.Storage.isMuted()) return;
    var c = ensureContext();
    var t = c.currentTime;
    playTone(600, 0.05, 'square', t, 0.12);
    playTone(800, 0.08, 'square', t + 0.05, 0.1);
  }

  // Garden unlock — magical ascending scale
  function playGardenUnlock() {
    if (Game.Storage.isMuted()) return;
    var c = ensureContext();
    var t = c.currentTime;
    var notes = [523, 587, 659, 698, 784, 880, 988, 1047];
    for (var i = 0; i < notes.length; i++) {
      playTone(notes[i], 0.2, 'sine', t + i * 0.12, 0.12);
    }
    playTone(1047, 0.6, 'triangle', t + notes.length * 0.12, 0.15);
  }

  Game.Sound = {
    playCorrect: playCorrect,
    playWrong: playWrong,
    playReveal: playReveal,
    playWin: playWin,
    playLose: playLose,
    playDoorClick: playDoorClick,
    playGardenUnlock: playGardenUnlock,
    ensureContext: ensureContext
  };
})();
