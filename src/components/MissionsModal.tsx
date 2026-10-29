import React, { useState } from 'react';
import { X, Target, Award, Coins, Check, Gift } from 'lucide-react';
import { SaveData, Mission } from '../game/types';
import { ACHIEVEMENTS, getDailyMissions, addXp } from '../game/progression';
import { audio } from '../game/audio';
import { getTranslations, LOCALIZED_ACHIEVEMENTS, LOCALIZED_MISSIONS } from '../game/i18n';

interface MissionsModalProps {
  saveData: SaveData;
  onUpdateSave: (newSave: SaveData) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  saveData,
  onUpdateSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'achievements'>('daily');
  const { missions } = getDailyMissions(saveData);

  const lang = saveData.settings.language || 'tr';
  const t = getTranslations(lang);

  const handleClaimDaily = (mission: Mission) => {
    audio.playUiTap();
    if (saveData.dailyMissions.claimed[mission.id]) return;

    const currentProgress = saveData.dailyMissions.progress[mission.id] || 0;
    if (currentProgress < mission.target) return;

    const newSave: SaveData = {
      ...saveData,
      coins: saveData.coins + mission.rewardCoins,
      stats: {
        ...saveData.stats,
        totalCoinsEarned: saveData.stats.totalCoinsEarned + mission.rewardCoins,
      },
      dailyMissions: {
        ...saveData.dailyMissions,
        claimed: {
          ...saveData.dailyMissions.claimed,
          [mission.id]: true,
        },
      },
    };

    onUpdateSave(newSave);
    audio.playFanfare();
  };

  const handleClaimAchievement = (achId: string) => {
    audio.playUiTap();
    const ach = ACHIEVEMENTS.find((a) => a.id === achId);
    if (!ach) return;

    const state = saveData.achievements[achId];
    if (!state || !state.unlocked || state.claimed) return;

    let updatedSave: SaveData = {
      ...saveData,
      coins: saveData.coins + ach.rewardCoins,
      stats: {
        ...saveData.stats,
        totalCoinsEarned: saveData.stats.totalCoinsEarned + ach.rewardCoins,
      },
      achievements: {
        ...saveData.achievements,
        [achId]: {
          ...state,
          claimed: true,
        },
      },
    };

    const xpResult = addXp(updatedSave, ach.rewardXp);
    updatedSave = xpResult.save;

    onUpdateSave(updatedSave);
    audio.playFanfare();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[92dvh] flex flex-col app-modal rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg sm:text-xl font-black font-display text-[var(--color-text-primary)] tracking-tight">
              {lang === 'tr' ? 'Görevler & Başarımlar' : 'Missions & Trophies'}
            </h2>
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

        {/* Tab Selector */}
        <div className="flex p-2 gap-2 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              setActiveTab('daily');
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-[var(--color-bg-surface)] text-emerald-500 shadow-sm border border-[var(--color-border-subtle)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Gift className="w-4 h-4" />
            {t.missionsTabDaily}
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              setActiveTab('achievements');
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-[var(--color-bg-surface)] text-emerald-500 shadow-sm border border-[var(--color-border-subtle)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Award className="w-4 h-4" />
            {t.missionsTabAchievements}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {activeTab === 'daily' ? (
            missions.map((m) => {
              const current = Math.min(saveData.dailyMissions.progress[m.id] || 0, m.target);
              const isCompleted = current >= m.target;
              const isClaimed = !!saveData.dailyMissions.claimed[m.id];
              const pct = Math.min(100, Math.round((current / m.target) * 100));
              const loc = LOCALIZED_MISSIONS[lang][m.id] || { title: m.title, description: m.description };

              return (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-[var(--color-border-subtle)] app-surface flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-0.5">{loc.title}</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-2.5">{loc.description}</p>

                    <div className="w-full bg-[var(--color-bg-elevated)] rounded-full h-2 overflow-hidden border border-[var(--color-border-subtle)]">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono-numbers text-[var(--color-text-muted)] mt-1">
                      <span>{lang === 'tr' ? 'İlerleme' : 'Progress'}</span>
                      <span>
                        {current} / {m.target}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-xs font-mono-numbers text-amber-500 font-bold">
                      <Coins className="w-3.5 h-3.5" />
                      +{m.rewardCoins}
                    </div>

                    {isClaimed ? (
                      <span className="px-3 py-1 bg-[var(--color-bg-elevated)] rounded-xl text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        {t.claimed}
                      </span>
                    ) : isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleClaimDaily(m)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 active:scale-95 text-slate-950 font-bold text-xs rounded-xl transition-transform shadow-md cursor-pointer"
                      >
                        {t.claim}
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl text-[11px] font-medium text-[var(--color-text-muted)]">
                        {lang === 'tr' ? 'Devam Ediyor' : 'In Progress'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            ACHIEVEMENTS.map((ach) => {
              const achState = saveData.achievements[ach.id];
              const isUnlocked = achState?.unlocked || false;
              const isClaimed = achState?.claimed || false;
              const currentProg = Math.min(achState?.progress || 0, ach.maxProgress);
              const pct = isUnlocked ? 100 : Math.round((currentProg / ach.maxProgress) * 100);
              const loc = LOCALIZED_ACHIEVEMENTS[lang][ach.id] || { title: ach.title, description: ach.description };

              return (
                <div
                  key={ach.id}
                  className="p-4 rounded-2xl border border-[var(--color-border-subtle)] app-surface flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{loc.title}</h3>
                      {isUnlocked && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/35">
                          {t.completed}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-2.5">{loc.description}</p>

                    <div className="w-full bg-[var(--color-bg-elevated)] rounded-full h-2 overflow-hidden border border-[var(--color-border-subtle)]">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono-numbers text-[var(--color-text-muted)] mt-1">
                      <span>{lang === 'tr' ? 'Hedef' : 'Goal'}</span>
                      <span>
                        {currentProg} / {ach.maxProgress}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-xs font-mono-numbers">
                      <span className="text-amber-500 font-bold flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        +{ach.rewardCoins}
                      </span>
                      <span className="text-cyan-500 font-semibold">+{ach.rewardXp} {t.xp}</span>
                    </div>

                    {isClaimed ? (
                      <span className="px-3 py-1 bg-[var(--color-bg-elevated)] rounded-xl text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        {t.claimed}
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleClaimAchievement(ach.id)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 active:scale-95 text-slate-950 font-bold text-xs rounded-xl transition-transform shadow-md cursor-pointer"
                      >
                        {t.claim}
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl text-[11px] font-medium text-[var(--color-text-muted)]">
                        {t.locked}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
