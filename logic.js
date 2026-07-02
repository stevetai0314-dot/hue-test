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

  function accumulateZoneErrors(tileErrorGroups) {
    var zoneErrors = new Array(ZONE_COUNT).fill(0);
    tileErrorGroups.forEach(function (group) {
      group.forEach(function (tile) {
        var zoneIndex = hueToZoneIndex(tile.hue);
        zoneErrors[zoneIndex] += tile.error;
      });
    });
    return zoneErrors;
  }

  function getWeakZones(zoneErrors) {
    var maxError = Math.max.apply(null, zoneErrors);
    if (maxError <= 0) {
      return [];
    }
    var indexed = zoneErrors.map(function (error, index) {
      return { index: index, error: error };
    });
    indexed.sort(function (a, b) { return b.error - a.error; });
    var weak = [ZONE_NAMES[indexed[0].index]];
    if (indexed.length > 1 && indexed[1].error > 0 && indexed[1].error >= maxError * 0.7) {
      weak.push(ZONE_NAMES[indexed[1].index]);
    }
    return weak;
  }

  function gradeScore(totalScore) {
    if (totalScore <= 12) return '優良';
    if (totalScore <= 40) return '正常';
    if (totalScore <= 90) return '建議留意';
    return '建議進一步檢查';
  }

  function formatResultText(params) {
    var lines = [
      '色相辨識測試結果',
      '姓名：' + params.name,
      '難度：' + params.difficultyLabel,
      '日期：' + params.dateStr,
      '總分：' + params.totalScore + ' / ' + MAX_POSSIBLE_SCORE,
      '弱色區：' + (params.weakZones.length ? params.weakZones.join('、') : '無明顯弱色區'),
      '建議：' + params.grade
    ];
    return lines.join('\n');
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
    computeLevelScore: computeLevelScore,
    accumulateZoneErrors: accumulateZoneErrors,
    getWeakZones: getWeakZones,
    gradeScore: gradeScore,
    formatResultText: formatResultText
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.HueTest = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
