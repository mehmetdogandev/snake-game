import React from 'react';
import { X, BarChart3, Clock, Trophy, Flame, Coins, Sparkles, Target } from 'lucide-react';
import { SaveData } from '../game/types';
import { ACHIEVEMENTS } from '../game/progression';
import { audio } from '../game/audio';
import { getTranslations } from '../game/i18n';

interface StatsModalProps {
  saveData: SaveData;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ saveData, onClose }) => {
  const stats = saveData.stats;
  const lang = saveData.settings.language || 'tr';
  const t = getTranslations(lang);

  // Format playtime
  const hours = Math.floor(stats.totalPlayTimeSeconds / 3600);
  const minutes = Math.floor((stats.totalPlayTimeSeconds % 3600) / 60);
  const seconds = stats.totalPlayTimeSeconds % 60;
  const playTimeFormatted =
    lang === 'tr'
      ? hours > 0
        ? `${hours} sa ${minutes} dk`
        : `${minutes} dk ${seconds} sn`
      : hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes}m ${seconds}s`;

  // Achievement completion %
  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = Object.values(saveData.achievements).filter((a) => a.unlocked).length;
  const achievementPct = Math.round((unlockedCount / totalAchievements) * 100);

  const statItems = [
    {
      label: t.statHighestScore,
      value: stats.highestScore.toLocaleString(),
      sub: `${t.modeClassic}: ${saveData.bestScores.classic} · ${t.modeZen}: ${saveData.bestScores.zen}`,
      icon: Trophy,
      color: 'text-amber-400',
    },
    {
      label: t.statLongestSnake,
      value: lang === 'tr' ? `${stats.longestSnake} parça` : `${stats.longestSnake} segments`,
      sub: lang === 'tr' ? 'Ulaşılan rekor uzunluk' : 'Peak length recorded',
      icon: Flame,
      color: 'text-emerald-400',
    },
    {
      label: t.statTotalFood,
      value: stats.totalFoodCollected.toLocaleString(),
      sub: lang === 'tr' ? `${stats.goldenFoodCollected} altın elma` : `${stats.goldenFoodCollected} golden orbs`,
      icon: Sparkles,
      color: 'text-cyan-400',
    },
    {
      label: t.statTotalRuns,
      value: stats.totalRuns.toLocaleString(),
      sub: lang === 'tr' ? 'Tamamlanan oyun seansı' : 'Completed gaming sessions',
      icon: Target,
      color: 'text-purple-400',
    },
    {
      label: t.statTotalPlayTime,
      value: playTimeFormatted,
      sub: lang === 'tr' ? 'Aktif oynanış süresi' : 'Time in active gameplay',
      icon: Clock,
      color: 'text-blue-400',
    },
    {
      label: t.statTotalCoins,
      value: stats.totalCoinsEarned.toLocaleString(),
      sub: `${lang === 'tr' ? 'Mevcut bakiye' : 'Current balance'}: ${saveData.coins.toLocaleString()}`,
      icon: Coins,
      color: 'text-amber-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg md:max-w-xl max-h-[92dvh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
              {t.statsTitle}
            </h2>
          </div>

          <button
            onClick={() => {
              audio.playUiTap();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 max-h-[85dvh] overflow-y-auto">
          {/* Progress Header Strip */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <div>
              <p className="text-xs text-slate-400 font-medium">
                {lang === 'tr' ? 'Açılan Kostümler' : 'Skins Unlocked'}
              </p>
              <p className="text-lg font-bold text-white font-mono-numbers">
                {saveData.unlockedSkins.length} <span className="text-xs text-slate-500">/ 10</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{t.missionsTabAchievements}</p>
              <p className="text-lg font-bold text-emerald-400 font-mono-numbers">
                {achievementPct}% <span className="text-xs text-slate-500">({unlockedCount}/{totalAchievements})</span>
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {statItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-semibold text-slate-400">{item.label}</span>
                  </div>
                  <div className="text-base font-bold text-white font-mono-numbers tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">{item.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
