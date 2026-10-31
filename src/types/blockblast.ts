/**
 * Block Blast Solver - Core Types and Models
 */

export type Grid = number[][]; // 0 = empty, >0 = occupied (color ID or 1)

export interface BlockPiece {
  id: string;
  shape: number[][]; // 2D array of 0s and 1s, normalized (trimmed bounding box)
  color: string;
  name?: string;
}

export interface PlacedMove {
  step: number;
  pieceIndex: number;
  pieceId: string;
  pieceShape: number[][];
  pieceColor: string;
  r: number; // Row coordinate on board (0-indexed)
  c: number; // Col coordinate on board (0-indexed)
  clearedRows: number[];
  clearedCols: number[];
  linesClearedCount: number;
  pointsEarned: number;
  gridBefore: Grid;
  gridAfter: Grid;
}

export type SolveStrategy = 'keep_combo' | 'balanced' | 'max_clears' | 'max_survival';

export interface SolverResult {
  moves: PlacedMove[];
  isComplete: boolean; // True if all candidate pieces were placed
  placedCount: number;
  totalPieces: number;
  totalLinesCleared: number;
  totalScore: number;
  survivalRating: number; // 0-100 score
  finalGrid: Grid;
  strategy: SolveStrategy;
  durationMs: number;
  message?: string;
  comboStreakCount?: number; // How many consecutive steps cleared lines
}

export interface AnalysisResponse {
  success: boolean;
  gridRows: number;
  gridCols: number;
  grid: number[][];
  pieces: {
    shape: number[][];
    color?: string;
  }[];
  detectedScore?: number;
  confidence?: 'high' | 'medium' | 'low';
  error?: string;
}

export interface PresetShape {
  id?: string;
  name: string;
  category: 'dots' | 'lines' | 'squares' | 'l_shapes' | 't_shapes' | 'z_shapes' | 'rectangles' | 'special' | 'custom';
  shape: number[][];
  color: string;
  isCustom?: boolean;
}
