import { Point } from './types';

export interface CollisionResult {
  hasCollided: boolean;
  type: 'NONE' | 'WALL' | 'OBSTACLE' | 'SELF';
  wrappedHead?: Point;
}

/**
 * Checks collision for the next head position
 * @param nextHead Prospective new head position
 * @param snake Current snake segments (index 0 is current head)
 * @param obstacles Array of obstacle coordinates
 * @param gridWidth Board width
 * @param gridHeight Board height
 * @param allowWrap If true (Zen mode), snake wraps around walls instead of crashing
 * @param isEatingFood If true, the tail will NOT move forward, so tail cell remains blocked
 */
export function checkCollision(
  nextHead: Point,
  snake: Point[],
  obstacles: Point[],
  gridWidth: number,
  gridHeight: number,
  allowWrap: boolean,
  isEatingFood: boolean
): CollisionResult {
  let resolvedHead = { ...nextHead };

  // 1. Boundary / Wall check
  const isOutOfBounds =
    nextHead.x < 0 ||
    nextHead.x >= gridWidth ||
    nextHead.y < 0 ||
    nextHead.y >= gridHeight;

  if (isOutOfBounds) {
    if (allowWrap) {
      resolvedHead = {
        x: ((nextHead.x % gridWidth) + gridWidth) % gridWidth,
        y: ((nextHead.y % gridHeight) + gridHeight) % gridHeight,
      };
    } else {
      return { hasCollided: true, type: 'WALL' };
    }
  }

  // 2. Obstacle collision
  for (const obs of obstacles) {
    if (obs.x === resolvedHead.x && obs.y === resolvedHead.y) {
      return { hasCollided: true, type: 'OBSTACLE' };
    }
  }

  // 3. Self collision:
  // If snake is NOT eating food, its tail vacates its cell on this step.
  // Therefore, the tail position is SAFE to move into!
  // If snake IS eating food, the tail stays, so tail cell is NOT safe.
  const segmentsToCheckLength = isEatingFood ? snake.length : snake.length - 1;

  for (let i = 0; i < segmentsToCheckLength; i++) {
    const segment = snake[i];
    if (segment.x === resolvedHead.x && segment.y === resolvedHead.y) {
      return { hasCollided: true, type: 'SELF' };
    }
  }

  return { hasCollided: false, type: 'NONE', wrappedHead: resolvedHead };
}
