import React, { useState } from 'react';
import { X, Target, Award, Coins, Check, Gift } from 'lucide-react';
import { SaveData, Mission } from '../game/types';
import { ACHIEVEMENTS, getDailyMissions, addXp } from '../game/progression';
import { audio } from '../game/audio';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold font-display text-white tracking-tight">
              Missions & Trophies
            </h2>
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

        {/* Tab Selector */}
        <div className="flex p-2 gap-2 bg-slate-950/50 border-b border-slate-800/60">
          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              setActiveTab('daily');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'daily'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gift className="w-4 h-4" />
            Daily Missions
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              setActiveTab('achievements');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'achievements'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            Achievements
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {activeTab === 'daily' ? (
            missions.map((m) => {
              const current = Math.min(saveData.dailyMissions.progress[m.id] || 0, m.target);
              const isCompleted = current >= m.target;
              const isClaimed = !!saveData.dailyMissions.claimed[m.id];
              const pct = Math.min(100, Math.round((current / m.target) * 100));

              return (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white mb-0.5">{m.title}</h3>
                    <p className="text-xs text-slate-400 mb-2.5">{m.description}</p>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono-numbers text-slate-400 mt-1">
                      <span>Progress</span>
                      <span>
                        {current} / {m.target}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-xs font-mono-numbers text-amber-400 font-bold">
                      <Coins className="w-3.5 h-3.5" />
                      +{m.rewardCoins}
                    </div>

                    {isClaimed ? (
                      <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Claimed
                      </span>
                    ) : isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleClaimDaily(m)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-lg transition-transform shadow-md"
                      >
                        Claim
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-slate-800/50 border border-slate-700/40 rounded-lg text-[11px] font-medium text-slate-500">
                        In Progress
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

              return (
                <div
                  key={ach.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-white">{ach.title}</h3>
                      {isUnlocked && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-2.5">{ach.description}</p>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono-numbers text-slate-400 mt-1">
                      <span>Goal</span>
                      <span>
                        {currentProg} / {ach.maxProgress}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-xs font-mono-numbers">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        +{ach.rewardCoins}
                      </span>
                      <span className="text-cyan-400 font-semibold">+{ach.rewardXp} XP</span>
                    </div>

                    {isClaimed ? (
                      <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Claimed
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleClaimAchievement(ach.id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-lg transition-transform shadow-md"
                      >
                        Claim
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-slate-800/50 border border-slate-700/40 rounded-lg text-[11px] font-medium text-slate-500">
                        Locked
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
