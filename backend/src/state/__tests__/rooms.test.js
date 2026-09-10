const {
  createRoom,
  deleteRoom,
  addPlayer,
  getPlayer,
  getConnectedPlayers,
  getConnectedCount,
  markDisconnected,
  markConnected,
  removePlayer,
  resetRoundState,
  roomSnapshot,
} = require('../rooms');

// Each test uses its own room code to avoid collisions in the shared
// in-memory store, and cleans up after itself.
let code;
beforeEach(() => {
  code = `TEST${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
});
afterEach(() => {
  deleteRoom(code);
});

describe('createRoom', () => {
  test('creates a room with the host as the first player', () => {
    const room = createRoom(code, 'host-1', 'Host');
    expect(room.hostSocketId).toBe('host-1');
    expect(room.status).toBe('waiting');
    expect(room.players['host-1'].name).toBe('Host');
  });

  test('defaults difficulty to medium when not provided', () => {
    const room = createRoom(code, 'host-1', 'Host');
    expect(room.difficulty).toBe('medium');
  });

  // Regression test: createRoom used to silently drop the requested
  // difficulty, so every room ran as "medium" no matter what the host
  // picked in the lobby.
  test('persists the difficulty the host requested', () => {
    const room = createRoom(code, 'host-1', 'Host', 'hard');
    expect(room.difficulty).toBe('hard');
  });
});

describe('addPlayer / getPlayer', () => {
  test('adds a new player to an existing room', () => {
    createRoom(code, 'host-1', 'Host');
    const player = addPlayer(code, 'p2', 'Guest');
    expect(player.name).toBe('Guest');
    expect(getPlayer(code, 'p2').name).toBe('Guest');
  });

  test('returns null when adding to a room that does not exist', () => {
    expect(addPlayer('NOPE', 'p2', 'Guest')).toBeNull();
  });

  test('new players start with zero score and connected', () => {
    createRoom(code, 'host-1', 'Host');
    const player = addPlayer(code, 'p2', 'Guest');
    expect(player.score).toBe(0);
    expect(player.isConnected).toBe(true);
    expect(player.hasGuessedCorrectly).toBe(false);
  });
});

describe('connection tracking', () => {
  test('markDisconnected/markConnected toggle a player and connected lists reflect it', () => {
    createRoom(code, 'host-1', 'Host');
    addPlayer(code, 'p2', 'Guest');

    expect(getConnectedCount(code)).toBe(2);

    markDisconnected(code, 'p2');
    expect(getConnectedCount(code)).toBe(1);
    expect(getConnectedPlayers(code).map((p) => p.socketId)).toEqual(['host-1']);

    markConnected(code, 'p2');
    expect(getConnectedCount(code)).toBe(2);
  });

  test('removePlayer takes them out of the room entirely', () => {
    createRoom(code, 'host-1', 'Host');
    addPlayer(code, 'p2', 'Guest');
    removePlayer(code, 'p2');
    expect(getPlayer(code, 'p2')).toBeUndefined();
    expect(getConnectedCount(code)).toBe(1);
  });
});

describe('resetRoundState', () => {
  test('clears per-round player flags and round data', () => {
    const room = createRoom(code, 'host-1', 'Host');
    room.players['host-1'].hasGuessedCorrectly = true;
    room.players['host-1'].guessOrder = 1;
    room.round.word = 'cat';
    room.round.wordHint = '_ _ _';
    room.round.canvas.strokes = [{ x: 1, y: 1 }];

    resetRoundState(code);

    expect(room.players['host-1'].hasGuessedCorrectly).toBe(false);
    expect(room.players['host-1'].guessOrder).toBeNull();
    expect(room.round.word).toBe('');
    expect(room.round.wordHint).toBe('');
    expect(room.round.canvas.strokes).toEqual([]);
  });
});

describe('roomSnapshot', () => {
  test('reveals the word to the drawer', () => {
    const room = createRoom(code, 'host-1', 'Host');
    room.round.drawerSocketId = 'host-1';
    room.round.word = 'giraffe';

    const snap = roomSnapshot(code, 'host-1');
    expect(snap.round.word).toBe('giraffe');
  });

  test('hides the word from non-drawer players', () => {
    const room = createRoom(code, 'host-1', 'Host');
    addPlayer(code, 'p2', 'Guest');
    room.round.drawerSocketId = 'host-1';
    room.round.word = 'giraffe';

    const snap = roomSnapshot(code, 'p2');
    expect(snap.round.word).toBeUndefined();
  });

  test('returns null for a room that does not exist', () => {
    expect(roomSnapshot('NOPE', 'someone')).toBeNull();
  });
});
