import React, { useState } from 'react';
import { Trophy, RotateCcw, Home, Share2, Sparkles, Coins, Zap, Check, Award, Flame } from 'lucide-react';
import { GameState, SaveData } from '../game/types';
import { audio } from '../game/audio';
import { getTranslations } from '../game/i18n';

interface GameOverModalProps {
  state: GameState;
  saveData: SaveData;
  earnedXp: number;
  earnedCoins: number;
  newAchievements: string[];
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  state,
  saveData,
  earnedXp,
  earnedCoins,
  newAchievements,
  onPlayAgain,
  onMainMenu,
}) => {
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const lang = saveData.settings.language || 'tr';
  const t = getTranslations(lang);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onPlayAgain();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onPlayAgain]);

  const handleShare = async () => {
    audio.playUiTap();
    const shareText =
      lang === 'tr'
        ? `🐍 Snake Evolution'da ${state.score} puan topladım ve yılan boyum ${state.snake.length}'e ulaştı! Benim rekorumu geçebilir misin?`
        : `🐍 I just scored ${state.score} points with a snake length of ${state.snake.length} in Snake Evolution! Can you beat my record?`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Snake Evolution Record',
          text: shareText,
          url: window.location.href,
        });
        setShareStatus(t.scoreCopied);
        setTimeout(() => setShareStatus(null), 3000);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          fallbackClipboard(shareText);
        }
      }
    } else {
      fallbackClipboard(shareText);
    }
  };

  const fallbackClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setShareStatus(t.scoreCopied);
          setTimeout(() => setShareStatus(null), 3000);
        })
        .catch(() => {
          setShareStatus(lang === 'tr' ? 'Panoya kopyalanamadı.' : 'Could not copy to clipboard.');
          setTimeout(() => setShareStatus(null), 3000);
        });
    } else {
      setShareStatus(lang === 'tr' ? 'Bu cihazda paylaşım desteklenmiyor.' : 'Sharing not supported on this device.');
      setTimeout(() => setShareStatus(null), 3000);
    }
  };

  const modeBadgeText =
    state.mode === 'CLASSIC'
      ? t.modeClassic
      : state.mode === 'ZEN'
      ? t.modeZen
      : t.modeChallenge;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md landscape:max-w-xl max-h-[94dvh] overflow-y-auto app-modal rounded-3xl p-5 sm:p-6 landscape:py-3 text-center">
        {/* Victory / Record Halo Header */}
        <div className="relative mb-3 sm:mb-4 flex flex-col items-center">
          {state.isVictory ? (
            <div className="mb-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-500 text-xs font-black uppercase tracking-wider glow-gold animate-bounce">
              <Sparkles className="w-4 h-4 fill-amber-500" />
              {t.stageCleared}
            </div>
          ) : state.isNewRecord ? (
            <div className="mb-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-xs font-black uppercase tracking-wider glow-emerald animate-bounce">
              <Trophy className="w-4 h-4 fill-emerald-500" />
              {t.newRecord}
            </div>
          ) : (
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">
              {lang === 'tr' ? 'Oyun Tamamlandı' : 'Run Complete'}
            </div>
          )}

          <h2 className="text-2xl sm:text-4xl font-black font-display text-[var(--color-text-primary)] tracking-tight">
            {state.isVictory ? t.victory : t.gameOver}
          </h2>
        </div>

        {/* In Landscape: Side-by-side Scoreboard & Stats Grid */}
        <div className="landscape:grid landscape:grid-cols-2 landscape:gap-3 mb-3">
          {/* Primary Scoreboard Podium */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] shadow-inner mb-3 landscape:mb-0 relative overflow-hidden flex flex-col justify-center">
            <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-0.5">
              {t.score}
            </div>
            <div className="text-4xl sm:text-6xl font-black font-mono-numbers text-[var(--color-text-primary)] tracking-tight text-glow-emerald my-0.5">
              {state.score}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] font-mono-numbers flex items-center justify-center gap-2">
              <span>{modeBadgeText}</span>
              <span>·</span>
              <span>
                {t.best.toUpperCase()}: <strong className="text-[var(--color-text-primary)]">{state.highScore}</strong>
              </span>
            </div>
          </div>

          {/* Breakdown Performance Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="p-2.5 sm:p-3 rounded-2xl app-surface border border-[var(--color-border-subtle)] shadow-sm flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold truncate">
                  {lang === 'tr' ? 'Toplanan Yem' : 'Energy'}
                </div>
                <div className="text-sm sm:text-base font-bold font-mono-numbers text-[var(--color-text-primary)]">
                  {state.foodCount}
                </div>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl app-surface border border-[var(--color-border-subtle)] shadow-sm flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-500 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold truncate">
                  {t.length}
                </div>
                <div className="text-sm sm:text-base font-bold font-mono-numbers text-cyan-500">
                  {state.snake.length}
                </div>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl app-surface border border-[var(--color-border-subtle)] shadow-sm flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-500 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold truncate">
                  {t.xp}
                </div>
                <div className="text-sm sm:text-base font-bold font-mono-numbers text-purple-500">
                  +{earnedXp}
                </div>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl app-surface border border-[var(--color-border-subtle)] shadow-sm flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold truncate">
                  {t.coins}
                </div>
                <div className="text-sm sm:text-base font-bold font-mono-numbers text-amber-500">
                  +{earnedCoins}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Achievements celebration if unlocked */}
        {newAchievements.length > 0 && (
          <div className="p-2.5 mb-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-500 text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {lang === 'tr'
                ? `${newAchievements.length} yeni kupa açıldı! Görevler menüsüne göz atın.`
                : `Unlocked ${newAchievements.length} new trophy! Visit Missions.`}
            </span>
          </div>
        )}

        {/* Feedback message banner */}
        {shareStatus && (
          <div className="mb-2 text-xs text-emerald-500 font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            {shareStatus}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              onPlayAgain();
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 active:scale-[0.985] text-slate-950 font-black rounded-2xl text-base transition-all shadow-xl flex items-center justify-center gap-2 glow-emerald cursor-pointer border-t border-white/40"
          >
            <RotateCcw className="w-4 h-4" />
            {t.playAgain}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 py-2 px-3 bg-[var(--color-bg-elevated)] hover:bg-[var(--color-border-strong)] active:scale-[0.985] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-[var(--color-border-subtle)] cursor-pointer shadow-sm"
            >
              <Share2 className="w-4 h-4 text-cyan-500" />
              {t.shareScore}
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playUiTap();
                onMainMenu();
              }}
              className="flex-1 py-2 px-3 bg-[var(--color-bg-elevated)] hover:bg-[var(--color-border-strong)] active:scale-[0.985] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-[var(--color-border-subtle)] cursor-pointer shadow-sm"
            >
              <Home className="w-4 h-4 text-[var(--color-text-secondary)]" />
              {t.mainMenu}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
