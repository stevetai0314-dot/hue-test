const test = require('node:test');
const assert = require('node:assert/strict');
const { computeLeaderboard, monthKeyOf, currentMonthKey } = require('./Code.gs');

test('currentMonthKey: formats a given date as YYYY-MM', () => {
  assert.equal(currentMonthKey(new Date('2026-07-15T00:00:00Z')), '2026-07');
  assert.equal(currentMonthKey(new Date('2026-01-05T00:00:00Z')), '2026-01');
});

test('monthKeyOf: extracts YYYY-MM from an ISO timestamp string', () => {
  assert.equal(monthKeyOf('2026-07-01T10:00:00.000Z'), '2026-07');
  // 2026-12-31T23:59:59Z is already 2027-01-01 08:00 in Taipei (UTC+8).
  assert.equal(monthKeyOf('2026-12-31T23:59:59.000Z'), '2027-01');
});

test('computeLeaderboard: filters by difficulty and month, dedups to best-per-name, sorts by score then seconds', () => {
  const records = [
    { timestamp: '2026-07-01T10:00:00.000Z', name: 'A', difficulty: 'normal', score: 20, seconds: 100 },
    { timestamp: '2026-07-02T10:00:00.000Z', name: 'A', difficulty: 'normal', score: 10, seconds: 200 },
    { timestamp: '2026-07-02T10:00:00.000Z', name: 'B', difficulty: 'normal', score: 10, seconds: 150 },
    { timestamp: '2026-06-15T10:00:00.000Z', name: 'C', difficulty: 'normal', score: 0, seconds: 50 },
    { timestamp: '2026-07-03T10:00:00.000Z', name: 'D', difficulty: 'hard', score: 5, seconds: 80 }
  ];
  const result = computeLeaderboard(records, 'normal', '2026-07');
  assert.deepEqual(result, [
    { rank: 1, name: 'B', score: 10, seconds: 150 },
    { rank: 2, name: 'A', score: 10, seconds: 200 }
  ]);
});

test('computeLeaderboard: returns an empty array when nothing matches', () => {
  assert.deepEqual(computeLeaderboard([], 'normal', '2026-07'), []);
});

test('computeLeaderboard: truncates to the top 10 entries', () => {
  const records = [];
  for (let i = 0; i < 15; i++) {
    records.push({ timestamp: '2026-07-01T10:00:00.000Z', name: 'P' + i, difficulty: 'normal', score: i, seconds: 100 });
  }
  const result = computeLeaderboard(records, 'normal', '2026-07');
  assert.equal(result.length, 10);
  assert.equal(result[0].name, 'P0');
  assert.equal(result[9].name, 'P9');
  assert.deepEqual(result.map((r) => r.rank), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});
