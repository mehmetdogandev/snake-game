import { SaveData, SkinId } from './types';

const SAVE_KEY = 'snake_evolution_save_v1';

// In-memory fallback if localStorage is completely blocked or restricted
let memoryFallbackStore: string | null = null;

export const DEFAULT_SAVE_DATA: SaveData = {
  version: 1,
  level: 1,
  xp: 0,
  coins: 50, // Starting gift
  selectedSkin: 'emerald',
  unlockedSkins: ['emerald'],
  bestScores: {
    classic: 0,
    zen: 0,
    challenges: {},
  },
  completedChallenges: [],
  stats: {
    totalRuns: 0,
    totalFoodCollected: 0,
    highestScore: 0,
    longestSnake: 0,
    totalPlayTimeSeconds: 0,
    totalCoinsEarned: 50,
    goldenFoodCollected: 0,
    challengesCompleted: 0,
  },
  achievements: {},
  dailyMissions: {
    date: '',
    progress: {},
    claimed: {},
  },
  settings: {
    soundFx: true,
    music: true,
    haptics: true,
    reducedMotion: false,
    highContrast: false,
    controls: 'both',
    language: 'tr',
    appearance: 'dark',
  },
  lastSavedAt: Date.now(),
};

/**
 * Loads save data from localStorage or in-memory fallback with graceful recovery
 */
export function loadSaveData(): SaveData {
  try {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(SAVE_KEY);
    } catch {
      raw = memoryFallbackStore;
    }

    if (!raw && memoryFallbackStore) {
      raw = memoryFallbackStore;
    }

    if (!raw) {
      return { ...DEFAULT_SAVE_DATA };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_SAVE_DATA };
    }

    // Version migration handling
    const migrated = migrateSaveData(parsed) as Partial<SaveData>;

    // Deep merge with defaults so newly added keys are always populated safely
    return {
      ...DEFAULT_SAVE_DATA,
      ...migrated,
      bestScores: {
        ...DEFAULT_SAVE_DATA.bestScores,
        ...(migrated.bestScores || {}),
        challenges: {
          ...(DEFAULT_SAVE_DATA.bestScores.challenges || {}),
          ...(migrated.bestScores?.challenges || {}),
        },
      },
      stats: {
        ...DEFAULT_SAVE_DATA.stats,
        ...(migrated.stats || {}),
      },
      settings: {
        ...DEFAULT_SAVE_DATA.settings,
        ...(migrated.settings || {}),
        language: (migrated.settings?.language === 'en' ? 'en' : 'tr'),
        appearance: (['light', 'dark', 'system'].includes(migrated.settings?.appearance as string)
          ? migrated.settings!.appearance
          : 'dark'),
      },
      achievements: {
        ...(migrated.achievements || {}),
      },
      dailyMissions: {
        ...DEFAULT_SAVE_DATA.dailyMissions,
        ...(migrated.dailyMissions || {}),
        progress: { ...(migrated.dailyMissions?.progress || {}) },
        claimed: { ...(migrated.dailyMissions?.claimed || {}) },
      },
      unlockedSkins: Array.from(new Set<SkinId>(['emerald', ...(migrated.unlockedSkins || [])])),
    };
  } catch (err) {
    console.warn('Failed to parse save data, falling back to session defaults:', err);
    return { ...DEFAULT_SAVE_DATA };
  }
}

/**
 * Saves data safely to localStorage with in-memory session backup
 */
export function saveSaveData(data: SaveData): boolean {
  try {
    const updated = {
      ...data,
      lastSavedAt: Date.now(),
    };
    const serialized = JSON.stringify(updated);
    memoryFallbackStore = serialized;

    try {
      localStorage.setItem(SAVE_KEY, serialized);
    } catch {
      // In-memory fallback handles blocked storage
    }
    return true;
  } catch (err) {
    console.error('Failed to write save data:', err);
    return false;
  }
}

/**
 * Reset all player progress with fresh defaults
 */
export function resetSaveData(): SaveData {
  memoryFallbackStore = null;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
  return { ...DEFAULT_SAVE_DATA, lastSavedAt: Date.now() };
}

/**
 * Migration helper
 */
function migrateSaveData(data: Record<string, unknown>): Record<string, unknown> {
  if (!data.version) {
    data.version = 1;
  }
  return data;
}
