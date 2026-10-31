import React, { useState } from 'react';
import { X, Check, RotateCcw, Palette, Plus } from 'lucide-react';
import { COLOR_PALETTE, normalizeShape } from '../constants/pieces';
import { PresetShape } from '../types/blockblast';

interface CustomShapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomShape: (newShape: PresetShape) => void;
}

export const CustomShapeModal: React.FC<CustomShapeModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomShape,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_PALETTE[3]); // Vibrant pink/magenta default
  const [shapeName, setShapeName] = useState<string>('');
  const [grid, setGrid] = useState<number[][]>(() => {
    // 5x5 default with a small sample
    const g = Array.from({ length: 5 }, () => Array(5).fill(0));
    g[1][1] = 1;
    g[1][2] = 1;
    g[2][2] = 1;
    return g;
  });

  if (!isOpen) return null;

  const toggleCell = (r: number, c: number) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = next[r][c] === 1 ? 0 : 1;
      return next;
    });
  };

  const clearGrid = () => {
    setGrid(Array.from({ length: 5 }, () => Array(5).fill(0)));
  };

  const normalized = normalizeShape(grid);
  const totalBlocks = normalized.flat().filter((v) => v > 0).length;

  const handleSave = () => {
    if (totalBlocks === 0) {
      alert('Vui lòng chọn ít nhất 1 ô để tạo hình khối.');
      return;
    }

    const customId = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const finalName = shapeName.trim() || `Khối tự tạo ${normalized.length}x${normalized[0].length}`;

    onSaveCustomShape({
      id: customId,
      name: finalName,
      category: 'custom',
      shape: normalized,
      color: selectedColor,
      isCustom: true,
    });

    // Reset and close
    setShapeName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/20">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                Tự thêm khối vào Chọn Nhanh
              </h3>
              <p className="text-[11px] text-slate-400">
                Vẽ hình khối tùy ý để xuất hiện ngay trong danh sách chọn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Shape Name Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Tên khối (Tùy chọn):
            </label>
            <input
              type="text"
              value={shapeName}
              onChange={(e) => setShapeName(e.target.value)}
              placeholder="VD: Khối chữ U, Khối đặc biệt..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:outline-none text-white placeholder-slate-500"
              maxLength={30}
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>Chọn màu sắc:</span>
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-lg transition-all cursor-pointer ${
                    selectedColor === color
                      ? 'scale-115 ring-2 ring-white shadow-lg'
                      : 'hover:scale-105 opacity-80'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Màu ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Interactive 5x5 Drawing Canvas */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-[280px] mb-2">
              <span className="text-xs font-semibold text-slate-300">
                Nhấp ô để vẽ ({totalBlocks} ô):
              </span>
              <button
                type="button"
                onClick={clearGrid}
                className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xóa trắng</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
              <div className="grid grid-cols-5 gap-1.5">
                {grid.map((row, r) =>
                  row.map((val, c) => (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => toggleCell(r, c)}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                        val > 0
                          ? 'ring-2 ring-white shadow-lg shadow-purple-500/30'
                          : 'bg-slate-900 border border-slate-800/80 hover:bg-slate-800/60'
                      }`}
                      style={{
                        backgroundColor: val > 0 ? selectedColor : undefined,
                      }}
                      aria-label={`Ô ${r}, ${c}`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Live Normalized Preview */}
          {totalBlocks > 0 && (
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Kích thước chuẩn hóa:
                </span>
                <span className="text-xs font-bold text-cyan-400">
                  {normalized.length} hàng × {normalized[0].length} cột ({totalBlocks} ô gạch)
                </span>
              </div>
              <div
                className="grid gap-0.5 p-1 bg-slate-900 rounded-md border border-slate-800"
                style={{
                  gridTemplateColumns: `repeat(${normalized[0].length}, minmax(0, 1fr))`,
                }}
              >
                {normalized.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`preview-${r}-${c}`}
                      className={`w-3 h-3 rounded-2xs ${val > 0 ? '' : 'opacity-0'}`}
                      style={{ backgroundColor: val > 0 ? selectedColor : 'transparent' }}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={totalBlocks === 0}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Lưu vào Chọn Nhanh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
