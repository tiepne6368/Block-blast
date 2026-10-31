import React from 'react';
import { Volume2, VolumeX, Sparkles, HelpCircle, Flame } from 'lucide-react';
import { getMuted, setMuted } from '../utils/soundEffects';
import { SolveStrategy } from '../types/blockblast';

interface HeaderProps {
  strategy: SolveStrategy;
  setStrategy: (strategy: SolveStrategy) => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  strategy,
  setStrategy,
  onOpenHelp,
}) => {
  const [muted, setLocalMuted] = React.useState(getMuted());

  const toggleMute = () => {
    const next = !muted;
    setLocalMuted(next);
    setMuted(next);
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-4 py-2 sm:py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] grid grid-cols-2 gap-0.5 p-1">
              <div className="bg-cyan-400 rounded-[2px] shadow-sm" />
              <div className="bg-amber-400 rounded-[2px] shadow-sm" />
              <div className="bg-purple-400 rounded-[2px] shadow-sm" />
              <div className="bg-emerald-400 rounded-[2px] shadow-sm" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-black text-sm sm:text-base md:text-lg tracking-wider text-white">
                BLOCK BLAST <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400">SOLVER</span>
              </h1>
              <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                AI + CV
              </span>
            </div>
          </div>
        </div>

        {/* Strategy and Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Strategy Selector with Giữ Combo */}
          <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/60 text-[11px] sm:text-xs font-medium">
            <button
              onClick={() => setStrategy('keep_combo')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md transition-all flex items-center gap-1 ${
                strategy === 'keep_combo'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                  : 'text-amber-300/80 hover:text-amber-200'
              }`}
              title="Ưu tiên giữ combo chuỗi xóa hàng liên tục nhân điểm khủng mà không bị thua!"
            >
              <Flame className="w-3 h-3 fill-current" />
              <span>Giữ Combo</span>
            </button>
            <button
              onClick={() => setStrategy('balanced')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md transition-all ${
                strategy === 'balanced'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cân bằng giữa xóa hàng và giữ bàn cờ sống sót"
            >
              Cân bằng
            </button>
            <button
              onClick={() => setStrategy('max_survival')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md transition-all ${
                strategy === 'max_survival'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Ưu tiên chừa ô lớn (3x3, 5x1) để duy trì sự sống lâu nhất"
            >
              Sống sót
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
            aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Help Modal */}
          <button
            onClick={onOpenHelp}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
            aria-label="Hướng dẫn sử dụng"
            title="Hướng dẫn sử dụng"
          >
            <HelpCircle className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
