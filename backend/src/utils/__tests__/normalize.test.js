const { normalizeGuess, isCorrectGuess } = require('../normalize');

describe('normalizeGuess', () => {
  test('lowercases and trims', () => {
    expect(normalizeGuess('  Elephant  ')).toBe('elephant');
  });

  test('strips accents', () => {
    expect(normalizeGuess('café')).toBe('cafe');
    expect(normalizeGuess('naïve')).toBe('naive');
  });

  test('removes punctuation', () => {
    expect(normalizeGuess("it's a cat!")).toBe('its a cat');
  });

  test('collapses repeated whitespace', () => {
    expect(normalizeGuess('hot   air   balloon')).toBe('hot air balloon');
  });
});

describe('isCorrectGuess', () => {
  test('exact match is correct', () => {
    expect(isCorrectGuess('elephant', 'elephant')).toBe(true);
  });

  test('case and whitespace differences still match', () => {
    expect(isCorrectGuess('  ELEPHANT ', 'elephant')).toBe(true);
  });

  test('accented guess matches unaccented word', () => {
    expect(isCorrectGuess('cafe', 'café')).toBe(true);
  });

  test('trailing punctuation does not block a match', () => {
    expect(isCorrectGuess('elephant!', 'elephant')).toBe(true);
  });

  test('a hyphen is stripped outright rather than becoming a space', () => {
    // So a hyphenated guess will NOT match a space-separated word.
    expect(isCorrectGuess('hot-air balloon', 'hot air balloon')).toBe(false);
  });

  test('a wrong word is not correct', () => {
    expect(isCorrectGuess('giraffe', 'elephant')).toBe(false);
  });

  test('a near-miss typo is not treated as correct here (fuzzy match is separate)', () => {
    expect(isCorrectGuess('elefant', 'elephant')).toBe(false);
  });
});
