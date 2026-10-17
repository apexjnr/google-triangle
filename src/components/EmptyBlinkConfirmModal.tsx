import React, { useState } from 'react';
import { AlertTriangle, X, ZapOff, Check } from 'lucide-react';

interface EmptyBlinkConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (neverAskAgain: boolean) => void;
}

export const EmptyBlinkConfirmModal: React.FC<EmptyBlinkConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  const [neverAskAgain, setNeverAskAgain] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative my-auto w-full max-w-md bg-slate-950 border border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl text-center max-h-[90vh] overflow-y-auto">
        {/* Dismiss button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon */}
        <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <AlertTriangle className="w-7 h-7 text-amber-400 animate-pulse" />
        </div>

        <h3 className="text-lg font-black text-white uppercase tracking-wide mb-1">
          Wasted Shape Confirmation
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          This tetrahedron contains <strong className="text-amber-400 font-bold">0 trapped dots</strong>. If you blink now, all 4 anchor dots will <strong className="text-rose-400">permanently dissolve into the void</strong> for 0 points!
        </p>

        {/* Never show again per session checkbox */}
        <label className="flex items-center justify-center gap-2 mb-5 cursor-pointer text-xs text-slate-300 hover:text-slate-100 select-none bg-slate-900/60 border border-slate-800 py-2 px-3 rounded-xl">
          <input
            type="checkbox"
            checked={neverAskAgain}
            onChange={(e) => setNeverAskAgain(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-[11px] font-medium">
            Don't ask me again this session
          </span>
        </label>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onCancel}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cancel & Adjust
          </button>

          <button
            onClick={() => onConfirm(neverAskAgain)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-rose-900/30 cursor-pointer active:scale-98"
          >
            <ZapOff className="w-3.5 h-3.5" />
            <span>Confirm Blink</span>
          </button>
        </div>
      </div>
    </div>
  );
};
