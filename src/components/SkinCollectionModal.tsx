import React, { useState } from 'react';
import { X, Coins, Check, Sparkles, Lock } from 'lucide-react';
import { SKIN_LIST, SKINS } from '../game/skins';
import { SaveData, SkinId } from '../game/types';
import { purchaseSkin, equipSkin } from '../game/economy';
import { HeroSnakePreview } from './HeroSnakePreview';
import { audio } from '../game/audio';
import { getTranslations, LOCALIZED_SKINS } from '../game/i18n';

interface SkinCollectionModalProps {
  saveData: SaveData;
  onUpdateSave: (newSave: SaveData) => void;
  onClose: () => void;
}

export const SkinCollectionModal: React.FC<SkinCollectionModalProps> = ({
  saveData,
  onUpdateSave,
  onClose,
}) => {
  const [selectedPreviewSkin, setSelectedPreviewSkin] = useState<SkinId>(saveData.selectedSkin);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lang = saveData.settings.language || 'tr';
  const t = getTranslations(lang);

  const activeSkinDef = SKINS[selectedPreviewSkin] || SKINS.emerald;
  const localizedActiveSkin = LOCALIZED_SKINS[lang][selectedPreviewSkin] || {
    name: activeSkinDef.name,
    description: activeSkinDef.description,
  };
  const isUnlocked = saveData.unlockedSkins.includes(selectedPreviewSkin);
  const isEquipped = saveData.selectedSkin === selectedPreviewSkin;

  const handleEquip = (skinId: SkinId) => {
    audio.playUiTap();
    const result = equipSkin(saveData, skinId);
    if (result.success) {
      onUpdateSave(result.save);
      audio.playPowerup();
    }
  };

  const handlePurchase = (skinId: SkinId) => {
    audio.playUiTap();
    setErrorMessage(null);
    const result = purchaseSkin(saveData, skinId);
    if (result.success) {
      onUpdateSave(result.save);
      audio.playFanfare();
    } else {
      const errMsg =
        lang === 'tr'
          ? result.error === 'Insufficient coins'
            ? 'Yetersiz altın! Daha fazla altın kazanmak için oynayın.'
            : 'Kostüm kilidi açılamadı.'
          : result.error || 'Cannot unlock skin';
      setErrorMessage(errMsg);
      audio.playCrash();
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return t.rarityLegendary;
      case 'epic':
        return t.rarityEpic;
      case 'rare':
        return t.rarityRare;
      default:
        return t.rarityCommon;
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-amber-500 bg-amber-500/15 border-amber-500/35';
      case 'epic':
        return 'text-purple-500 bg-purple-500/15 border-purple-500/35';
      case 'rare':
        return 'text-cyan-500 bg-cyan-500/15 border-cyan-500/35';
      default:
        return 'text-emerald-500 bg-emerald-500/15 border-emerald-500/35';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[94dvh] flex flex-col app-modal rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
          <div>
            <h2 className="text-lg sm:text-xl font-black font-display text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
              {t.wardrobeTitle}
            </h2>
            <p className="text-[11px] sm:text-xs text-[var(--color-text-secondary)]">{t.wardrobeSubtitle}</p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/35 rounded-xl text-amber-500 font-mono-numbers text-xs sm:text-sm font-bold shadow-inner">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span>{saveData.coins.toLocaleString()}</span>
            </div>

            <button
              onClick={() => {
                audio.playUiTap();
                onClose();
              }}
              className="p-1.5 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
              aria-label={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Preview Banner */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 landscape:py-2 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
          <div className="w-full sm:w-52 flex items-center justify-center bg-[var(--color-bg-surface)] rounded-2xl p-2 border border-[var(--color-border-subtle)] shadow-inner">
            <HeroSnakePreview skinId={selectedPreviewSkin} width={200} height={75} />
          </div>

          <div className="flex-1 w-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] font-display">
                  {localizedActiveSkin.name}
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${getRarityBadge(
                    activeSkinDef.rarity
                  )}`}
                >
                  {getRarityLabel(activeSkinDef.rarity)}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-3">{localizedActiveSkin.description}</p>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-500 mb-2 font-medium">{errorMessage}</p>
            )}

            <div className="flex items-center gap-3">
              {isEquipped ? (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-500 text-xs font-bold shadow-sm glow-emerald">
                  <Check className="w-4 h-4" />
                  {t.equipped}
                </div>
              ) : isUnlocked ? (
                <button
                  type="button"
                  onClick={() => handleEquip(selectedPreviewSkin)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 active:scale-95 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg flex items-center gap-1.5 glow-emerald cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {t.equip.toUpperCase()}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePurchase(selectedPreviewSkin)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 active:scale-95 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg flex items-center gap-1.5 glow-gold cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  {lang === 'tr'
                    ? `${activeSkinDef.cost.toLocaleString()} ALTIN İLE AÇ`
                    : `UNLOCK FOR ${activeSkinDef.cost.toLocaleString()} COINS`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Skin Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {SKIN_LIST.map((skin) => {
              const unlocked = saveData.unlockedSkins.includes(skin.id);
              const equipped = saveData.selectedSkin === skin.id;
              const isSelected = selectedPreviewSkin === skin.id;
              const loc = LOCALIZED_SKINS[lang][skin.id] || { name: skin.name };

              return (
                <button
                  key={skin.id}
                  type="button"
                  onClick={() => {
                    audio.playUiTap();
                    setSelectedPreviewSkin(skin.id);
                    setErrorMessage(null);
                  }}
                  className={`relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-[var(--color-bg-elevated)] shadow-lg ring-2 ring-emerald-500/40'
                      : 'border-[var(--color-border-subtle)] app-surface hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)]'
                  }`}
                >
                  {/* Equipped pill */}
                  {equipped && (
                    <span className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/15 border border-emerald-500/35 px-1.5 py-0.5 rounded-md">
                      {t.equipped}
                    </span>
                  )}

                  {/* Lock icon if not unlocked */}
                  {!unlocked && (
                    <span className="absolute top-2.5 right-2.5 text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] p-1 rounded-md">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}

                  {/* Color preview dot cluster */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div
                      className="w-5 h-5 rounded-full border border-white/30 shadow-sm"
                      style={{ backgroundColor: skin.primaryColor }}
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm"
                      style={{ backgroundColor: skin.secondaryColor }}
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-text-primary)] leading-tight truncate">
                      {loc.name}
                    </h4>
                    <span
                      className={`text-[9px] uppercase font-bold tracking-wider mt-0.5 inline-block ${
                        skin.rarity === 'legendary'
                          ? 'text-amber-500'
                          : skin.rarity === 'epic'
                          ? 'text-purple-500'
                          : skin.rarity === 'rare'
                          ? 'text-cyan-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {getRarityLabel(skin.rarity)}
                    </span>
                  </div>

                  {/* Cost or Status */}
                  <div className="mt-3 pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[11px] font-mono-numbers">
                    {unlocked ? (
                      <span className="text-emerald-500 font-semibold">{t.unlock}</span>
                    ) : (
                      <span className="text-amber-500 font-semibold flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        {skin.cost}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
