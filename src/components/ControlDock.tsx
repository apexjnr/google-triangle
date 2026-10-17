import React, { useState } from 'react';
import {
  Zap,
  RotateCw,
  XCircle,
  Lightbulb,
  Compass,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Undo2,
  Redo2,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { DotData, PlayerId, TetrahedronValidation, ViewMode } from '../types/game';
import { MIN_DOT_DISTANCE, MIN_TETRAHEDRON_VOLUME } from '../utils/geometry';

interface ControlDockProps {
  selectedDots: DotData[];
  validation: TetrahedronValidation;
  currentPlayer: PlayerId;
  isBlinking: boolean;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onBlink: () => void;
  onClearSelection: () => void;
  onSuggestMove: () => void;
  onCameraPreset: (preset: 'front' | 'top' | 'side' | 'iso' | 'reset') => void;
  onOpenTacticalOptions: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  selectedDots,
  validation,
  currentPlayer,
  isBlinking,
  viewMode,
  onToggleViewMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onBlink,
  onClearSelection,
  onSuggestMove,
  onCameraPreset,
  onOpenTacticalOptions,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isFourSelected = selectedDots.length === 4;
  const isValidShape = isFourSelected && validation.isValid;
  const trappedCount = validation.capturedDotIds.length;

  const playerColorGradient =
    currentPlayer === 'player1'
      ? 'from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-600/30'
      : 'from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-600/30';

  return (
    <>
      {/* ========================================================
          MOBILE VIEW (< md): Minimalistic floating dock with Simple/Advanced toggle
          ======================================================== */}
      <div className="flex md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-30 w-[94vw] max-w-md pointer-events-none transition-all duration-300 pb-[env(safe-area-inset-bottom)]">
        <div className="w-full">
          {/* Collapse & View Mode Toggle Tab */}
          <div className="flex items-center justify-center gap-2 mb-1 pointer-events-auto">
            <button
              onClick={onToggleViewMode}
              className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-950/85 hover:bg-slate-900 border border-slate-800 text-sky-400 shadow-lg transition-colors cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>{viewMode === 'simple' ? 'Simple' : 'Advanced'}</span>
            </button>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400 hover:text-slate-200 bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 rounded-full shadow-lg transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <>
                  <ChevronUp className="w-3 h-3 text-sky-400" />
                  <span>Expand</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 text-sky-400" />
                  <span>Minimize</span>
                </>
              )}
            </button>
          </div>

          {!isCollapsed && (
            <div className="pointer-events-auto bg-slate-950/92 border border-slate-800/90 rounded-2xl p-2.5 backdrop-blur-xl shadow-2xl">
              {/* Top Row: Dot selection icons & Undo/Redo & Actions */}
              <div className="flex items-center justify-between gap-1.5 mb-2">
                {/* 4 dots progress icons */}
                <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-xl px-2 py-1.5">
                  {[0, 1, 2, 3].map((idx) => {
                    const dot = selectedDots[idx];
                    return (
                      <div
                        key={idx}
                        className={`w-3 h-3 rounded-full transition-all ${
                          dot
                            ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110'
                            : 'bg-slate-800 border border-slate-700'
                        }`}
                        title={dot ? `Dot #${dot.id}` : `Slot ${idx + 1}`}
                      />
                    );
                  })}
                  <span className="text-[11px] font-mono font-bold text-slate-300 ml-1">
                    {selectedDots.length}/4
                  </span>
                </div>

                {/* Undo & Redo buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    title="Undo Selection"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    title="Redo Selection"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Redo2 className="w-3.5 h-3.5" />
                  </button>
                  {selectedDots.length > 0 && (
                    <button
                      onClick={onClearSelection}
                      title="Clear selection"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/70 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Tactical Options Menu Button */}
                <button
                  onClick={onOpenTacticalOptions}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-300 transition-colors cursor-pointer"
                  title="Tactical Options"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>

              {/* Advanced view extra metrics on mobile if toggled */}
              {viewMode === 'advanced' && (
                <div className="grid grid-cols-2 gap-1.5 mb-2 text-[10px] font-mono">
                  <div
                    className={`px-2 py-1 rounded-lg border flex items-center justify-between ${
                      selectedDots.length < 2
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                        : validation.minDistance >= MIN_DOT_DISTANCE
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                    }`}
                  >
                    <span>MinDist:</span>
                    <span>
                      {selectedDots.length >= 2
                        ? `${validation.minDistance.toFixed(1)}u`
                        : `≥${MIN_DOT_DISTANCE}u`}
                    </span>
                  </div>

                  <div
                    className={`px-2 py-1 rounded-lg border flex items-center justify-between ${
                      selectedDots.length < 4
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                        : validation.volume >= MIN_TETRAHEDRON_VOLUME
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                    }`}
                  >
                    <span>Volume:</span>
                    <span>
                      {selectedDots.length === 4
                        ? `${validation.volume.toFixed(1)}u³`
                        : `≥${MIN_TETRAHEDRON_VOLUME}u³`}
                    </span>
                  </div>
                </div>
              )}

              {/* Status / Yellow Zero Warning & BLINK Button */}
              <div className="flex flex-col gap-1.5">
                {/* Yellow 0 Dots Warning Sign or Trapped Status */}
                {selectedDots.length < 4 ? (
                  <div className="text-[11px] text-slate-400 text-center py-1 bg-slate-900/40 rounded-lg">
                    Select {4 - selectedDots.length} more neutral dot{4 - selectedDots.length > 1 ? 's' : ''} (5th replaces oldest)
                  </div>
                ) : !validation.isValid ? (
                  <div className="flex items-center justify-center gap-1 text-[11px] text-rose-300 bg-rose-950/50 border border-rose-900/60 rounded-xl px-2.5 py-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{validation.reason}</span>
                  </div>
                ) : trappedCount === 0 ? (
                  // Requested prominent yellow sign for 0 trapped dots
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/60 rounded-xl px-2.5 py-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                    <span>0 dots trapped (wasted turn risk!)</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/50 border border-emerald-800/70 rounded-xl px-2.5 py-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>+{trappedCount} dot{trappedCount > 1 ? 's' : ''} trapped inside!</span>
                  </div>
                )}

                {/* Big Action BLINK Button */}
                <button
                  onClick={onBlink}
                  disabled={!isFourSelected || !validation.isValid || isBlinking}
                  className={`w-full py-2.5 px-4 rounded-xl font-black text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed ${
                    isValidShape && !isBlinking
                      ? trappedCount === 0
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-600/30'
                        : `bg-gradient-to-r ${playerColorGradient} text-white`
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Zap className={`w-4 h-4 ${isValidShape ? 'animate-bounce' : ''}`} />
                  <span>BLINK</span>
                  {isValidShape && (
                    <span className="ml-1 text-[11px] font-mono font-bold bg-black/30 px-1.5 py-0.5 rounded">
                      {trappedCount > 0 ? `+${trappedCount}` : '0'}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          DESKTOP VIEW (>= md): Configurable Simple vs Advanced Details View
          ======================================================== */}
      <div className="hidden md:block fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-[min(940px,94vw)] pointer-events-none transition-all duration-300">
        {/* Toggle Bar: Collapse + View Mode Switch */}
        <div className="flex items-center justify-center gap-3 mb-1.5 pointer-events-auto">
          {/* View Mode Toggle: Simple vs Advanced */}
          <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-full p-0.5 shadow-lg">
            <button
              onClick={() => viewMode !== 'simple' && onToggleViewMode()}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'simple'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Simple View</span>
            </button>
            <button
              onClick={() => viewMode !== 'advanced' && onToggleViewMode()}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'advanced'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Advanced Details</span>
            </button>
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-950/85 hover:bg-slate-900 border border-slate-800 rounded-full shadow-lg transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                <span>Show Dock</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                <span>Cinema Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Main Desktop Dock */}
        {!isCollapsed && (
          <div className="pointer-events-auto bg-slate-950/92 border border-slate-800/90 rounded-2xl p-4 backdrop-blur-xl shadow-2xl">
            {/* ----------------------------------------------------
                SIMPLE VIEW: Clean, non-cluttered, icon-based, no coords/camera
                ---------------------------------------------------- */}
            {viewMode === 'simple' ? (
              <div className="flex items-center justify-between gap-4">
                {/* Left: 4 Dot Icons (No numbers/coords) + Undo & Redo */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-2xl px-3.5 py-2">
                    {[0, 1, 2, 3].map((idx) => {
                      const dot = selectedDots[idx];
                      return (
                        <div
                          key={idx}
                          className={`w-4 h-4 rounded-full transition-all ${
                            dot
                              ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)] scale-110'
                              : 'bg-slate-800 border border-slate-700'
                          }`}
                          title={dot ? `Anchor ${idx + 1} locked` : `Empty anchor slot ${idx + 1}`}
                        />
                      );
                    })}
                    <span className="text-xs font-mono font-bold text-slate-300 ml-1.5">
                      {selectedDots.length}/4
                    </span>
                  </div>

                  {/* Undo & Redo & Clear */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={onUndo}
                      disabled={!canUndo}
                      title="Undo Dot Selection (Ctrl+Z)"
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1 text-xs"
                    >
                      <Undo2 className="w-4 h-4" />
                      <span className="text-[11px] hidden lg:inline">Undo</span>
                    </button>
                    <button
                      onClick={onRedo}
                      disabled={!canRedo}
                      title="Redo Dot Selection (Ctrl+Y)"
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1 text-xs"
                    >
                      <Redo2 className="w-4 h-4" />
                      <span className="text-[11px] hidden lg:inline">Redo</span>
                    </button>
                    {selectedDots.length > 0 && (
                      <button
                        onClick={onClearSelection}
                        title="Clear all selected dots"
                        className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Center: Status Guidance or Yellow 0 Warning Sign */}
                <div className="flex-1 max-w-md flex justify-center">
                  {selectedDots.length < 4 ? (
                    <div className="text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl text-center">
                      Select {4 - selectedDots.length} more dots • Continuing past 4 replaces the oldest
                    </div>
                  ) : !validation.isValid ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/80 px-4 py-2 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{validation.reason}</span>
                    </div>
                  ) : trappedCount === 0 ? (
                    // Requested prominent yellow sign for 0 trapped dots
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-950/70 border border-amber-500/70 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                      <span>0 dots trapped (wasted turn risk! Requires confirmation)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-4 py-2 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>+{trappedCount} dot{trappedCount > 1 ? 's' : ''} trapped inside tetrahedron!</span>
                    </div>
                  )}
                </div>

                {/* Right: BLINK Action Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={onBlink}
                    disabled={!isFourSelected || !validation.isValid || isBlinking}
                    className={`relative px-7 py-3 rounded-xl font-black text-sm tracking-widest uppercase transition-all duration-300 flex items-center gap-2 shadow-xl cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 ${
                      isValidShape && !isBlinking
                        ? trappedCount === 0
                          ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-600/30 active:scale-95'
                          : `bg-gradient-to-r ${playerColorGradient} text-white shadow-lg active:scale-95`
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <Zap className={`w-4 h-4 ${isValidShape ? 'animate-bounce' : ''}`} />
                    <span>BLINK</span>
                    {isValidShape && (
                      <span className="ml-1 text-xs font-mono font-bold bg-black/30 px-1.5 py-0.5 rounded">
                        {trappedCount > 0 ? `+${trappedCount}` : '0'}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* ----------------------------------------------------
                  ADVANCED DETAILS VIEW: Full coords, volume math, camera controls
                  ---------------------------------------------------- */
              <div>
                <div className="flex items-center justify-between gap-4">
                  {/* Left: 4 Coordinate Anchor Boxes + Undo/Redo */}
                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                        Anchors:
                      </span>
                      {[0, 1, 2, 3].map((slotIdx) => {
                        const dot = selectedDots[slotIdx];
                        return (
                          <div
                            key={slotIdx}
                            className={`flex-1 max-w-[130px] h-9 px-2.5 rounded-xl border flex items-center justify-between transition-all ${
                              dot
                                ? 'bg-amber-950/40 border-amber-500/70 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                                : 'bg-slate-900/60 border-slate-800 text-slate-500'
                            }`}
                          >
                            <span className="text-xs font-mono font-bold">
                              {dot ? `#${dot.id}` : `Slot ${slotIdx + 1}`}
                            </span>
                            {dot ? (
                              <span className="text-[10px] font-mono text-amber-400/90">
                                {dot.x > 0 ? `+${dot.x.toFixed(0)}` : dot.x.toFixed(0)},
                                {dot.y > 0 ? `+${dot.y.toFixed(0)}` : dot.y.toFixed(0)}
                              </span>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                            )}
                          </div>
                        );
                      })}

                      {/* Undo / Redo / Clear in Advanced View */}
                      <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        title="Undo (Ctrl+Z)"
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <Undo2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        title="Redo (Ctrl+Y)"
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <Redo2 className="w-4 h-4" />
                      </button>
                      {selectedDots.length > 0 && (
                        <button
                          onClick={onClearSelection}
                          title="Clear selection"
                          className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Diagnostics: Min distance, volume, status */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Distance condition */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
                          selectedDots.length < 2
                            ? 'bg-slate-900/50 border-slate-800 text-slate-400'
                            : validation.minDistance >= MIN_DOT_DISTANCE
                            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                            : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                        }`}
                      >
                        {selectedDots.length >= 2 &&
                          (validation.minDistance >= MIN_DOT_DISTANCE ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          ))}
                        <span>
                          Min Dist:{' '}
                          {selectedDots.length >= 2
                            ? `${validation.minDistance.toFixed(1)} u`
                            : `≥ ${MIN_DOT_DISTANCE} u`}
                        </span>
                      </div>

                      {/* Volume condition */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
                          selectedDots.length < 4
                            ? 'bg-slate-900/50 border-slate-800 text-slate-400'
                            : validation.volume >= MIN_TETRAHEDRON_VOLUME
                            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                            : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                        }`}
                      >
                        {selectedDots.length === 4 &&
                          (validation.volume >= MIN_TETRAHEDRON_VOLUME ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          ))}
                        <span>
                          Volume:{' '}
                          {selectedDots.length === 4
                            ? `${validation.volume.toFixed(1)} u³`
                            : `≥ ${MIN_TETRAHEDRON_VOLUME} u³`}
                        </span>
                      </div>

                      {/* Trapped Dots preview or instructions */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
                        {selectedDots.length < 4 ? (
                          <span className="text-slate-400">
                            Select {4 - selectedDots.length} more dots (5th replaces oldest)
                          </span>
                        ) : !validation.isValid ? (
                          <span className="text-rose-400 font-medium">{validation.reason}</span>
                        ) : trappedCount > 0 ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-emerald-400 inline" />
                            {trappedCount} dot{trappedCount > 1 ? 's' : ''} trapped (+
                            {trappedCount} pts)
                          </span>
                        ) : (
                          // Yellow warning sign in advanced view as well
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 inline animate-pulse" />
                            0 dots trapped (wasted turn risk!)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Tactical Scan & BLINK Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={onSuggestMove}
                      title="Tactical Scan: Suggest high-yield tetrahedron"
                      className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Tactical Scan</span>
                    </button>

                    <button
                      onClick={onBlink}
                      disabled={!isFourSelected || !validation.isValid || isBlinking}
                      className={`relative px-6 py-3 rounded-xl font-black text-sm tracking-widest uppercase transition-all duration-300 flex items-center gap-2 shadow-xl cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 ${
                        isValidShape && !isBlinking
                          ? trappedCount === 0
                            ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-600/30 active:scale-95'
                            : `bg-gradient-to-r ${playerColorGradient} text-white shadow-lg active:scale-95`
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <Zap className={`w-4 h-4 ${isValidShape ? 'animate-bounce' : ''}`} />
                      <span>BLINK</span>
                      {isValidShape && (
                        <span className="ml-1 text-xs font-mono font-bold bg-black/30 px-1.5 py-0.5 rounded">
                          {trappedCount > 0 ? `+${trappedCount}` : '0'}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Advanced Bottom Mini-bar: Camera Presets & Orbit Guidance */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-semibold text-slate-300">Camera:</span>
                    {(['iso', 'front', 'top', 'side', 'reset'] as const).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => onCameraPreset(preset)}
                        className="px-2 py-0.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors capitalize cursor-pointer"
                      >
                        {preset === 'reset' ? (
                          <span className="flex items-center gap-1">
                            <RotateCw className="w-3 h-3 text-slate-400" />
                            Reset
                          </span>
                        ) : (
                          preset
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center gap-3">
                    <span>Ctrl+Z: Undo</span>
                    <span>Ctrl+Y: Redo</span>
                    <span>5th dot replaces oldest</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
