import React, { useState } from 'react';
import { Trophy, RotateCcw, Home, Share2, Sparkles, Coins, Zap, Check, Award, Flame } from 'lucide-react';
import { GameState, SaveData } from '../game/types';
import { audio } from '../game/audio';

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
  earnedXp,
  earnedCoins,
  newAchievements,
  onPlayAgain,
  onMainMenu,
}) => {
  const [shareStatus, setShareStatus] = useState<string | null>(null);

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
    const shareText = `🐍 I just scored ${state.score} points with a snake length of ${state.snake.length} in Snake Evolution! Can you beat my record?`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Snake Evolution Record',
          text: shareText,
          url: window.location.href,
        });
        setShareStatus('Result shared successfully!');
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
          setShareStatus('Score copied to clipboard!');
          setTimeout(() => setShareStatus(null), 3000);
        })
        .catch(() => {
          setShareStatus('Could not copy to clipboard.');
          setTimeout(() => setShareStatus(null), 3000);
        });
    } else {
      setShareStatus('Sharing not supported on this device.');
      setTimeout(() => setShareStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 text-center">
        {/* Victory / Record Halo Header */}
        <div className="relative mb-4 flex flex-col items-center">
          {state.isVictory ? (
            <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-wider glow-gold animate-bounce">
              <Sparkles className="w-4 h-4 fill-amber-400" />
              Stage Cleared!
            </div>
          ) : state.isNewRecord ? (
            <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider glow-emerald animate-bounce">
              <Trophy className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              New Personal Best!
            </div>
          ) : (
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
              Run Complete
            </div>
          )}

          <h2 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
            {state.isVictory ? 'Victory!' : 'Game Over'}
          </h2>
        </div>

        {/* Primary Scoreboard Podium */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900/90 border border-slate-800 shadow-inner mb-4 relative overflow-hidden">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
            Total Score
          </div>
          <div className="text-5xl sm:text-6xl font-black font-mono-numbers text-white tracking-tight text-glow-emerald my-1">
            {state.score}
          </div>
          <div className="text-xs text-slate-400 font-mono-numbers flex items-center justify-center gap-2">
            <span>{state.mode} MODE</span>
            <span>·</span>
            <span>RECORD: <strong className="text-slate-200">{state.highScore}</strong></span>
          </div>
        </div>

        {/* Breakdown Performance Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-left">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 shadow-sm flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Energy Eaten</div>
              <div className="text-base font-bold font-mono-numbers text-white">
                {state.foodCount}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 shadow-sm flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Snake Length</div>
              <div className="text-base font-bold font-mono-numbers text-cyan-400">
                {state.snake.length}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 shadow-sm flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">XP Earned</div>
              <div className="text-base font-bold font-mono-numbers text-purple-400">
                +{earnedXp}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 shadow-sm flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Coins Gained</div>
              <div className="text-base font-bold font-mono-numbers text-amber-400">
                +{earnedCoins}
              </div>
            </div>
          </div>
        </div>

        {/* New Achievements celebration if unlocked */}
        {newAchievements.length > 0 && (
          <div className="p-3 mb-4 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Unlocked {newAchievements.length} new trophy! Visit Missions.</span>
          </div>
        )}

        {/* Feedback message banner */}
        {shareStatus && (
          <div className="mb-3 text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
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
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 active:scale-[0.98] text-slate-950 font-black rounded-2xl text-base transition-all shadow-xl flex items-center justify-center gap-2 glow-emerald cursor-pointer border-t border-white/40"
          >
            <RotateCcw className="w-4 h-4" />
            PLAY AGAIN
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700/80 active:scale-[0.98] text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer shadow-sm"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              Share Score
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playUiTap();
                onMainMenu();
              }}
              className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700/80 active:scale-[0.98] text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer shadow-sm"
            >
              <Home className="w-4 h-4 text-slate-300" />
              Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
