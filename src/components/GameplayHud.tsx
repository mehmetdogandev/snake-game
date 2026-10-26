import React from 'react';
import { Pause, Trophy, Flame, Shield, Clock, Zap } from 'lucide-react';
import { GameState } from '../game/types';
import { audio } from '../game/audio';

interface GameplayHudProps {
  state: GameState;
  onPause: () => void;
}

export const GameplayHud: React.FC<GameplayHudProps> = ({ state, onPause }) => {
  const is2x = state.activePowerUps.some((p) => p.type === 'BONUS_2X');
  const isSlow = state.activePowerUps.some((p) => p.type === 'SLOW');

  return (
    <div className="w-full max-w-xl mx-auto px-4 pt-2.5 pb-1 flex flex-col gap-1.5 select-none z-20">
      {/* Top Header: Mode & Stage Timer & Best Score */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold uppercase tracking-wider text-slate-300 text-[11px] px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800">
            {state.mode === 'CHALLENGE' && state.challengeStageId
              ? `Stage ${state.challengeStageId}`
              : state.mode}
          </span>

          {state.timeRemaining !== undefined && (
            <span className="flex items-center gap-1 font-mono-numbers text-cyan-400 font-bold bg-cyan-950/70 px-2 py-0.5 rounded-md border border-cyan-700/50 shadow-sm animate-pulse">
              <Clock className="w-3 h-3 text-cyan-400" />
              {Math.ceil(state.timeRemaining)}s
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono-numbers text-xs bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-800">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>BEST: <strong className="text-slate-200">{state.highScore}</strong></span>
          </div>

          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              onPause();
            }}
            className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700/70 transition-transform cursor-pointer shadow-sm"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Main Score Bar & Dynamic Combo Readout */}
      <div className="flex items-center justify-between">
        {/* Score Readout with Neon Glow */}
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black font-mono-numbers text-white tracking-tight text-glow-emerald">
            {state.score}
          </span>
          <span className="text-xs uppercase font-extrabold text-emerald-400/80 tracking-widest">
            PTS
          </span>
        </div>

        {/* Combo & Length Badges */}
        <div className="flex items-center gap-2.5">
          {state.comboCount > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl text-amber-300 text-xs font-black font-mono-numbers shadow-lg glow-gold animate-bounce">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{state.comboCount}X COMBO</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs font-mono-numbers text-emerald-400 font-bold bg-slate-900/90 px-3 py-1 rounded-xl border border-emerald-500/30 shadow-sm">
            <span className="text-[10px] text-slate-400 uppercase">LEN</span>
            <span className="text-sm font-extrabold text-white">{state.snake.length}</span>
          </div>
        </div>
      </div>

      {/* Active Power-Up Countdown Badges */}
      {(state.hasShield || is2x || isSlow) && (
        <div className="flex items-center gap-2 pt-0.5">
          {state.hasShield && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-500/50 text-blue-300 text-[11px] font-bold shadow-sm glow-cyan">
              <Shield className="w-3.5 h-3.5 text-blue-400 fill-blue-400/40" />
              <span>Shield Ready</span>
            </div>
          )}

          {is2x && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-500/50 text-purple-300 text-[11px] font-bold shadow-sm glow-purple">
              <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
              <span>2X Multiplier</span>
            </div>
          )}

          {isSlow && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[11px] font-bold shadow-sm glow-cyan">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Slow Motion</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
