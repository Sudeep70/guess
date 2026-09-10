const {
  getRandomWords,
  buildHintMask,
  revealHintChar,
  shuffle,
} = require('../wordBank');

describe('getRandomWords', () => {
  test('returns the requested count of words', () => {
    const words = getRandomWords('easy', 3);
    expect(words).toHaveLength(3);
  });

  test('returns words with no duplicates within a single call', () => {
    const words = getRandomWords('medium', 5);
    expect(new Set(words).size).toBe(words.length);
  });

  test('falls back to medium words for an unknown difficulty', () => {
    const words = getRandomWords('nonsense-level', 3);
    expect(words).toHaveLength(3);
  });

  test('does not repeat a word across calls until the bank is exhausted', () => {
    // Easy bank is finite; draw from it repeatedly and make sure we don't see
    // a repeat before we've plausibly cycled through the bank.
    const seen = new Set();
    let repeatedTooSoon = false;

    for (let i = 0; i < 15; i++) {
      const [word] = getRandomWords('easy', 1);
      if (seen.has(word)) {
        repeatedTooSoon = true;
      }
      seen.add(word);
    }

    expect(repeatedTooSoon).toBe(false);
  });
});

describe('buildHintMask', () => {
  test('masks letters with underscores', () => {
    expect(buildHintMask('cat')).toBe('_ _ _');
  });

  test('preserves spaces in multi-word answers', () => {
    expect(buildHintMask('ice cream')).toBe('_ _ _   _ _ _ _ _');
  });
});

describe('revealHintChar', () => {
  test('reveals exactly one additional character', () => {
    const word = 'cat';
    const hint = buildHintMask(word); // "_ _ _"
    const revealed = revealHintChar(word, hint);

    const hiddenBefore = hint.split(' ').filter((c) => c === '_').length;
    const hiddenAfter = revealed.split(' ').filter((c) => c === '_').length;

    expect(hiddenAfter).toBe(hiddenBefore - 1);
  });

  test('revealed characters match the original word', () => {
    const word = 'dog';
    let hint = buildHintMask(word);
    hint = revealHintChar(word, hint);
    hint = revealHintChar(word, hint);

    const chars = hint.split(' ');
    word.split('').forEach((c, i) => {
      if (chars[i] !== '_') {
        expect(chars[i]).toBe(c);
      }
    });
  });

  test('returns the hint unchanged once fully revealed', () => {
    const word = 'hi';
    let hint = buildHintMask(word);
    hint = revealHintChar(word, hint); // reveal 1st
    hint = revealHintChar(word, hint); // reveal 2nd, fully revealed now
    const stillFull = revealHintChar(word, hint);
    expect(stillFull).toBe(hint);
  });
});

describe('shuffle', () => {
  test('returns an array with the same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  test('does not mutate the input array', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });
});
