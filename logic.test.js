const test = require('node:test');
const assert = require('node:assert/strict');
const HueTest = require('./logic.js');

test('generateLevelHues: level 0 spans 0-45 in steps of 5', () => {
  assert.deepEqual(
    HueTest.generateLevelHues(0),
    [0, 5, 10, 15, 20, 25, 30, 35, 40, 45]
  );
});

test('generateLevelHues: level 7 spans 315-360 in steps of 5', () => {
  assert.deepEqual(
    HueTest.generateLevelHues(7),
    [315, 320, 325, 330, 335, 340, 345, 350, 355, 360]
  );
});

test('generateLevelHues: throws on out-of-range level index', () => {
  assert.throws(() => HueTest.generateLevelHues(-1), RangeError);
  assert.throws(() => HueTest.generateLevelHues(8), RangeError);
});

test('hueToZoneIndex: maps hue to one of 12 zones of 30 degrees', () => {
  assert.equal(HueTest.hueToZoneIndex(0), 0);
  assert.equal(HueTest.hueToZoneIndex(29), 0);
  assert.equal(HueTest.hueToZoneIndex(30), 1);
  assert.equal(HueTest.hueToZoneIndex(359), 11);
});

test('hueToZoneIndex: wraps values outside 0-360', () => {
  assert.equal(HueTest.hueToZoneIndex(360), 0);
  assert.equal(HueTest.hueToZoneIndex(-10), 11);
});

test('shuffleMovable: keeps first and last tile fixed, shuffles the middle 8', () => {
  const correct = HueTest.generateLevelHues(0);
  const rng = () => 0; // deterministic: Fisher-Yates with rng=0 rotates the middle-8 left by 1
  const result = HueTest.shuffleMovable(correct, rng);
  assert.deepEqual(result, [0, 10, 15, 20, 25, 30, 35, 40, 5, 45]);
});

test('shuffleMovable: throws if input is not 10 hues', () => {
  assert.throws(() => HueTest.shuffleMovable([1, 2, 3]), RangeError);
});

test('computeTileErrors: fully correct arrangement has zero error on every tile', () => {
  const correct = HueTest.generateLevelHues(0);
  const errors = HueTest.computeTileErrors(correct, correct);
  assert.equal(errors.length, 8);
  errors.forEach((e) => assert.equal(e.error, 0));
});

test('computeTileErrors: fully reversed middle produces expected per-tile errors', () => {
  const correct = HueTest.generateLevelHues(0); // [0,5,10,...,45]
  const reversedMiddle = [0, 40, 35, 30, 25, 20, 15, 10, 5, 45];
  const errors = HueTest.computeTileErrors(correct, reversedMiddle);
  assert.deepEqual(errors.map((e) => e.error), [7, 5, 3, 1, 1, 3, 5, 7]);
  assert.deepEqual(errors.map((e) => e.hue), [40, 35, 30, 25, 20, 15, 10, 5]);
});

test('computeLevelScore: fully correct arrangement scores 0', () => {
  const correct = HueTest.generateLevelHues(3);
  assert.equal(HueTest.computeLevelScore(correct, correct), 0);
});

test('computeLevelScore: fully reversed middle scores the documented max (32)', () => {
  const correct = HueTest.generateLevelHues(0);
  const reversedMiddle = [0, 40, 35, 30, 25, 20, 15, 10, 5, 45];
  assert.equal(HueTest.computeLevelScore(correct, reversedMiddle), 32);
});

test('accumulateZoneErrors: sums tile errors into their 30-degree zone bucket', () => {
  const groups = [
    [{ hue: 10, error: 3 }, { hue: 40, error: 2 }],
    [{ hue: 15, error: 5 }]
  ];
  const zoneErrors = HueTest.accumulateZoneErrors(groups);
  assert.equal(zoneErrors.length, 12);
  assert.equal(zoneErrors[0], 8); // hues 10 and 15 both fall in zone 0 (0-29), plus... see next assert
  assert.equal(zoneErrors[1], 2); // hue 40 falls in zone 1 (30-59)
});

test('getWeakZones: reports only the top zone when second place is under 70%', () => {
  const zoneErrors = new Array(12).fill(0);
  zoneErrors[2] = 10;
  zoneErrors[5] = 6; // 60% of max, below the 70% threshold
  assert.deepEqual(HueTest.getWeakZones(zoneErrors), [HueTest.ZONE_NAMES[2]]);
});

test('getWeakZones: reports top two zones when second place is at least 70%', () => {
  const zoneErrors = new Array(12).fill(0);
  zoneErrors[2] = 10;
  zoneErrors[5] = 8; // 80% of max, at/above threshold
  assert.deepEqual(HueTest.getWeakZones(zoneErrors), [HueTest.ZONE_NAMES[2], HueTest.ZONE_NAMES[5]]);
});

test('getWeakZones: returns empty array when there is no error at all', () => {
  assert.deepEqual(HueTest.getWeakZones(new Array(12).fill(0)), []);
});

test('gradeScore: buckets total score into four grades at the documented thresholds', () => {
  assert.equal(HueTest.gradeScore(12), '優良');
  assert.equal(HueTest.gradeScore(13), '正常');
  assert.equal(HueTest.gradeScore(40), '正常');
  assert.equal(HueTest.gradeScore(41), '建議留意');
  assert.equal(HueTest.gradeScore(90), '建議留意');
  assert.equal(HueTest.gradeScore(91), '建議進一步檢查');
});

test('formatResultText: renders all fields as labeled lines', () => {
  const text = HueTest.formatResultText({
    name: '王小明',
    difficultyLabel: '一般',
    dateStr: '2026/7/2 上午10:00',
    totalScore: 15,
    weakZones: ['綠', '青'],
    grade: '正常'
  });
  assert.equal(
    text,
    '色相辨識測試結果\n' +
    '姓名：王小明\n' +
    '難度：一般\n' +
    '日期：2026/7/2 上午10:00\n' +
    '總分：15 / ' + HueTest.MAX_POSSIBLE_SCORE + '\n' +
    '弱色區：綠、青\n' +
    '建議：正常'
  );
});

test('formatResultText: shows a no-weak-zone message when weakZones is empty', () => {
  const text = HueTest.formatResultText({
    name: '王小明',
    difficultyLabel: '困難',
    dateStr: '2026/7/2',
    totalScore: 0,
    weakZones: [],
    grade: '優良'
  });
  assert.match(text, /弱色區：無明顯弱色區/);
});
