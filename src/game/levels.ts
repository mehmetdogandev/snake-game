import { ChallengeStage, Point } from './types';

export const CHALLENGE_STAGES: ChallengeStage[] = [
  {
    id: 1,
    title: 'Stage 1: Neon Corridor',
    description: 'Navigate two parallel dividing barriers to reach a score of 120.',
    gridWidth: 18,
    gridHeight: 18,
    targetScore: 120,
    targetLength: 15,
    initialSpeed: 135,
    obstacles: [
      // Top horizontal barrier
      { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
      { x: 10, y: 5 }, { x: 11, y: 5 }, { x: 12, y: 5 }, { x: 13, y: 5 },
      // Bottom horizontal barrier
      { x: 4, y: 12 }, { x: 5, y: 12 }, { x: 6, y: 12 }, { x: 7, y: 12 },
      { x: 10, y: 12 }, { x: 11, y: 12 }, { x: 12, y: 12 }, { x: 13, y: 12 },
    ],
  },
  {
    id: 2,
    title: 'Stage 2: The Box Maze',
    description: 'Four fortified corner bunkers protect bonus 2X multiplier apples.',
    gridWidth: 20,
    gridHeight: 20,
    targetScore: 220,
    targetLength: 20,
    initialSpeed: 125,
    specialFoodType: 'BONUS_2X',
    obstacles: [
      // Top-Left corner bunker
      { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 3, y: 4 },
      // Top-Right corner bunker
      { x: 15, y: 3 }, { x: 15, y: 4 }, { x: 16, y: 4 },
      // Bottom-Left corner bunker
      { x: 4, y: 16 }, { x: 4, y: 15 }, { x: 3, y: 15 },
      // Bottom-Right corner bunker
      { x: 15, y: 16 }, { x: 15, y: 15 }, { x: 16, y: 15 },
      // Central column pylons (leaving center row 10 open for snake spawn)
      { x: 9, y: 6 }, { x: 10, y: 6 },
      { x: 9, y: 14 }, { x: 10, y: 14 },
    ],
  },
  {
    id: 3,
    title: 'Stage 3: Crossroads Rush',
    description: 'Score 300 points before the 75-second timer runs out!',
    gridWidth: 20,
    gridHeight: 20,
    targetScore: 300,
    targetLength: 22,
    timeLimitSeconds: 75,
    initialSpeed: 120,
    specialFoodType: 'GOLDEN',
    obstacles: [
      // Cross barriers leaving wide central passage
      { x: 9, y: 3 }, { x: 9, y: 4 }, { x: 9, y: 5 }, { x: 10, y: 3 }, { x: 10, y: 4 }, { x: 10, y: 5 },
      { x: 9, y: 14 }, { x: 9, y: 15 }, { x: 9, y: 16 }, { x: 10, y: 14 }, { x: 10, y: 15 }, { x: 10, y: 16 },
      { x: 3, y: 9 }, { x: 4, y: 9 }, { x: 5, y: 9 }, { x: 3, y: 10 }, { x: 4, y: 10 }, { x: 5, y: 10 },
      { x: 14, y: 9 }, { x: 15, y: 9 }, { x: 16, y: 9 }, { x: 14, y: 10 }, { x: 15, y: 10 }, { x: 16, y: 10 },
    ],
  },
  {
    id: 4,
    title: 'Stage 4: Speed Gauntlet',
    description: 'Narrow corridors with high-density energy pylons. Fast pace!',
    gridWidth: 22,
    gridHeight: 22,
    targetScore: 400,
    targetLength: 26,
    initialSpeed: 100,
    specialFoodType: 'SLOW',
    obstacles: [
      { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 6 },
      { x: 15, y: 5 }, { x: 16, y: 5 }, { x: 16, y: 6 },
      { x: 5, y: 15 }, { x: 5, y: 16 }, { x: 6, y: 16 },
      { x: 16, y: 15 }, { x: 15, y: 16 }, { x: 16, y: 16 },
      { x: 10, y: 6 }, { x: 11, y: 6 },
      { x: 10, y: 15 }, { x: 11, y: 15 },
      { x: 6, y: 10 }, { x: 6, y: 11 },
      { x: 15, y: 10 }, { x: 15, y: 11 },
    ],
  },
  {
    id: 5,
    title: 'Stage 5: Labyrinth of Serpents',
    description: 'The master trial: navigate an intricate maze and conquer 500 points.',
    gridWidth: 22,
    gridHeight: 22,
    targetScore: 500,
    targetLength: 30,
    timeLimitSeconds: 120,
    initialSpeed: 110,
    specialFoodType: 'SHIELD',
    obstacles: [
      // Left vertical wall with middle gate
      { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 },
      { x: 6, y: 15 }, { x: 6, y: 16 }, { x: 6, y: 17 }, { x: 6, y: 18 }, { x: 6, y: 19 },
      // Right vertical wall with middle gate
      { x: 15, y: 2 }, { x: 15, y: 3 }, { x: 15, y: 4 }, { x: 15, y: 5 }, { x: 15, y: 6 },
      { x: 15, y: 15 }, { x: 15, y: 16 }, { x: 15, y: 17 }, { x: 15, y: 18 }, { x: 15, y: 19 },
      // Central horizontal dividers
      { x: 8, y: 9 }, { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 11, y: 9 }, { x: 12, y: 9 }, { x: 13, y: 9 },
      { x: 8, y: 12 }, { x: 9, y: 12 }, { x: 10, y: 12 }, { x: 11, y: 12 }, { x: 12, y: 12 }, { x: 13, y: 12 },
    ],
  },
];
