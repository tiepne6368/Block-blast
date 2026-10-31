import React, { useState } from 'react';
import { BlockPiece } from '../types/blockblast';
import { PRESET_SHAPES, COLOR_PALETTE, normalizeShape } from '../constants/pieces';
import { X, Check, PenTool, Grid as GridIcon, RotateCcw } from 'lucide-react';

interface ShapePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pieceIndex: number;
  currentPiece?: BlockPiece;
  onSavePiece: (index: number, shape: number[][], color: string, name?: string) => void;
}

export const ShapePickerModal: React.FC<ShapePickerModalProps> = ({
  isOpen,
  onClose,
  pieceIndex,
  currentPiece,
  onSavePiece,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedColor, setSelectedColor] = useState<string>(
    currentPiece?.color || COLOR_PALETTE[0]
  );
  const [selectedPreset, setSelectedPreset] = useState<number[][]>(
    currentPiece?.shape || [[1, 1], [1, 1]]
  );

  // 5x5 custom draw grid
  const [customGrid, setCustomGrid] = useState<number[][]>(() => {
    const initial = Array.from({ length: 5 }, () => Array(5).fill(0));
    if (currentPiece?.shape) {
      const s = currentPiece.shape;
      for (let r = 0; r < Math.min(5, s.length); r++) {
        for (let c = 0; c < Math.min(5, s[0].length); c++) {
          initial[r][c] = s[r][c] > 0 ? 1 : 0;
        }
      }
    } else {
      initial[1][1] = 1;
      initial[1][2] = 1;
      initial[2][1] = 1;
      initial[2][2] = 1;
    }
    return initial;
  });

  if (!isOpen) return null;

  const toggleCustomCell = (r: number, c: number) => {
    setCustomGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = next[r][c] === 1 ? 0 : 1;
      return next;
    });
  };

  const clearCustom = () => {
    setCustomGrid(Array.from({ length: 5 }, () => Array(5).fill(0)));
  };

  const handleApply = () => {
    if (activeTab === 'presets') {
      onSavePiece(pieceIndex, selectedPreset, selectedColor);
    } else {
      const normalized = normalizeShape(customGrid);
      onSavePiece(pieceIndex, normalized, selectedColor, 'Khối tùy chỉnh');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-md shadow-sm"
              style={{ backgroundColor: selectedColor }}
            />
            <h3 className="font-bold text-slate-100 text-sm md:text-base">
              Chỉnh sửa Khối #{pieceIndex + 1}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center border-b border-slate-800 px-4 pt-2 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'presets'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GridIcon className="w-3.5 h-3.5" />
            <span>Thư viện mẫu chuẩn</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'custom'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Tự vẽ hình tự do</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Color Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Chọn màu sắc:
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-lg transition-transform ${
                    selectedColor === color
                      ? 'scale-110 ring-2 ring-white shadow-lg'
                      : 'hover:scale-105 opacity-80'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Màu ${color}`}
                />
              ))}
            </div>
          </div>

          {activeTab === 'presets' ? (
            /* Presets list */
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Chọn hình dạng từ danh sách Block Blast:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
                {PRESET_SHAPES.map((preset, idx) => {
                  const isSelected =
                    JSON.stringify(preset.shape) === JSON.stringify(selectedPreset);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        // Tự động áp dụng ngay lập tức (không cần ấn nút Xong)
                        onSavePiece(pieceIndex, preset.shape, preset.color, preset.name);
                        onClose();
                      }}
                      className={`
                        p-2.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all
                        ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400/30'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                        }
                      `}
                    >
                      {/* Mini piece rendering */}
                      <div
                        className="grid gap-0.5"
                        style={{
                          gridTemplateColumns: `repeat(${preset.shape[0].length}, minmax(0, 1fr))`,
                        }}
                      >
                        {preset.shape.map((row, r) =>
                          row.map((val, c) => (
                            <div
                              key={`${r}-${c}`}
                              className={`w-3.5 h-3.5 rounded-xs ${
                                val > 0 ? '' : 'opacity-0'
                              }`}
                              style={{
                                backgroundColor:
                                  val > 0
                                    ? isSelected
                                      ? selectedColor
                                      : preset.color
                                    : 'transparent',
                              }}
                            />
                          ))
                        )}
                      </div>
                      <span className="text-[11px] text-slate-300 font-medium text-center truncate max-w-full">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Custom 5x5 Drawer */
            <div className="flex flex-col items-center">
              <p className="text-xs text-slate-400 mb-3 text-center">
                Nhấp vào các ô trong lưới 5x5 để tô sáng hình khối bạn muốn tạo:
              </p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                <div className="grid grid-cols-5 gap-1.5">
                  {customGrid.map((row, r) =>
                    row.map((val, c) => (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => toggleCustomCell(r, c)}
                        className={`w-9 h-9 rounded-md transition-all flex items-center justify-center ${
                          val > 0
                            ? 'ring-2 ring-white shadow-md'
                            : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                        }`}
                        style={{
                          backgroundColor: val > 0 ? selectedColor : undefined,
                        }}
                        aria-label={`Ô vẽ ${r}, ${c}`}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearCustom}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xóa vẽ lại</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Check className="w-4 h-4" />
            <span>Áp dụng khối này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
