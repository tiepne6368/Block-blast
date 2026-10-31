import React, { useState, useEffect } from 'react';
import { PRESET_SHAPES } from '../constants/pieces';
import { Zap, Plus, Trash2, Check, Sparkles, SlidersHorizontal, Info } from 'lucide-react';
import { BlockPiece, PresetShape } from '../types/blockblast';
import { CustomShapeModal } from './CustomShapeModal';

interface QuickPieceDockProps {
  onSelectShape: (shape: number[][], color: string, name: string) => void;
  onClearPieces: () => void;
  pieces: BlockPiece[];
}

const LOCAL_STORAGE_CUSTOM_KEY = 'blockblast_custom_shapes_v1';

export const QuickPieceDock: React.FC<QuickPieceDockProps> = ({
  onSelectShape,
  onClearPieces,
  pieces,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [customShapes, setCustomShapes] = useState<PresetShape[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOM_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load custom shapes from localStorage', e);
    }
    return [];
  });

  // Save custom shapes to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_KEY, JSON.stringify(customShapes));
    } catch (e) {
      console.error('Failed to save custom shapes to localStorage', e);
    }
  }, [customShapes]);

  const handleAddCustomShape = (newShape: PresetShape) => {
    setCustomShapes((prev) => [newShape, ...prev]);
    // Also auto select the 'custom' or 'all' tab so user sees their new piece immediately
    setSelectedCategory('custom');
  };

  const handleDeleteCustomShape = (e: React.MouseEvent, shapeId?: string) => {
    e.stopPropagation();
    if (!shapeId) return;
    setCustomShapes((prev) => prev.filter((s) => s.id !== shapeId));
  };

  // Combine standard presets with user's custom shapes
  const allShapes: PresetShape[] = [...customShapes, ...PRESET_SHAPES];

  const categories = [
    { id: 'all', label: `Tất cả (${allShapes.length})` },
    ...(customShapes.length > 0
      ? [{ id: 'custom', label: `⭐ Tự tạo (${customShapes.length})` }]
      : []),
    { id: 'lines', label: 'Thanh thẳng' },
    { id: 'squares', label: 'Vuông & 3x2, 2x3' },
    { id: 'l_shapes', label: 'Chữ L & Góc (đủ hướng)' },
    { id: 't_shapes', label: 'Chữ T' },
    { id: 'z_shapes', label: 'Chữ Z & S' },
    { id: 'special', label: 'Đặc biệt (+, U)' },
  ];

  const filteredShapes = allShapes.filter((preset) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'custom') return preset.isCustom;
    if (selectedCategory === 'squares') {
      return preset.category === 'squares' || preset.category === 'rectangles';
    }
    return preset.category === selectedCategory;
  });

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col h-full">
      {/* Top Header & Add Custom Block Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-orange-500/20">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>BẢNG CHỌN NHANH</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                FULL {allShapes.length} KHỐI
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Chạm 3 hình bất kỳ để giải ngay trong 1 giây (đầy đủ 3x2, 2x3, L xoay & khối tự vẽ).
            </p>
          </div>
        </div>

        {/* Buttons: Add Custom Shape & Reset Selection */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Tự vẽ thêm khối bất kỳ vào danh sách chọn nhanh"
          >
            <Plus className="w-4 h-4" />
            <span>Tự thêm khối</span>
          </button>

          {pieces.length > 0 && (
            <button
              type="button"
              onClick={onClearPieces}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800/90 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
              title="Xóa cả 3 khối để chọn lại lượt mới"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Chọn lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected 3 Pieces Quick Slot Tray */}
      <div className="my-3 p-3 bg-slate-950/80 border border-slate-800/90 rounded-xl flex items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-300">
            Khối đã chọn ({pieces.length}/3):
          </span>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((slotIdx) => {
              const piece = pieces[slotIdx];
              return (
                <div
                  key={slotIdx}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex flex-col items-center justify-center p-1 transition ${
                    piece
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-md shadow-cyan-500/20'
                      : 'border-dashed border-slate-700 bg-slate-900/40 text-slate-600'
                  }`}
                >
                  {piece ? (
                    <div
                      className="grid gap-0.5 max-w-full max-h-full"
                      style={{
                        gridTemplateColumns: `repeat(${piece.shape[0].length}, minmax(0, 1fr))`,
                      }}
                    >
                      {piece.shape.map((row, r) =>
                        row.map((val, c) => (
                          <div
                            key={`${r}-${c}`}
                            className={`w-1.5 h-1.5 rounded-2xs ${
                              val > 0 ? '' : 'opacity-0'
                            }`}
                            style={{ backgroundColor: val > 0 ? piece.color : 'transparent' }}
                          />
                        ))
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500">#{slotIdx + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          {pieces.length === 3 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>Đã nạp đủ 3 khối!</span>
            </span>
          ) : (
            <span className="text-[11px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              Chạm thêm {3 - pieces.length} khối
            </span>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Full Visible Grid of All Shapes */}
      <div className="flex-1 overflow-y-auto pr-1 pt-2 max-h-[640px] scrollbar-thin scrollbar-thumb-slate-700">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-5 gap-2.5">
          {/* Card to Add Custom Block if in custom category or as first item */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="p-3 rounded-xl border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/40 transition flex flex-col items-center justify-center min-h-[95px] cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-purple-300 mt-2 text-center">
              + Tự vẽ khối
            </span>
          </button>

          {filteredShapes.map((preset, idx) => (
            <div
              key={preset.id || `shape-${idx}-${preset.name}`}
              onClick={() => onSelectShape(preset.shape, preset.color, preset.name)}
              className="relative group p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 hover:border-cyan-400 hover:bg-slate-900 transition flex flex-col items-center justify-between min-h-[95px] cursor-pointer active:scale-95 shadow-sm"
              title={`Chạm để nạp: ${preset.name}`}
            >
              {/* Badge for Custom Shapes */}
              {preset.isCustom && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 border border-purple-500/40">
                    Tự tạo
                  </span>
                </div>
              )}

              {/* Delete button for Custom Shapes */}
              {preset.isCustom && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteCustomShape(e, preset.id)}
                  className="absolute top-1 right-1 p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                  title="Xóa khối tự tạo này"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}

              {/* Shape Visual Rendering */}
              <div className="flex-1 flex items-center justify-center my-1.5 w-full">
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
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs transition-all ${
                          val > 0
                            ? 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] border border-white/25'
                            : 'opacity-0'
                        }`}
                        style={{
                          backgroundColor: val > 0 ? preset.color : 'transparent',
                        }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Name & Dimension label */}
              <div className="w-full text-center mt-1">
                <span className="text-[10px] text-slate-300 group-hover:text-cyan-300 font-medium block truncate">
                  {preset.name}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {preset.shape.length}x{preset.shape[0].length}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal to Draw Custom Shape */}
      <CustomShapeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveCustomShape={handleAddCustomShape}
      />
    </div>
  );
};
