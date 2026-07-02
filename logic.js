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

  var api = {
    LEVEL_COUNT: LEVEL_COUNT,
    TILES_PER_LEVEL: TILES_PER_LEVEL,
    ZONE_NAMES: ZONE_NAMES,
    DIFFICULTY: DIFFICULTY,
    MAX_POSSIBLE_SCORE: MAX_POSSIBLE_SCORE,
    generateLevelHues: generateLevelHues,
    hueToZoneIndex: hueToZoneIndex
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.HueTest = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
