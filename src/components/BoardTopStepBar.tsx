import React, { useEffect, useRef, useState } from 'react';
import { SolverResult, PlacedMove } from '../types/blockblast';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { playBlockPlaceSound, playLineClearSound, playSuccessFanfare } from '../utils/soundEffects';

interface BoardTopStepBarProps {
  solution: SolverResult | null;
  activeStep: number;
  setActiveStep: (step: number) => void;
  showAllMoves: boolean;
  setShowAllMoves: (show: boolean) => void;
  onReset: () => void;
  onNextWave?: () => void;
  isSolving: boolean;
}

export const BoardTopStepBar: React.FC<BoardTopStepBarProps> = ({
  solution,
  activeStep,
  setActiveStep,
  showAllMoves,
  setShowAllMoves,
  onReset,
  onNextWave,
  isSolving,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = solution?.moves.length || 0;
  const currentMove: PlacedMove | undefined =
    activeStep > 0 && solution ? solution.moves[activeStep - 1] : undefined;

  // Auto-play timer
  useEffect(() => {
    if (isPlaying && solution && totalSteps > 0) {
      playTimerRef.current = setTimeout(() => {
        if (activeStep < totalSteps) {
          handleNext();
        } else {
          setIsPlaying(false);
          playSuccessFanfare();
          if (onNextWave) {
            setTimeout(() => onNextWave(), 600);
          }
        }
      }, 1200);
    }
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, activeStep, totalSteps, solution, onNextWave]);

  // Auto transition to next wave when reaching step 3
  const autoWaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (autoWaveTimerRef.current) {
      clearTimeout(autoWaveTimerRef.current);
      autoWaveTimerRef.current = null;
    }

    // When reaching the last step (step 3), auto transition to next wave after 2.5s
    if (activeStep > 0 && activeStep === totalSteps && onNextWave && !isPlaying) {
      setCountdown(2);
      const interval = setInterval(() => {
        setCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
      }, 1000);

      autoWaveTimerRef.current = setTimeout(() => {
        clearInterval(interval);
        setCountdown(null);
        onNextWave();
      }, 2500);

      return () => {
        clearInterval(interval);
        if (autoWaveTimerRef.current) {
          clearTimeout(autoWaveTimerRef.current);
          autoWaveTimerRef.current = null;
        }
      };
    } else {
      setCountdown(null);
    }
  }, [activeStep, totalSteps, onNextWave, isPlaying]);

  const handleNext = () => {
    if (!solution) return;
    if (activeStep >= totalSteps) {
      // Reached step 3: clicking next automatically switches to next wave immediately!
      if (autoWaveTimerRef.current) {
        clearTimeout(autoWaveTimerRef.current);
        autoWaveTimerRef.current = null;
      }
      setCountdown(null);
      if (onNextWave) {
        onNextWave();
      }
      return;
    }
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    setShowAllMoves(false);

    const move = solution.moves[nextStep - 1];
    playBlockPlaceSound();
    if (move && move.linesClearedCount > 0) {
      setTimeout(() => playLineClearSound(move.linesClearedCount), 150);
    }
  };

  const handlePrev = () => {
    if (activeStep <= 0) return;
    if (autoWaveTimerRef.current) {
      clearTimeout(autoWaveTimerRef.current);
      autoWaveTimerRef.current = null;
    }
    setCountdown(null);
    setIsPlaying(false);
    setActiveStep(activeStep - 1);
    setShowAllMoves(false);
  };

  const toggleAutoPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setShowAllMoves(false);
      if (activeStep >= totalSteps) {
        setActiveStep(0);
      }
      setIsPlaying(true);
    }
  };

  if (!solution || totalSteps === 0) {
    return (
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Sẵn sàng: Chọn 3 khối bên phải hoặc tải ảnh để hiện bước đi</span>
        </span>
        <span className="text-[11px] text-slate-500 font-medium">Bấm là tự động giải</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-2 border-cyan-500/50 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col gap-2.5">
      {/* Top row: Main Action Buttons (Single Next Step Button that auto transitions to next wave) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Step indicator badge */}
        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm">
            <span>BƯỚC:</span>
            <span className="text-white text-sm sm:text-base font-black">
              {showAllMoves ? 'Tất cả' : activeStep === 0 ? 'Ban đầu' : `${activeStep}/${totalSteps}`}
            </span>
          </div>

          {/* Quick step jump buttons */}
          <div className="flex items-center gap-1">
            {[1, 2, 3].slice(0, totalSteps).map((stepNum) => (
              <button
                key={stepNum}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setShowAllMoves(false);
                  setActiveStep(stepNum);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center ${
                  !showAllMoves && activeStep === stepNum
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 scale-105'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                }`}
              >
                #{stepNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setShowAllMoves(!showAllMoves);
              }}
              className={`px-2 h-7 sm:h-8 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center justify-center ${
                showAllMoves
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                  : 'bg-slate-800/90 text-slate-400 hover:text-slate-200'
              }`}
            >
              Hiện cả 3
            </button>
          </div>
        </div>

        {/* Primary Navigation Controls */}
        <div className="flex items-center gap-1.5">
          {/* Back Step */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeStep <= 0 || showAllMoves}
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
            title="Lùi lại bước trước"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Lùi</span>
          </button>

          {/* Single Continuous "BƯỚC TIẾP THEO" Button */}
          {/* On Step 3: clicking it transitions directly to next wave! */}
          <button
            type="button"
            onClick={handleNext}
            className={`px-4 py-2 rounded-xl text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              activeStep >= totalSteps
                ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-emerald-500/40 animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-cyan-500/40 animate-pulse'
            }`}
            title={
              activeStep >= totalSteps
                ? 'Chuyển sang ván mới ngay (bàn cờ cập nhật ô trống, nạp 3 khối tiếp theo)'
                : 'Xem bước tiếp theo'
            }
          >
            {activeStep >= totalSteps ? (
              <>
                <Sparkles className="w-4 h-4 fill-current text-slate-950" />
                <span>BƯỚC TIẾP (SANG VÁN MỚI)</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </>
            ) : (
              <>
                <span>BƯỚC TIẾP THEO</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>

          {/* Auto play toggle */}
          <button
            type="button"
            onClick={toggleAutoPlay}
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title={isPlaying ? 'Dừng phát' : 'Tự động phát từng bước'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Reset to initial */}
          <button
            type="button"
            onClick={onReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Quay lại trạng thái gốc ban đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom row: Clear and Combo Streak details for current step */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          {currentMove ? (
            <span className="text-slate-300">
              Bước {activeStep}: Đặt <strong style={{ color: currentMove.pieceColor }}>{currentMove.pieceShape.length}x{currentMove.pieceShape[0].length}</strong> tại Hàng {currentMove.r + 1}, Cột {String.fromCharCode(65 + currentMove.c)}
            </span>
          ) : showAllMoves ? (
            <span className="text-purple-300 font-semibold">
              Đang hiển thị toàn bộ 3 vị trí đặt khối trên bàn cờ
            </span>
          ) : (
            <span className="text-slate-400">Trạng thái gốc trước khi đặt khối</span>
          )}

          {currentMove && currentMove.linesClearedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] animate-pulse">
              💥 Ăn {currentMove.linesClearedCount} hàng/cột (+{currentMove.pointsEarned}đ)
            </span>
          )}

          {activeStep === totalSteps && countdown !== null && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold text-[11px] flex items-center gap-1 animate-pulse">
              <span>⚡ Tự chuyển ván mới sau {countdown}s</span>
            </span>
          )}
        </div>

        {solution.comboStreakCount && solution.comboStreakCount >= 2 && (
          <div className="flex items-center gap-1 text-[11px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
            <span>🔥</span>
            <span>COMBO {solution.comboStreakCount} BƯỚC LIÊN HOÀN</span>
          </div>
        )}
      </div>
    </div>
  );
};
