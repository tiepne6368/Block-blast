import React, { useEffect, useRef, useState } from 'react';
import { SolverResult, PlacedMove } from '../types/blockblast';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Zap,
} from 'lucide-react';
import { playBlockPlaceSound, playLineClearSound, playSuccessFanfare } from '../utils/soundEffects';

interface SolutionViewerProps {
  solution: SolverResult | null;
  activeStep: number;
  setActiveStep: (step: number) => void;
  showAllMoves: boolean;
  setShowAllMoves: (show: boolean) => void;
  onReset: () => void;
  onResolve: () => void;
  onNextWave?: () => void;
  isSolving: boolean;
}

export const SolutionViewer: React.FC<SolutionViewerProps> = ({
  solution,
  activeStep,
  setActiveStep,
  showAllMoves,
  setShowAllMoves,
  onReset,
  onResolve,
  onNextWave,
  isSolving,
}) => {
  const currentMove: PlacedMove | undefined =
    activeStep > 0 && solution ? solution.moves[activeStep - 1] : undefined;

  const handleToggleShowAll = () => {
    setShowAllMoves(!showAllMoves);
  };

  if (!solution) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl text-center">
        <p className="text-sm text-slate-400">
          Chưa có kết quả giải. Tải ảnh hoặc chỉnh bàn cờ rồi nhấn <strong>"PHÂN TÍCH VÀ GIẢI"</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl w-full">
      {/* Title & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            4. Hướng dẫn từng bước xếp khối
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">
            Thời gian tính: <strong className="text-cyan-400">{solution.durationMs}ms</strong>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            Chiến thuật: <strong className="text-purple-300 capitalize">{solution.strategy}</strong>
          </span>
        </div>
      </div>

      {/* Outcome Banner */}
      {solution.isComplete ? (
        <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/40 border border-emerald-500/40 flex items-start gap-3 shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
            {solution.comboStreakCount && solution.comboStreakCount >= 2 ? (
              <span className="text-base font-black">🔥</span>
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div className="text-xs flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                <span>{solution.message || 'Tìm thấy phương án tối ưu toàn diện!'}</span>
              </h4>
              {solution.comboStreakCount && solution.comboStreakCount >= 2 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm animate-pulse">
                  🔥 CHUỖI COMBO {solution.comboStreakCount} BƯỚC
                </span>
              )}
            </div>
            <p className="text-emerald-200/90 leading-relaxed">
              Đã xếp đủ tất cả <strong>{solution.placedCount}/{solution.totalPieces}</strong> khối. Tổng xóa{' '}
              <strong>{solution.totalLinesCleared} hàng/cột</strong>, nhận khoảng{' '}
              <strong className="text-amber-300">+{solution.totalScore} điểm</strong>. Độ an toàn bàn cờ:{' '}
              <span className="font-bold text-emerald-300">{solution.survivalRating}%</span> (Đã tính toán chừa ô cho các khối lớn 3x3 và 5x1 ở các ván sau, <strong>tuyệt đối không bị nghẽn bàn thua</strong>).
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-300 text-sm">
              Cảnh báo: Bàn cờ khó xếp đủ 100% các khối
            </h4>
            <p className="text-amber-200/80 mt-0.5">
              Chỉ xếp được tối đa <strong>{solution.placedCount}/{solution.totalPieces}</strong> khối. Thuật toán đã chọn phương án giúp kéo dài thời gian sống sót và dọn nhiều ô nhất có thể.
            </p>
          </div>
        </div>
      )}

      {/* Quick summary indicators */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 mb-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sử dụng thanh điều hướng ở trên đầu bàn cờ để chuyển bước</span>
        </span>
        <button
          type="button"
          onClick={handleToggleShowAll}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
            showAllMoves
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
          }`}
          title="Đánh dấu đồng thời toàn bộ vị trí cần đặt các khối trên bàn cờ"
        >
          <Layers className="w-3.5 h-3.5 text-purple-300" />
          <span>{showAllMoves ? 'Thu về từng bước' : 'Hiện cả 3 bước'}</span>
        </button>
      </div>

      {/* Active Step Detail Card */}
      {currentMove && !showAllMoves && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg"
              style={{ backgroundColor: currentMove.pieceColor }}
            >
              #{currentMove.step}
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">
                Nước đi #{currentMove.step}: Đặt Khối #{currentMove.pieceIndex + 1}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Vị trí đặt trên bàn cờ: <strong>Hàng {currentMove.r + 1}</strong>,{' '}
                <strong>Cột {currentMove.c + 1}</strong> (góc trên bên trái của khối).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
            {currentMove.linesClearedCount > 0 ? (
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Xóa {currentMove.linesClearedCount} hàng/cột</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Không xóa hàng</div>
            )}

            <div className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>+{currentMove.pointsEarned} điểm</span>
            </div>
          </div>
        </div>
      )}

      {/* All Moves Summary List */}
      {showAllMoves && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Tổng quan trình tự các khối cần đặt:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {solution.moves.map((move) => (
              <div
                key={move.step}
                className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-white text-xs"
                    style={{ backgroundColor: move.pieceColor }}
                  >
                    {move.step}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">
                      Khối #{move.pieceIndex + 1}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Hàng {move.r + 1}, Cột {move.c + 1}
                    </div>
                  </div>
                </div>

                {move.linesClearedCount > 0 && (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                    +{move.linesClearedCount} Line
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
