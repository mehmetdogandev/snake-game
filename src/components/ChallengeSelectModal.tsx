import React from 'react';
import { X, Swords, Star, Play, Clock, Target } from 'lucide-react';
import { CHALLENGE_STAGES } from '../game/levels';
import { SaveData, ChallengeStage } from '../game/types';
import { audio } from '../game/audio';
import { getTranslations, LOCALIZED_CHALLENGES } from '../game/i18n';

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
  const lang = saveData.settings.language || 'tr';
  const t = getTranslations(lang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl md:max-w-2xl max-h-[92dvh] flex flex-col app-modal rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
          <div className="flex items-center gap-2.5">
            <Swords className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-black font-display text-[var(--color-text-primary)] tracking-tight">
              {t.challengesTitle}
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

        {/* Content */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[85dvh] overflow-y-auto">
          {CHALLENGE_STAGES.map((stage) => {
            const isCompleted = saveData.completedChallenges.includes(stage.id);
            const bestScore = saveData.bestScores.challenges[stage.id] || 0;
            const loc = LOCALIZED_CHALLENGES[lang][stage.id] || {
              title: stage.title,
              description: stage.description,
            };

            return (
              <div
                key={stage.id}
                className="p-4 rounded-2xl border border-[var(--color-border-subtle)] app-surface hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)] transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-display">
                      {loc.title}
                    </h3>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/35 shrink-0">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {t.completed}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-2.5 leading-relaxed">{loc.description}</p>

                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono-numbers text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                      <Target className="w-3.5 h-3.5" />
                      {lang === 'tr'
                        ? `${stage.targetScore} puan / ${stage.targetLength} boy`
                        : `${stage.targetScore} pts / ${stage.targetLength} len`}
                    </span>

                    {stage.timeLimitSeconds && (
                      <span className="flex items-center gap-1 text-cyan-500 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {stage.timeLimitSeconds}s
                      </span>
                    )}

                    {bestScore > 0 && (
                      <span className="text-[var(--color-text-muted)]">
                        {t.best}: {bestScore}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    audio.playUiTap();
                    onSelectStage(stage);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 active:scale-[0.985] text-slate-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 glow-emerald cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {t.play}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
