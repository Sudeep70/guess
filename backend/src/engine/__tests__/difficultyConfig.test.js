const { getDifficultyConfig } = require('../difficultyConfig');

describe('getDifficultyConfig', () => {
  test('returns config for a known level', () => {
    expect(getDifficultyConfig('hard').fuzzyFactor).toBe(0.10);
  });

  test('falls back to medium for an unknown level', () => {
    expect(getDifficultyConfig('impossible')).toEqual(
      getDifficultyConfig('medium')
    );
  });

  test('falls back to medium when no level is given', () => {
    expect(getDifficultyConfig(undefined)).toEqual(
      getDifficultyConfig('medium')
    );
  });

  test('harder difficulty grants a bigger drawer bonus multiplier', () => {
    const easy = getDifficultyConfig('easy');
    const medium = getDifficultyConfig('medium');
    const hard = getDifficultyConfig('hard');
    expect(hard.drawerBonusMultiplier).toBeGreaterThan(medium.drawerBonusMultiplier);
    expect(medium.drawerBonusMultiplier).toBeGreaterThan(easy.drawerBonusMultiplier);
  });
});
