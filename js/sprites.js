// SVG sprite generators for George and the Dragon
(function() {
  'use strict';

  // Deterministic color from string hash
  function hashColor(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var hue = Math.abs(hash) % 360;
    return 'hsl(' + hue + ', 65%, 55%)';
  }

  function darken(hslStr, amount) {
    var match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return hslStr;
    var l = Math.max(0, parseInt(match[3]) - amount);
    return 'hsl(' + match[1] + ', ' + match[2] + '%, ' + l + '%)';
  }

  // George the Knight — pixel art SVG
  function createGeorge(size) {
    size = size || 64;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="' + size + '" height="' + size + '" style="image-rendering:pixelated">' +
      // Helmet
      '<rect x="5" y="1" width="5" height="3" fill="#8b8b8b"/>' +
      '<rect x="4" y="2" width="1" height="2" fill="#8b8b8b"/>' +
      '<rect x="10" y="2" width="1" height="1" fill="#8b8b8b"/>' +
      // Visor
      '<rect x="5" y="3" width="4" height="1" fill="#555"/>' +
      '<rect x="6" y="3" width="1" height="1" fill="#ffd700"/>' +
      // Body armor
      '<rect x="5" y="4" width="5" height="4" fill="#6b6b6b"/>' +
      '<rect x="6" y="4" width="3" height="4" fill="#8b8b8b"/>' +
      // Cross on armor
      '<rect x="7" y="5" width="1" height="2" fill="#cc0000"/>' +
      '<rect x="6" y="5" width="3" height="1" fill="#cc0000"/>' +
      // Sword (right side, pointing right)
      '<rect x="10" y="3" width="4" height="1" fill="#c0c0c0"/>' +
      '<rect x="14" y="3" width="1" height="1" fill="#ffd700"/>' +
      '<rect x="9" y="2" width="1" height="3" fill="#8b4513"/>' +
      // Shield (left side)
      '<rect x="2" y="4" width="3" height="4" fill="#1a5276"/>' +
      '<rect x="3" y="5" width="1" height="2" fill="#ffd700"/>' +
      // Legs
      '<rect x="5" y="8" width="2" height="3" fill="#6b6b6b"/>' +
      '<rect x="8" y="8" width="2" height="3" fill="#6b6b6b"/>' +
      // Boots
      '<rect x="5" y="11" width="2" height="1" fill="#4a3728"/>' +
      '<rect x="8" y="11" width="3" height="1" fill="#4a3728"/>' +
      '</svg>';
  }

  // Dragon — pixel art SVG
  function createDragon(size) {
    size = size || 64;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="' + size + '" height="' + size + '" style="image-rendering:pixelated">' +
      // Head
      '<rect x="2" y="3" width="4" height="3" fill="#2d8a4e"/>' +
      '<rect x="1" y="4" width="1" height="2" fill="#2d8a4e"/>' +
      // Eye
      '<rect x="3" y="4" width="1" height="1" fill="#ff4444"/>' +
      // Horns
      '<rect x="4" y="1" width="1" height="2" fill="#3aa55d"/>' +
      '<rect x="2" y="2" width="1" height="1" fill="#3aa55d"/>' +
      // Mouth / fire
      '<rect x="0" y="5" width="2" height="1" fill="#ff6600"/>' +
      // Neck
      '<rect x="5" y="5" width="2" height="2" fill="#2d8a4e"/>' +
      // Body
      '<rect x="6" y="4" width="5" height="5" fill="#2d8a4e"/>' +
      '<rect x="7" y="5" width="3" height="3" fill="#3aa55d"/>' +
      // Belly
      '<rect x="7" y="6" width="3" height="2" fill="#5dc77a"/>' +
      // Wing
      '<rect x="8" y="1" width="3" height="3" fill="#1a6b35"/>' +
      '<rect x="11" y="2" width="2" height="2" fill="#1a6b35"/>' +
      '<rect x="13" y="3" width="1" height="1" fill="#1a6b35"/>' +
      // Tail
      '<rect x="11" y="7" width="2" height="1" fill="#2d8a4e"/>' +
      '<rect x="13" y="6" width="2" height="1" fill="#2d8a4e"/>' +
      '<rect x="14" y="5" width="1" height="1" fill="#3aa55d"/>' +
      // Legs
      '<rect x="7" y="9" width="2" height="2" fill="#2d8a4e"/>' +
      '<rect x="10" y="9" width="2" height="2" fill="#2d8a4e"/>' +
      // Claws
      '<rect x="6" y="11" width="3" height="1" fill="#1a5a30"/>' +
      '<rect x="10" y="11" width="2" height="1" fill="#1a5a30"/>' +
      '</svg>';
  }

  // Fire breath animation sprite
  function createFireBreath(size) {
    size = size || 32;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 4" width="' + size + '" height="' + (size/2) + '" style="image-rendering:pixelated">' +
      '<rect x="0" y="1" width="2" height="2" fill="#ff4400"/>' +
      '<rect x="2" y="0" width="2" height="4" fill="#ff6600"/>' +
      '<rect x="4" y="1" width="2" height="2" fill="#ffaa00"/>' +
      '<rect x="6" y="1" width="2" height="2" fill="#ffdd00"/>' +
      '</svg>';
  }

  // Sword slash animation sprite
  function createSwordSlash(size) {
    size = size || 32;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" width="' + size + '" height="' + size + '" style="image-rendering:pixelated">' +
      '<rect x="1" y="0" width="1" height="1" fill="#fff" opacity="0.8"/>' +
      '<rect x="2" y="1" width="1" height="1" fill="#ffd700"/>' +
      '<rect x="3" y="2" width="1" height="1" fill="#fff"/>' +
      '<rect x="4" y="3" width="1" height="1" fill="#ffd700"/>' +
      '<rect x="5" y="4" width="1" height="1" fill="#fff"/>' +
      '<rect x="6" y="5" width="1" height="1" fill="#ffd700" opacity="0.8"/>' +
      '<rect x="0" y="3" width="1" height="1" fill="#ffd700" opacity="0.5"/>' +
      '<rect x="7" y="2" width="1" height="1" fill="#ffd700" opacity="0.5"/>' +
      '</svg>';
  }

  // Lock icon
  function createLock(size) {
    size = size || 24;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 12" width="' + size + '" height="' + Math.round(size*1.2) + '" style="image-rendering:pixelated">' +
      '<rect x="3" y="1" width="4" height="1" fill="#888"/>' +
      '<rect x="2" y="2" width="1" height="3" fill="#888"/>' +
      '<rect x="7" y="2" width="1" height="3" fill="#888"/>' +
      '<rect x="1" y="5" width="8" height="6" fill="#666"/>' +
      '<rect x="2" y="6" width="6" height="4" fill="#777"/>' +
      '<rect x="4" y="7" width="2" height="2" fill="#444"/>' +
      '</svg>';
  }

  // Star icon
  function createStar(size) {
    size = size || 24;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="' + size + '" height="' + size + '" style="image-rendering:pixelated">' +
      '<rect x="4" y="0" width="2" height="2" fill="#ffd700"/>' +
      '<rect x="2" y="2" width="6" height="2" fill="#ffd700"/>' +
      '<rect x="0" y="4" width="10" height="2" fill="#ffd700"/>' +
      '<rect x="1" y="6" width="3" height="2" fill="#ffd700"/>' +
      '<rect x="6" y="6" width="3" height="2" fill="#ffd700"/>' +
      '<rect x="0" y="8" width="2" height="2" fill="#ffd700"/>' +
      '<rect x="8" y="8" width="2" height="2" fill="#ffd700"/>' +
      '</svg>';
  }

  // Door for castle map
  function createDoor(state, levelNum) {
    // state: 'locked', 'unlocked', 'beaten'
    var doorColor = state === 'locked' ? '#555' : '#8b4513';
    var frameColor = state === 'locked' ? '#444' : '#a0522d';
    var knobColor = state === 'beaten' ? '#ffd700' : '#c0c0c0';

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 24" width="60" height="72" style="image-rendering:pixelated">' +
      // Door frame
      '<rect x="2" y="0" width="16" height="24" fill="' + frameColor + '"/>' +
      // Door
      '<rect x="4" y="2" width="12" height="20" fill="' + doorColor + '"/>' +
      // Planks
      '<rect x="4" y="8" width="12" height="1" fill="' + (state === 'locked' ? '#333' : '#6b3410') + '"/>' +
      '<rect x="4" y="14" width="12" height="1" fill="' + (state === 'locked' ? '#333' : '#6b3410') + '"/>' +
      // Knob
      '<rect x="13" y="10" width="2" height="2" fill="' + knobColor + '"/>' +
      // Arch top
      '<rect x="4" y="0" width="2" height="2" fill="' + frameColor + '"/>' +
      '<rect x="14" y="0" width="2" height="2" fill="' + frameColor + '"/>';

    if (state === 'locked') {
      // Add lock overlay
      svg += '<rect x="7" y="9" width="6" height="5" fill="#666" opacity="0.9"/>' +
        '<rect x="9" y="7" width="2" height="2" fill="#888"/>' +
        '<rect x="8" y="6" width="1" height="2" fill="#888"/>' +
        '<rect x="11" y="6" width="1" height="2" fill="#888"/>' +
        '<rect x="9" y="11" width="2" height="1" fill="#444"/>';
    }

    svg += '</svg>';
    return svg;
  }

  // Term token placeholder (colored rectangle with letter)
  function createTermToken(termId, label, size) {
    size = size || 48;
    var color = hashColor(termId);
    var darkColor = darken(color, 15);
    var letter = (label || termId).charAt(0).toUpperCase();

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="' + size + '" height="' + size + '" style="image-rendering:pixelated">' +
      '<rect x="0" y="0" width="12" height="12" fill="' + darkColor + '"/>' +
      '<rect x="1" y="1" width="10" height="10" fill="' + color + '"/>' +
      '<text x="6" y="8" text-anchor="middle" fill="white" font-family="monospace" font-size="7" font-weight="bold">' + letter + '</text>' +
      '</svg>';
  }

  // Battle track cell
  function createTrackCell(active) {
    var fill = active ? '#2a2a4a' : '#1a1a2e';
    return '<div style="width:100%;height:100%;background:' + fill + ';border:1px solid #333;box-sizing:border-box"></div>';
  }

  // Garden scene (locked)
  function createGardenLocked(width, height) {
    width = width || 300;
    height = height || 100;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 20" width="' + width + '" height="' + height + '" style="image-rendering:pixelated">' +
      '<rect x="0" y="0" width="60" height="20" fill="#1a1a2e"/>' +
      '<rect x="0" y="14" width="60" height="6" fill="#333"/>' +
      '<text x="30" y="10" text-anchor="middle" fill="#555" font-family="monospace" font-size="4">? ? ?</text>' +
      '</svg>';
  }

  // Garden scene (unlocked)
  function createGardenUnlocked(width, height) {
    width = width || 300;
    height = height || 100;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 20" width="' + width + '" height="' + height + '" style="image-rendering:pixelated">' +
      // Sky
      '<rect x="0" y="0" width="60" height="14" fill="#87ceeb"/>' +
      // Sun
      '<rect x="48" y="2" width="4" height="4" fill="#ffd700"/>' +
      '<rect x="47" y="3" width="1" height="2" fill="#ffd700"/>' +
      '<rect x="52" y="3" width="1" height="2" fill="#ffd700"/>' +
      '<rect x="49" y="1" width="2" height="1" fill="#ffd700"/>' +
      '<rect x="49" y="6" width="2" height="1" fill="#ffd700"/>' +
      // Grass
      '<rect x="0" y="14" width="60" height="6" fill="#2d8a4e"/>' +
      '<rect x="0" y="14" width="60" height="2" fill="#3aa55d"/>' +
      // Flowers
      '<rect x="5" y="12" width="2" height="2" fill="#ff6b9d"/>' +
      '<rect x="6" y="14" width="1" height="2" fill="#2d8a4e"/>' +
      '<rect x="15" y="11" width="2" height="2" fill="#ffd700"/>' +
      '<rect x="16" y="13" width="1" height="3" fill="#2d8a4e"/>' +
      '<rect x="25" y="12" width="2" height="2" fill="#ff4444"/>' +
      '<rect x="26" y="14" width="1" height="2" fill="#2d8a4e"/>' +
      '<rect x="35" y="11" width="2" height="2" fill="#9b59b6"/>' +
      '<rect x="36" y="13" width="1" height="3" fill="#2d8a4e"/>' +
      '<rect x="45" y="12" width="2" height="2" fill="#3498db"/>' +
      '<rect x="46" y="14" width="1" height="2" fill="#2d8a4e"/>' +
      // Butterflies
      '<rect x="12" y="5" width="1" height="1" fill="#ff6b9d"/>' +
      '<rect x="14" y="5" width="1" height="1" fill="#ff6b9d"/>' +
      '<rect x="13" y="6" width="1" height="1" fill="#333"/>' +
      '<rect x="40" y="3" width="1" height="1" fill="#ffd700"/>' +
      '<rect x="42" y="3" width="1" height="1" fill="#ffd700"/>' +
      '<rect x="41" y="4" width="1" height="1" fill="#333"/>' +
      '</svg>';
  }

  Game.Sprites = {
    createGeorge: createGeorge,
    createDragon: createDragon,
    createFireBreath: createFireBreath,
    createSwordSlash: createSwordSlash,
    createLock: createLock,
    createStar: createStar,
    createDoor: createDoor,
    createTermToken: createTermToken,
    createTrackCell: createTrackCell,
    createGardenLocked: createGardenLocked,
    createGardenUnlocked: createGardenUnlocked,
    hashColor: hashColor
  };
})();
