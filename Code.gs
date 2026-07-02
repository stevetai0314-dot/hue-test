var SHEET_NAME = '記錄';
var TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000; // Asia/Taipei is fixed UTC+8, no DST

// Uses UTC getters on a shifted instant rather than local Date getters,
// so the result is the same regardless of which timezone the host
// machine (Node test runner, Apps Script server) happens to be in.
function monthKeyOfInstant(date) {
  var shifted = new Date(date.getTime() + TAIPEI_OFFSET_MS);
  return shifted.getUTCFullYear() + '-' + ('0' + (shifted.getUTCMonth() + 1)).slice(-2);
}

function currentMonthKey(date) {
  return monthKeyOfInstant(date || new Date());
}

function monthKeyOf(timestamp) {
  return monthKeyOfInstant(new Date(timestamp));
}

function computeLeaderboard(records, difficultyKey, monthKey) {
  var filtered = records.filter(function (r) {
    return r.difficulty === difficultyKey && monthKeyOf(r.timestamp) === monthKey;
  });

  var bestByName = {};
  filtered.forEach(function (r) {
    var current = bestByName[r.name];
    if (!current || r.score < current.score || (r.score === current.score && r.seconds < current.seconds)) {
      bestByName[r.name] = r;
    }
  });

  var deduped = Object.keys(bestByName).map(function (name) { return bestByName[name]; });
  deduped.sort(function (a, b) {
    if (a.score !== b.score) return a.score - b.score;
    return a.seconds - b.seconds;
  });

  return deduped.slice(0, 10).map(function (r, index) {
    return { rank: index + 1, name: r.name, score: r.score, seconds: r.seconds };
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    computeLeaderboard: computeLeaderboard,
    monthKeyOf: monthKeyOf,
    currentMonthKey: currentMonthKey
  };
}
