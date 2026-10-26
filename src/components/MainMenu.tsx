import React from 'react';
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
  const currentSkin = SKINS[saveData.selectedSkin] || SKINS.emerald;
  const xpNeeded = getXpRequiredForNextLevel(saveData.level);
  const xpPercent = Math.min(100, Math.round((saveData.xp / xpNeeded) * 100));

  const modeDescriptions: Record<GameMode, string> = {
    CLASSIC: 'Increasing speed · Wall collisions · The pure arcade challenge',
    ZEN: 'No wall impact · Wrap-around flow · Meditative endless crawling',
    CHALLENGE: 'Handcrafted obstacle gauntlets · Custom objectives & timers',
  };

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col justify-between h-[100dvh] max-h-[100dvh] overflow-y-auto px-4 py-2.5 sm:py-3.5 select-none pt-[max(0.6rem,env(safe-area-inset-top,0px))] pb-[max(0.6rem,env(safe-area-inset-bottom,0px))]">
      {/* Top Header: Level Bar, Currency & Sound */}
      <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-xl">
        {/* Level & XP Strip */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 flex items-center justify-center font-black text-slate-950 text-sm shadow-md border border-emerald-300/40 shrink-0">
            {saveData.level}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping pointer-events-none" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
              <span className="text-slate-200 uppercase tracking-wider">Level {saveData.level}</span>
              <span className="font-mono-numbers text-emerald-400">
                {saveData.xp}/{xpNeeded} XP
              </span>
            </div>
            <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-slate-800/50">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Currency & Audio Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 font-mono-numbers text-xs font-bold shadow-inner">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{saveData.coins.toLocaleString()}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              onToggleSound();
            }}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-700/60 transition-transform cursor-pointer shadow-sm"
            aria-label="Toggle Sound"
          >
            {saveData.settings.soundFx || saveData.settings.music ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Hero Showcase Centerpiece */}
      <div className="my-auto py-3 flex flex-col items-center text-center">
        {/* Bespoke SVG Logo Lockup */}
        <div className="relative mb-3 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase tracking-[0.25em] mb-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Next-Gen Arcade
          </div>

          <div className="flex items-center justify-center">
            <svg
              viewBox="0 0 340 56"
              className="w-72 sm:w-80 h-auto overflow-visible drop-shadow-[0_4px_16px_rgba(16,185,129,0.35)]"
            >
              <defs>
                <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#34d399" />
                  <stop offset="75%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <filter id="neonFilter">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.6" />
                </filter>
              </defs>

              <text
                x="50%"
                y="42"
                textAnchor="middle"
                fontFamily="Outfit, sans-serif"
                fontWeight="900"
                fontSize="42"
                letterSpacing="-1"
                fill="url(#titleGrad)"
                filter="url(#neonFilter)"
              >
                SNAKE EVOLUTION
              </text>
            </svg>
          </div>
        </div>

        {/* Dynamic Animated Serpent Hero Podium */}
        <div className="relative my-2 w-full max-w-xs flex flex-col items-center">
          {/* Ambient pedestal glow */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent blur-xl pointer-events-none" />

          <div className="relative w-full bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800/90 rounded-2xl p-3 shadow-2xl flex items-center justify-center overflow-hidden">
            {/* Background grid texture inside pedestal */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            <HeroSnakePreview skinId={saveData.selectedSkin} width={270} height={110} />
          </div>

          {/* Equipped Skin Pill */}
          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              onOpenSkins();
            }}
            className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-all cursor-pointer shadow-md group"
          >
            <div
              className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20 shadow-sm"
              style={{ backgroundColor: currentSkin.primaryColor }}
            />
            <span className="text-[11px]">
              Skin: <strong className="text-white font-semibold group-hover:text-emerald-400 transition-colors">{currentSkin.name}</strong>
            </span>
          </button>
        </div>

        {/* Game Mode Selector Segmented Tabs */}
        <div className="w-full mt-3">
          <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 shadow-inner">
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
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedMode === mode
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'CHALLENGE' ? 'TRIALS' : mode}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium px-2 leading-tight">
            {modeDescriptions[selectedMode]}
          </p>
        </div>

        {/* Big Tactile Arcade PLAY Button */}
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
          className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 active:scale-[0.98] text-slate-950 font-black rounded-2xl text-lg sm:text-xl transition-all shadow-xl flex items-center justify-center gap-3 glow-emerald cursor-pointer border-t border-white/40"
        >
          <Play className="w-6 h-6 fill-current" />
          START PLAYING
        </button>
      </div>

      {/* Bottom Sub-Navigation Bar */}
      <div className="space-y-2.5 pt-1">
        <div className="grid grid-cols-4 gap-2">
          {/* Skins */}
          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              onOpenSkins();
            }}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 active:scale-95 border border-slate-800/80 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm group"
          >
            <Palette className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold">Skins</span>
          </button>

          {/* Missions */}
          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              onOpenMissions();
            }}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 active:scale-95 border border-slate-800/80 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm group"
          >
            <Target className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold">Missions</span>
          </button>

          {/* Challenges */}
          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              onOpenChallenges();
            }}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 active:scale-95 border border-slate-800/80 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm group"
          >
            <Swords className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold">Trials</span>
          </button>

          {/* Stats */}
          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              onOpenStats();
            }}
            className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 active:scale-95 border border-slate-800/80 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm group"
          >
            <BarChart3 className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold">Stats</span>
          </button>
        </div>

        {/* Footer controls hint & settings gear */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <div className="truncate">
            WASD / Arrows · Space Pause · Swipe
          </div>

          <button
            type="button"
            onClick={() => {
              audio.playUiTap();
              onOpenSettings();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1 cursor-pointer"
            aria-label="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
