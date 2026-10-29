import React from 'react';
import { Play, RotateCcw, Home, Settings } from 'lucide-react';
import { GameState, Language } from '../game/types';
import { audio } from '../game/audio';
import { getTranslations } from '../game/i18n';

interface PauseModalProps {
  state: GameState;
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
  language?: Language;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  state,
  onResume,
  onRestart,
  onSettings,
  onMainMenu,
  language = 'tr',
}) => {
  const t = getTranslations(language);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onResume();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onResume]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm max-h-[92dvh] overflow-y-auto app-modal rounded-3xl p-5 sm:p-6 landscape:py-3 text-center space-y-3 sm:space-y-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-text-muted)] mb-1 block">
            {t.pause}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[var(--color-text-primary)] tracking-tight">
            {t.paused}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {language === 'tr' ? 'Derin bir nefes al, yılan ustası' : 'Catch your breath, serpent master'}
          </p>
        </div>

        {/* Current Run Metrics Podium */}
        <div className="p-3.5 bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border-subtle)] shadow-inner grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider">{t.score}</div>
            <div className="text-xl font-black font-mono-numbers text-[var(--color-text-primary)] mt-0.5">{state.score ?? 0}</div>
          </div>
          <div>
            <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider">{t.length}</div>
            <div className="text-xl font-black font-mono-numbers text-emerald-500 mt-0.5">
              {state.snake?.length ?? 3}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider">
              {language === 'tr' ? 'Yem' : 'Food'}
            </div>
            <div className="text-xl font-black font-mono-numbers text-cyan-500 mt-0.5">
              {state.foodCount ?? 0}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              onResume();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 active:scale-[0.985] text-slate-950 font-black rounded-2xl text-base transition-all shadow-xl flex items-center justify-center gap-2 glow-emerald cursor-pointer border-t border-white/40"
          >
            <Play className="w-5 h-5 fill-current" />
            {t.resume}
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              onRestart();
            }}
            className="w-full py-2.5 bg-[var(--color-bg-elevated)] hover:bg-[var(--color-border-strong)] active:scale-[0.985] text-[var(--color-text-primary)] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-[var(--color-border-subtle)] cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            {t.restart}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                audio.playUiTap();
                onSettings();
              }}
              className="flex-1 py-2.5 bg-[var(--color-bg-elevated)] hover:bg-[var(--color-border-strong)] active:scale-[0.985] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-[var(--color-border-subtle)] cursor-pointer shadow-sm"
            >
              <Settings className="w-4 h-4" />
              {t.settings}
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playUiTap();
                onMainMenu();
              }}
              className="flex-1 py-2.5 bg-[var(--color-bg-elevated)] hover:bg-[var(--color-border-strong)] active:scale-[0.985] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-[var(--color-border-subtle)] cursor-pointer shadow-sm"
            >
              <Home className="w-4 h-4" />
              {t.mainMenu}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
