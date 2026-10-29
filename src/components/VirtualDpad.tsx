import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction } from '../game/types';
import { audio } from '../game/audio';

interface VirtualDpadProps {
  onDirection: (dir: Direction) => void;
}

export const VirtualDpad: React.FC<VirtualDpadProps> = ({ onDirection }) => {
  const handlePress = (dir: Direction) => {
    audio.playUiTap();
    onDirection(dir);
  };

  return (
    <div
      className="relative w-36 h-36 sm:w-40 sm:h-40 select-none touch-none mx-auto shrink-0"
      style={{ touchAction: 'none' }}
    >
      {/* Up */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          handlePress('UP');
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 app-surface active:bg-emerald-500 border border-[var(--color-border-strong)] active:border-emerald-400 rounded-2xl flex items-center justify-center text-[var(--color-text-primary)] active:text-slate-950 shadow-md active:scale-95 transition-all cursor-pointer"
        aria-label="Move Up"
      >
        <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Down */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          handlePress('DOWN');
        }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 app-surface active:bg-emerald-500 border border-[var(--color-border-strong)] active:border-emerald-400 rounded-2xl flex items-center justify-center text-[var(--color-text-primary)] active:text-slate-950 shadow-md active:scale-95 transition-all cursor-pointer"
        aria-label="Move Down"
      >
        <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Left */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          handlePress('LEFT');
        }}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 app-surface active:bg-emerald-500 border border-[var(--color-border-strong)] active:border-emerald-400 rounded-2xl flex items-center justify-center text-[var(--color-text-primary)] active:text-slate-950 shadow-md active:scale-95 transition-all cursor-pointer"
        aria-label="Move Left"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Right */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          handlePress('RIGHT');
        }}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 app-surface active:bg-emerald-500 border border-[var(--color-border-strong)] active:border-emerald-400 rounded-2xl flex items-center justify-center text-[var(--color-text-primary)] active:text-slate-950 shadow-md active:scale-95 transition-all cursor-pointer"
        aria-label="Move Right"
      >
        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Center tactile dot */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] pointer-events-none" />
    </div>
  );
};
