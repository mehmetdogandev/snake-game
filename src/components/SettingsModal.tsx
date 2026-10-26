import React, { useState } from 'react';
import { X, Settings, Volume2, VolumeX, Music, Smartphone, Eye, Sparkles, Trash2, AlertTriangle, Globe } from 'lucide-react';
import { SaveData, PlayerSettings, Language } from '../game/types';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg md:max-w-xl max-h-[92dvh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
              {t.settingsTitle}
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
        <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 max-h-[85dvh] overflow-y-auto">
          {/* Language Selection Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.sectionLanguage}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/70 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => updateSetting('language', 'tr')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  lang === 'tr'
                    ? 'bg-emerald-500 text-slate-950 shadow-md ring-1 ring-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="text-base">🇹🇷</span>
                <span>Türkçe</span>
              </button>
              <button
                type="button"
                onClick={() => updateSetting('language', 'en')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  lang === 'en'
                    ? 'bg-emerald-500 text-slate-950 shadow-md ring-1 ring-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="text-base">🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>

          {/* Audio Section */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.sectionAudio}
            </h3>

            {/* Sound FX Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                {settings.soundFx ? (
                  <Volume2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-500" />
                )}
                <div>
                  <div className="text-sm font-semibold text-white">{t.soundFx}</div>
                  <div className="text-xs text-slate-400">{t.soundFxDesc}</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.soundFx}
                aria-label={t.soundFx}
                onClick={() => updateSetting('soundFx', !settings.soundFx)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.soundFx ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Music Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Music className={`w-5 h-5 ${settings.music ? 'text-cyan-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-sm font-semibold text-white">{t.music}</div>
                  <div className="text-xs text-slate-400">{t.musicDesc}</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.music}
                aria-label={t.music}
                onClick={() => updateSetting('music', !settings.music)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.music ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Haptic Feedback */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Smartphone className={`w-5 h-5 ${settings.haptics ? 'text-purple-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-sm font-semibold text-white">{t.haptics}</div>
                  <div className="text-xs text-slate-400">{t.hapticsDesc}</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.haptics}
                aria-label={t.haptics}
                onClick={() => updateSetting('haptics', !settings.haptics)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.haptics ? 'bg-purple-500 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* Controls Preference */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.sectionControls}
            </h3>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => updateSetting('controls', 'swipe')}
                className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  settings.controls === 'swipe'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.controlsSwipe}
              </button>
              <button
                type="button"
                onClick={() => updateSetting('controls', 'dpad')}
                className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  settings.controls === 'dpad'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.controlsDpad}
              </button>
              <button
                type="button"
                onClick={() => updateSetting('controls', 'both')}
                className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  settings.controls === 'both'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.controlsBoth}
              </button>
            </div>
          </div>

          {/* Accessibility Section */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.sectionAccessibility}
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm font-semibold text-white">{t.reducedMotion}</div>
                  <div className="text-xs text-slate-400">{t.reducedMotionDesc}</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.reducedMotion}
                aria-label={t.reducedMotion}
                onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.reducedMotion ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm font-semibold text-white">{t.highContrast}</div>
                  <div className="text-xs text-slate-400">{t.highContrastDesc}</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.highContrast}
                aria-label={t.highContrast}
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.highContrast ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* Danger Zone: Reset Progress */}
          <div className="pt-2 border-t border-slate-800">
            {showResetConfirm ? (
              <div className="p-4 rounded-xl border border-rose-500/50 bg-rose-950/30 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 text-sm font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  {t.resetProgress}?
                </div>
                <p className="text-xs text-slate-300">
                  {t.resetConfirm}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    {t.resetProgress}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-500/20 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t.resetProgress}
              </button>
            )}
          </div>

          {/* Version Info */}
          <div className="text-center pt-2 text-[11px] text-slate-500 font-mono-numbers">
            SNAKE EVOLUTION v1.0.0 · {lang === 'tr' ? 'Çevrim Dışı Sürüm' : 'Offline Edition'}
          </div>
        </div>
      </div>
    </div>
  );
};
