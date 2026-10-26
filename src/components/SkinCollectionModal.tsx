import React, { useState } from 'react';
import { X, Coins, Check, Sparkles, Lock } from 'lucide-react';
import { SKIN_LIST, SKINS } from '../game/skins';
import { SaveData, SkinId } from '../game/types';
import { purchaseSkin, equipSkin } from '../game/economy';
import { HeroSnakePreview } from './HeroSnakePreview';
import { audio } from '../game/audio';

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

  const activeSkinDef = SKINS[selectedPreviewSkin] || SKINS.emerald;
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
      setErrorMessage(result.error || 'Cannot unlock skin');
      audio.playCrash();
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/40';
      case 'epic':
        return 'text-purple-400 bg-purple-950/40 border-purple-500/40';
      case 'rare':
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-500/40';
      default:
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div>
            <h2 className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Serpent Wardrobe
            </h2>
            <p className="text-xs text-slate-400">12 original skins with dynamic aura styles</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 font-mono-numbers text-sm font-semibold">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{saveData.coins.toLocaleString()}</span>
            </div>

            <button
              onClick={() => {
                audio.playUiTap();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Preview Banner */}
        <div className="px-5 py-4 bg-gradient-to-b from-slate-800/40 to-slate-900/80 border-b border-slate-800/60 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-56 flex items-center justify-center bg-slate-950/60 rounded-xl p-2 border border-slate-800/50">
            <HeroSnakePreview skinId={selectedPreviewSkin} width={220} height={90} />
          </div>

          <div className="flex-1 w-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-lg font-bold text-white font-display">
                  {activeSkinDef.name}
                </h3>
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getRarityBadge(
                    activeSkinDef.rarity
                  )}`}
                >
                  {activeSkinDef.rarity}
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3">{activeSkinDef.description}</p>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-400 mb-2 font-medium">{errorMessage}</p>
            )}

            <div className="flex items-center gap-3">
              {isEquipped ? (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-400 text-xs font-bold shadow-sm glow-emerald">
                  <Check className="w-4 h-4" />
                  Currently Equipped
                </div>
              ) : isUnlocked ? (
                <button
                  type="button"
                  onClick={() => handleEquip(selectedPreviewSkin)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 active:scale-95 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg flex items-center gap-1.5 glow-emerald cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  EQUIP SKIN
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePurchase(selectedPreviewSkin)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 active:scale-95 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg flex items-center gap-1.5 glow-gold cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  UNLOCK FOR {activeSkinDef.cost.toLocaleString()} COINS
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Skin Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {SKIN_LIST.map((skin) => {
              const unlocked = saveData.unlockedSkins.includes(skin.id);
              const equipped = saveData.selectedSkin === skin.id;
              const isSelected = selectedPreviewSkin === skin.id;

              return (
                <button
                  key={skin.id}
                  type="button"
                  onClick={() => {
                    audio.playUiTap();
                    setSelectedPreviewSkin(skin.id);
                    setErrorMessage(null);
                  }}
                  className={`relative p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500/80 bg-slate-800/90 shadow-lg ring-1 ring-emerald-500/40'
                      : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  {/* Equipped pill */}
                  {equipped && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      Equipped
                    </span>
                  )}

                  {/* Lock icon if not unlocked */}
                  {!unlocked && (
                    <span className="absolute top-2 right-2 text-slate-400 bg-slate-950/60 p-1 rounded-md">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}

                  {/* Color preview dot cluster */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div
                      className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: skin.primaryColor }}
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: skin.secondaryColor }}
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight truncate">
                      {skin.name}
                    </h4>
                    <span
                      className={`text-[9px] uppercase font-bold tracking-wider mt-0.5 inline-block ${
                        skin.rarity === 'legendary'
                          ? 'text-amber-400'
                          : skin.rarity === 'epic'
                          ? 'text-purple-400'
                          : skin.rarity === 'rare'
                          ? 'text-cyan-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {skin.rarity}
                    </span>
                  </div>

                  {/* Cost or Status */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono-numbers">
                    {unlocked ? (
                      <span className="text-emerald-400 font-semibold">Unlocked</span>
                    ) : (
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
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
