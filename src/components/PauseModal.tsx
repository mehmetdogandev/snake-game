import React from 'react';
import { Play, RotateCcw, Home, Settings } from 'lucide-react';
import { GameState } from '../game/types';
import { audio } from '../game/audio';

interface PauseModalProps {
  state: GameState;
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  state,
  onResume,
  onRestart,
  onSettings,
  onMainMenu,
}) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 text-center space-y-4">
        <div>
          <div className="inline-block px-3 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
            Paused
          </div>
          <h2 className="text-3xl font-black font-display text-white tracking-tight">
            Game Paused
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Catch your breath, serpent master</p>
        </div>

        {/* Current Run Metrics Podium */}
        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Score</div>
            <div className="text-xl font-black font-mono-numbers text-white mt-0.5">{state.score ?? 0}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Length</div>
            <div className="text-xl font-black font-mono-numbers text-emerald-400 mt-0.5">
              {state.snake?.length ?? 3}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Food</div>
            <div className="text-xl font-black font-mono-numbers text-cyan-400 mt-0.5">
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
            className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 active:scale-[0.98] text-slate-950 font-black rounded-2xl text-base transition-all shadow-xl flex items-center justify-center gap-2 glow-emerald cursor-pointer border-t border-white/40"
          >
            <Play className="w-5 h-5 fill-current" />
            RESUME RUN
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              onRestart();
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700/80 active:scale-[0.98] text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Run
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                audio.playUiTap();
                onSettings();
              }}
              className="flex-1 py-2.5 bg-slate-800/80 hover:bg-slate-700 active:scale-[0.98] text-slate-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700/70 cursor-pointer shadow-sm"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playUiTap();
                onMainMenu();
              }}
              className="flex-1 py-2.5 bg-slate-800/80 hover:bg-slate-700 active:scale-[0.98] text-slate-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700/70 cursor-pointer shadow-sm"
            >
              <Home className="w-4 h-4" />
              Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
