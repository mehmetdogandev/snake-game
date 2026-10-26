import {
  createInitialState,
  queueDirection,
  tick,
  spawnFood,
} from '../game/engine';
import { checkCollision } from '../game/collision';
import { purchaseSkin, equipSkin } from '../game/economy';
import { loadSaveData, saveSaveData, resetSaveData, DEFAULT_SAVE_DATA } from '../game/storage';
import { Point, GameState, SaveData, SkinId } from '../game/types';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function runAllGameTests(): { passed: number; failed: number; results: TestResult[] } {
  const results: TestResult[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({ name, passed: false, error: errorMsg });
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      throw new Error(`Assertion failed: ${msg}`);
    }
  }

  function assertEqual<T>(actual: T, expected: T, msg: string) {
    if (actual !== expected) {
      throw new Error(`Assertion failed: ${msg}. Expected ${expected}, got ${actual}`);
    }
  }

  // 1. Initial State Test
  test('Initial state: snake has 3 segments near center, moving RIGHT', () => {
    const state = createInitialState('CLASSIC', 100);
    assertEqual(state.snake.length, 3, 'Snake starts with 3 segments');
    assertEqual(state.direction, 'RIGHT', 'Initial direction is RIGHT');
    assertEqual(state.score, 0, 'Initial score is 0');
    assertEqual(state.highScore, 100, 'High score matches provided value');
    assert(state.food.length >= 1, 'Initial food is spawned');
    assertEqual(state.isGameOver, false, 'Game starts not over');
    assertEqual(state.isPaused, false, 'Game starts unpaused');
  });

  // 2. Snake Movement Test
  test('Snake movement: snake moves forward by 1 grid cell per tick', () => {
    let state = createInitialState('CLASSIC', 0);
    const headBefore = state.snake[0];
    const res = tick(state, state.currentSpeed);
    const headAfter = res.nextState.snake[0];

    assertEqual(headAfter.x, headBefore.x + 1, 'Head moved 1 cell to the right');
    assertEqual(headAfter.y, headBefore.y, 'Head Y remained the same');
  });

  // 3. Valid Turns Test
  test('Valid turns: snake accepts perpendicular turns', () => {
    let state = createInitialState('CLASSIC', 0);
    state = queueDirection(state, 'UP');
    assertEqual(state.inputQueue[0], 'UP', 'UP turn accepted when moving RIGHT');

    const res = tick(state, state.currentSpeed);
    assertEqual(res.nextState.direction, 'UP', 'Direction transitioned to UP on tick');
  });

  // 4. Invalid Reverse Turns (180°)
  test('Invalid reverse turns: snake rejects 180° instant reverse', () => {
    let state = createInitialState('CLASSIC', 0);
    // State is moving RIGHT, attempting LEFT must be rejected
    state = queueDirection(state, 'LEFT');
    assertEqual(state.inputQueue.length, 0, 'LEFT reverse was ignored');

    const res = tick(state, state.currentSpeed);
    assertEqual(res.nextState.direction, 'RIGHT', 'Direction remained RIGHT');
  });

  // 5. Input Buffering (Multiple turn queueing)
  test('Input buffering: handles quick UP then LEFT across consecutive ticks safely', () => {
    let state = createInitialState('CLASSIC', 0);
    state = queueDirection(state, 'UP');
    state = queueDirection(state, 'LEFT');
    assertEqual(state.inputQueue.length, 2, 'Both directional inputs buffered');

    // First tick consumes UP
    const tick1 = tick(state, state.currentSpeed);
    assertEqual(tick1.nextState.direction, 'UP', 'First tick turns UP');

    // Second tick consumes LEFT
    const tick2 = tick(tick1.nextState, tick1.nextState.currentSpeed);
    assertEqual(tick2.nextState.direction, 'LEFT', 'Second tick turns LEFT safely');
  });

  // 6. Food Collection & Growth
  test('Food collection: snake grows and score increases when eating food', () => {
    let state = createInitialState('CLASSIC', 0);
    const head = state.snake[0];
    // Force food right in front of snake
    const targetFood = {
      id: 'test_food',
      position: { x: head.x + 1, y: head.y },
      type: 'NORMAL' as const,
      points: 10,
      coins: 2,
    };
    state.food = [targetFood];

    const initialLength = state.snake.length;
    const res = tick(state, state.currentSpeed);

    assertEqual(res.events.grew, true, 'Grew event triggered');
    assertEqual(res.nextState.snake.length, initialLength + 1, 'Snake length increased by 1');
    assert(res.nextState.score >= 10, 'Score increased by at least 10');
  });

  // 7. Wall Collision in Classic Mode
  test('Wall collision: hitting border causes game over in Classic mode', () => {
    let state = createInitialState('CLASSIC', 0);
    // Put snake right on edge facing wall
    state.snake = [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }];
    state.direction = 'RIGHT';

    const res = tick(state, state.currentSpeed);
    assertEqual(res.events.gameOver, true, 'Game over event fired');
    assertEqual(res.nextState.isGameOver, true, 'State is marked as game over');
  });

  // 8. Zen Mode Wrap-Around
  test('Zen mode: snake wraps around grid border without dying', () => {
    let state = createInitialState('ZEN', 0);
    state.snake = [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }];
    state.direction = 'RIGHT';

    const res = tick(state, state.currentSpeed);
    assertEqual(res.events.gameOver, false, 'No game over in Zen mode');
    assertEqual(res.nextState.snake[0].x, 0, 'Snake head wrapped around to X = 0');
  });

  // 9. Self-Collision Test
  test('Self-collision: running into own body causes game over', () => {
    let state = createInitialState('CLASSIC', 0);
    // Create a loop: head at (5,5), body surrounding it
    state.snake = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
      { x: 5, y: 6 },
      { x: 4, y: 6 },
    ];
    state.direction = 'DOWN'; // Will hit (5,6) which is index 3 of body

    const res = tick(state, state.currentSpeed);
    assertEqual(res.events.gameOver, true, 'Self collision triggers game over');
    assertEqual(res.events.hitSelf, true, 'HitSelf event flagged');
  });

  // 10. Safe Tail Collision Edge Case (Req #9)
  test('Safe tail collision: moving into vacated tail position is SAFE when not eating', () => {
    const snake: Point[] = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
      { x: 5, y: 6 }, // tail at (5,6)
    ];
    // Next head would be (5,6)
    const nextHead: Point = { x: 5, y: 6 };

    // When NOT eating food, tail will move away -> SAFE
    const resSafe = checkCollision(nextHead, snake, [], 20, 20, false, false);
    assertEqual(resSafe.hasCollided, false, 'Moving into vacated tail is safe');

    // When IS eating food, tail stays -> COLLISION
    const resCollide = checkCollision(nextHead, snake, [], 20, 20, false, true);
    assertEqual(resCollide.hasCollided, true, 'Moving into tail while eating is a collision');
  });

  // 11. Food Spawning: never on snake or obstacle
  test('Food spawning: food never spawns on snake or obstacle cells', () => {
    const state = createInitialState('CLASSIC', 0);
    for (let i = 0; i < 20; i++) {
      const foodList = spawnFood(state);
      for (const food of foodList) {
        for (const seg of state.snake) {
          assert(
            food.position.x !== seg.x || food.position.y !== seg.y,
            'Food must not spawn on snake body'
          );
        }
        for (const obs of state.obstacles) {
          assert(
            food.position.x !== obs.x || food.position.y !== obs.y,
            'Food must not spawn on obstacle'
          );
        }
      }
    }
  });

  // 12. Full-Board Completion Handling (Req #11)
  test('Full-board completion: handles full grid safely without entering infinite loop', () => {
    const state = createInitialState('CLASSIC', 0);
    state.gridWidth = 3;
    state.gridHeight = 3;
    // Fill 3x3 board
    state.snake = [];
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        state.snake.push({ x, y });
      }
    }
    const foods = spawnFood(state);
    assert(Array.isArray(foods), 'Food spawning returns gracefully on full board');
  });

  // 13. Shield Power-up Protection
  test('Shield power-up: absorbs lethal collision and breaks instead of death', () => {
    let state = createInitialState('CLASSIC', 0);
    state.hasShield = true;
    state.snake = [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }];
    state.direction = 'RIGHT'; // Into wall

    const res = tick(state, state.currentSpeed);
    assertEqual(res.events.gameOver, false, 'Game over prevented by shield');
    assertEqual(res.events.shieldPopped, true, 'Shield absorb triggered');
    assertEqual(res.nextState.hasShield, false, 'Shield is consumed');
  });

  // 14. Skin Purchase and Equip Logic
  test('Skin economy: purchase and equip correctly handles coins and ownership', () => {
    const save: SaveData = { ...DEFAULT_SAVE_DATA, coins: 500, unlockedSkins: ['emerald' as SkinId] };

    // Try to buy Cyber Cyan (cost 300)
    const buyRes = purchaseSkin(save, 'cyber_cyan');
    assertEqual(buyRes.success, true, 'Purchase succeeded');
    assertEqual(save.coins, 200, '300 coins deducted');
    assert(save.unlockedSkins.includes('cyber_cyan'), 'Cyber cyan is unlocked');

    // Equipping unlocked skin
    const equipRes = equipSkin(save, 'cyber_cyan');
    assertEqual(equipRes.success, true, 'Equip succeeded');
    assertEqual(save.selectedSkin, 'cyber_cyan', 'Cyber cyan selected');

    // Equipping locked skin fails
    const lockedEquip = equipSkin(save, 'shadow');
    assertEqual(lockedEquip.success, false, 'Equipping locked skin fails');
  });

  // 15. Save/Load and Corrupted Fallback
  test('Save and load persistence: gracefully handles valid data and corrupted json', () => {
    const testData = { ...DEFAULT_SAVE_DATA, level: 7, coins: 888 };
    const saved = saveSaveData(testData);
    assert(saved, 'Saved to storage');

    const loaded = loadSaveData();
    assertEqual(loaded.level, 7, 'Loaded level correctly');
    assertEqual(loaded.coins, 888, 'Loaded coins correctly');

    // Corrupted data test
    localStorage.setItem('snake_evolution_save_v1', '{ invalid json garbage');
    const recovered = loadSaveData();
    assert(recovered !== null, 'Recovered from corrupted json without crashing');
    assertEqual(recovered.level, 1, 'Default fallback applied');
  });

  // 16. Input Lag Elimination: Queue Replacement
  test('Input queue replacement: replaces 2nd move when user changes mind before execution', () => {
    let state = createInitialState('CLASSIC', 0); // Moving RIGHT
    state = queueDirection(state, 'UP'); // Queue: ['UP']
    state = queueDirection(state, 'RIGHT'); // Queue: ['UP', 'RIGHT']
    // User rapidly presses LEFT: since LEFT is perpendicular to UP, it replaces RIGHT
    state = queueDirection(state, 'LEFT');
    assertEqual(state.inputQueue.length, 2, 'Queue maintains length of 2');
    assertEqual(state.inputQueue[0], 'UP', 'First turn remains UP');
    assertEqual(state.inputQueue[1], 'LEFT', 'Second turn updated to LEFT without lag');
  });

  // 17. Persistent Food Replenishment Guarantee
  test('Food replenishment: normal food is always maintained on board', () => {
    let state = createInitialState('CLASSIC', 0);
    // Eat normal food
    const head = state.snake[0];
    state.food = [
      {
        id: 'norm',
        position: { x: head.x + 1, y: head.y },
        type: 'NORMAL',
        points: 10,
        coins: 1,
      },
    ];

    const res = tick(state, state.currentSpeed);
    assertEqual(res.events.grew, true, 'Food eaten');
    const hasNormal = res.nextState.food.some((f) => f.type === 'NORMAL');
    assertEqual(hasNormal, true, 'New normal food immediately replenished');
  });

  // 18. Safe Start Positioning in Obstacle Mazes
  test('Safe spawn in obstacle stages: snake never spawns on obstacles', () => {
    // Challenge Stage 1
    const state1 = createInitialState('CHALLENGE', 0, 1);
    for (const seg of state1.snake) {
      const collides = state1.obstacles.some((o) => o.x === seg.x && o.y === seg.y);
      assertEqual(collides, false, 'Stage 1 snake segments do not collide with obstacles');
    }
    // Challenge Stage 2
    const state2 = createInitialState('CHALLENGE', 0, 2);
    for (const seg of state2.snake) {
      const collides = state2.obstacles.some((o) => o.x === seg.x && o.y === seg.y);
      assertEqual(collides, false, 'Stage 2 snake segments do not collide with obstacles');
    }
  });

  // 19. Challenge Mode Victory Condition
  test('Challenge victory: achieving target score triggers victory event', () => {
    let state = createInitialState('CHALLENGE', 0, 1); // Stage 1 target is 120
    const head = state.snake[0];
    state.score = 115;
    state.food = [
      {
        id: 'win_food',
        position: { x: head.x + 1, y: head.y },
        type: 'NORMAL',
        points: 10,
        coins: 1,
      },
    ];

    const res = tick(state, state.currentSpeed);
    assertEqual(res.events.victory, true, 'Victory event triggered');
    assertEqual(res.nextState.isVictory, true, 'State marked as victory');
  });

  // 20. Smart Shield Deflection & Invulnerability Window
  test('Smart shield deflection: deflects snake into safe lane with grace period', () => {
    let state = createInitialState('CLASSIC', 0);
    state.hasShield = true;
    state.snake = [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }];
    state.direction = 'RIGHT'; // Heading directly into right wall

    const res = tick(state, state.currentSpeed);
    assertEqual(res.events.gameOver, false, 'Prevented death');
    assertEqual(res.events.shieldPopped, true, 'Shield popped');
    assert(res.nextState.invulnerableTime > 0, 'Invulnerability grace granted');
    assert(res.nextState.direction !== 'RIGHT', 'Snake was deflected away from wall');
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return { passed, failed, results };
}
