import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Pause, Clock, Flame, Shield, Zap } from 'lucide-react';
import { GameState, SaveData, Direction, ChallengeStage } from '../game/types';
import { createInitialState, queueDirection, tick } from '../game/engine';
import { GameRenderer } from '../game/renderer';
import { InputManager } from '../game/input';
import { GameplayHud } from './GameplayHud';
import { VirtualDpad } from './VirtualDpad';
import { audio } from '../game/audio';
import { getTranslations } from '../game/i18n';

interface GameCanvasProps {
  mode: GameState['mode'];
  challengeStage?: ChallengeStage;
  saveData: SaveData;
  theme?: 'light' | 'dark';
  onGameOver: (finalState: GameState) => void;
  onVictory: (finalState: GameState) => void;
  onPause: (snapshot?: GameState) => void;
  isPaused: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  mode,
  challengeStage,
  saveData,
  theme = 'dark',
  onGameOver,
  onVictory,
  onPause,
  isPaused,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  // Responsive orientation & viewport dimensions state
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 844,
  }));

  const isLandscape = dimensions.width > dimensions.height;
  const isTablet = (dimensions.width >= 768 && dimensions.height >= 768) || (isLandscape && dimensions.width >= 900 && dimensions.height >= 600);
  const isMobileLandscape = isLandscape && dimensions.height < 600;

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
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

  // Store game state in ref so fixed simulation loop runs smoothly without React state churn
  const highScore =
    mode === 'CHALLENGE' && challengeStage
      ? saveData.bestScores.challenges[challengeStage.id] || 0
      : mode === 'ZEN'
      ? saveData.bestScores.zen
      : saveData.bestScores.classic;

  const gameStateRef = useRef<GameState>(
    createInitialState(mode, highScore, challengeStage?.id)
  );

  // Sync React state for HUD meters at controlled interval (~10Hz)
  const [hudState, setHudState] = useState<GameState>(gameStateRef.current);

  const handleDirection = useCallback((dir: Direction) => {
    gameStateRef.current = queueDirection(gameStateRef.current, dir);
  }, []);

  const handleTogglePause = useCallback(() => {
    onPause(gameStateRef.current);
  }, [onPause]);

  // Pause handling from parent
  useEffect(() => {
    gameStateRef.current.isPaused = isPaused;
  }, [isPaused]);

  // Tab visibility pause handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !gameStateRef.current.isPaused && !gameStateRef.current.isGameOver) {
        onPause(gameStateRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onPause]);

  // Setup simulation and rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx);
    const inputManager = new InputManager(handleDirection, handleTogglePause);

    const unbindKeyboard = inputManager.bindKeyboard();
    const unbindTouch = inputManager.bindTouch(container);

    let animationFrameId: number;
    let lastTime = performance.now();
    let tickAccumulator = 0;
    let lastHudUpdateTime = 0;

    const gameLoop = (currentTime: number) => {
      const rawDelta = currentTime - lastTime;
      lastTime = currentTime;
      const delta = Math.min(rawDelta, 50); // Clamp to prevent spiral of death

      const currentState = gameStateRef.current;

      if (!currentState.isPaused && !currentState.isGameOver && !currentState.isVictory) {
        tickAccumulator += delta;

        // Run fixed simulation steps
        while (tickAccumulator >= currentState.currentSpeed) {
          tickAccumulator -= currentState.currentSpeed;

          const result = tick(gameStateRef.current, currentState.currentSpeed);
          gameStateRef.current = result.nextState;

          // Process sound & visual events
          if (result.events.ateFood) {
            if (result.events.ateFood.type === 'GOLDEN') {
              audio.playGolden();
            } else if (result.events.ateFood.type !== 'NORMAL') {
              audio.playPowerup();
            } else {
              audio.playEat(result.nextState.comboCount);
            }

            // Emit particles at food location
            const cellSize = Math.floor(
              Math.min(canvas.clientWidth / result.nextState.gridWidth, canvas.clientHeight / result.nextState.gridHeight)
            );
            const fx = result.events.ateFood.position.x * cellSize + cellSize / 2;
            const fy = result.events.ateFood.position.y * cellSize + cellSize / 2;
            const color =
              result.events.ateFood.type === 'GOLDEN'
                ? '#facc15'
                : result.events.ateFood.type === 'BONUS_2X'
                ? '#a855f7'
                : result.events.ateFood.type === 'SLOW'
                ? '#06b6d4'
                : result.events.ateFood.type === 'SHIELD'
                ? '#3b82f6'
                : '#10b981';
            rendererRef.current?.emitFoodBurst(fx, fy, color);
          }

          if (result.events.shieldPopped) {
            audio.playShieldAbsorb();
          }

          if (result.events.newRecord) {
            audio.playFanfare();
          }

          if (result.events.gameOver) {
            audio.playCrash();
            const head = result.nextState.snake[0];
            const cellSize = Math.floor(
              Math.min(canvas.clientWidth / result.nextState.gridWidth, canvas.clientHeight / result.nextState.gridHeight)
            );
            rendererRef.current?.emitCrashBurst(head.x * cellSize, head.y * cellSize);
            onGameOver(result.nextState);
            break;
          }

          if (result.events.victory) {
            audio.playFanfare();
            onVictory(result.nextState);
            break;
          }
        }
      }

      // Throttle HUD state updates to ~12fps to avoid React render overhead
      if (currentTime - lastHudUpdateTime > 80) {
        setHudState({ ...gameStateRef.current });
        lastHudUpdateTime = currentTime;
      }

      // Render canvas
      if (rendererRef.current) {
        rendererRef.current.render(
          gameStateRef.current,
          canvas.clientWidth,
          canvas.clientHeight,
          saveData.selectedSkin,
          saveData.settings.reducedMotion,
          theme
        );
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Resize observer to keep canvas sharp across all screen sizes (phones, tablets, desktop)
    const resizeObserver = new ResizeObserver(() => {
      if (!canvas || !container) return;
      const availableW = container.clientWidth - 10;
      const availableH = container.clientHeight - 10;
      // Cap at 620px for tablet / desktop so playfield is comfortably sized
      const maxCap = dimensions.width >= 768 && dimensions.height >= 768 ? 640 : 540;
      const size = Math.max(160, Math.min(maxCap, Math.min(availableW, availableH)));
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      rendererRef.current?.resize(canvas, size, size);
    });

    resizeObserver.observe(container);
    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      unbindKeyboard();
      unbindTouch();
      resizeObserver.disconnect();
    };
  }, [handleDirection, handleTogglePause, onGameOver, onVictory, saveData.selectedSkin, saveData.settings.reducedMotion, theme, dimensions]);

  const showDpad = saveData.settings.controls === 'dpad' || saveData.settings.controls === 'both';
  const is2x = hudState.activePowerUps.some((p) => p.type === 'BONUS_2X');
  const isSlow = hudState.activePowerUps.some((p) => p.type === 'SLOW');

  const lang = saveData.settings.language || 'tr';
  const t = getTranslations(lang);

  // RENDER: Landscape Mode (Horizontal Handheld Console Cockpit Layout for Phones & Tablets)
  if (isLandscape) {
    const modeBadge =
      hudState.mode === 'CHALLENGE' && hudState.challengeStageId
        ? lang === 'tr'
          ? `Bölüm ${hudState.challengeStageId}`
          : `Stage ${hudState.challengeStageId}`
        : hudState.mode === 'CLASSIC'
        ? t.modeClassic
        : hudState.mode === 'ZEN'
        ? t.modeZen
        : t.modeChallenge;

    return (
      <div className="relative w-full h-[100dvh] flex flex-row items-center justify-between bg-[var(--color-bg-base)] text-[var(--color-text-primary)] overflow-hidden select-none px-[max(0.5rem,env(safe-area-inset-left,0px))] py-[max(0.25rem,env(safe-area-inset-top,0px))]">
        {/* Left Column HUD */}
        <div className={`h-full ${isTablet ? 'w-52 p-3' : 'w-40 py-1.5 px-2'} flex flex-col justify-between select-none shrink-0 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] rounded-2xl my-1 shadow-xl backdrop-blur-sm`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold uppercase text-[10px] sm:text-xs px-2 py-0.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)]">
                {modeBadge}
              </span>
              <button
                type="button"
                onClick={() => onPause(gameStateRef.current)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 cursor-pointer shadow-sm transition-transform"
                aria-label={t.pause}
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>

            {hudState.timeRemaining !== undefined && (
              <div className="flex items-center gap-1.5 font-mono-numbers text-cyan-400 font-bold text-xs bg-cyan-950/60 px-2 py-1 rounded-lg border border-cyan-800/40">
                <Clock className="w-3.5 h-3.5" />
                <span>{Math.ceil(hudState.timeRemaining)}s</span>
              </div>
            )}

            <div>
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold">{t.score}</div>
              <div className={`${isTablet ? 'text-3xl' : 'text-2xl'} font-black font-mono-numbers text-white text-glow-emerald leading-tight`}>
                {hudState.score}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono-numbers text-slate-300">
              <span>{lang === 'tr' ? 'BOY' : 'LEN'}: <strong className="text-emerald-400">{hudState.snake.length}</strong></span>
              <span>{t.best.toUpperCase()}: {hudState.highScore}</span>
            </div>

            {hudState.comboCount > 1 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 text-[11px] font-black font-mono-numbers shadow-sm animate-pulse">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{hudState.comboCount}X {t.combo.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Active Powerups */}
          {(hudState.hasShield || is2x || isSlow) && (
            <div className="flex flex-col gap-1.5 pt-1">
              {hudState.hasShield && (
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-blue-300 bg-blue-950/70 px-2 py-1 rounded-lg border border-blue-500/40">
                  <Shield className="w-3.5 h-3.5 text-blue-400" /> {t.powerupShield}
                </div>
              )}
              {is2x && (
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-purple-300 bg-purple-950/70 px-2 py-1 rounded-lg border border-purple-500/40">
                  <Zap className="w-3.5 h-3.5 text-purple-400" /> {t.powerupBonus2x}
                </div>
              )}
              {isSlow && (
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-cyan-300 bg-cyan-950/70 px-2 py-1 rounded-lg border border-cyan-500/40">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> {t.powerupSlow}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Canvas Viewport */}
        <div
          ref={containerRef}
          className="flex-1 h-full flex items-center justify-center p-1 sm:p-2 overflow-hidden min-h-0 mx-2"
        >
          <canvas
            ref={canvasRef}
            className="rounded-2xl border border-[var(--color-border-subtle)] shadow-2xl bg-[var(--arena-bg-1)] cursor-pointer touch-none"
          />
        </div>

        {/* Right Column Controls (if Dpad is on) */}
        {showDpad ? (
          <div className={`h-full flex items-center justify-center ${isTablet ? 'pr-4 pl-2' : 'pr-2 pl-1'} shrink-0`}>
            <VirtualDpad onDirection={handleDirection} />
          </div>
        ) : (
          <div className="w-20 flex items-center justify-center text-[11px] text-[var(--color-text-muted)] font-mono-numbers text-center shrink-0">
            {lang === 'tr' ? 'Kaydırarak dön' : 'Swipe to turn'}
          </div>
        )}
      </div>
    );
  }

  // RENDER: Portrait Mode (Mobile Portrait & Tablet Portrait)
  return (
    <div className="relative w-full h-[100dvh] flex flex-col justify-between bg-[var(--color-bg-base)] text-[var(--color-text-primary)] overflow-hidden select-none pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] transition-colors duration-200">
      {/* Top HUD */}
      <GameplayHud state={hudState} onPause={() => onPause(gameStateRef.current)} language={lang} />

      {/* Primary Game Board Viewport Container */}
      <div
        ref={containerRef}
        className={`flex-1 w-full ${isTablet ? 'max-w-2xl' : 'max-w-xl'} mx-auto flex items-center justify-center p-2 touch-none overflow-hidden min-h-0`}
      >
        <canvas
          ref={canvasRef}
          className="rounded-2xl border border-[var(--color-border-subtle)] shadow-2xl bg-[var(--arena-bg-1)] cursor-pointer touch-none"
        />
      </div>

      {/* Bottom Controls / Virtual D-Pad (only when enabled) */}
      <div className="w-full pb-1.5 px-3 flex flex-col items-center shrink-0">
        {showDpad && (
          <div className="mb-1">
            <VirtualDpad onDirection={handleDirection} />
          </div>
        )}
        <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono-numbers text-center tracking-tight">
          {lang === 'tr'
            ? 'WASD / Yön Tuşları / Kaydırarak Dön · Boşluk: Duraklat'
            : 'WASD / Arrows / Swipe to Turn · Space to Pause'}
        </div>
      </div>
    </div>
  );
};
