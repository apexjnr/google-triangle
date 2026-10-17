import React from 'react';
import {
  Bot,
  Users,
  Globe,
  HelpCircle,
  Volume2,
  VolumeX,
  Play,
  Sparkles,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { GameMode, AIDifficulty } from '../types/game';

interface StartScreenProps {
  onStartGame: (mode: GameMode, difficulty: AIDifficulty) => void;
  onOpenRules: () => void;
  onBackToIntro?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onOpenRules,
  onBackToIntro,
  soundEnabled,
  onToggleSound,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<AIDifficulty>('medium');

  return (
    <>
      {/* Floating Top Header on Start Screen */}
      <header className="fixed top-3 left-3 right-3 z-40 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2.5 bg-slate-950/85 border border-slate-800/80 rounded-2xl px-3.5 py-1.5 backdrop-blur-md shadow-xl pointer-events-auto">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wider text-slate-100 uppercase">
              3D Blink
            </h1>
            <p className="text-[9px] text-slate-400 font-medium">Tetrahedral Capture</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-950/85 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
          {onBackToIntro && (
            <button
              onClick={onBackToIntro}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/85 border border-slate-800 hover:border-slate-700 text-sky-300 hover:text-white backdrop-blur-md transition-colors cursor-pointer text-xs font-semibold"
              title="View 3-Step Guide & Demo"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">3-Step Guide</span>
            </button>
          )}
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/85 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white backdrop-blur-md transition-colors cursor-pointer text-xs font-semibold"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span className="hidden xs:inline">Rules</span>
          </button>
        </div>
      </header>

      {/* Fully Scrollable, Perfectly Centered Viewport Wrapper */}
      <div className="fixed inset-0 z-30 overflow-y-auto overscroll-contain flex flex-col items-center justify-start sm:justify-center p-3 sm:p-4 pt-16 pb-8">
        {/* Centered Main Menu Card */}
        <div className="relative my-auto w-full max-w-md bg-slate-950/94 border border-slate-800/90 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl animate-fadeIn">
          {/* Menu Title Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3" />
              Tactical 3D Strategy
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              Select Mission
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Form 4-vertex tetrahedrons to annihilate trapped dots.
            </p>
          </div>

          {/* Mode Selection Options */}
          <div className="space-y-2.5">
            {/* Solo vs AI Card */}
            <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800 hover:border-sky-500/60 p-3.5 transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Solo vs Tactical AI
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Challenge the spatial compute engine.
                  </p>
                </div>
              </div>

              {/* Difficulty selector pills */}
              <div className="flex items-center gap-1 mb-2.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                      selectedDifficulty === diff
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {diff === 'easy' ? 'Casual' : diff === 'medium' ? 'Adaptive' : 'Tactical'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onStartGame('vs_ai', selectedDifficulty)}
                className="w-full py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 cursor-pointer active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Solo Match</span>
              </button>
            </div>

            {/* Pass & Play (Same Device) Card */}
            <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800 hover:border-emerald-500/60 p-3.5 transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Pass & Play (Same Device)
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Take turns playing on this screen.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2.5 text-[10px] text-slate-400 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> P1 Red
                </span>
                <span className="text-slate-600 font-bold">vs</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> P2 Green
                </span>
              </div>

              <button
                onClick={() => onStartGame('pvp', 'medium')}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch 2-Player Match</span>
              </button>
            </div>

            {/* Online Multiplayer Preview Card */}
            <div className="rounded-2xl bg-slate-900/30 border border-slate-800/50 p-2.5 opacity-60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-800/60 flex items-center justify-center shrink-0 text-slate-400">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-300">Online Multiplayer</span>
                    <span className="text-[8px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded">
                      Soon
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400">
                    Live peer matchmaking in development
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>

          {/* Touch navigation hint */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-800/70 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
            <Compass className="w-3 h-3 text-sky-400" />
            <span>Drag background to orbit 3D cloud • Touch-friendly</span>
          </div>
        </div>
      </div>
    </>
  );
};
