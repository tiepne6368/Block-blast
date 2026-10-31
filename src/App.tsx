/**
 * Block Blast Solver - Main Application
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { GameBoard } from './components/GameBoard';
import { PieceTray } from './components/PieceTray';
import { QuickPieceDock } from './components/QuickPieceDock';
import { SolutionViewer } from './components/SolutionViewer';
import { BoardTopStepBar } from './components/BoardTopStepBar';
import { ShapePickerModal } from './components/ShapePickerModal';
import { HelpModal } from './components/HelpModal';
import {
  BlockPiece,
  Grid,
  SolverResult,
  PlacedMove,
  SolveStrategy,
} from './types/blockblast';
import {
  cloneGrid,
  createEmptyGrid,
  solveBlockBlast,
} from './solver/engine';
import {
  SAMPLE_SCREENSHOT_PATH,
  PINK_SAMPLE_PATH,
  USER_SAMPLE_DATA,
  PINK_SAMPLE_DATA,
  analyzeWithGemini,
  analyzeWithCanvasFallback,
  fileToBase64,
} from './utils/imageProcessor';
import { Sparkles, Play, Cpu, CheckCircle } from 'lucide-react';
import { playSuccessFanfare } from './utils/soundEffects';

export default function App() {
  // Strategy state - Default to 'keep_combo' (Max streak without losing)
  const [strategy, setStrategy] = useState<SolveStrategy>('keep_combo');

  // Board state (initial board before solver steps)
  const [initialBoard, setInitialBoard] = useState<Grid>(() =>
    cloneGrid(USER_SAMPLE_DATA.grid)
  );

  // Candidate pieces (up to 3)
  const [pieces, setPieces] = useState<BlockPiece[]>(() =>
    USER_SAMPLE_DATA.pieces.map((p) => ({ ...p }))
  );

  // Image upload and analysis state
  const [currentImagePreview, setCurrentImagePreview] = useState<string | null>(
    SAMPLE_SCREENSHOT_PATH
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');

  // Manual board edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Piece modal editor state
  const [editingPieceIdx, setEditingPieceIdx] = useState<number | null>(null);

  // Help modal state
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Solver outcome state
  const [solution, setSolution] = useState<SolverResult | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showAllMoves, setShowAllMoves] = useState<boolean>(false);
  const [isSolving, setIsSolving] = useState<boolean>(false);

  // Solve the puzzle based on current initialBoard and pieces
  const executeSolve = useCallback(
    (boardToSolve = initialBoard, piecesToSolve = pieces, currentStrat = strategy) => {
      setIsSolving(true);
      try {
        const result = solveBlockBlast(boardToSolve, piecesToSolve, {
          strategy: currentStrat,
        });
        setSolution(result);
        setActiveStep(result.moves.length > 0 ? 1 : 0);
        setShowAllMoves(false);

        if (result.isComplete) {
          playSuccessFanfare();
        }
      } catch (err) {
        console.error('Solve error:', err);
      } finally {
        setIsSolving(false);
      }
    },
    [initialBoard, pieces, strategy]
  );

  // Initial solve on mount with the user's sample
  useEffect(() => {
    executeSolve(initialBoard, pieces, strategy);
  }, []);

  // When strategy changes, re-solve automatically if we have a solution
  const handleStrategyChange = (newStrat: SolveStrategy) => {
    setStrategy(newStrat);
    if (solution) {
      executeSolve(initialBoard, pieces, newStrat);
    }
  };

  // Cell toggle in manual edit mode
  const handleCellToggle = (r: number, c: number) => {
    setInitialBoard((prev) => {
      const next = cloneGrid(prev);
      next[r][c] = next[r][c] > 0 ? 0 : 1;
      return next;
    });
    // Invalidate stale solution until user clicks solve
    setSolution(null);
  };

  const handleClearGrid = () => {
    setInitialBoard(createEmptyGrid(initialBoard.length, initialBoard[0].length));
    setSolution(null);
  };

  const handleInvertGrid = () => {
    setInitialBoard((prev) => {
      return prev.map((row) => row.map((val) => (val > 0 ? 0 : 1)));
    });
    setSolution(null);
  };

  // Piece Tray Actions
  const handleSavePiece = (
    index: number,
    shape: number[][],
    color: string,
    name?: string
  ) => {
    setPieces((prev) => {
      const next = [...prev];
      if (index >= 0 && index < next.length) {
        next[index] = {
          id: next[index].id || `piece-${Date.now()}`,
          shape,
          color,
          name: name || `Khối ${index + 1}`,
        };
      }
      return next;
    });
    setSolution(null);
  };

  const handleDeletePiece = (index: number) => {
    setPieces((prev) => prev.filter((_, idx) => idx !== index));
    setSolution(null);
  };

  const handleAddPiece = () => {
    if (pieces.length >= 3) return;
    const newPiece: BlockPiece = {
      id: `piece-${Date.now()}`,
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: '#38bdf8',
      name: `Khối ${pieces.length + 1}`,
    };
    setPieces((prev) => [...prev, newPiece]);
    setSolution(null);
  };

  // 1-Tap Quick Piece Selection from Dock (takes 1 second!)
  const handleQuickSelectShape = (shape: number[][], color: string, name: string) => {
    const makeId = () => `quick-${Math.random().toString(36).slice(2, 9)}-${Date.now()}`;
    setPieces((prev) => {
      let next: BlockPiece[];
      if (prev.length >= 3) {
        // Reset and start new batch
        next = [{ id: makeId(), shape, color, name }];
      } else {
        next = [...prev, { id: makeId(), shape, color, name }];
      }

      if (next.length === 3) {
        // Automatically solve immediately when 3 pieces are chosen!
        executeSolve(initialBoard, next, strategy);
      } else {
        setSolution(null);
      }
      return next;
    });
  };

  // Continuity / Wave mode: keep cleared board state for next turn without screenshotting!
  const handleNextWave = () => {
    if (solution && solution.finalGrid) {
      setInitialBoard(cloneGrid(solution.finalGrid));
      setPieces([]);
      setSolution(null);
      setActiveStep(0);
      setShowAllMoves(false);
    }
  };

  // Ultra-fast Image handling: Instant local CV first (<50ms), never hangs!
  const processUploadedImage = async (base64Data: string) => {
    setIsAnalyzing(true);
    setAnalysisStatus('⚡ Đang quét thị giác siêu tốc...');

    try {
      // Step 1: Run instant Canvas CV in browser (10-20ms)
      const cvResult = await analyzeWithCanvasFallback(base64Data);

      if (cvResult && cvResult.grid) {
        setInitialBoard(cvResult.grid);

        let activePieces = pieces;
        if (cvResult.pieces && cvResult.pieces.length > 0) {
          activePieces = cvResult.pieces.map((p, idx) => ({
            id: `p-${idx + 1}-${Date.now()}`,
            shape: p.shape,
            color: p.color || '#38bdf8',
            name: `Khối #${idx + 1}`,
          }));
          setPieces(activePieces);
        }

        // Solve immediately! Result appears in <100ms total!
        executeSolve(cvResult.grid, activePieces, strategy);
      }
    } catch (err: any) {
      console.warn('Canvas CV fallback error, trying AI:', err);
      try {
        setAnalysisStatus('Đang xác nhận bằng AI (tối đa 3s)...');
        const aiResult = await analyzeWithGemini(base64Data);
        if (aiResult && aiResult.grid) {
          setInitialBoard(aiResult.grid);
          if (aiResult.pieces && aiResult.pieces.length > 0) {
            const newPieces: BlockPiece[] = aiResult.pieces.map((p, idx) => ({
              id: `p-${idx + 1}-${Date.now()}`,
              shape: p.shape,
              color: p.color || '#38bdf8',
              name: `Khối #${idx + 1}`,
            }));
            setPieces(newPieces);
            executeSolve(aiResult.grid, newPieces, strategy);
          }
        }
      } catch (aiErr: any) {
        console.error('All recognition failed:', aiErr);
      }
    } finally {
      setIsAnalyzing(false);
      setAnalysisStatus('');
    }
  };

  const handleImageSelected = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setCurrentImagePreview(base64);
      await processUploadedImage(base64);
    } catch (err) {
      console.error(err);
    }
  };

  // Preset 1: Dark Navy theme
  const handleUseSampleImage = () => {
    setCurrentImagePreview(SAMPLE_SCREENSHOT_PATH);
    setInitialBoard(cloneGrid(USER_SAMPLE_DATA.grid));
    setPieces(USER_SAMPLE_DATA.pieces.map((p) => ({ ...p })));
    executeSolve(USER_SAMPLE_DATA.grid, USER_SAMPLE_DATA.pieces, strategy);
  };

  // Preset 2: Pink theme (user's blockl screenshot)
  const handleUsePinkSampleImage = () => {
    setCurrentImagePreview(PINK_SAMPLE_PATH);
    setInitialBoard(cloneGrid(PINK_SAMPLE_DATA.grid));
    setPieces(PINK_SAMPLE_DATA.pieces.map((p) => ({ ...p })));
    executeSolve(PINK_SAMPLE_DATA.grid, PINK_SAMPLE_DATA.pieces, strategy);
  };

  const handleClearImage = () => {
    setCurrentImagePreview(null);
  };

  // Compute what grid should be displayed on the board
  // If activeStep === 0 or no move: initialBoard
  // If activeStep > 0: shows boardBefore of that move, with the ghost piece overlay on top!
  const currentMove: PlacedMove | undefined =
    activeStep > 0 && solution ? solution.moves[activeStep - 1] : undefined;

  const displayGrid = useMemo(() => {
    if (showAllMoves) {
      return initialBoard;
    }
    if (!currentMove) {
      return initialBoard;
    }
    return currentMove.gridBefore;
  }, [showAllMoves, currentMove, initialBoard]);

  // Map piece IDs to their scheduled step index for display
  const pieceStepOrder = useMemo(() => {
    const map: { [pieceId: string]: number } = {};
    if (solution?.moves) {
      solution.moves.forEach((m) => {
        map[m.pieceId] = m.step;
      });
    }
    return map;
  }, [solution]);

  return (
    <div className="min-h-screen bg-[#0d111e] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* App Header */}
      <Header
        strategy={strategy}
        setStrategy={handleStrategyChange}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-[1750px] w-full mx-auto p-3 sm:p-4 md:p-6 space-y-4">
        {/* Step 1: Upload Screenshot (Collapsible / Compact) */}
        <section aria-labelledby="section-upload">
          <ImageUploader
            onImageSelected={handleImageSelected}
            onUseSampleImage={handleUseSampleImage}
            onUsePinkSampleImage={handleUsePinkSampleImage}
            currentImagePreview={currentImagePreview}
            onClearImage={handleClearImage}
            isAnalyzing={isAnalyzing}
            analysisMessage={analysisStatus}
          />
        </section>

        {/* 2-Column Core Interface: Left = Board & Solution, Right = Full Quick Piece Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* CỘT BÊN TRÁI: ĐIỀU HƯỚNG BƯỚC Ở TRÊN ĐẦU + BÀN CỜ 8X8 + 3 KHỐI CHỜ */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-3.5">
            {/* DÒNG BƯỚC TIẾP THEO Ở TRÊN ĐẦU BÀN CỜ - KHÔNG CẦN LƯỚT XUỐNG! */}
            <section aria-label="Điều hướng bước đi trên đầu bàn cờ">
              <BoardTopStepBar
                solution={solution}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                showAllMoves={showAllMoves}
                setShowAllMoves={setShowAllMoves}
                onReset={() => {
                  setActiveStep(0);
                  setShowAllMoves(false);
                }}
                onNextWave={solution ? handleNextWave : undefined}
                isSolving={isSolving}
              />
            </section>

            {/* Game Board 8x8 */}
            <section aria-labelledby="section-board">
              <GameBoard
                grid={displayGrid}
                onCellToggle={handleCellToggle}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                onClearGrid={handleClearGrid}
                onInvertGrid={handleInvertGrid}
                currentMove={currentMove}
                allMoves={solution?.moves}
                showAllMoves={showAllMoves}
                activeStep={activeStep}
              />
            </section>

            {/* 3 Pieces Tray */}
            <section aria-labelledby="section-tray">
              <PieceTray
                pieces={pieces}
                onEditPiece={(idx) => setEditingPieceIdx(idx)}
                onDeletePiece={handleDeletePiece}
                onAddPiece={handleAddPiece}
                activePieceIndex={currentMove?.pieceIndex}
                pieceStepOrder={pieceStepOrder}
              />
            </section>

            {/* Big Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-indigo-950/70 via-purple-950/70 to-slate-900 border border-purple-500/30 rounded-2xl p-3.5 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                  <Cpu className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm">
                    Thuật toán Giữ Combo & Không thua
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Tự động tìm chuỗi ăn điểm liên hoàn an toàn nhất.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => executeSolve()}
                disabled={isSolving || isAnalyzing}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isSolving ? 'ĐANG TÍNH...' : 'PHÂN TÍCH VÀ GIẢI NGAY'}</span>
              </button>
            </div>

            {/* Solution Step-by-Step Viewer */}
            <section aria-labelledby="section-solution">
              <SolutionViewer
                solution={solution}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                showAllMoves={showAllMoves}
                setShowAllMoves={setShowAllMoves}
                onReset={() => {
                  setActiveStep(0);
                  setShowAllMoves(false);
                }}
                onResolve={() => executeSolve()}
                onNextWave={solution?.isComplete ? handleNextWave : undefined}
                isSolving={isSolving}
              />
            </section>
          </div>

          {/* CỘT BÊN PHẢI: BẢNG CHỌN NHANH KHỐI (FULL TẤT CẢ KHỐI + TỰ THÊM KHỐI) */}
          <div className="lg:col-span-7 xl:col-span-7 sticky top-4">
            <section aria-labelledby="section-quick-pieces">
              <QuickPieceDock
                onSelectShape={handleQuickSelectShape}
                onClearPieces={() => {
                  setPieces([]);
                  setSolution(null);
                }}
                pieces={pieces}
              />
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-800/80 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-400">
        <p>
          Block Blast Solver • Giải đố tự động trên iPhone, Android và máy tính bằng AI & Heuristics • Hoàn toàn bảo mật
        </p>
      </footer>

      {/* Shape Picker / Drawer Modal */}
      {editingPieceIdx !== null && (
        <ShapePickerModal
          isOpen={editingPieceIdx !== null}
          onClose={() => setEditingPieceIdx(null)}
          pieceIndex={editingPieceIdx}
          currentPiece={pieces[editingPieceIdx]}
          onSavePiece={handleSavePiece}
        />
      )}

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
