import {
  GameState,
  GameMode,
  Direction,
  Point,
  FoodItem,
  FoodType,
} from './types';
import { checkCollision } from './collision';
import { CHALLENGE_STAGES } from './levels';

export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

const BASE_SPEED = 125; // ms per tick
const MIN_SPEED = 60;   // fastest tick rate

/**
 * Creates a brand new initial game state with guaranteed safe positioning
 */
export function createInitialState(
  mode: GameMode,
  highScore = 0,
  challengeStageId?: number
): GameState {
  let gridWidth = 20;
  let gridHeight = 20;
  let obstacles: Point[] = [];
  let currentSpeed = BASE_SPEED;
  let timeRemaining: number | undefined = undefined;

  if (mode === 'CHALLENGE' && challengeStageId) {
    const stage = CHALLENGE_STAGES.find((s) => s.id === challengeStageId) || CHALLENGE_STAGES[0];
    gridWidth = stage.gridWidth;
    gridHeight = stage.gridHeight;
    obstacles = [...stage.obstacles];
    currentSpeed = stage.initialSpeed;
    if (stage.timeLimitSeconds) {
      timeRemaining = stage.timeLimitSeconds;
    }
  } else if (mode === 'ZEN') {
    currentSpeed = 135; // Relaxed pace
  }

  // Find safe starting position if center is blocked by an obstacle
  let startX = Math.floor(gridWidth / 2);
  let startY = Math.floor(gridHeight / 2);

  const isBlocked = (x: number, y: number) =>
    obstacles.some((o) => o.x === x && o.y === y);

  if (
    isBlocked(startX, startY) ||
    isBlocked(startX - 1, startY) ||
    isBlocked(startX - 2, startY)
  ) {
    let foundSafe = false;
    for (let y = 2; y < gridHeight - 2; y++) {
      for (let x = 3; x < gridWidth - 2; x++) {
        if (!isBlocked(x, y) && !isBlocked(x - 1, y) && !isBlocked(x - 2, y)) {
          startX = x;
          startY = y;
          foundSafe = true;
          break;
        }
      }
      if (foundSafe) break;
    }
  }

  // Snake starts with 3 segments moving RIGHT
  const initialSnake: Point[] = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];

  const initialState: GameState = {
    mode,
    challengeStageId,
    gridWidth,
    gridHeight,
    snake: initialSnake,
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    inputQueue: [],
    food: [],
    obstacles,
    score: 0,
    highScore,
    foodCount: 0,
    coinsGained: 0,
    comboCount: 0,
    comboTimer: 0,
    activePowerUps: [],
    hasShield: false,
    invulnerableTime: 0,
    isPaused: false,
    isGameOver: false,
    isVictory: false,
    timeRemaining,
    elapsedTime: 0,
    currentSpeed,
    isNewRecord: false,
  };

  // Spawn initial guaranteed food
  initialState.food = spawnFood(initialState);
  return initialState;
}

/**
 * Validates and enqueues a new direction with input buffering & replacement
 */
export function queueDirection(state: GameState, requested: Direction): GameState {
  if (state.isPaused || state.isGameOver || state.isVictory) return state;

  if (state.inputQueue.length === 0) {
    // Check against current active direction
    if (OPPOSITE_DIRECTIONS[state.direction] === requested || state.direction === requested) {
      return state;
    }
    return {
      ...state,
      inputQueue: [requested],
    };
  } else if (state.inputQueue.length === 1) {
    const first = state.inputQueue[0];
    if (OPPOSITE_DIRECTIONS[first] === requested || first === requested) {
      return state;
    }
    return {
      ...state,
      inputQueue: [first, requested],
    };
  } else {
    // Queue already has 2 moves: replace the 2nd move against the 1st queued move
    const first = state.inputQueue[0];
    if (OPPOSITE_DIRECTIONS[first] === requested || first === requested) {
      return state;
    }
    return {
      ...state,
      inputQueue: [first, requested],
    };
  }
}

