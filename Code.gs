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

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['提交時間戳記', '姓名', '難度', '分數', '秒數']);
  }
  return sheet;
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var name = String(data.name || '').trim().slice(0, 50);
  var difficulty = (data.difficulty === 'hard') ? 'hard' : 'normal';
  var score = Number(data.score);
  var seconds = Number(data.seconds);
  var timestamp = String(data.timestamp || new Date().toISOString());

  if (!name || isNaN(score) || isNaN(seconds)) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'invalid payload' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  getOrCreateSheet().appendRow([timestamp, name, difficulty, score, seconds]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var difficulty = (e.parameter.difficulty === 'hard') ? 'hard' : 'normal';
  var values = getOrCreateSheet().getDataRange().getValues();
  var rows = values.slice(1);
  var records = rows.map(function (r) {
    return { timestamp: r[0], name: r[1], difficulty: r[2], score: Number(r[3]), seconds: Number(r[4]) };
  });
  var top10 = computeLeaderboard(records, difficulty, currentMonthKey());
  return ContentService.createTextOutput(JSON.stringify(top10)).setMimeType(ContentService.MimeType.JSON);
}

function manualTest_computeLeaderboard() {
  var sample = [
    { timestamp: '2026-07-01T10:00:00.000Z', name: 'A', difficulty: 'normal', score: 20, seconds: 100 },
    { timestamp: '2026-07-02T10:00:00.000Z', name: 'A', difficulty: 'normal', score: 10, seconds: 200 },
    { timestamp: '2026-07-02T10:00:00.000Z', name: 'B', difficulty: 'normal', score: 10, seconds: 150 },
    { timestamp: '2026-06-15T10:00:00.000Z', name: 'C', difficulty: 'normal', score: 0, seconds: 50 },
    { timestamp: '2026-07-03T10:00:00.000Z', name: 'D', difficulty: 'hard', score: 5, seconds: 80 }
  ];
  Logger.log(JSON.stringify(computeLeaderboard(sample, 'normal', '2026-07')));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    computeLeaderboard: computeLeaderboard,
    monthKeyOf: monthKeyOf,
    currentMonthKey: currentMonthKey
  };
}
