const {
  calcGuesserScore,
  calcDrawerBonus,
  buildLeaderboard,
} = require('../scoringEngine');

describe('calcGuesserScore', () => {
  test('first correct guess with full time left scores near max', () => {
    // BASE_SCORE(1000) + TIME_BONUS_MAX(500) - 0 order penalty
    expect(calcGuesserScore(60, 1)).toBe(1500);
  });

  test('guessing with no time left still gets base score', () => {
    expect(calcGuesserScore(0, 1)).toBe(1000);
  });

  test('later guess order is penalized relative to first', () => {
    const first = calcGuesserScore(30, 1);
    const second = calcGuesserScore(30, 2);
    const third = calcGuesserScore(30, 3);
    expect(second).toBeLessThan(first);
    expect(third).toBeLessThan(second);
    expect(first - second).toBe(100); // ORDER_PENALTY
  });

  test('score never drops below the floor even with heavy order penalty', () => {
    // With 0 time left and a very late guess order, the raw score would go negative
    expect(calcGuesserScore(0, 50)).toBe(100); // SCORE_FLOOR
  });

  test('more time left yields a strictly higher score than less time left, all else equal', () => {
    expect(calcGuesserScore(50, 2)).toBeGreaterThan(calcGuesserScore(10, 2));
  });
});

describe('calcDrawerBonus', () => {
  test('no correct guessers means no bonus', () => {
    expect(calcDrawerBonus(0)).toBe(0);
  });

  test('bonus scales linearly with correct guess count', () => {
    expect(calcDrawerBonus(1)).toBe(75);
    expect(calcDrawerBonus(4)).toBe(300);
  });
});

describe('buildLeaderboard', () => {
  test('sorts players by score descending', () => {
    const players = {
      a: { socketId: 'a', name: 'Alice', score: 200 },
      b: { socketId: 'b', name: 'Bob', score: 500 },
      c: { socketId: 'c', name: 'Cara', score: 100 },
    };
    const board = buildLeaderboard(players);
    expect(board.map((p) => p.name)).toEqual(['Bob', 'Alice', 'Cara']);
  });

  test('ties are broken alphabetically by name', () => {
    const players = {
      a: { socketId: 'a', name: 'Zed', score: 100 },
      b: { socketId: 'b', name: 'Amy', score: 100 },
    };
    const board = buildLeaderboard(players);
    expect(board.map((p) => p.name)).toEqual(['Amy', 'Zed']);
  });

  test('does not mutate the original players object', () => {
    const players = {
      a: { socketId: 'a', name: 'Alice', score: 200 },
      b: { socketId: 'b', name: 'Bob', score: 500 },
    };
    const snapshot = JSON.stringify(players);
    buildLeaderboard(players);
    expect(JSON.stringify(players)).toBe(snapshot);
  });

  test('handles an empty players object', () => {
    expect(buildLeaderboard({})).toEqual([]);
  });
});
