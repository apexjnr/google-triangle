import React from 'react';
import {
  X,
  Sliders,
  Volume2,
  VolumeX,
  RotateCcw,
  LogOut,
  HelpCircle,
  Lightbulb,
  Compass,
  Bot,
  Users,
  Shield,
  Zap,
} from 'lucide-react';
import { GameMode, AIDifficulty, PlayerId, GameStats } from '../types/game';

interface TacticalOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  onChangeDifficulty: (diff: AIDifficulty) => void;
  currentPlayer: PlayerId;
  stats: GameStats;
  p1Territory: number;
  p2Territory: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSuggestMove: () => void;
  onCameraPreset: (preset: 'front' | 'top' | 'side' | 'iso' | 'reset') => void;
  onRestartMatch: () => void;
  onExitToStartScreen: () => void;
  onOpenRules: () => void;
}

export const TacticalOptionsModal: React.FC<TacticalOptionsModalProps> = ({
  isOpen,
  onClose,
  gameMode,
  aiDifficulty,
  onChangeDifficulty,
  currentPlayer,
  stats,
  p1Territory,
  p2Territory,
  soundEnabled,
  onToggleSound,
  onSuggestMove,
  onCameraPreset,
  onRestartMatch,
  onExitToStartScreen,
  onOpenRules,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto overscroll-contain">
      {/* Background click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Sheet / Modal Container - Perfectly Centered & Scrollable */}
      <div className="relative my-auto w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto z-10 animate-slideDown">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-wide uppercase">
                Tactical Game Options
              </h2>
              <p className="text-[11px] text-slate-400">
                {gameMode === 'vs_ai' ? 'Solo Match vs AI' : 'Pass & Play (Same Device)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Match Status & Scores */}
        <div className="mb-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Match Standings
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-rose-950/40 border border-rose-900/50 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-rose-300">Player 1 (Red)</div>
                <div className="text-[10px] text-slate-400">{p1Territory} territory dots</div>
              </div>
              <div className="text-xl font-mono font-black text-white">{stats.p1Score}</div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-emerald-300">
                  {gameMode === 'vs_ai' ? 'AI (Green)' : 'Player 2 (Green)'}
                </div>
                <div className="text-[10px] text-slate-400">{p2Territory} territory dots</div>
              </div>
              <div className="text-xl font-mono font-black text-white">{stats.p2Score}</div>
            </div>
          </div>
        </div>

        {/* Section 2: AI Settings (if in vs_ai mode) */}
        {gameMode === 'vs_ai' && (
          <div className="mb-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-sky-400" />
                AI Difficulty
              </span>
              <span className="text-[10px] font-bold text-sky-400 uppercase">{aiDifficulty}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => onChangeDifficulty(diff)}
                  className={`py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                    aiDifficulty === diff
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff === 'easy' ? 'Casual' : diff === 'medium' ? 'Adaptive' : 'Tactical'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: In-Game Assistance & Camera */}
        <div className="mb-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Tactical Scan & Camera Angles
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                onSuggestMove();
                onClose();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 hover:text-white transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Tactical Scan (Scan Cloud for Move)</span>
              </div>
              <span className="text-[10px] text-amber-300 font-mono">Auto-Target</span>
            </button>

            <div className="flex items-center gap-1.5 pt-1">
              <Compass className="w-3.5 h-3.5 text-sky-400 ml-1 shrink-0" />
              {(['iso', 'front', 'top', 'side', 'reset'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    onCameraPreset(preset);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors capitalize cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: General Settings & Navigation */}
        <div className="space-y-2">
          {/* Audio toggle & Rules */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onToggleSound}
              className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  <span>Audio: On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span>Audio: Muted</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenRules();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>How to Play</span>
            </button>
          </div>

          {/* Restart Match */}
          <button
            onClick={() => {
              onClose();
              onRestartMatch();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Restart Current Galaxy</span>
          </button>

          {/* Exit to Main Menu / Start Screen */}
          <button
            onClick={() => {
              onClose();
              onExitToStartScreen();
            }}
            className="w-full py-3 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/60 hover:border-rose-700 text-xs font-bold text-rose-300 hover:text-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Exit to Main Menu (Change Mode)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
