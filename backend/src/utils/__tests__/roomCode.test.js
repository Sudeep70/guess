jest.mock('../../state/rooms', () => ({
  getRooms: jest.fn(),
}));

const { getRooms } = require('../../state/rooms');
const { generateRoomCode } = require('../roomCode');

describe('generateRoomCode', () => {
  beforeEach(() => {
    getRooms.mockReset();
    getRooms.mockReturnValue({});
  });

  test('generates a code of the requested length', () => {
    const code = generateRoomCode(6);
    expect(code).toHaveLength(6);
  });

  test('defaults to length 6', () => {
    expect(generateRoomCode()).toHaveLength(6);
  });

  test('only uses unambiguous characters (no 0, O, 1, I)', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateRoomCode();
      expect(code).not.toMatch(/[01OI]/);
    }
  });

  test('retries until it finds a code not already in use', () => {
    // Existing room "AAAAAA" occupies the code the first attempt will produce.
    getRooms.mockReturnValue({ AAAAAA: {} });

    const randomSpy = jest.spyOn(Math, 'random');
    // First attempt: 6 chars all -> index 0 ('A'), collides with AAAAAA.
    for (let i = 0; i < 6; i++) randomSpy.mockImplementationOnce(() => 0);
    // Second attempt: 6 chars all -> index 1 ('B'), free.
    for (let i = 0; i < 6; i++) randomSpy.mockImplementationOnce(() => 0.04);

    const code = generateRoomCode();
    expect(code).toBe('BBBBBB');

    randomSpy.mockRestore();
  });

  test('throws after too many failed attempts to find a unique code', () => {
    getRooms.mockReturnValue({ AAAAAA: {} });
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0); // always 'A'

    expect(() => generateRoomCode()).toThrow(
      'Failed to generate unique room code'
    );

    randomSpy.mockRestore();
  });
});
