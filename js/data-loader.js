// Level data loader for George and the Dragon
(function() {
  'use strict';

  var cache = {};

  function loadLevel(levelNum) {
    if (cache[levelNum]) {
      return Promise.resolve(cache[levelNum]);
    }

    var url = 'data/level' + levelNum + '.json';
    return fetch(url)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to load level ' + levelNum + ' data (HTTP ' + response.status + ')');
        }
        return response.json();
      })
      .then(function(data) {
        // Validate basic structure
        if (!data.problems || !Array.isArray(data.problems) || data.problems.length === 0) {
          throw new Error('Level ' + levelNum + ' has no problems defined');
        }
        cache[levelNum] = data;
        return data;
      })
      .catch(function(err) {
        console.error('Error loading level ' + levelNum + ':', err);
        throw err;
      });
  }

  function clearCache() {
    cache = {};
  }

  Game.DataLoader = {
    loadLevel: loadLevel,
    clearCache: clearCache
  };
})();
