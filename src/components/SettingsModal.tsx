import React, { useState } from 'react';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Music,
  Smartphone,
  Eye,
  Sparkles,
  Trash2,
  AlertTriangle,
  Globe,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { SaveData, PlayerSettings, Language, AppearanceMode } from '../game/types';
import { resetSaveData } from '../game/storage';
import { audio } from '../game/audio';
import { getTranslations } from '../game/i18n';

interface SettingsModalProps {
  saveData: SaveData;
  onUpdateSave: (newSave: SaveData) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  saveData,
  onUpdateSave,
  onClose,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const settings = saveData.settings;
  const lang: Language = settings.language || 'tr';
  const appearance: AppearanceMode = settings.appearance || 'dark';
  const t = getTranslations(lang);

  const updateSetting = <K extends keyof PlayerSettings>(key: K, value: PlayerSettings[K]) => {
    audio.playUiTap();
    const newSettings = { ...settings, [key]: value };

    // Apply immediate audio manager hooks
    if (key === 'soundFx') audio.setSoundFxEnabled(value as boolean);
    if (key === 'music') audio.setMusicEnabled(value as boolean);
    if (key === 'haptics') audio.setHapticsEnabled(value as boolean);

    onUpdateSave({
      ...saveData,
      settings: newSettings,
    });
  };

  const handleConfirmReset = () => {
    audio.playCrash();
    const fresh = resetSaveData();
    onUpdateSave(fresh);
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg md:max-w-xl max-h-[92dvh] flex flex-col app-modal rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[var(--color-accent-primary)]" />
            <h2 className="text-lg sm:text-xl font-black font-display tracking-tight text-[var(--color-text-primary)]">
              {t.settingsTitle}
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[85dvh] overflow-y-auto">
          {/* Appearance Section (Light / Dark / System) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                {t.sectionAppearance}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                {appearance === 'light' ? t.appearanceLight : appearance === 'dark' ? t.appearanceDark : t.appearanceSystem}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
              <button
                type="button"
                onClick={() => updateSetting('appearance', 'light')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  appearance === 'light'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold ring-1 ring-amber-300'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Sun className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.appearanceLight}</span>
              </button>

              <button
                type="button"
                onClick={() => updateSetting('appearance', 'dark')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  appearance === 'dark'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold ring-1 ring-emerald-400'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Moon className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.appearanceDark}</span>
              </button>

              <button
                type="button"
                onClick={() => updateSetting('appearance', 'system')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  appearance === 'system'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold ring-1 ring-cyan-400'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Monitor className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.appearanceSystem}</span>
              </button>
            </div>
          </div>

          {/* Language Selection Section */}
          <div className="space-y-2 pt-2 border-t border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--color-accent-primary)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                {t.sectionLanguage}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border-subtle)]">
              <button
                type="button"
                onClick={() => updateSetting('language', 'tr')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  lang === 'tr'
                    ? 'bg-emerald-500 text-slate-950 shadow-md ring-1 ring-emerald-400'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <span className="text-base">🇹🇷</span>
                <span>Türkçe</span>
              </button>
              <button
                type="button"
                onClick={() => updateSetting('language', 'en')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  lang === 'en'
                    ? 'bg-emerald-500 text-slate-950 shadow-md ring-1 ring-emerald-400'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <span className="text-base">🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>

          {/* Audio Section */}
          <div className="space-y-2 pt-2 border-t border-[var(--color-border-subtle)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              {t.sectionAudio}
            </h3>

            {/* Sound FX Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
              <div className="flex items-center gap-3">
                {settings.soundFx ? (
                  <Volume2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-[var(--color-text-muted)]" />
                )}
                <div>
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">{t.soundFx}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{t.soundFxDesc}</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.soundFx}
                aria-label={t.soundFx}
                onClick={() => updateSetting('soundFx', !settings.soundFx)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.soundFx ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Music Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
              <div className="flex items-center gap-3">
                <Music className={`w-5 h-5 ${settings.music ? 'text-cyan-400' : 'text-[var(--color-text-muted)]'}`} />
                <div>
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">{t.music}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{t.musicDesc}</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.music}
                aria-label={t.music}
                onClick={() => updateSetting('music', !settings.music)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.music ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Haptic Feedback */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
              <div className="flex items-center gap-3">
                <Smartphone className={`w-5 h-5 ${settings.haptics ? 'text-purple-400' : 'text-[var(--color-text-muted)]'}`} />
                <div>
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">{t.haptics}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{t.hapticsDesc}</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.haptics}
                aria-label={t.haptics}
                onClick={() => updateSetting('haptics', !settings.haptics)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.haptics ? 'bg-purple-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* Controls Preference */}
          <div className="space-y-2 pt-2 border-t border-[var(--color-border-subtle)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              {t.sectionControls}
            </h3>
            <div className="grid grid-cols-3 gap-2 p-1 bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border-subtle)]">
              <button
                type="button"
                onClick={() => updateSetting('controls', 'swipe')}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.controls === 'swipe'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {t.controlsSwipe}
              </button>
              <button
                type="button"
                onClick={() => updateSetting('controls', 'dpad')}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.controls === 'dpad'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {t.controlsDpad}
              </button>
              <button
                type="button"
                onClick={() => updateSetting('controls', 'both')}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.controls === 'both'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {t.controlsBoth}
              </button>
            </div>
          </div>

          {/* Accessibility Section */}
          <div className="space-y-2 pt-2 border-t border-[var(--color-border-subtle)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              {t.sectionAccessibility}
            </h3>

            <div className="flex items-center justify-between p-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[var(--color-text-muted)]" />
                <div>
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">{t.reducedMotion}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{t.reducedMotionDesc}</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.reducedMotion}
                aria-label={t.reducedMotion}
                onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.reducedMotion ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-[var(--color-text-muted)]" />
                <div>
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">{t.highContrast}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{t.highContrastDesc}</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.highContrast}
                aria-label={t.highContrast}
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.highContrast ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* Danger Zone: Reset Progress */}
          <div className="pt-2 border-t border-[var(--color-border-subtle)]">
            {showResetConfirm ? (
              <div className="p-4 rounded-2xl border border-rose-500/50 bg-rose-500/10 space-y-3">
                <div className="flex items-center gap-2 text-rose-500 text-sm font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  {t.resetProgress}?
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {t.resetConfirm}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {t.resetProgress}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2.5 bg-[var(--color-bg-elevated)] hover:bg-[var(--color-border-strong)] active:scale-95 text-[var(--color-text-primary)] rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 px-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-500 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {t.resetProgress}
              </button>
            )}
          </div>

          {/* Version Info */}
          <div className="text-center pt-2 text-[11px] text-[var(--color-text-muted)] font-mono-numbers">
            SNAKE EVOLUTION v1.1.0 · {lang === 'tr' ? 'Çevrim Dışı Sürüm' : 'Offline Edition'}
          </div>
        </div>
      </div>
    </div>
  );
};
