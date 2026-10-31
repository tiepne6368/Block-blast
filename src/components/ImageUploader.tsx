import React, { useRef, useState } from 'react';
import { Upload, Camera, Image as ImageIcon, Sparkles, X, RefreshCw, Clipboard } from 'lucide-react';
import { SAMPLE_SCREENSHOT_PATH } from '../utils/imageProcessor';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  onUseSampleImage: () => void;
  onUsePinkSampleImage: () => void;
  currentImagePreview: string | null;
  onClearImage: () => void;
  isAnalyzing: boolean;
  analysisMessage?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onUseSampleImage,
  onUsePinkSampleImage,
  currentImagePreview,
  onClearImage,
  isAnalyzing,
  analysisMessage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageSelected(e.target.files[0]);
    }
  };

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Clipboard Paste handler (super fast on iPhone / PC)
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], 'clipboard-screenshot.png', { type: imageType });
            onImageSelected(file);
            return;
          }
        }
      }
      alert('Không tìm thấy ảnh trong bộ nhớ tạm (Clipboard). Hãy chụp màn hình rồi bấm "Sao chép" (Copy) trước.');
    } catch (err: any) {
      alert('Trình duyệt yêu cầu quyền truy cập Clipboard. Bạn cũng có thể bấm phím Ctrl+V hoặc dán vào đây.');
    }
  };

  // Listen to global window paste
  React.useEffect(() => {
    const handleWindowPaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          onImageSelected(file);
        }
      }
    };
    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [onImageSelected]);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 sm:p-4 md:p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-semibold text-slate-200 uppercase tracking-wider">
            1. Tải ảnh chụp màn hình
          </h2>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Quét siêu tốc &lt; 1s
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {currentImagePreview && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline px-1.5 py-0.5 rounded cursor-pointer mr-1"
            >
              {isCollapsed ? 'Hiện ảnh gốc' : 'Thu nhỏ ảnh'}
            </button>
          )}

          <button
            onClick={onUseSampleImage}
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white transition cursor-pointer"
            title="Thử ảnh chụp mẫu 1 (Giao diện Xanh Navy 2789 điểm)"
          >
            <Sparkles className="w-3 h-3 text-cyan-300" />
            <span>Mẫu Xanh Navy</span>
          </button>

          <button
            onClick={onUsePinkSampleImage}
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-md shadow-pink-500/20 transition cursor-pointer"
            title="Thử ảnh chụp mẫu 2 (Giao diện Hồng 275805 điểm - blockl)"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Mẫu Hồng (Blockl)</span>
          </button>
        </div>
      </div>

      {currentImagePreview ? (
        /* Image Preview Box */
        !isCollapsed ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3">
          <div className="relative w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-44 shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
            <img
              src={currentImagePreview}
              alt="Screenshot Block Blast"
              className="w-full h-full object-contain"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-cyan-400 p-2 text-center">
                <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                <span className="text-[11px] font-medium text-slate-200">
                  {analysisMessage || 'Đang nhận diện AI...'}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 w-full flex flex-col justify-between py-1">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Đã tải ảnh chụp màn hình
                </span>
                <button
                  onClick={onClearImage}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Xóa ảnh và chọn ảnh khác"
                  aria-label="Xóa ảnh"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Hệ thống đã nhận diện lưới 8x8 và các khối hình phía dưới. Bạn có thể kiểm tra trực tiếp ở bàn cờ bên dưới hoặc chỉnh sửa nếu cần.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Chọn ảnh khác</span>
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-purple-400" />
                <span>Chụp mới</span>
              </button>
            </div>
          </div>
        </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <img src={currentImagePreview} alt="Thumb" className="w-6 h-8 object-contain rounded bg-slate-900" />
              <span className="text-slate-300 font-medium">Ảnh chụp màn hình đã nạp</span>
            </div>
            <button
              onClick={() => setIsCollapsed(false)}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Mở rộng
            </button>
          </div>
        )
      ) : (
        /* Upload Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 transition flex flex-col items-center justify-center text-center cursor-pointer ${
            isDragging
              ? 'border-purple-500 bg-purple-500/10 scale-[0.99]'
              : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/70'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-slate-700 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-sm font-semibold text-slate-200">
            Kéo thả ảnh chụp Block Blast vào đây hoặc nhấp để chọn
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Hỗ trợ ảnh màn hình iPhone, Android (PNG, JPG, JPEG). Tự động phân tích ô cờ và các khối chờ.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
              title="Dán nhanh ảnh chụp màn hình từ bộ nhớ tạm (Clipboard)"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Dán ảnh (Paste)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Thư viện ảnh</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-pink-400" />
              <span>Chụp ảnh camera</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
