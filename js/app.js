// Boot and navigation for George and the Dragon
(function() {
  'use strict';

  var currentView = null;
  var views = ['map', 'battle', 'stats'];

  function init() {
    Game.Storage.init();
    navigate('map');
  }

  function navigate(view, params) {
    params = params || {};

    // Hide all views
    views.forEach(function(v) {
      var el = document.getElementById(v + '-view');
      if (el) el.classList.add('hidden');
    });

    currentView = view;

    var el = document.getElementById(view + '-view');
    if (el) el.classList.remove('hidden');

    switch (view) {
      case 'map':
        Game.UI.renderMap();
        break;

      case 'battle':
        var levelNum = params.level;
        if (!levelNum || !Game.Storage.isLevelUnlocked(levelNum)) {
          navigate('map');
          return;
        }
        Game.DataLoader.loadLevel(levelNum)
          .then(function(levelData) {
            Game.Engine.startBattle(levelNum, levelData);
            Game.UI.renderBattle(levelNum);
          })
          .catch(function(err) {
            Game.UI.showError('Could not load level ' + levelNum + '. Make sure the data file exists.');
          });
        break;

      case 'stats':
        Game.UI.renderStats();
        break;

      default:
        navigate('map');
    }
  }

  Game.App = {
    init: init,
    navigate: navigate
  };

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
