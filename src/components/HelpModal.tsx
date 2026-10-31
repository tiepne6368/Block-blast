import React from 'react';
import { X, Smartphone, Zap, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <HelpCircle className="w-5 h-5" />
            <h3 className="font-bold text-slate-100 text-base">
              Hướng Dẫn Sử Dụng & Thuật Toán
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-300">
          <div>
            <h4 className="font-bold text-white flex items-center gap-1.5 mb-2 text-sm text-cyan-300">
              <Smartphone className="w-4 h-4" />
              1. Cách chơi cực nhanh trên iPhone (Không cần chụp ảnh liên tục!):
            </h4>
            <div className="space-y-2 text-slate-300 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                <strong className="text-emerald-300 block mb-0.5">⚡ Cách 1: Chế độ Chơi Liên Tục (Wave Mode) - Nhanh nhất!</strong>
                <span>Sau khi giải xong 3 khối và đặt vào game, bấm nút <strong>"Ván tiếp theo"</strong>. Bàn cờ tự động giữ nguyên các hàng đã xóa! Bạn chỉ cần chạm 3 hình mới ở <strong>"Thanh chọn nhanh khối"</strong> trong <strong>1 giây</strong> là có ngay đáp án tiếp theo mà không cần chụp ảnh lại!</span>
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
                <strong className="text-cyan-300 block mb-0.5">📋 Cách 2: Dán trực tiếp từ Clipboard (Paste)</strong>
                <span>Khi chụp màn hình trên iPhone, chạm vào ảnh thu nhỏ ở góc trái &rarr; Chọn <strong>"Sao chép và xóa" (Copy & Delete)</strong> &rarr; Mở web bấm <strong>"Dán ảnh (Paste)"</strong>. Ảnh tự động giải tức thì mà không bị đầy bộ nhớ ảnh điện thoại!</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-white flex items-center gap-1.5 mb-1.5 text-sm text-purple-300">
              <Zap className="w-4 h-4" />
              2. Bộ ba chiến thuật giải:
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <strong className="text-purple-300">Cân bằng (Khuyên dùng):</strong> Tối ưu điểm số vừa đủ kết hợp giữ gìn không gian bàn cờ thông thoáng.
              </li>
              <li>
                <strong className="text-amber-300">Xóa tối đa:</strong> Tập trung kích hoạt các pha combo xóa 2-4 hàng/cột cùng lúc để bứt phá điểm số.
              </li>
              <li>
                <strong className="text-emerald-300">Sống sót:</strong> Ưu tiên dự trữ khoảng trống 3x3 và 5x1 lớn để không bao giờ bị game over bất ngờ.
              </li>
            </ul>
          </div>

          <div className="bg-cyan-950/30 p-3.5 rounded-xl border border-cyan-500/20">
            <h4 className="font-bold text-white flex items-center gap-1.5 mb-1.5 text-sm text-cyan-300">
              <Smartphone className="w-4 h-4" />
              3. Cài đặt thành App trên iPhone & Android (PWA):
            </h4>
            <ul className="space-y-1.5 text-slate-300 text-xs">
              <li>
                <strong>Trên iPhone (Safari):</strong> Nhấn biểu tượng <strong>Chia sẻ (Share)</strong> ở thanh dưới Safari &rarr; Chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.
              </li>
              <li>
                <strong>Trên Android (Chrome):</strong> Nhấn nút <strong>3 chấm</strong> ở góc trên &rarr; Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.
              </li>
            </ul>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-white flex items-center gap-1.5 mb-1.5 text-sm text-emerald-300">
              <Sparkles className="w-4 h-4" />
              4. Triển khai Hosting Miễn Phí (Vercel / Render / Railway):
            </h4>
            <div className="space-y-1.5 text-slate-300 text-xs">
              <p>Mã nguồn được đóng gói tiêu chuẩn TypeScript + Node.js Express:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Đẩy mã nguồn lên kho lưu trữ <strong>GitHub</strong> của bạn.</li>
                <li>Đăng nhập <strong>Vercel.com</strong> hoặc <strong>Render.com</strong> &rarr; Import repo GitHub.</li>
                <li>Thêm biến môi trường <code>GEMINI_API_KEY</code> trong Settings.</li>
                <li>Nhấn <strong>Deploy</strong> &rarr; Hoàn tất với tên miền HTTPS miễn phí!</li>
              </ol>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white flex items-center gap-1.5 mb-2 text-sm text-amber-300">
              <AlertCircle className="w-4 h-4" />
              5. Lưu ý quan trọng về luật chơi:
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                Trong Block Blast chuẩn, các khối hình <strong>không thể xoay hoặc lật</strong>. Thuật toán luôn tuân thủ nghiêm ngặt góc nghiêng gốc của khối.
              </li>
              <li>
                Nếu ảnh chụp bị mờ hoặc nhận diện thiếu ô, bạn chỉ cần nhấn <strong>"Chỉnh sửa ô"</strong> để chạm đổi trực tiếp trên bàn cờ trước khi nhấn Giải.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
