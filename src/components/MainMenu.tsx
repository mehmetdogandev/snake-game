import React, { useState, useEffect } from 'react';
import {
  Play,
  Volume2,
  VolumeX,
  Palette,
  Target,
  BarChart3,
  Settings,
  Coins,
  Swords,
  Sparkles,
} from 'lucide-react';
import { SaveData, GameMode } from '../game/types';
import { SKINS } from '../game/skins';
import { getXpRequiredForNextLevel } from '../game/progression';
import { HeroSnakePreview } from './HeroSnakePreview';
import { audio } from '../game/audio';
import { getTranslations, LOCALIZED_SKINS } from '../game/i18n';

interface MainMenuProps {
  saveData: SaveData;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onStartGame: () => void;
  onOpenSkins: () => void;
  onOpenMissions: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenChallenges: () => void;
  onToggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  selectedMode,
  onSelectMode,
  onStartGame,
  onOpenSkins,
  onOpenMissions,
  onOpenStats,
  onOpenSettings,
  onOpenChallenges,
  onToggleSound,
}) => {
  const lang = saveData.settings.language || 'tr';
  const t = getTranslations(lang);
  const currentSkin = SKINS[saveData.selectedSkin] || SKINS.emerald;
  const localizedSkin = LOCALIZED_SKINS[lang][saveData.selectedSkin] || {
    name: currentSkin.name,
    description: currentSkin.description,
  };
  const xpNeeded = getXpRequiredForNextLevel(saveData.level);
  const xpPercent = Math.min(100, Math.round((saveData.xp / xpNeeded) * 100));

  // Dynamic viewport tracking for responsive portrait/landscape adaptation
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 844,
  }));

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleResize);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleResize);
      }
    };
  }, []);

  const isLandscape = viewport.width > viewport.height;
  const isMobileLandscape = isLandscape && viewport.height < 600;
  const isTablet =
    (viewport.width >= 768 && viewport.height >= 768) ||
    (isLandscape && viewport.height >= 600 && viewport.width >= 900);

  const modeDescriptions: Record<GameMode, string> = {
    CLASSIC: t.modeClassicDesc,
    ZEN: t.modeZenDesc,
    CHALLENGE: t.modeChallengeDesc,
  };

  const modeLabels: Record<GameMode, string> = {
    CLASSIC: t.modeClassic,
    ZEN: t.modeZen,
    CHALLENGE: t.modeChallenge,
  };

  // Profile bar (Level, XP, Coins, Sound)
  const ProfileBar = (
    <div className="flex items-center justify-between gap-3 p-2 sm:p-2.5 rounded-2xl app-card shadow-lg backdrop-blur-md">
      {/* Level & XP Strip */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 flex items-center justify-center font-black text-white text-xs sm:text-sm shadow-md border border-emerald-300/40 shrink-0">
          {saveData.level}
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping pointer-events-none" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
            <span className="text-[var(--color-text-primary)] uppercase tracking-wider font-bold">
              {t.level} {saveData.level}
            </span>
            <span className="font-mono-numbers text-emerald-500 font-bold">
              {saveData.xp}/{xpNeeded} {t.xp}
            </span>
          </div>
          <div className="w-full bg-[var(--color-bg-elevated)] rounded-full h-1.5 overflow-hidden border border-[var(--color-border-subtle)]">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Currency & Audio Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-500/15 border border-amber-500/35 rounded-xl text-amber-500 font-mono-numbers text-xs font-bold shadow-inner">
          <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
          <span>{saveData.coins.toLocaleString()}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            audio.playUiTap();
            onToggleSound();
          }}
          className="p-1.5 sm:p-2 rounded-xl bg-[var(--color-bg-elevated)] hover:bg-[var(--color-border-strong)] active:scale-95 text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] transition-all cursor-pointer shadow-sm"
          aria-label="Toggle Sound"
        >
          {saveData.settings.soundFx || saveData.settings.music ? (
            <Volume2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <VolumeX className="w-4 h-4 text-[var(--color-text-muted)]" />
          )}
        </button>
      </div>
    </div>
  );

  // Logo SVG lockup
  const LogoLockup = (
    <div className="relative flex flex-col items-center">
      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1 shadow-sm">
        <Sparkles className="w-3 h-3 text-emerald-500" />
        {lang === 'tr' ? 'ARCADE SERÜVENİ' : 'ARCADE EVOLUTION'}
      </div>

      <div className="flex items-center justify-center">
        <svg
          viewBox="0 0 340 56"
          className={`${isMobileLandscape ? 'w-56 h-auto' : 'w-64 sm:w-80 h-auto'} overflow-visible drop-shadow-[0_2px_12px_rgba(16,185,129,0.3)]`}
        >
          <defs>
            <linearGradient id="mainTitleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="45%" stopColor="#059669" />
              <stop offset="80%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          <text
            x="50%"
            y="42"
            textAnchor="middle"
            fontFamily="Outfit, sans-serif"
            fontWeight="900"
            fontSize="40"
            letterSpacing="-1"
            fill="url(#mainTitleGrad)"
          >
            SNAKE EVOLUTION
          </text>
        </svg>
      </div>
    </div>
  );

  // Snake Hero Podium
  const SnakePodium = (
    <div className={`relative flex flex-col items-center ${isMobileLandscape ? 'my-1' : 'my-2'} w-full max-w-xs`}>
      <div className="relative w-full app-card rounded-3xl p-2 sm:p-3 shadow-xl flex items-center justify-center overflow-hidden border border-[var(--color-border-subtle)]">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(var(--arena-dot) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <HeroSnakePreview
          skinId={saveData.selectedSkin}
          width={isMobileLandscape ? 210 : isTablet ? 300 : 260}
          height={isMobileLandscape ? 80 : isTablet ? 120 : 105}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          audio.playUiTap();
          onOpenSkins();
        }}
        className="mt-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full app-surface hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer shadow-sm group"
      >
        <div
          className="w-2.5 h-2.5 rounded-full ring-2 ring-white/30 shadow-sm"
          style={{ backgroundColor: currentSkin.primaryColor }}
        />
        <span className="text-[11px]">
          {t.skins}:{' '}
          <strong className="text-[var(--color-text-primary)] font-semibold group-hover:text-emerald-500 transition-colors">
            {localizedSkin.name}
          </strong>
        </span>
      </button>
    </div>
  );

  // Mode Selector Tabs & Big Play Button
  const GameModeSection = (
    <div className="w-full">
      <div className="flex p-1 bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border-subtle)] shadow-inner">
        {(['CLASSIC', 'ZEN', 'CHALLENGE'] as GameMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => {
              audio.playUiTap();
              if (mode === 'CHALLENGE') {
                onOpenChallenges();
              } else {
                onSelectMode(mode);
              }
            }}
            className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer truncate ${
              selectedMode === mode
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-black'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {modeLabels[mode]}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5 font-medium px-2 leading-tight text-center">
        {modeDescriptions[selectedMode]}
      </p>

      <button
        type="button"
        onClick={() => {
          audio.playUiTap();
          if (selectedMode === 'CHALLENGE') {
            onOpenChallenges();
          } else {
            onStartGame();
          }
        }}
        className={`w-full ${isMobileLandscape ? 'mt-2 py-3 text-base' : 'mt-3.5 sm:mt-4 py-3.5 sm:py-4 text-lg sm:text-xl'} px-6 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 active:scale-[0.985] text-slate-950 font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 glow-emerald cursor-pointer border-t border-white/40`}
      >
        <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
        {selectedMode === 'CHALLENGE' ? t.startChallenge : t.play}
      </button>
    </div>
  );

  // Sub-Navigation Buttons (Skins, Missions, Challenges, Stats)
  const SubNavigation = (
    <div className="grid grid-cols-4 gap-2">
      <button
        type="button"
        onClick={() => {
          audio.playUiTap();
          onOpenSkins();
        }}
        className="flex flex-col items-center justify-center gap-1 p-2 sm:p-2.5 rounded-2xl app-surface hover:bg-[var(--color-bg-elevated)] active:scale-95 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer shadow-sm group"
      >
        <Palette className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
        <span className="text-[11px] font-bold truncate">{t.skins}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          audio.playUiTap();
          onOpenMissions();
        }}
        className="flex flex-col items-center justify-center gap-1 p-2 sm:p-2.5 rounded-2xl app-surface hover:bg-[var(--color-bg-elevated)] active:scale-95 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer shadow-sm group"
      >
        <Target className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
        <span className="text-[11px] font-bold truncate">{t.missions}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          audio.playUiTap();
          onOpenChallenges();
        }}
        className="flex flex-col items-center justify-center gap-1 p-2 sm:p-2.5 rounded-2xl app-surface hover:bg-[var(--color-bg-elevated)] active:scale-95 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer shadow-sm group"
      >
        <Swords className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
        <span className="text-[11px] font-bold truncate">{t.challenges}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          audio.playUiTap();
          onOpenStats();
        }}
        className="flex flex-col items-center justify-center gap-1 p-2 sm:p-2.5 rounded-2xl app-surface hover:bg-[var(--color-bg-elevated)] active:scale-95 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer shadow-sm group"
      >
        <BarChart3 className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
        <span className="text-[11px] font-bold truncate">{t.stats}</span>
      </button>
    </div>
  );

  const FooterHints = (
    <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] px-1 pt-1">
      <div className="truncate">
        {lang === 'tr'
          ? 'WASD / Yön Tuşları · Kaydırarak Dön · Boşluk: Duraklat'
          : 'WASD / Arrows · Swipe to Turn · Space: Pause'}
      </div>

      <button
        type="button"
        onClick={() => {
          audio.playUiTap();
          onOpenSettings();
        }}
        className="p-1.5 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors flex items-center gap-1 cursor-pointer"
        aria-label={t.settings}
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );

  // LANDSCAPE LAYOUT: Handheld console split-view for phones & tablets rotated horizontally
  if (isLandscape) {
    return (
      <div className="relative w-full max-w-5xl mx-auto h-[100dvh] max-h-[100dvh] flex flex-col justify-between px-4 sm:px-6 py-2 sm:py-3 select-none overflow-hidden pt-[max(0.4rem,env(safe-area-inset-top,0px))] pb-[max(0.4rem,env(safe-area-inset-bottom,0px))] pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))]">
        {/* Top Header Bar */}
        {ProfileBar}

        {/* Center 2-Column Split Console View */}
        <div className="flex-1 grid grid-cols-2 gap-4 sm:gap-8 items-center my-auto min-h-0 py-1">
          {/* Left Column: Title Lockup & Serpent Showcase */}
          <div className="flex flex-col items-center justify-center text-center">
            {LogoLockup}
            {SnakePodium}
          </div>

          {/* Right Column: Mode Selection, Play CTA, Sub-Nav, Settings */}
          <div className="flex flex-col justify-center space-y-2.5 sm:space-y-3.5">
            {GameModeSection}
            {SubNavigation}
            {FooterHints}
          </div>
        </div>
      </div>
    );
  }

  // PORTRAIT LAYOUT: Mobile portrait & Tablet portrait
  return (
    <div
      className={`relative w-full ${isTablet ? 'max-w-lg md:max-w-xl' : 'max-w-md'} mx-auto flex flex-col justify-between h-[100dvh] max-h-[100dvh] overflow-y-auto px-4 py-2.5 sm:py-4 select-none pt-[max(0.6rem,env(safe-area-inset-top,0px))] pb-[max(0.6rem,env(safe-area-inset-bottom,0px))] pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))]`}
    >
      {/* Top Header */}
      {ProfileBar}

      {/* Hero Showcase Centerpiece */}
      <div className="my-auto py-2 sm:py-4 flex flex-col items-center text-center">
        {LogoLockup}
        {SnakePodium}
        {GameModeSection}
      </div>

      {/* Bottom Sub-Navigation Bar */}
      <div className="space-y-2 pt-1">
        {SubNavigation}
        {FooterHints}
      </div>
    </div>
  );
};
