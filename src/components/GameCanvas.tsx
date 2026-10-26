import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, SaveData, Direction, ChallengeStage } from '../game/types';
import { createInitialState, queueDirection, tick } from '../game/engine';
import { GameRenderer } from '../game/renderer';
import { InputManager } from '../game/input';
import { GameplayHud } from './GameplayHud';
import { VirtualDpad } from './VirtualDpad';
import { audio } from '../game/audio';

interface GameCanvasProps {
  mode: GameState['mode'];
  challengeStage?: ChallengeStage;
  saveData: SaveData;
  onGameOver: (finalState: GameState) => void;
  onVictory: (finalState: GameState) => void;
  onPause: (snapshot?: GameState) => void;
  isPaused: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  mode,
  challengeStage,
  saveData,
  onGameOver,
  onVictory,
  onPause,
  isPaused,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

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
          saveData.settings.reducedMotion
        );
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Resize observer to keep canvas sharp across all screen sizes
    const resizeObserver = new ResizeObserver(() => {
      if (!canvas || !container) return;
      const availableW = container.clientWidth - 12;
      const availableH = container.clientHeight - 12;
      // Cap at 520px for optimal desktop focal density while adapting down to 240px on small mobile
      const size = Math.max(160, Math.min(520, Math.min(availableW, availableH)));
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
  }, [handleDirection, handleTogglePause, onGameOver, onVictory, saveData.selectedSkin, saveData.settings.reducedMotion]);

  const showDpad = saveData.settings.controls === 'dpad' || saveData.settings.controls === 'both';

  return (
    <div className="relative w-full h-[100dvh] flex flex-col justify-between bg-[#060913] overflow-hidden select-none pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
      {/* Top HUD */}
      <GameplayHud state={hudState} onPause={() => onPause(gameStateRef.current)} />

      {/* Primary Game Board Viewport Container */}
      <div
        ref={containerRef}
        className="flex-1 w-full max-w-xl mx-auto flex items-center justify-center p-1.5 touch-none overflow-hidden min-h-0"
      >
        <canvas
          ref={canvasRef}
          className="rounded-2xl border border-slate-800 shadow-2xl bg-[#080d1a] cursor-pointer touch-none"
        />
      </div>

      {/* Bottom Controls / Virtual D-Pad (only when enabled) */}
      <div className="w-full pb-1.5 px-3 flex flex-col items-center shrink-0">
        {showDpad && (
          <div className="sm:hidden mb-1">
            <VirtualDpad onDirection={handleDirection} />
          </div>
        )}
        <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono-numbers text-center tracking-tight">
          WASD / Arrows / Swipe to Turn · Space to Pause
        </div>
      </div>
    </div>
  );
};
