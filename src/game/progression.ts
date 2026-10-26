import { Achievement, Mission, SaveData } from './types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_food',
    title: 'First Bite',
    description: 'Consume your very first energy orb.',
    icon: 'Apple',
    rewardCoins: 50,
    rewardXp: 50,
    maxProgress: 1,
  },
  {
    id: 'length_20',
    title: 'Centipede',
    description: 'Grow your serpent to a length of 20 segments.',
    icon: 'Maximize2',
    rewardCoins: 100,
    rewardXp: 120,
    maxProgress: 20,
  },
  {
    id: 'length_35',
    title: 'Mythic Drake',
    description: 'Reach a length of 35 segments.',
    icon: 'Flame',
    rewardCoins: 250,
    rewardXp: 250,
    maxProgress: 35,
  },
  {
    id: 'length_50',
    title: 'World Serpent',
    description: 'Attain the legendary length of 50 segments.',
    icon: 'Crown',
    rewardCoins: 500,
    rewardXp: 500,
    maxProgress: 50,
  },
  {
    id: 'score_500',
    title: 'High Roller',
    description: 'Achieve a score of 500 or more in a single run.',
    icon: 'Trophy',
    rewardCoins: 200,
    rewardXp: 200,
    maxProgress: 500,
  },
  {
    id: 'score_1000',
    title: 'Arcade Legend',
    description: 'Score 1,000 points in Classic mode.',
    icon: 'Award',
    rewardCoins: 500,
    rewardXp: 600,
    maxProgress: 1000,
  },
  {
    id: 'golden_10',
    title: 'Golden Hoard',
    description: 'Collect 10 rare Golden Apples.',
    icon: 'Sparkles',
    rewardCoins: 300,
    rewardXp: 300,
    maxProgress: 10,
  },
  {
    id: 'zen_500',
    title: 'Zen Master',
    description: 'Reach 500 points in Zen peaceful mode.',
    icon: 'Compass',
    rewardCoins: 200,
    rewardXp: 200,
    maxProgress: 500,
  },
  {
    id: 'challenges_all',
    title: 'Gauntlet Victor',
    description: 'Conquer all 5 handcrafted Challenge Stages.',
    icon: 'CheckCircle2',
    rewardCoins: 600,
    rewardXp: 800,
    maxProgress: 5,
  },
  {
    id: 'collector_5',
    title: 'Wardrobe Collector',
    description: 'Unlock at least 5 different serpent skins.',
    icon: 'Palette',
    rewardCoins: 350,
    rewardXp: 400,
    maxProgress: 5,
  },
  {
    id: 'coins_2000',
    title: 'Cryptid Tycoon',
    description: 'Earn a lifetime total of 2,000 coins.',
    icon: 'Coins',
    rewardCoins: 400,
    rewardXp: 500,
    maxProgress: 2000,
  },
];

/**
 * Returns XP required to reach the next level from current level
 */
export function getXpRequiredForNextLevel(currentLevel: number): number {
  return 100 + (currentLevel - 1) * 75;
}

/**
 * Adds XP to save data and calculates level-ups
 */
export function addXp(save: SaveData, amount: number): { leveledUp: boolean; newLevel: number; save: SaveData } {
  let xp = save.xp + amount;
  let level = save.level;
  let leveledUp = false;

  while (true) {
    const required = getXpRequiredForNextLevel(level);
    if (xp >= required) {
      xp -= required;
      level += 1;
      leveledUp = true;
      save.coins += level * 30; // Level up reward coins!
      save.stats.totalCoinsEarned += level * 30;
    } else {
      break;
    }
  }

  save.xp = xp;
  save.level = level;
  return { leveledUp, newLevel: level, save };
}

/**
 * Generates or retrieves today's 3 daily missions
 */
export function getDailyMissions(save: SaveData): { missions: Mission[]; save: SaveData } {
  const today = new Date().toISOString().slice(0, 10);

  // If saved date matches today, keep current progress
  if (save.dailyMissions.date === today) {
    return {
      missions: generateMissionsForDate(today),
      save,
    };
  }

  // New day: reset daily missions
  save.dailyMissions = {
    date: today,
    progress: {},
    claimed: {},
  };

  return {
    missions: generateMissionsForDate(today),
    save,
  };
}

function generateMissionsForDate(dateStr: string): Mission[] {
  // Deterministic seed based on date string
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  return [
    {
      id: `daily_food_${dateStr}`,
      title: 'Energy Harvest',
      description: 'Collect 25 energy orbs across all runs.',
      target: 25,
      rewardCoins: 75,
      type: 'food',
    },
    {
      id: `daily_score_${dateStr}`,
      title: 'Score Milestone',
      description: 'Score 250 points in a single run.',
      target: 250,
      rewardCoins: 100,
      type: 'score',
    },
    {
      id: `daily_rounds_${dateStr}`,
      title: 'Serpent Dedication',
      description: 'Complete 3 full gameplay rounds today.',
      target: 3,
      rewardCoins: 90,
      type: 'rounds',
    },
  ];
}
