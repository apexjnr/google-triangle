import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Award, Zap, AlertOctagon } from 'lucide-react';
import { GameMode, GameStats, PlayerId } from '../types/game';

interface GameOverModalProps {
  isOpen: boolean;
  winner: PlayerId | 'draw';
  stats: GameStats;
  gameMode: GameMode;
  onRematch: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  stats,
  gameMode,
  onRematch,
}) => {
  useEffect(() => {
    if (isOpen && winner !== 'draw') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: winner === 'player1' ? ['#ef4444', '#f87171', '#fecdd3'] : ['#10b981', '#34d399', '#a7f3d0'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen, winner]);

  if (!isOpen) return null;

  const winnerTitle =
    winner === 'draw'
      ? 'Tactical Stalemate!'
      : winner === 'player1'
      ? 'Player 1 Dominates!'
      : gameMode === 'vs_ai'
      ? 'Tactical AI Wins!'
      : 'Player 2 Dominates!';

  const winnerSubtitle =
    winner === 'draw'
      ? 'Both players finished with identical scores.'
      : `${winner === 'player1' ? 'Player 1' : gameMode === 'vs_ai' ? 'AI' : 'Player 2'} trapped more dots inside their tetrahedrons.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative my-auto w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-5 md:p-8 shadow-2xl text-center max-h-[90vh] overflow-y-auto">
        {/* Trophy / Result Icon */}
        <div className="mx-auto mb-4 w-16 h-16 rounded-3xl flex items-center justify-center bg-gradient-to-tr from-amber-500 to-amber-600 shadow-xl shadow-amber-500/30">
          <Trophy className="w-9 h-9 text-slate-950" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-wide uppercase mb-1">
          {winnerTitle}
        </h2>
        <p className="text-xs text-slate-400 mb-6">{winnerSubtitle}</p>

        {/* Score comparison card */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            className={`p-4 rounded-2xl border transition-all ${
              winner === 'player1'
                ? 'bg-rose-950/60 border-rose-500/80 shadow-lg shadow-rose-950/40'
                : 'bg-slate-900/50 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-300 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Player 1</span>
            </div>
            <div className="text-3xl font-black font-mono text-white mb-1">
              {stats.p1Score}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-rose-400" />
              <span>{stats.p1Blinks} Blinks ({stats.p1Wasted} wasted)</span>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              winner === 'player2'
                ? 'bg-emerald-950/60 border-emerald-500/80 shadow-lg shadow-emerald-950/40'
                : 'bg-slate-900/50 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-300 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{gameMode === 'vs_ai' ? 'Tactical AI' : 'Player 2'}</span>
            </div>
            <div className="text-3xl font-black font-mono text-white mb-1">
              {stats.p2Score}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>{stats.p2Blinks} Blinks ({stats.p2Wasted} wasted)</span>
            </div>
          </div>
        </div>

        {/* Game summary details */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 mb-6 text-xs text-slate-300 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Total Match Turns:</span>
            <span className="font-mono font-bold text-white">{stats.turnsCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Dots Annihilated:</span>
            <span className="font-mono font-bold text-sky-400">
              {stats.p1Score + stats.p2Score}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Reason for Game Over:</span>
            <span className="text-slate-300 flex items-center gap-1">
              <AlertOctagon className="w-3 h-3 text-amber-400" />
              No valid tetrahedrons remain
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onRematch}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Rematch</span>
        </button>
      </div>
    </div>
  );
};
