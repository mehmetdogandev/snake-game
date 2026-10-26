/**
 * SNAKE EVOLUTION - Premium Mobile-First Arcade Game
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  SaveData,
  GameMode,
  GameState,
  AppScreen,
  ChallengeStage,
} from './game/types';
import { loadSaveData, saveSaveData } from './game/storage';
import { calculateRunCoins, calculateRunXp } from './game/economy';
import { addXp, ACHIEVEMENTS, getDailyMissions } from './game/progression';
import { audio } from './game/audio';
import { MainMenu } from './components/MainMenu';
import { GameCanvas } from './components/GameCanvas';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { SkinCollectionModal } from './components/SkinCollectionModal';
import { MissionsModal } from './components/MissionsModal';
import { StatsModal } from './components/StatsModal';
import { SettingsModal } from './components/SettingsModal';
import { ChallengeSelectModal } from './components/ChallengeSelectModal';
import { runAllGameTests } from './tests/game.test';

export default function App() {
  const [saveData, setSaveData] = useState<SaveData>(() => loadSaveData());
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('MENU');
  const [selectedMode, setSelectedMode] = useState<GameMode>('CLASSIC');
  const [activeChallengeStage, setActiveChallengeStage] = useState<ChallengeStage | undefined>(undefined);
  const [activeModal, setActiveModal] = useState<'SKINS' | 'MISSIONS' | 'STATS' | 'SETTINGS' | 'CHALLENGES' | null>(null);

  // Active run session tracker & snapshot
  const [runSessionId, setRunSessionId] = useState(1);
  const [activeRunSnapshot, setActiveRunSnapshot] = useState<GameState | null>(null);

  // End of run rewards cache
  const [lastFinishedState, setLastFinishedState] = useState<GameState | null>(null);
  const [earnedRunXp, setEarnedRunXp] = useState(0);
  const [earnedRunCoins, setEarnedRunCoins] = useState(0);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<string[]>([]);

  // Automatically execute test suite once on boot to verify logic integrity
  useEffect(() => {
    try {
      const testReport = runAllGameTests();
      if (testReport.failed > 0) {
        console.warn('Game test failures detected:', testReport.results.filter(r => !r.passed));
      } else {
        console.info(`[Snake Evolution] All ${testReport.passed} core gameplay automated tests verified successfully.`);
      }
    } catch (e) {
      console.warn('Test execution note:', e);
    }
  }, []);

  // Save changes to storage
  const handleUpdateSave = useCallback((newSave: SaveData) => {
    setSaveData(newSave);
    saveSaveData(newSave);
  }, []);

  // Sync settings with audio manager on initial mount
  useEffect(() => {
    audio.setSoundFxEnabled(saveData.settings.soundFx);
    audio.setMusicEnabled(saveData.settings.music);
    audio.setHapticsEnabled(saveData.settings.haptics);
  }, [saveData.settings]);

  // Quick sound toggle from header
  const handleToggleSound = useCallback(() => {
    const currentlyActive = saveData.settings.soundFx || saveData.settings.music;
    const nextState = !currentlyActive;
    const newSettings = {
      ...saveData.settings,
      soundFx: nextState,
      music: nextState,
    };
    audio.setSoundFxEnabled(nextState);
    audio.setMusicEnabled(nextState);
    handleUpdateSave({ ...saveData, settings: newSettings });
  }, [saveData, handleUpdateSave]);

  const handleStartGame = useCallback(() => {
    audio.playUiTap();
    if (saveData.settings.music) {
      audio.startMusic();
    }
    setRunSessionId((id) => id + 1);
    setCurrentScreen('PLAYING');
  }, [saveData.settings.music]);

  const handleSelectChallenge = useCallback((stage: ChallengeStage) => {
    audio.playUiTap();
    setSelectedMode('CHALLENGE');
    setActiveChallengeStage(stage);
    setActiveModal(null);
    if (saveData.settings.music) {
      audio.startMusic();
    }
    setRunSessionId((id) => id + 1);
    setCurrentScreen('PLAYING');
  }, [saveData.settings.music]);

  // Handle run conclusion (Game Over or Victory)
  const handleEndRun = useCallback(
    (finalState: GameState) => {
      setLastFinishedState(finalState);
      const earnedCoins = calculateRunCoins(finalState.score, finalState.foodCount, finalState.mode);
      const earnedXp = calculateRunXp(finalState.score, finalState.foodCount, finalState.mode);
      setEarnedRunCoins(earnedCoins);
      setEarnedRunXp(earnedXp);

      // Deep copy current save data
      let currentSave: SaveData = {
        ...saveData,
        coins: saveData.coins + earnedCoins,
        stats: {
          ...saveData.stats,
          totalRuns: saveData.stats.totalRuns + 1,
          totalFoodCollected: saveData.stats.totalFoodCollected + finalState.foodCount,
          highestScore: Math.max(saveData.stats.highestScore, finalState.score),
          longestSnake: Math.max(saveData.stats.longestSnake, finalState.snake.length),
          totalPlayTimeSeconds:
            saveData.stats.totalPlayTimeSeconds + Math.round(finalState.elapsedTime / 1000),
          totalCoinsEarned: saveData.stats.totalCoinsEarned + earnedCoins,
          goldenFoodCollected:
            saveData.stats.goldenFoodCollected +
            (finalState.food.filter((f) => f.type === 'GOLDEN').length > 0 ? 1 : 0),
        },
      };

      // Update High Scores by mode
      if (finalState.mode === 'CLASSIC') {
        currentSave.bestScores.classic = Math.max(
          currentSave.bestScores.classic,
          finalState.score
        );
      } else if (finalState.mode === 'ZEN') {
        currentSave.bestScores.zen = Math.max(
          currentSave.bestScores.zen,
          finalState.score
        );
      } else if (finalState.mode === 'CHALLENGE' && finalState.challengeStageId) {
        const stageId = finalState.challengeStageId;
        currentSave.bestScores.challenges[stageId] = Math.max(
          currentSave.bestScores.challenges[stageId] || 0,
          finalState.score
        );

        if (finalState.isVictory && !currentSave.completedChallenges.includes(stageId)) {
          currentSave.completedChallenges.push(stageId);
          currentSave.stats.challengesCompleted = currentSave.completedChallenges.length;
        }
      }

      // Add XP & check Level up
      const xpRes = addXp(currentSave, earnedXp);
      currentSave = xpRes.save;

      // Update Daily Missions
      const { missions } = getDailyMissions(currentSave);
      for (const m of missions) {
        let delta = 0;
        if (m.type === 'food') delta = finalState.foodCount;
        if (m.type === 'score') delta = finalState.score;
        if (m.type === 'rounds') delta = 1;

        if (delta > 0) {
          const currentProg = currentSave.dailyMissions.progress[m.id] || 0;
          currentSave.dailyMissions.progress[m.id] =
            m.type === 'score' ? Math.max(currentProg, delta) : currentProg + delta;
        }
      }

      // Update Lifetime Achievements
      const unlockedThisRun: string[] = [];
      for (const ach of ACHIEVEMENTS) {
        const existing = currentSave.achievements[ach.id] || {
          unlocked: false,
          progress: 0,
          claimed: false,
        };
        if (!existing.unlocked) {
          let newProgress = existing.progress;

          if (ach.id === 'first_food') newProgress = Math.min(1, currentSave.stats.totalFoodCollected);
          if (ach.id === 'length_20') newProgress = Math.max(existing.progress, finalState.snake.length);
          if (ach.id === 'length_35') newProgress = Math.max(existing.progress, finalState.snake.length);
          if (ach.id === 'length_50') newProgress = Math.max(existing.progress, finalState.snake.length);
          if (ach.id === 'score_500') newProgress = Math.max(existing.progress, finalState.score);
          if (ach.id === 'score_1000') newProgress = Math.max(existing.progress, finalState.score);
          if (ach.id === 'golden_10') newProgress = currentSave.stats.goldenFoodCollected;
          if (ach.id === 'zen_500' && finalState.mode === 'ZEN') newProgress = Math.max(existing.progress, finalState.score);
          if (ach.id === 'challenges_all') newProgress = currentSave.completedChallenges.length;
          if (ach.id === 'collector_5') newProgress = currentSave.unlockedSkins.length;
          if (ach.id === 'coins_2000') newProgress = currentSave.stats.totalCoinsEarned;

          const isNowUnlocked = newProgress >= ach.maxProgress;
          currentSave.achievements[ach.id] = {
            ...existing,
            progress: newProgress,
            unlocked: isNowUnlocked,
          };

          if (isNowUnlocked) {
            unlockedThisRun.push(ach.id);
          }
        }
      }

      setNewlyUnlockedAchievements(unlockedThisRun);
      handleUpdateSave(currentSave);
      setCurrentScreen('GAME_OVER');
    },
    [saveData, handleUpdateSave]
  );

  return (
    <div className="relative w-full h-[100dvh] bg-[#060913] text-slate-100 flex flex-col items-center justify-center overflow-hidden pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
      {/* Background Ambient Glow Gradients */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Menu Screen */}
      {currentScreen === 'MENU' && (
        <MainMenu
          saveData={saveData}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          onStartGame={handleStartGame}
          onOpenSkins={() => setActiveModal('SKINS')}
          onOpenMissions={() => setActiveModal('MISSIONS')}
          onOpenStats={() => setActiveModal('STATS')}
          onOpenSettings={() => setActiveModal('SETTINGS')}
          onOpenChallenges={() => setActiveModal('CHALLENGES')}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Playing / Paused Screen */}
      {(currentScreen === 'PLAYING' || currentScreen === 'PAUSED') && (
        <GameCanvas
          key={`${selectedMode}_${activeChallengeStage?.id || 'standard'}_${runSessionId}`}
          mode={selectedMode}
          challengeStage={activeChallengeStage}
          saveData={saveData}
          onGameOver={handleEndRun}
          onVictory={handleEndRun}
          onPause={(snapshot) => {
            if (snapshot) setActiveRunSnapshot(snapshot);
            setCurrentScreen('PAUSED');
          }}
          isPaused={currentScreen === 'PAUSED'}
        />
      )}

      {/* Pause Modal */}
      {currentScreen === 'PAUSED' && (
        <PauseModal
          state={activeRunSnapshot || lastFinishedState || ({} as GameState)}
          language={saveData.settings.language}
          onResume={() => setCurrentScreen('PLAYING')}
          onRestart={() => {
            setRunSessionId((id) => id + 1);
            setCurrentScreen('PLAYING');
          }}
          onSettings={() => setActiveModal('SETTINGS')}
          onMainMenu={() => {
            audio.stopMusic();
            setCurrentScreen('MENU');
          }}
        />
      )}

      {/* Game Over Modal */}
      {currentScreen === 'GAME_OVER' && lastFinishedState && (
        <GameOverModal
          state={lastFinishedState}
          saveData={saveData}
          earnedXp={earnedRunXp}
          earnedCoins={earnedRunCoins}
          newAchievements={newlyUnlockedAchievements}
          onPlayAgain={() => {
            setRunSessionId((id) => id + 1);
            setCurrentScreen('PLAYING');
          }}
          onMainMenu={() => {
            audio.stopMusic();
            setCurrentScreen('MENU');
          }}
        />
      )}

      {/* Wardrobe Modal */}
      {activeModal === 'SKINS' && (
        <SkinCollectionModal
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Missions & Trophies Modal */}
      {activeModal === 'MISSIONS' && (
        <MissionsModal
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Stats Modal */}
      {activeModal === 'STATS' && (
        <StatsModal
          saveData={saveData}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Settings Modal */}
      {activeModal === 'SETTINGS' && (
        <SettingsModal
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Challenges Modal */}
      {activeModal === 'CHALLENGES' && (
        <ChallengeSelectModal
          saveData={saveData}
          onSelectStage={handleSelectChallenge}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
