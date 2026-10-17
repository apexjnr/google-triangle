import React from 'react';
import {
  Play,
  Sparkles,
  Layers,
  Zap,
  Target,
  Bot,
  Users,
  Compass,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface IntroScreenProps {
  onStartDemoVsAI: () => void;
  onOpenMissionSelect: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  onStartDemoVsAI,
  onOpenMissionSelect,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <>
      {/* Floating Audio Toggle at Top Right */}
      <div className="fixed top-3 right-3 z-40 pointer-events-auto">
        <button
          onClick={onToggleSound}
          className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white backdrop-blur-md shadow-xl transition-all cursor-pointer"
          title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-amber-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* Centered, Fully Scrollable Container */}
      <div className="fixed inset-0 z-30 overflow-y-auto overscroll-contain flex flex-col items-center justify-start sm:justify-center p-3 sm:p-5 pt-12 sm:pt-4 pb-8">
        <div className="relative my-auto w-full max-w-xl bg-gradient-to-b from-slate-900/98 via-slate-900/95 to-slate-950/98 border border-sky-400/40 rounded-3xl p-5 sm:p-7 backdrop-blur-2xl shadow-[0_0_50px_rgba(56,189,248,0.22)] animate-fadeIn">
          
          {/* Header & Colorful Badges */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 border border-sky-400/50 text-sky-300 text-xs font-bold uppercase tracking-wider mb-2.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Tactical 3D Strategy Game</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase leading-none drop-shadow-md">
              3D Blink
            </h1>
            <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent uppercase tracking-wider mt-1">
              Tetrahedral Capture
            </p>
          </div>

          {/* High-Contrast Description Banner */}
          <div className="bg-slate-800/90 border border-sky-500/30 rounded-2xl p-3.5 sm:p-4 mb-5 shadow-inner">
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium text-center">
              A 3D spatial strategy duel inside a glowing cloud of dots. Form four-sided shapes (tetrahedrons) to trap clusters, then hit <strong className="text-amber-300 font-extrabold uppercase">BLINK</strong> to annihilate everything trapped inside for points!
            </p>
          </div>

          {/* 3 Easy Steps Section */}
          <div className="mb-6">
            <div className="text-center text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-sky-500/40" />
              <span>How To Play In 3 Easy Steps</span>
              <span className="h-px w-8 bg-sky-500/40" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Step 1 */}
              <div className="bg-gradient-to-b from-sky-950/80 to-slate-900/90 border border-sky-500/40 rounded-2xl p-3 sm:p-3.5 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 shadow-md">
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-sky-500/30">
                  1
                </div>
                <div>
                  <h3 className="text-xs font-bold text-sky-200 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-sky-400 inline" />
                    Pick 4 Dots
                  </h3>
                  <p className="text-[11px] text-slate-200 leading-snug mt-0.5">
                    Orbit the 3D cloud and select 4 neutral dots to enclose a cluster. Selecting a 5th replaces the oldest!
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-gradient-to-b from-indigo-950/80 to-slate-900/90 border border-indigo-500/40 rounded-2xl p-3 sm:p-3.5 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 shadow-md">
                <div className="w-8 h-8 rounded-xl bg-indigo-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-indigo-400/30">
                  2
                </div>
                <div>
                  <h3 className="text-xs font-bold text-indigo-200 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-400 inline" />
                    Check Volume
                  </h3>
                  <p className="text-[11px] text-slate-200 leading-snug mt-0.5">
                    Your 4 dots must form a real 3D volume (≥15u³) with healthy spacing. Flat planes are rejected!
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-gradient-to-b from-emerald-950/80 to-slate-900/90 border border-emerald-500/40 rounded-2xl p-3 sm:p-3.5 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 shadow-md">
                <div className="w-8 h-8 rounded-xl bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-emerald-400/30">
                  3
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-200 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400 inline" />
                    Blink & Score
                  </h3>
                  <p className="text-[11px] text-slate-200 leading-snug mt-0.5">
                    Trapped dots are vaporized for +1 pt each! If 0 dots are trapped, all 4 anchor dots are lost!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PRIMARY YELLOW START BUTTON */}
          <div className="space-y-2.5">
            <button
              onClick={onStartDemoVsAI}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-sm sm:text-base uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(250,204,21,0.55)] cursor-pointer active:scale-98"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Start Demo 1v1 vs AI</span>
              <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
            </button>

            {/* Secondary Option: Mission Select (Pass & Play / Difficulty) */}
            <button
              onClick={onOpenMissionSelect}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>More Options: 2-Player Pass & Play / Difficulty</span>
            </button>
          </div>

          {/* Interactive 3D background hint */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-center text-[10px] text-slate-300 flex items-center justify-center gap-1.5 font-medium">
            <Compass className="w-3 h-3 text-sky-400" />
            <span>Interactive 3D field active in background • Drag to rotate camera</span>
          </div>
        </div>
      </div>
    </>
  );
};
