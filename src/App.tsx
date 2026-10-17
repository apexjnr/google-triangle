/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DotData, PlayerId, GameMode, AIDifficulty, GameStats, GamePhase, ViewMode } from './types/game';
import {
  generateDotCloud,
  validateTetrahedron,
  checkAnyValidTetrahedronExists,
  findBestMove,
  distance3D,
  MIN_DOT_DISTANCE,
} from './utils/geometry';
import { soundManager } from './utils/audio';
import { ThreeCanvas } from './components/ThreeCanvas';
import { IntroScreen } from './components/IntroScreen';
import { StartScreen } from './components/StartScreen';
import { ScoreBoard } from './components/ScoreBoard';
import { ControlDock } from './components/ControlDock';
import { TacticalOptionsModal } from './components/TacticalOptionsModal';
import { EmptyBlinkConfirmModal } from './components/EmptyBlinkConfirmModal';
import { RulesModal } from './components/RulesModal';
import { GameOverModal } from './components/GameOverModal';

export default function App() {
  // Navigation & phase: start on intro_screen on load for high-contrast guide & demo
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro_screen');

  // View mode: 'simple' vs 'advanced'
  const [viewMode, setViewMode] = useState<ViewMode>('simple');

  // Game field state
  const [dots, setDots] = useState<DotData[]>(() => generateDotCloud());
  const [selectedDots, setSelectedDots] = useState<DotData[]>([]);

  // Selection History for Undo / Redo
  const [selectionHistory, setSelectionHistory] = useState<DotData[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [currentPlayer, setCurrentPlayer] = useState<PlayerId>('player1');
  const [gameMode, setGameMode] = useState<GameMode>('vs_ai');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');

  // Interactive & turn execution states
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Safety confirmation for zero trapped dots
  const [emptyBlinkModalOpen, setEmptyBlinkModalOpen] = useState(false);
  const [skipEmptyBlinkWarning, setSkipEmptyBlinkWarning] = useState(false);

  // Modals & Panels
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [tacticalOptionsOpen, setTacticalOptionsOpen] = useState(false);
  const [gameOverOpen, setGameOverOpen] = useState(false);
  const [winner, setWinner] = useState<PlayerId | 'draw'>('draw');
  const [cameraPresetTrigger, setCameraPresetTrigger] = useState<string | null>(null);

  // Stats tracker
  const [stats, setStats] = useState<GameStats>({
    p1Score: 0,
    p2Score: 0,
    p1Blinks: 0,
    p2Blinks: 0,
    p1Wasted: 0,
    p2Wasted: 0,
    turnsCount: 0,
  });

  // Calculate remaining neutral dots
  const neutralDotsCount = useMemo(() => {
    return dots.filter((d) => d.state === 'active' && d.owner === 'neutral').length;
  }, [dots]);

  // Calculate territory counts
  const p1Territory = useMemo(() => {
    return dots.filter((d) => d.state === 'active' && d.owner === 'player1').length;
  }, [dots]);

  const p2Territory = useMemo(() => {
    return dots.filter((d) => d.state === 'active' && d.owner === 'player2').length;
  }, [dots]);

  // Validation calculation for current selection
  const validation = useMemo(() => {
    return validateTetrahedron(selectedDots, dots, currentPlayer);
  }, [selectedDots, dots, currentPlayer]);

  // Transient banner display helper
  const showBanner = (msg: string, durationMs = 2800) => {
    setBannerMessage(msg);
    setTimeout(() => {
      setBannerMessage((prev) => (prev === msg ? null : prev));
    }, durationMs);
  };

  // Sound toggle handler
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
  };

  // Push new selection to history for Undo / Redo
  const pushSelection = useCallback((nextDots: DotData[]) => {
    setSelectionHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      trimmed.push(nextDots);
      return trimmed;
    });
    setHistoryIndex((prev) => prev + 1);
    setSelectedDots(nextDots);
  }, [historyIndex]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setSelectedDots(selectionHistory[prevIdx]);
      soundManager.playDeselect();
    }
  }, [historyIndex, selectionHistory]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (historyIndex < selectionHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setSelectedDots(selectionHistory[nextIdx]);
      soundManager.playSelect(selectionHistory[nextIdx].length);
    }
  }, [historyIndex, selectionHistory]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < selectionHistory.length - 1;

  // Keyboard shortcuts: Ctrl+Z (Undo), Ctrl+Y or Ctrl+Shift+Z (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gamePhase !== 'playing' || isBlinking || isAiThinking) return;

      const isModifier = e.ctrlKey || e.metaKey;
      if (isModifier && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if (isModifier && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, isBlinking, isAiThinking, handleUndo, handleRedo]);

  // Start new match from start screen
  const handleStartGame = (mode: GameMode, difficulty: AIDifficulty) => {
    setGameMode(mode);
    setAiDifficulty(difficulty);
    setDots(generateDotCloud());
    setSelectedDots([]);
    setSelectionHistory([[]]);
    setHistoryIndex(0);
    setCurrentPlayer('player1');
    setIsAiThinking(false);
    setIsBlinking(false);
    setGameOverOpen(false);
    setEmptyBlinkModalOpen(false);
    setStats({
      p1Score: 0,
      p2Score: 0,
      p1Blinks: 0,
      p2Blinks: 0,
      p1Wasted: 0,
      p2Wasted: 0,
      turnsCount: 0,
    });
    setGamePhase('playing');
    showBanner(
      mode === 'vs_ai'
        ? `Solo Match vs AI (${difficulty.toUpperCase()}) initialized.`
        : 'Pass & Play match started. Player 1 (Red) goes first.'
    );
  };

  // Exit back to start screen
  const handleExitToStartScreen = () => {
    setGamePhase('start_screen');
    setTacticalOptionsOpen(false);
    setGameOverOpen(false);
    setEmptyBlinkModalOpen(false);
    setSelectedDots([]);
    setSelectionHistory([[]]);
    setHistoryIndex(0);
  };

  // Handle dot selection / click with FIFO (5th dot replaces oldest dot)
  const handleDotClick = useCallback(
    (clickedDot: DotData) => {
      if (gamePhase !== 'playing' || isBlinking || isAiThinking) return;

      // Check if already selected -> deselect
      const isAlreadySelected = selectedDots.some((d) => d.id === clickedDot.id);
      if (isAlreadySelected) {
        const next = selectedDots.filter((d) => d.id !== clickedDot.id);
        pushSelection(next);
        soundManager.playDeselect();
        return;
      }

      // Owned dots cannot be selected to form a tetrahedron
      if (clickedDot.owner !== 'neutral') {
        soundManager.playError();
        showBanner('Owned dots cannot be selected. Only neutral dots can form shapes!');
        return;
      }

      // FIFO Rule: When continuing past 4 dots, unselect the oldest!
      if (selectedDots.length >= 4) {
        const oldest = selectedDots[0];
        const remainingThree = selectedDots.slice(1);

        // Check minimum distance to the remaining 3 dots
        for (const sel of remainingThree) {
          const dist = distance3D(clickedDot, sel);
          if (dist < MIN_DOT_DISTANCE) {
            soundManager.playError();
            showBanner(
              `Too close to dot #${sel.id} (${dist.toFixed(1)} < ${MIN_DOT_DISTANCE}u)!`
            );
            return;
          }
        }

        const nextSelected = [...remainingThree, clickedDot];
        pushSelection(nextSelected);
        soundManager.playSelect(4);
        showBanner(`Replaced oldest dot #${oldest.id} with dot #${clickedDot.id}`);

        const v = validateTetrahedron(nextSelected, dots, currentPlayer);
        if (v.isValid) {
          soundManager.playShapeValid();
        }
        return;
      }

      // If < 4 dots, check minimum distance to all already selected dots (~4 units)
      for (const sel of selectedDots) {
        const dist = distance3D(clickedDot, sel);
        if (dist < MIN_DOT_DISTANCE) {
          soundManager.playError();
          showBanner(
            `Too close to dot #${sel.id} (${dist.toFixed(1)} < ${MIN_DOT_DISTANCE}u)! Choose a farther dot.`
          );
          return;
        }
      }

      const nextSelected = [...selectedDots, clickedDot];
      pushSelection(nextSelected);
      soundManager.playSelect(nextSelected.length);

      if (nextSelected.length === 4) {
        const v = validateTetrahedron(nextSelected, dots, currentPlayer);
        if (v.isValid) {
          soundManager.playShapeValid();
        }
      }
    },
    [gamePhase, selectedDots, dots, currentPlayer, isBlinking, isAiThinking, pushSelection]
  );

  // Clear selection
  const handleClearSelection = () => {
    if (selectedDots.length > 0) {
      pushSelection([]);
      soundManager.playDeselect();
    }
  };

  // Reset entire active game match
  const handleResetGame = useCallback(() => {
    const newDots = generateDotCloud();
    setDots(newDots);
    setSelectedDots([]);
    setSelectionHistory([[]]);
    setHistoryIndex(0);
    setCurrentPlayer('player1');
    setIsAiThinking(false);
    setIsBlinking(false);
    setGameOverOpen(false);
    setEmptyBlinkModalOpen(false);
    setStats({
      p1Score: 0,
      p2Score: 0,
      p1Blinks: 0,
      p2Blinks: 0,
      p1Wasted: 0,
      p2Wasted: 0,
      turnsCount: 0,
    });
    showBanner('New galaxy loaded! Player 1 turn.');
  }, []);

  // Actual BLINK Execution
  const executeBlink = useCallback(() => {
    if (selectedDots.length !== 4 || !validation.isValid || isBlinking) return;

    setIsBlinking(true);

    // 1. Full-screen white flash
    setFlashOpacity(1);
    setTimeout(() => {
      setFlashOpacity(0);
    }, 120);

    const capturedIds = new Set(validation.capturedDotIds);
    const selectedIds = new Set(selectedDots.map((d) => d.id));
    const capturedCount = validation.capturedDotIds.length;
    const isWasted = capturedCount === 0;

    if (!isWasted) {
      soundManager.playBlinkSuccess(capturedCount);
      showBanner(
        `⚡ BLINK! +${capturedCount} pt${capturedCount > 1 ? 's' : ''}! 4 anchor dots claimed as territory.`
      );
    } else {
      soundManager.playBlinkFailure();
      showBanner(`⚠ WASTED TURN! 0 dots inside. All 4 anchor dots dissolved into void!`);
    }

    // 2. Update Dots state
    const nextDots = dots.map((dot) => {
      if (capturedIds.has(dot.id)) {
        return { ...dot, state: 'destroyed' as const };
      }
      if (selectedIds.has(dot.id)) {
        if (!isWasted) {
          return {
            ...dot,
            owner: currentPlayer,
            state: 'active' as const,
          };
        } else {
          return {
            ...dot,
            state: 'destroyed' as const,
          };
        }
      }
      return dot;
    });

    setDots(nextDots);

    // 3. Update stats
    setStats((prev) => {
      const isP1 = currentPlayer === 'player1';
      return {
        ...prev,
        p1Score: isP1 ? prev.p1Score + capturedCount : prev.p1Score,
        p2Score: !isP1 ? prev.p2Score + capturedCount : prev.p2Score,
        p1Blinks: isP1 ? prev.p1Blinks + 1 : prev.p1Blinks,
        p2Blinks: !isP1 ? prev.p2Blinks + 1 : prev.p2Blinks,
        p1Wasted: isP1 && isWasted ? prev.p1Wasted + 1 : prev.p1Wasted,
        p2Wasted: !isP1 && isWasted ? prev.p2Wasted + 1 : prev.p2Wasted,
        turnsCount: prev.turnsCount + 1,
      };
    });

    setSelectedDots([]);
    setSelectionHistory([[]]);
    setHistoryIndex(0);

    // 4. Delay turn switch so visual implosion and score updates are readable
    setTimeout(() => {
      setIsBlinking(false);

      // Check win condition
      const stillHasValidTetra = checkAnyValidTetrahedronExists(nextDots);
      if (!stillHasValidTetra) {
        setStats((finalStats) => {
          let gameWinner: PlayerId | 'draw' = 'draw';
          if (finalStats.p1Score > finalStats.p2Score) {
            gameWinner = 'player1';
          } else if (finalStats.p2Score > finalStats.p1Score) {
            gameWinner = 'player2';
          }
          setWinner(gameWinner);
          setGameOverOpen(true);
          soundManager.playGameOver();
          return finalStats;
        });
        return;
      }

      // Switch turn
      const nextPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
      setCurrentPlayer(nextPlayer);
    }, 1100);
  }, [selectedDots, validation, isBlinking, dots, currentPlayer]);

  // BLINK trigger with Safety Confirmation for 0 trapped dots
  const handleBlinkClick = useCallback(() => {
    if (selectedDots.length !== 4 || !validation.isValid || isBlinking) return;

    // If 0 trapped dots and player hasn't opted out of the warning this session:
    if (validation.capturedDotIds.length === 0 && !skipEmptyBlinkWarning) {
      setEmptyBlinkModalOpen(true);
      return;
    }

    executeBlink();
  }, [selectedDots, validation, isBlinking, skipEmptyBlinkWarning, executeBlink]);

  // Safety Confirmation handler
  const handleConfirmEmptyBlink = (neverAskAgain: boolean) => {
    if (neverAskAgain) {
      setSkipEmptyBlinkWarning(true);
      showBanner("Zero-dots warning disabled for this session.");
    }
    setEmptyBlinkModalOpen(false);
    executeBlink();
  };

  // Tactical Scan: Suggest highest yield move for player or hint
  const handleSuggestMove = useCallback(() => {
    if (isBlinking || isAiThinking) return;

    const bestDots = findBestMove(dots, currentPlayer, 'hard');
    if (!bestDots) {
      showBanner('No valid tetrahedrons could be found in the current cloud!');
      return;
    }

    pushSelection(bestDots);
    soundManager.playShapeValid();
    const v = validateTetrahedron(bestDots, dots, currentPlayer);
    showBanner(`Tactical Scan locked onto optimal formation (+${v.capturedDotIds.length} dots)!`);
  }, [dots, currentPlayer, isBlinking, isAiThinking, pushSelection]);

  // AI Turn Autonomous Execution
  useEffect(() => {
    if (
      gamePhase === 'playing' &&
      gameMode === 'vs_ai' &&
      currentPlayer === 'player2' &&
      !isBlinking &&
      !gameOverOpen
    ) {
      setIsAiThinking(true);

      const aiTimer = setTimeout(() => {
        const aiMove = findBestMove(dots, 'player2', aiDifficulty);

        if (!aiMove) {
          setIsAiThinking(false);
          let gameWinner: PlayerId | 'draw' = 'draw';
          if (stats.p1Score > stats.p2Score) gameWinner = 'player1';
          else if (stats.p2Score > stats.p1Score) gameWinner = 'player2';
          setWinner(gameWinner);
          setGameOverOpen(true);
          soundManager.playGameOver();
          return;
        }

        // Show AI's selection
        setSelectedDots(aiMove);
        setSelectionHistory([aiMove]);
        setHistoryIndex(0);
        soundManager.playShapeValid();

        const blinkTimer = setTimeout(() => {
          setIsAiThinking(false);
          executeBlink();
        }, 750);

        return () => clearTimeout(blinkTimer);
      }, 900);

      return () => clearTimeout(aiTimer);
    }
  }, [gamePhase, currentPlayer, gameMode, isBlinking, gameOverOpen, dots, aiDifficulty, executeBlink, stats]);

  // Camera preset trigger helper
  const handleCameraPreset = (preset: 'front' | 'top' | 'side' | 'iso' | 'reset') => {
    setCameraPresetTrigger(`${preset}-${Date.now()}`);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 1. 3D WebGL Canvas Layer */}
      <ThreeCanvas
        dots={dots}
        selectedDots={selectedDots}
        currentPlayer={currentPlayer}
        validation={validation}
        isBlinking={isBlinking}
        onDotClick={handleDotClick}
        cameraViewTrigger={cameraPresetTrigger}
      />

      {/* 2. Full-Screen White Flash on BLINK */}
      <div
        className="pointer-events-none fixed inset-0 z-40 bg-white transition-opacity duration-300 ease-out"
        style={{ opacity: flashOpacity }}
      />

      {/* 3. Transient Floating Banner / Tactical Alerts */}
      {bannerMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-30 max-w-[90vw] pointer-events-none transition-all duration-300 animate-slideDown">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-sky-500/50 shadow-2xl backdrop-blur-md text-[11px] font-semibold text-sky-200 text-center tracking-wide">
            {bannerMessage}
          </div>
        </div>
      )}

      {/* 4a. On-Load Colourful Intro Screen: 3 Easy Steps & Yellow Start Demo 1v1 Button */}
      {gamePhase === 'intro_screen' && (
        <IntroScreen
          onStartDemoVsAI={() => {
            handleStartGame('vs_ai', 'medium');
            showBanner('⚡ Demo 1v1 vs AI started! Select 4 blue dots to enclose a cluster.');
          }}
          onOpenMissionSelect={() => setGamePhase('start_screen')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* 4b. Mission Select / Start Screen (When gamePhase === 'start_screen') */}
      {gamePhase === 'start_screen' && (
        <StartScreen
          onStartGame={handleStartGame}
          onOpenRules={() => setRulesOpen(true)}
          onBackToIntro={() => setGamePhase('intro_screen')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* 5. In-Game HUD & Tactical Controls (Full desktop HUD on md+, Minimal on mobile) */}
      {gamePhase === 'playing' && (
        <>
          <ScoreBoard
            currentPlayer={currentPlayer}
            p1Score={stats.p1Score}
            p2Score={stats.p2Score}
            p1Territory={p1Territory}
            p2Territory={p2Territory}
            neutralDotsCount={neutralDotsCount}
            gameMode={gameMode}
            aiDifficulty={aiDifficulty}
            isAiThinking={isAiThinking}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onToggleGameMode={() => {
              setGameMode((prev) => (prev === 'pvp' ? 'vs_ai' : 'pvp'));
              showBanner(
                gameMode === 'pvp'
                  ? 'Switched to Vs AI mode!'
                  : 'Switched to 2-Player Pass & Play mode!'
              );
            }}
            onChangeDifficulty={(diff) => {
              setAiDifficulty(diff);
              showBanner(`AI difficulty set to ${diff.toUpperCase()}`);
            }}
            onOpenRules={() => setRulesOpen(true)}
            onResetGame={handleResetGame}
            onExitToStartScreen={handleExitToStartScreen}
            onOpenMobileOptions={() => setTacticalOptionsOpen(true)}
          />

          <ControlDock
            selectedDots={selectedDots}
            validation={validation}
            currentPlayer={currentPlayer}
            isBlinking={isBlinking || isAiThinking}
            viewMode={viewMode}
            onToggleViewMode={() =>
              setViewMode((prev) => (prev === 'simple' ? 'advanced' : 'simple'))
            }
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onBlink={handleBlinkClick}
            onClearSelection={handleClearSelection}
            onSuggestMove={handleSuggestMove}
            onCameraPreset={handleCameraPreset}
            onOpenTacticalOptions={() => setTacticalOptionsOpen(true)}
          />
        </>
      )}

      {/* 6. Empty Blink Safety Confirmation Dialog */}
      <EmptyBlinkConfirmModal
        isOpen={emptyBlinkModalOpen}
        onCancel={() => setEmptyBlinkModalOpen(false)}
        onConfirm={handleConfirmEmptyBlink}
      />

      {/* 7. Tactical Game Options Drawer / Modal */}
      <TacticalOptionsModal
        isOpen={tacticalOptionsOpen}
        onClose={() => setTacticalOptionsOpen(false)}
        gameMode={gameMode}
        aiDifficulty={aiDifficulty}
        onChangeDifficulty={(diff) => {
          setAiDifficulty(diff);
          showBanner(`AI difficulty set to ${diff.toUpperCase()}`);
        }}
        currentPlayer={currentPlayer}
        stats={stats}
        p1Territory={p1Territory}
        p2Territory={p2Territory}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onSuggestMove={handleSuggestMove}
        onCameraPreset={handleCameraPreset}
        onRestartMatch={handleResetGame}
        onExitToStartScreen={handleExitToStartScreen}
        onOpenRules={() => setRulesOpen(true)}
      />

      {/* 8. Rules & Strategy Modal */}
      <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />

      {/* 9. Game Over Celebration Modal */}
      <GameOverModal
        isOpen={gameOverOpen}
        winner={winner}
        stats={stats}
        gameMode={gameMode}
        onRematch={handleResetGame}
      />
    </div>
  );
}
