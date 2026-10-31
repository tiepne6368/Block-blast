import React from 'react';
import { Grid, PlacedMove } from '../types/blockblast';
import { Sparkles, Edit3, Check, RotateCcw, Trash2 } from 'lucide-react';

interface GameBoardProps {
  grid: Grid;
  onCellToggle?: (r: number, c: number) => void;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  onClearGrid: () => void;
  onInvertGrid: () => void;
  currentMove?: PlacedMove | null;
  allMoves?: PlacedMove[];
  showAllMoves: boolean;
  activeStep: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  onCellToggle,
  isEditMode,
  setIsEditMode,
  onClearGrid,
  onInvertGrid,
  currentMove,
  allMoves = [],
  showAllMoves,
  activeStep,
}) => {
  const rows = grid.length;
  const cols = grid[0]?.length || 8;

  // Compute ghost placement overlay maps
  const activePlacementCells = new Map<string, { color: string; stepNumber: number; isAnchor: boolean }>();

  if (showAllMoves && allMoves.length > 0) {
    allMoves.forEach((move) => {
      let firstCell = true;
      for (let r = 0; r < move.pieceShape.length; r++) {
        for (let c = 0; c < move.pieceShape[r].length; c++) {
          if (move.pieceShape[r][c] > 0) {
            const key = `${move.r + r},${move.c + c}`;
            activePlacementCells.set(key, {
              color: move.pieceColor,
              stepNumber: move.step,
              isAnchor: firstCell,
            });
            firstCell = false;
          }
        }
      }
    });
  } else if (currentMove) {
    let firstCell = true;
    for (let r = 0; r < currentMove.pieceShape.length; r++) {
      for (let c = 0; c < currentMove.pieceShape[r].length; c++) {
        if (currentMove.pieceShape[r][c] > 0) {
          const key = `${currentMove.r + r},${currentMove.c + c}`;
          activePlacementCells.set(key, {
            color: currentMove.pieceColor,
            stepNumber: currentMove.step,
            isAnchor: firstCell,
          });
          firstCell = false;
        }
      }
    }
  }

  // Set of cleared rows and columns for flash animation
  const flashingRows = new Set(currentMove?.clearedRows || []);
  const flashingCols = new Set(currentMove?.clearedCols || []);

  const getCellColor = (val: number) => {
    switch (val) {
      case 1:
        return '#0284c7'; // Cyan/sky
      case 2:
        return '#4f46e5'; // Indigo
      case 3:
        return '#eab308'; // Amber
      case 4:
        return '#a855f7'; // Purple
      case 5:
        return '#f97316'; // Orange
      case 6:
        return '#22c55e'; // Green
      case 7:
        return '#ef4444'; // Red
      default:
        return '#38bdf8';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 md:p-5 shadow-2xl flex flex-col items-center">
      {/* Board Header & Controls */}
      <div className="w-full flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            2. Bàn cờ ({rows}x{cols})
          </h2>
          {isEditMode && (
            <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-medium animate-pulse">
              Đang chỉnh sửa thủ công
            </span>
          )}
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1.5">
          {isEditMode ? (
            <>
              <button
                onClick={onClearGrid}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 border border-slate-700 transition flex items-center gap-1"
                title="Xóa trắng bàn cờ"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Xóa hết</span>
              </button>
              <button
                onClick={onInvertGrid}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1"
                title="Đảo ngược ô trống và ô có khối"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Đảo ô</span>
              </button>
              <button
                onClick={() => setIsEditMode(false)}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Xong</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5"
              title="Chạm vào các ô để sửa nếu ảnh nhận diện chưa đúng"
            >
              <Edit3 className="w-3 h-3 text-cyan-400" />
              <span>Chỉnh sửa ô</span>
            </button>
          )}
        </div>
      </div>

      {isEditMode && (
        <div className="w-full mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 text-center">
          Nhấp hoặc chạm vào bất kỳ ô nào trên bàn cờ để đổi giữa <strong>Ô có khối</strong> và <strong>Ô trống</strong>.
        </div>
      )}

      {/* The 8x8 Grid Canvas Shell */}
      <div className="relative p-2.5 sm:p-3 rounded-2xl bg-[#14172a] border-4 border-[#1f2545] shadow-[0_0_30px_rgba(0,0,0,0.5)] max-w-full">
        {/* Column coordinate labels (A-H) */}
        <div
          className="grid gap-1 sm:gap-1.5 mb-1 text-center"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <span key={c} className="text-[9px] sm:text-[10px] font-bold text-slate-500 font-mono">
              {String.fromCharCode(65 + c)}
            </span>
          ))}
        </div>

        <div
          className="grid gap-1 sm:gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((val, c) => {
              const cellKey = `${r},${c}`;
              const placement = activePlacementCells.get(cellKey);
              const isOccupied = val > 0;
              const isClearingRow = flashingRows.has(r);
              const isClearingCol = flashingCols.has(c);
              const isClearing = isClearingRow || isClearingCol;

              return (
                <button
                  key={cellKey}
                  type="button"
                  disabled={!isEditMode}
                  onClick={() => onCellToggle && onCellToggle(r, c)}
                  aria-label={`Ô hàng ${r + 1}, cột ${c + 1}: ${isOccupied ? 'Có khối' : 'Trống'}`}
                  className={`
                    relative w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-md sm:rounded-lg transition-all duration-200
                    flex items-center justify-center select-none
                    ${isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-cyan-400' : 'cursor-default'}
                    ${
                      isOccupied
                        ? 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.4)]'
                        : 'bg-[#181d36] shadow-[inset_0_2px_5px_rgba(0,0,0,0.6)] border border-[#232a4e]/70'
                    }
                    ${isClearing ? 'ring-2 ring-amber-400 animate-pulse' : ''}
                  `}
                  style={{
                    backgroundColor: isOccupied ? getCellColor(val) : undefined,
                  }}
                >
                  {/* Real Block Blast 3D Jewel Texture */}
                  {isOccupied && (
                    <div className="absolute inset-0 rounded-md sm:rounded-lg pointer-events-none overflow-hidden">
                      {/* Top-left gloss highlight */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-80" />
                      {/* Inset border effect */}
                      <div className="absolute inset-0 border border-white/25 rounded-md sm:rounded-lg" />
                    </div>
                  )}

                  {/* Active Move Ghost Overlay / Placement indicator */}
                  {placement && (
                    <div
                      className="absolute inset-0 rounded-md sm:rounded-lg z-20 flex flex-col items-center justify-center shadow-lg border-2 animate-bounce-subtle pointer-events-none"
                      style={{
                        backgroundColor: `${placement.color}dd`,
                        borderColor: '#ffffff',
                        boxShadow: `0 0 15px ${placement.color}`,
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-md" />
                      {placement.isAnchor && (
                        <span className="relative z-10 text-[10px] sm:text-xs font-black text-white bg-black/60 px-1 rounded-sm shadow-sm">
                          #{placement.stepNumber}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Edit mode hover indicator */}
                  {isEditMode && (
                    <span className="text-[9px] text-slate-500 opacity-0 hover:opacity-100 font-mono">
                      {r},{c}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Clear indicator banner over grid if rows/cols are cleared in this step */}
        {currentMove && (currentMove.clearedRows.length > 0 || currentMove.clearedCols.length > 0) && (
          <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-1 z-30 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              COMBO +{currentMove.clearedRows.length + currentMove.clearedCols.length} HÀNG/CỘT
            </span>
          </div>
        )}
      </div>

      {/* Grid Status Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-[#181d36] border border-[#232a4e]" />
          <span>Ô trống ({grid.flat().filter((v) => v === 0).length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-cyan-500 border border-white/40" />
          <span>Ô có khối ({grid.flat().filter((v) => v > 0).length})</span>
        </div>
        {activePlacementCells.size > 0 && (
          <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
            <div className="w-3.5 h-3.5 rounded bg-purple-500 ring-2 ring-white" />
            <span>Vị trí cần đặt khối ({activePlacementCells.size} ô)</span>
          </div>
        )}
      </div>
    </div>
  );
};
