(function (root) {
  'use strict';

  var LEVEL_COUNT = 8;
  var TILES_PER_LEVEL = 10;
  var HUE_STEP = 5;
  var LEVEL_SPAN = 45;

  var ZONE_NAMES = ['紅', '橙', '黃', '黃綠', '綠', '綠青', '青', '天藍', '藍', '紫藍', '紫', '洋紅'];
  var ZONE_COUNT = ZONE_NAMES.length;
  var ZONE_SPAN = 360 / ZONE_COUNT;

  var DIFFICULTY = {
    normal: { saturation: 28, lightness: 52, label: '一般' },
    hard: { saturation: 16, lightness: 50, label: '困難' }
  };

  var MAX_SCORE_PER_LEVEL = 32;
  var MAX_POSSIBLE_SCORE = MAX_SCORE_PER_LEVEL * LEVEL_COUNT;

  function generateLevelHues(levelIndex) {
    if (levelIndex < 0 || levelIndex >= LEVEL_COUNT) {
      throw new RangeError('levelIndex must be between 0 and ' + (LEVEL_COUNT - 1));
    }
    var base = levelIndex * LEVEL_SPAN;
    var hues = [];
    for (var i = 0; i < TILES_PER_LEVEL; i++) {
      hues.push(base + i * HUE_STEP);
    }
    return hues;
  }

  function hueToZoneIndex(hue) {
    var normalized = ((hue % 360) + 360) % 360;
    return Math.floor(normalized / ZONE_SPAN) % ZONE_COUNT;
  }

  function shuffleMovable(correctHues, rng) {
    rng = rng || Math.random;
    if (correctHues.length !== TILES_PER_LEVEL) {
      throw new RangeError('correctHues must have ' + TILES_PER_LEVEL + ' entries');
    }
    var result = correctHues.slice();
    var movable = result.slice(1, TILES_PER_LEVEL - 1);
    for (var i = movable.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = movable[i];
      movable[i] = movable[j];
      movable[j] = tmp;
    }
    for (var k = 0; k < movable.length; k++) {
      result[k + 1] = movable[k];
    }
    return result;
  }

  function computeTileErrors(correctHues, arrangedHues) {
    var errors = [];
    for (var i = 1; i < TILES_PER_LEVEL - 1; i++) {
      var hue = arrangedHues[i];
      var correctIndex = correctHues.indexOf(hue);
      errors.push({ hue: hue, error: Math.abs(i - correctIndex) });
    }
    return errors;
  }

  function computeLevelScore(correctHues, arrangedHues) {
    return computeTileErrors(correctHues, arrangedHues).reduce(function (sum, e) {
      return sum + e.error;
    }, 0);
  }

  var api = {
    LEVEL_COUNT: LEVEL_COUNT,
    TILES_PER_LEVEL: TILES_PER_LEVEL,
    ZONE_NAMES: ZONE_NAMES,
    DIFFICULTY: DIFFICULTY,
    MAX_POSSIBLE_SCORE: MAX_POSSIBLE_SCORE,
    generateLevelHues: generateLevelHues,
    hueToZoneIndex: hueToZoneIndex,
    shuffleMovable: shuffleMovable,
    computeTileErrors: computeTileErrors,
    computeLevelScore: computeLevelScore
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.HueTest = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
