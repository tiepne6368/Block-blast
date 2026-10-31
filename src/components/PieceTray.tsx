import React from 'react';
import { BlockPiece } from '../types/blockblast';
import { Edit2, Plus, Trash2, ArrowRight } from 'lucide-react';

interface PieceTrayProps {
  pieces: BlockPiece[];
  onEditPiece: (index: number) => void;
  onDeletePiece: (index: number) => void;
  onAddPiece: () => void;
  activePieceIndex?: number | null;
  pieceStepOrder?: { [pieceId: string]: number }; // Maps pieceId to step 1, 2, 3
}

export const PieceTray: React.FC<PieceTrayProps> = ({
  pieces,
  onEditPiece,
  onDeletePiece,
  onAddPiece,
  activePieceIndex,
  pieceStepOrder = {},
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            3. Các khối chờ xếp ({pieces.length}/3)
          </h2>
        </div>

        {pieces.length < 3 && (
          <button
            onClick={onAddPiece}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm khối</span>
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 mb-3">
        Các khối được trích xuất từ phần dưới màn hình. Bạn có thể nhấn <strong>Chỉnh sửa</strong> để chọn hình dạng chuẩn hoặc tự vẽ nếu nhận diện chưa đúng.
      </p>

      {/* Pieces Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {pieces.map((piece, idx) => {
          const stepNumber = pieceStepOrder[piece.id];
          const isCurrentlyActive = activePieceIndex === idx;

          return (
            <div
              key={piece.id || idx}
              className={`
                relative bg-slate-950/70 border rounded-xl p-3 flex flex-col items-center justify-between transition-all
                ${
                  isCurrentlyActive
                    ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }
              `}
            >
              {/* Step Order Badge */}
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">
                  Khối #{idx + 1}
                </span>

                {stepNumber ? (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-black tracking-wide bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 shadow-sm flex items-center gap-1">
                    <span>ĐẶT BƯỚC {stepNumber}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Chờ giải</span>
                )}
              </div>

              {/* Mini Piece Canvas Preview */}
              <div className="my-2 min-h-20 flex items-center justify-center p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 w-full">
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${piece.shape[0]?.length || 1}, minmax(0, 1fr))`,
                  }}
                >
                  {piece.shape.map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm transition-all ${
                          val > 0
                            ? 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] border border-white/20'
                            : 'opacity-0'
                        }`}
                        style={{
                          backgroundColor: val > 0 ? piece.color : 'transparent',
                        }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex items-center justify-between gap-1 mt-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onEditPiece(idx)}
                  className="flex-1 py-1 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-center gap-1"
                  title="Đổi hình dạng khối hoặc vẽ tự do"
                >
                  <Edit2 className="w-3 h-3 text-cyan-400" />
                  <span>Đổi hình</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeletePiece(idx)}
                  className="p-1.5 rounded-md bg-slate-800/50 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                  title="Xóa khối này"
                  aria-label="Xóa khối"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty slot placeholder if less than 3 pieces */}
        {pieces.length < 3 && (
          <button
            type="button"
            onClick={onAddPiece}
            className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center text-slate-500 hover:text-slate-300 bg-slate-950/30 transition min-h-36 cursor-pointer"
          >
            <Plus className="w-6 h-6 mb-1 text-slate-400" />
            <span className="text-xs font-medium">Thêm khối #{pieces.length + 1}</span>
          </button>
        )}
      </div>
    </div>
  );
};
