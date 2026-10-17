import React from 'react';
import { X, Zap, Shield, AlertTriangle, Layers, Target, Trophy } from 'lucide-react';
import { MIN_DOT_DISTANCE, MIN_TETRAHEDRON_VOLUME } from '../utils/geometry';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative my-auto w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-5 md:p-8 shadow-2xl overflow-y-auto max-h-[88vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide uppercase">
              3D Blink Directives
            </h2>
            <p className="text-xs text-slate-400">
              Tetrahedral Capture Tactics & Spatial Rules
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div className="space-y-4 text-sm text-slate-300">
          {/* Section 1: Objective */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex gap-3.5">
            <Target className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-100 mb-1">Core Objective</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Scan the 3D cloud for clusters of dots. Pick 4 neutral dots to construct a 3D tetrahedron, then press <strong className="text-amber-400">BLINK</strong> to destroy everything trapped inside that volume. Highest score wins!
              </p>
            </div>
          </div>

          {/* Section 2: Construction Rules */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex gap-3.5">
            <Layers className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-100 mb-1">Tetrahedron Geometry Rules</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>
                  <strong className="text-slate-100">Selection Size:</strong> Exactly 4 neutral dots (blue).
                </li>
                <li>
                  <strong className="text-slate-100">Minimum Distance:</strong> Every selected dot must be at least <span className="text-sky-300 font-mono font-bold">~{MIN_DOT_DISTANCE} units</span> away from every other selected dot (prevents tiny degenerate shapes).
                </li>
                <li>
                  <strong className="text-slate-100">Minimum Volume:</strong> The 4 vertices must enclose at least <span className="text-sky-300 font-mono font-bold">~{MIN_TETRAHEDRON_VOLUME} cubic units</span> (flat or near-coplanar quads are rejected).
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3: The Blink Risk / Reward */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4 text-emerald-400" />
                Successful Blink
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If dots are trapped inside, they are destroyed! You gain <strong className="text-white">+1 point per dot</strong>, and your 4 selected vertices convert into permanent territory in your color.
              </p>
            </div>

            <div className="bg-rose-950/30 border border-rose-800/60 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Empty Shape Penalty
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If no dots are trapped inside your tetrahedron, <strong className="text-rose-300">all 4 anchor dots vanish permanently</strong> into the void. Zero points. Your turn was wasted!
              </p>
            </div>
          </div>

          {/* Section 4: Territory Mechanics */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex gap-3.5">
            <Shield className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-100 mb-1">Territory & Counter-Plays</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dots owned by either player cannot be selected to form shapes. Furthermore, your owned territory cannot be destroyed by your own blinks. However, <strong className="text-amber-300">your opponent CAN capture and destroy your owned dots</strong> inside their tetrahedrons!
              </p>
            </div>
          </div>

          {/* Section 5: End Game */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex gap-3.5">
            <Trophy className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-100 mb-1">Game Over Condition</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The match terminates immediately when fewer than 4 neutral dots remain on the field, or when no geometrically valid tetrahedron can physically be constructed. Highest score wins!
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            Got it, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
