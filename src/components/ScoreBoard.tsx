import React from 'react';
import {
  Volume2,
  VolumeX,
  HelpCircle,
  RotateCcw,
  Bot,
  Users,
  Sparkles,
  Sliders,
  LogOut,
} from 'lucide-react';
import { PlayerId, GameMode, AIDifficulty } from '../types/game';

interface ScoreBoardProps {
  currentPlayer: PlayerId;
  p1Score: number;
  p2Score: number;
  p1Territory: number;
  p2Territory: number;
  neutralDotsCount: number;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  isAiThinking: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleGameMode: () => void;
  onChangeDifficulty: (diff: AIDifficulty) => void;
  onOpenRules: () => void;
  onResetGame: () => void;
  onExitToStartScreen: () => void;
  onOpenMobileOptions: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  currentPlayer,
  p1Score,
  p2Score,
  p1Territory,
  p2Territory,
  neutralDotsCount,
  gameMode,
  aiDifficulty,
  isAiThinking,
  soundEnabled,
  onToggleSound,
  onToggleGameMode,
  onChangeDifficulty,
  onOpenRules,
  onResetGame,
  onExitToStartScreen,
  onOpenMobileOptions,
}) => {
  return (
    <>
      {/* ========================================================
          MOBILE VIEW (< md): Minimalistic, out-of-the-way micro-bar
          ======================================================== */}
      <header className="flex md:hidden absolute top-3 left-3 right-3 z-20 items-center justify-between gap-2 pointer-events-none">
        {/* Left: Minimal Neutral Cloud Indicator */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-950/85 border border-slate-800/80 rounded-full px-3 py-1.5 backdrop-blur-md shadow-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]" />
          <span className="font-mono font-bold text-sky-300">{neutralDotsCount}</span>
          <span className="text-[10px] text-slate-400">dots</span>
        </div>

        {/* Center: Minimalist Turn & Score Badge */}
        <div className="pointer-events-auto flex items-center bg-slate-950/90 border border-slate-800/80 rounded-full px-3 py-1 backdrop-blur-md shadow-xl">
          {/* Player 1 Red */}
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all ${
              currentPlayer === 'player1'
                ? 'bg-rose-950/80 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'text-slate-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full bg-rose-500 ${
                currentPlayer === 'player1' ? 'animate-pulse' : 'opacity-60'
              }`}
            />
            <span className="text-[11px] font-bold">P1</span>
            <span className="text-sm font-mono font-black text-white">{p1Score}</span>
          </div>

          <span className="text-slate-600 font-mono text-[10px] px-1 font-bold">:</span>

          {/* Player 2 Green / AI */}
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all ${
              currentPlayer === 'player2'
                ? 'bg-emerald-950/80 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-slate-400'
            }`}
          >
            <span className="text-sm font-mono font-black text-white">{p2Score}</span>
            <span className="text-[11px] font-bold">
              {gameMode === 'vs_ai' ? (isAiThinking ? 'AI...' : 'AI') : 'P2'}
            </span>
            <span
              className={`w-2 h-2 rounded-full bg-emerald-500 ${
                currentPlayer === 'player2' ? 'animate-pulse' : 'opacity-60'
              }`}
            />
          </div>
        </div>

        {/* Right: Tactical Menu Drawer Button */}
        <div className="pointer-events-auto">
          <button
            onClick={onOpenMobileOptions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white backdrop-blur-md shadow-xl transition-all cursor-pointer text-xs font-semibold"
            title="Open Tactical Options Menu"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Menu</span>
          </button>
        </div>
      </header>

      {/* ========================================================
          DESKTOP VIEW (>= md): Full, rich tactical scoreboard
          ======================================================== */}
      <header className="hidden md:flex absolute top-4 left-4 right-4 z-20 items-center justify-between gap-3 pointer-events-none">
        {/* Brand & Neutral Cloud Info */}
        <div className="flex items-center gap-3 pointer-events-auto bg-slate-950/85 border border-slate-800/90 rounded-2xl px-4 py-2.5 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-slate-100 uppercase">
                3D Blink
              </h1>
              <p className="text-[10px] font-medium text-slate-400">
                Tetrahedral Capture
              </p>
            </div>
          </div>

          <div className="h-7 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            <span className="font-mono font-bold text-sky-400">{neutralDotsCount}</span>
            <span className="text-[11px] text-slate-400">neutral left</span>
          </div>
        </div>

        {/* Center Scores & Turn Tracker */}
        <div className="pointer-events-auto flex items-center bg-slate-950/85 border border-slate-800/90 rounded-2xl p-1.5 backdrop-blur-md shadow-2xl">
          {/* Player 1 (Red) */}
          <div
            className={`relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-3 ${
              currentPlayer === 'player1'
                ? 'bg-rose-950/70 border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                : 'opacity-75'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.9)] flex items-center justify-center">
              {currentPlayer === 'player1' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              )}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-rose-300">Player 1</span>
                {currentPlayer === 'player1' && (
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                    Turn
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black font-mono text-white leading-none">
                  {p1Score}
                </span>
                <span className="text-[10px] text-rose-300/80">
                  {p1Territory} territory
                </span>
              </div>
            </div>
          </div>

          <div className="px-2 text-xs font-black text-slate-600 font-mono">VS</div>

          {/* Player 2 (Green) / AI */}
          <div
            className={`relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-3 ${
              currentPlayer === 'player2'
                ? 'bg-emerald-950/70 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'opacity-75'
            }`}
          >
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                {currentPlayer === 'player2' && (
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                    {isAiThinking ? 'Thinking...' : 'Turn'}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  {gameMode === 'vs_ai' ? (
                    <>
                      <Bot className="w-3 h-3 text-emerald-400 inline" />
                      AI ({aiDifficulty})
                    </>
                  ) : (
                    'Player 2'
                  )}
                </span>
              </div>
              <div className="flex items-baseline justify-end gap-2">
                <span className="text-[10px] text-emerald-300/80">
                  {p2Territory} territory
                </span>
                <span className="text-xl font-black font-mono text-white leading-none">
                  {p2Score}
                </span>
              </div>
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.9)] flex items-center justify-center">
              {currentPlayer === 'player2' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              )}
            </div>
          </div>
        </div>

        {/* Right Desktop Controls: Mode, Audio, Help, Reset, Main Menu */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-950/85 border border-slate-800/90 rounded-2xl px-3 py-2 backdrop-blur-md shadow-2xl">
          {/* Game Mode Toggle */}
          <button
            onClick={onToggleGameMode}
            title={gameMode === 'pvp' ? 'Switch to Solo vs AI' : 'Switch to 2-Player Local'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            {gameMode === 'pvp' ? (
              <>
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>Pass & Play</span>
              </>
            ) : (
              <>
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>Vs AI</span>
              </>
            )}
          </button>

          {/* AI Difficulty dropdown if Vs AI */}
          {gameMode === 'vs_ai' && (
            <select
              value={aiDifficulty}
              onChange={(e) => onChangeDifficulty(e.target.value as AIDifficulty)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-xl px-2 py-1.5 outline-none cursor-pointer hover:border-slate-500"
            >
              <option value="easy">Easy AI</option>
              <option value="medium">Medium AI</option>
              <option value="hard">Tactical AI</option>
            </select>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Rules & Help */}
          <button
            onClick={onOpenRules}
            title="Game Rules & Guide"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="View Rules"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Restart Game */}
          <button
            onClick={onResetGame}
            title="Restart Match"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Restart Match"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Return to Start Screen / Main Menu */}
          <button
            onClick={onExitToStartScreen}
            title="Return to Main Menu (Select Mode)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/80 hover:border-rose-700/70 border border-slate-700/70 text-xs font-semibold text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Menu</span>
          </button>
        </div>
      </header>
    </>
  );
};
