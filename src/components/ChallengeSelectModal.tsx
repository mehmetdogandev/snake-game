import React from 'react';
import { X, Swords, Star, Play, Clock, Target } from 'lucide-react';
import { CHALLENGE_STAGES } from '../game/levels';
import { SaveData, ChallengeStage } from '../game/types';
import { audio } from '../game/audio';

interface ChallengeSelectModalProps {
  saveData: SaveData;
  onSelectStage: (stage: ChallengeStage) => void;
  onClose: () => void;
}

export const ChallengeSelectModal: React.FC<ChallengeSelectModalProps> = ({
  saveData,
  onSelectStage,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-display text-white tracking-tight">
              Challenge Trials
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

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3 max-h-[80vh] overflow-y-auto">
          {CHALLENGE_STAGES.map((stage) => {
            const isCompleted = saveData.completedChallenges.includes(stage.id);
            const bestScore = saveData.bestScores.challenges[stage.id] || 0;

            return (
              <div
                key={stage.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white font-display">
                      {stage.title}
                    </h3>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                        <Star className="w-3 h-3 fill-amber-400" />
                        Cleared
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{stage.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono-numbers text-slate-300">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Target className="w-3.5 h-3.5" />
                      Goal: {stage.targetScore} pts / {stage.targetLength} len
                    </span>

                    {stage.timeLimitSeconds && (
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Clock className="w-3.5 h-3.5" />
                        {stage.timeLimitSeconds}s Limit
                      </span>
                    )}

                    {bestScore > 0 && (
                      <span className="text-slate-400">Best: {bestScore} pts</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    audio.playUiTap();
                    onSelectStage(stage);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 active:scale-95 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 glow-emerald cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  PLAY TRIAL
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
