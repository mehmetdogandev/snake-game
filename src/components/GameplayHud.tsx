import React from 'react';
import { Pause, Trophy, Flame, Shield, Clock, Zap } from 'lucide-react';
import { GameState, Language } from '../game/types';
import { audio } from '../game/audio';
import { getTranslations } from '../game/i18n';

interface GameplayHudProps {
  state: GameState;
  onPause: () => void;
  language?: Language;
}

export const GameplayHud: React.FC<GameplayHudProps> = ({ state, onPause, language = 'tr' }) => {
  const is2x = state.activePowerUps.some((p) => p.type === 'BONUS_2X');
  const isSlow = state.activePowerUps.some((p) => p.type === 'SLOW');
  const t = getTranslations(language);

  const modeBadge =
    state.mode === 'CHALLENGE' && state.challengeStageId
      ? language === 'tr'
        ? `Bölüm ${state.challengeStageId}`
        : `Stage ${state.challengeStageId}`
      : state.mode === 'CLASSIC'
      ? t.modeClassic
      : state.mode === 'ZEN'
      ? t.modeZen
      : t.modeChallenge;

  return (
    <div className="w-full max-w-xl mx-auto px-4 pt-2 pb-1 flex flex-col gap-1.5 select-none z-20">
      {/* Top Header: Mode & Stage Timer & Best Score (Zero-Pill Metadata) */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold uppercase tracking-wider text-[var(--color-text-primary)] text-[11px] px-2.5 py-0.5 rounded-lg app-surface">
            {modeBadge}
          </span>

          {state.timeRemaining !== undefined && (
            <span className="flex items-center gap-1 font-mono-numbers text-cyan-500 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/30 shadow-sm animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              {Math.ceil(state.timeRemaining)}s
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Zero-pill unboxed metadata */}
          <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] font-mono-numbers text-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {t.best.toUpperCase()}: <strong className="text-[var(--color-text-primary)]">{state.highScore}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              onPause();
            }}
            className="p-1.5 sm:p-2 rounded-xl app-surface hover:bg-[var(--color-bg-elevated)] active:scale-95 text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] transition-transform cursor-pointer shadow-sm"
            aria-label={t.pause}
          >
            <Pause className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Main Score Bar & Dynamic Combo Readout */}
      <div className="flex items-center justify-between">
        {/* Score Readout with Tabular Numerals */}
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black font-mono-numbers tracking-tight text-[var(--color-text-primary)] text-glow-emerald">
            {state.score}
          </span>
          <span className="text-xs uppercase font-extrabold text-emerald-500 tracking-widest">
            {language === 'tr' ? 'PUAN' : 'PTS'}
          </span>
        </div>

        {/* Combo & Length Indicators */}
        <div className="flex items-center gap-2">
          {state.comboCount > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-500 text-xs font-black font-mono-numbers shadow-md glow-gold animate-bounce">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>
                {state.comboCount}X {t.combo.toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs font-mono-numbers text-emerald-500 font-bold app-surface px-3 py-1 rounded-xl border border-[var(--color-border-subtle)] shadow-sm">
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase">
              {language === 'tr' ? 'BOY' : 'LEN'}
            </span>
            <span className="text-sm font-extrabold text-[var(--color-text-primary)]">{state.snake.length}</span>
          </div>
        </div>
      </div>

      {/* Active Power-Up Badges */}
      {(state.hasShield || is2x || isSlow) && (
        <div className="flex items-center gap-2 pt-0.5">
          {state.hasShield && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/15 border border-blue-500/40 text-blue-500 text-[11px] font-bold shadow-sm glow-cyan">
              <Shield className="w-3.5 h-3.5 fill-blue-500/30" />
              <span>{t.powerupShield}</span>
            </div>
          )}

          {is2x && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-500 text-[11px] font-bold shadow-sm glow-purple">
              <Zap className="w-3.5 h-3.5 fill-purple-500" />
              <span>{t.powerupBonus2x}</span>
            </div>
          )}

          {isSlow && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-500 text-[11px] font-bold shadow-sm glow-cyan">
              <Clock className="w-3.5 h-3.5" />
              <span>{t.powerupSlow}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
