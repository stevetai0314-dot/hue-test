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
