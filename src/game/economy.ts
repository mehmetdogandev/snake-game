import { SaveData, SkinId } from './types';
import { SKINS } from './skins';

/**
 * Calculates coins awarded at the end of a run
 */
export function calculateRunCoins(score: number, foodEaten: number, mode: string): number {
  let baseCoins = Math.floor(score / 15);
  // Mode multipliers
  if (mode === 'CHALLENGE') {
    baseCoins = Math.floor(baseCoins * 1.3);
  }
  // Minimum participation reward if at least 1 food was eaten
  if (foodEaten > 0 && baseCoins < 5) {
    baseCoins = 5;
  }
  return baseCoins;
}

/**
 * Calculates XP earned from a run
 */
export function calculateRunXp(score: number, foodEaten: number, mode: string): number {
  let xp = Math.floor(score * 0.8) + foodEaten * 5;
  if (mode === 'CHALLENGE') {
    xp = Math.floor(xp * 1.25);
  }
  return Math.max(10, xp);
}

/**
 * Unlocks a skin using in-game coins
 */
export function purchaseSkin(save: SaveData, skinId: SkinId): { success: boolean; error?: string; save: SaveData } {
  const skin = SKINS[skinId];
  if (!skin) {
    return { success: false, error: 'Invalid skin', save };
  }

  if (save.unlockedSkins.includes(skinId)) {
    return { success: false, error: 'Skin already unlocked', save };
  }

  if (save.coins < skin.cost) {
    return { success: false, error: 'Not enough coins', save };
  }

  save.coins -= skin.cost;
  save.unlockedSkins.push(skinId);
  save.selectedSkin = skinId;

  return { success: true, save };
}

/**
 * Equips an already unlocked skin
 */
export function equipSkin(save: SaveData, skinId: SkinId): { success: boolean; save: SaveData } {
  if (!save.unlockedSkins.includes(skinId)) {
    return { success: false, save };
  }
  save.selectedSkin = skinId;
  return { success: true, save };
}
