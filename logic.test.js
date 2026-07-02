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
