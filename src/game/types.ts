/**
 * SNAKE EVOLUTION - Core Game Types & Interfaces
 */

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export type GameMode = 'CLASSIC' | 'ZEN' | 'CHALLENGE';

export type FoodType = 'NORMAL' | 'GOLDEN' | 'BONUS_2X' | 'SLOW' | 'SHIELD';

export interface FoodItem {
  id: string;
  position: Point;
  type: FoodType;
  points: number;
  coins: number;
  expiresAt?: number; // timestamp for temporary foods like golden apple
  duration?: number;  // total lifespan in ms for countdown indicator
}

export interface ActivePowerUp {
  type: FoodType;
  expiresAt: number;
  durationMs: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
}

export type SkinRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type SkinPattern = 
  | 'scales'
  | 'neon'
  | 'circuit'
  | 'rings'
  | 'pixel'
  | 'galaxy'
  | 'prism'
  | 'stealth'
  | 'flame'
  | 'ice'
  | 'gold'
  | 'ocean';

export type SkinId =
  | 'emerald'
  | 'neon_lime'
  | 'cyber_cyan'
  | 'solar_gold'
  | 'violet_pulse'
  | 'arctic_ice'
  | 'crimson'
  | 'ocean'
  | 'galaxy'
  | 'retro_pixel'
  | 'prism'
  | 'shadow';

export interface SkinDefinition {
  id: SkinId;
  name: string;
  description: string;
  rarity: SkinRarity;
  cost: number;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  eyeColor: string;
  pattern: SkinPattern;
  unlockRequirement?: string;
}

export interface ChallengeStage {
  id: number;
  title: string;
  description: string;
  gridWidth: number;
  gridHeight: number;
  targetScore: number;
  targetLength: number;
  timeLimitSeconds?: number;
  obstacles: Point[];
  initialSpeed: number; // ms per tick
  specialFoodType?: FoodType;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardCoins: number;
  rewardXp: number;
  maxProgress: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  target: number;
  type: 'score' | 'food' | 'length' | 'zen_score' | 'rounds' | 'golden_food';
}

export interface PlayerStats {
  totalRuns: number;
  totalFoodCollected: number;
  highestScore: number;
  longestSnake: number;
  totalPlayTimeSeconds: number;
  totalCoinsEarned: number;
  goldenFoodCollected: number;
  challengesCompleted: number;
}

export interface PlayerSettings {
  soundFx: boolean;
  music: boolean;
  haptics: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  controls: 'swipe' | 'dpad' | 'both';
}

export interface SaveData {
  version: number;
  level: number;
  xp: number;
  coins: number;
  selectedSkin: SkinId;
  unlockedSkins: SkinId[];
  bestScores: {
    classic: number;
    zen: number;
    challenges: Record<number, number>;
  };
  completedChallenges: number[];
  stats: PlayerStats;
  achievements: Record<string, { unlocked: boolean; progress: number; claimed: boolean }>;
  dailyMissions: {
    date: string;
    progress: Record<string, number>;
    claimed: Record<string, boolean>;
  };
  settings: PlayerSettings;
  lastSavedAt: number;
}

export interface GameState {
  mode: GameMode;
  challengeStageId?: number;
  gridWidth: number;
  gridHeight: number;
  snake: Point[];
  direction: Direction;
  nextDirection: Direction;
  inputQueue: Direction[];
  food: FoodItem[];
  obstacles: Point[];
  score: number;
  highScore: number;
  foodCount: number;
  coinsGained: number;
  comboCount: number;
  comboTimer: number; // countdown
  activePowerUps: ActivePowerUp[];
  hasShield: boolean;
  invulnerableTime: number; // brief grace period in ms
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  timeRemaining?: number; // for challenge mode
  elapsedTime: number;
  currentSpeed: number; // ms per tick
  isNewRecord: boolean;
}

export type AppScreen =
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'VICTORY'
  | 'SKINS'
  | 'MISSIONS'
  | 'STATS'
  | 'SETTINGS'
  | 'CHALLENGES';