/**
 * Spawns food on free cells with guaranteed persistent Normal food and bonus items
 */
export function spawnFood(state: GameState): FoodItem[] {
  const currentFood = [...state.food];
  const occupied = new Set<string>();

  // Mark snake cells
  for (const seg of state.snake) {
    occupied.add(`${seg.x},${seg.y}`);
  }
  // Mark obstacles
  for (const obs of state.obstacles) {
    occupied.add(`${obs.x},${obs.y}`);
  }
  // Mark existing food
  for (const f of currentFood) {
    occupied.add(`${f.position.x},${f.position.y}`);
  }

  const freeCells: Point[] = [];
  for (let x = 0; x < state.gridWidth; x++) {
    for (let y = 0; y < state.gridHeight; y++) {
      if (!occupied.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    // Board is completely full!
    return currentFood;
  }

  // 1. Ensure at least one persistent NORMAL food is always on board
  const hasNormalFood = currentFood.some((f) => f.type === 'NORMAL');
  if (!hasNormalFood && freeCells.length > 0) {
    const idx = Math.floor(Math.random() * freeCells.length);
    const cell = freeCells.splice(idx, 1)[0];
    currentFood.push({
      id: `food_norm_${Date.now()}_${Math.random()}`,
      position: cell,
      type: 'NORMAL',
      points: 10,
      coins: 1,
    });
  }

  // 2. Chance to spawn an additional special item if none currently active on board
  const hasSpecial = currentFood.some((f) => f.type !== 'NORMAL');
  if (!hasSpecial && freeCells.length > 0 && state.foodCount > 0) {
    const rand = Math.random();
    let specialType: FoodType | null = null;

    if (state.foodCount % 4 === 0 && rand < 0.45) {
      specialType = 'GOLDEN';
    } else if (rand < 0.12) {
      specialType = 'BONUS_2X';
    } else if (rand < 0.18) {
      specialType = 'SLOW';
    } else if (rand < 0.24 && !state.hasShield) {
      specialType = 'SHIELD';
    }

    if (specialType) {
      const idx = Math.floor(Math.random() * freeCells.length);
      const cell = freeCells.splice(idx, 1)[0];
      currentFood.push({
        id: `food_${specialType}_${Date.now()}_${Math.random()}`,
        position: cell,
        type: specialType,
        points: specialType === 'GOLDEN' ? 50 : 25,
        coins: specialType === 'GOLDEN' ? 15 : 5,
        expiresAt: specialType === 'GOLDEN' ? Date.now() + 12000 : Date.now() + 10000,
        duration: specialType === 'GOLDEN' ? 12000 : 10000,
      });
    }
  }

  return currentFood;
}

export interface TickResult {
  nextState: GameState;
  events: {
    ateFood?: FoodItem;
    grew: boolean;
    hitWall: boolean;
    hitSelf: boolean;
    shieldPopped: boolean;
    gameOver: boolean;
    victory: boolean;
    newRecord: boolean;
  };
}

/**
 * Advances the simulation by 1 logical tick
 */
export function tick(state: GameState, deltaMs: number): TickResult {
  const events: TickResult['events'] = {
    grew: false,
    hitWall: false,
    hitSelf: false,
    shieldPopped: false,
    gameOver: false,
    victory: false,
    newRecord: false,
  };

  if (state.isPaused || state.isGameOver || state.isVictory) {
    return { nextState: state, events };
  }

  let nextDirection = state.direction;
  const nextQueue = [...state.inputQueue];
  if (nextQueue.length > 0) {
    const candidate = nextQueue.shift()!;
    if (OPPOSITE_DIRECTIONS[state.direction] !== candidate) {
      nextDirection = candidate;
    }
  }

  // Update combo timer
  let comboCount = state.comboCount;
  let comboTimer = Math.max(0, state.comboTimer - deltaMs);
  if (comboTimer <= 0) {
    comboCount = 0;
  }

  // Update invulnerability grace timer
  const invulnerableTime = Math.max(0, state.invulnerableTime - deltaMs);

  // Update time remaining in challenge mode
  let timeRemaining = state.timeRemaining;
  if (timeRemaining !== undefined) {
    timeRemaining = Math.max(0, timeRemaining - deltaMs / 1000);
    if (timeRemaining <= 0) {
      return {
        nextState: { ...state, timeRemaining: 0, isGameOver: true },
        events: { ...events, gameOver: true },
      };
    }
  }

  // Update active powerups
  const now = Date.now();
  const activePowerUps = state.activePowerUps.filter((p) => p.expiresAt > now);
  let hasShield = state.hasShield;
  const is2xActive = activePowerUps.some((p) => p.type === 'BONUS_2X');
  const isSlowActive = activePowerUps.some((p) => p.type === 'SLOW');

  // Clean expired temporary foods (like golden apple)
  let currentFood = state.food.filter((f) => !f.expiresAt || f.expiresAt > now);

  // Compute next head position
  const head = state.snake[0];
  let nextHead: Point = { x: head.x, y: head.y };
  switch (nextDirection) {
    case 'UP':
      nextHead.y -= 1;
      break;
    case 'DOWN':
      nextHead.y += 1;
      break;
    case 'LEFT':
      nextHead.x -= 1;
      break;
    case 'RIGHT':
      nextHead.x += 1;
      break;
  }

  // Check if eating food on this cell
  const eatenFoodIndex = currentFood.findIndex(
    (f) => f.position.x === nextHead.x && f.position.y === nextHead.y
  );
  const isEating = eatenFoodIndex !== -1;
  const eatenFood = isEating ? currentFood[eatenFoodIndex] : undefined;

  // Collision detection
  const allowWrap = state.mode === 'ZEN';
  const collision = checkCollision(
    nextHead,
    state.snake,
    state.obstacles,
    state.gridWidth,
    state.gridHeight,
    allowWrap,
    isEating
  );

  let finalHead = collision.wrappedHead || nextHead;

  if (collision.hasCollided) {
    // Check if protected by shield or grace invulnerability
    if (hasShield || invulnerableTime > 0) {
      if (hasShield) {
        hasShield = false;
        events.shieldPopped = true;
      }

      // Auto-deflect snake into perpendicular safe lane
      const perpDirs: Direction[] =
        state.direction === 'UP' || state.direction === 'DOWN'
          ? ['LEFT', 'RIGHT']
          : ['UP', 'DOWN'];

      let safeDir = perpDirs[0];
      for (const d of perpDirs) {
        const testHead = { ...head };
        if (d === 'UP') testHead.y -= 1;
        if (d === 'DOWN') testHead.y += 1;
        if (d === 'LEFT') testHead.x -= 1;
        if (d === 'RIGHT') testHead.x += 1;

        const testCol = checkCollision(
          testHead,
          state.snake,
          state.obstacles,
          state.gridWidth,
          state.gridHeight,
          allowWrap,
          false
        );
        if (!testCol.hasCollided) {
          safeDir = d;
          break;
        }
      }

      let deflectedHead = { ...head };
      if (safeDir === 'UP') deflectedHead.y -= 1;
      if (safeDir === 'DOWN') deflectedHead.y += 1;
      if (safeDir === 'LEFT') deflectedHead.x -= 1;
      if (safeDir === 'RIGHT') deflectedHead.x += 1;

      if (allowWrap) {
        deflectedHead = {
          x: ((deflectedHead.x % state.gridWidth) + state.gridWidth) % state.gridWidth,
          y: ((deflectedHead.y % state.gridHeight) + state.gridHeight) % state.gridHeight,
        };
      }

      const newSnake: Point[] = [deflectedHead, ...state.snake];
      newSnake.pop();

      return {
        nextState: {
          ...state,
          snake: newSnake,
          direction: safeDir,
          inputQueue: [],
          hasShield: false,
          invulnerableTime: 1200,
        },
        events,
      };
    }

    if (collision.type === 'WALL') events.hitWall = true;
    if (collision.type === 'SELF') events.hitSelf = true;
    events.gameOver = true;

    return {
      nextState: {
        ...state,
        isGameOver: true,
      },
      events,
    };
  }

  // Move snake forward
  const newSnake: Point[] = [finalHead, ...state.snake];
  if (!isEating) {
    newSnake.pop(); // Remove tail
  } else {
    events.grew = true;
    events.ateFood = eatenFood;
  }

  // Score & coins computation
  let newScore = state.score;
  let newCoins = state.coinsGained;
  let newFoodCount = state.foodCount;
  const newActivePowerUps = [...activePowerUps];

  if (eatenFood) {
    newFoodCount += 1;
    comboCount = Math.min(comboCount + 1, 5);
    comboTimer = 4500; // 4.5 seconds to chain next food

    const comboMultiplier = 1 + (comboCount - 1) * 0.25;
    const powerMultiplier = is2xActive ? 2 : 1;
    const gainedScore = Math.round(eatenFood.points * comboMultiplier * powerMultiplier);
    newScore += gainedScore;
    newCoins += eatenFood.coins;

    // Apply special food buffs
    if (eatenFood.type === 'BONUS_2X') {
      newActivePowerUps.push({
        type: 'BONUS_2X',
        expiresAt: now + 10000,
        durationMs: 10000,
      });
    } else if (eatenFood.type === 'SLOW') {
      newActivePowerUps.push({
        type: 'SLOW',
        expiresAt: now + 8000,
        durationMs: 8000,
      });
    } else if (eatenFood.type === 'SHIELD') {
      hasShield = true;
    }

    // Remove eaten food
    currentFood.splice(eatenFoodIndex, 1);
  }

  // Check victory in Challenge Mode
  let isVictory = false;
  if (state.mode === 'CHALLENGE' && state.challengeStageId) {
    const stage = CHALLENGE_STAGES.find((s) => s.id === state.challengeStageId);
    if (stage && (newScore >= stage.targetScore || newSnake.length >= stage.targetLength)) {
      isVictory = true;
      events.victory = true;
    }
  }

  // Check high score record
  let isNewRecord = state.isNewRecord;
  let highScore = state.highScore;
  if (newScore > highScore) {
    highScore = newScore;
    if (!isNewRecord && newScore > 0) {
      isNewRecord = true;
      events.newRecord = true;
    }
  }

  // Speed scaling in Classic mode
  let currentSpeed = state.currentSpeed;
  if (state.mode === 'CLASSIC') {
    const speedReduction = Math.min(newFoodCount * 2.5, 65);
    currentSpeed = Math.max(BASE_SPEED - speedReduction, MIN_SPEED);
  }
  if (isSlowActive) {
    currentSpeed = Math.floor(currentSpeed * 1.4); // 40% slower
  }

  // Ensure food exists and replenish
  let finalFood = currentFood;
  if (finalFood.length === 0 || !finalFood.some((f) => f.type === 'NORMAL')) {
    finalFood = spawnFood({
      ...state,
      snake: newSnake,
      food: finalFood,
      foodCount: newFoodCount,
    });
  }

  // Check if board full -> win
  const totalPlayableCells = state.gridWidth * state.gridHeight - state.obstacles.length;
  if (newSnake.length >= totalPlayableCells) {
    isVictory = true;
    events.victory = true;
  }

  return {
    nextState: {
      ...state,
      snake: newSnake,
      direction: nextDirection,
      nextDirection,
      inputQueue: nextQueue,
      food: finalFood,
      score: newScore,
      highScore,
      foodCount: newFoodCount,
      coinsGained: newCoins,
      comboCount,
      comboTimer,
      activePowerUps: newActivePowerUps,
      hasShield,
      invulnerableTime,
      isGameOver: false,
      isVictory,
      timeRemaining,
      elapsedTime: state.elapsedTime + deltaMs,
      currentSpeed,
      isNewRecord,
    },
    events,
  };
}
