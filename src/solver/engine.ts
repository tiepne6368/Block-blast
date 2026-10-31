import { BlockPiece, Grid, PlacedMove, SolverResult, SolveStrategy } from '../types/blockblast';

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

export function createEmptyGrid(rows = 8, cols = 8): Grid {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

/**
 * Checks if a shape can be placed at (startR, startC) without collisions or going out of bounds.
 * (Rotation/flipping is NOT performed).
 */
export function canPlace(
  grid: Grid,
  shape: number[][],
  startR: number,
  startC: number
): boolean {
  const rows = grid.length;
  const cols = grid[0].length;
  const shapeH = shape.length;
  const shapeW = shape[0].length;

  if (startR < 0 || startC < 0 || startR + shapeH > rows || startC + shapeW > cols) {
    return false;
  }

  for (let r = 0; r < shapeH; r++) {
    for (let c = 0; c < shapeW; c++) {
      if (shape[r][c] > 0) {
        if (grid[startR + r][startC + c] > 0) {
          return false; // Collision with occupied cell
        }
      }
    }
  }

  return true;
}

/**
 * Places the shape onto a copy of the grid with a given marker value.
 */
export function placePiece(
  grid: Grid,
  shape: number[][],
  startR: number,
  startC: number,
  markerValue = 1
): Grid {
  const newGrid = cloneGrid(grid);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] > 0) {
        newGrid[startR + r][startC + c] = markerValue;
      }
    }
  }
  return newGrid;
}

/**
 * Checks for full rows and columns, clears them, and returns the updated grid + cleared info.
 */
export function checkAndClearLines(grid: Grid): {
  newGrid: Grid;
  clearedRows: number[];
  clearedCols: number[];
  linesCleared: number;
} {
  const rows = grid.length;
  const cols = grid[0].length;

  const clearedRows: number[] = [];
  const clearedCols: number[] = [];

  // Check rows
  for (let r = 0; r < rows; r++) {
    let full = true;
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) {
        full = false;
        break;
      }
    }
    if (full) {
      clearedRows.push(r);
    }
  }

  // Check columns
  for (let c = 0; c < cols; c++) {
    let full = true;
    for (let r = 0; r < rows; r++) {
      if (grid[r][c] === 0) {
        full = false;
        break;
      }
    }
    if (full) {
      clearedCols.push(c);
    }
  }

  if (clearedRows.length === 0 && clearedCols.length === 0) {
    return {
      newGrid: grid,
      clearedRows: [],
      clearedCols: [],
      linesCleared: 0,
    };
  }

  const newGrid = cloneGrid(grid);

  // Clear rows
  for (const r of clearedRows) {
    for (let c = 0; c < cols; c++) {
      newGrid[r][c] = 0;
    }
  }

  // Clear columns
  for (const c of clearedCols) {
    for (let r = 0; r < rows; r++) {
      newGrid[r][c] = 0;
    }
  }

  return {
    newGrid,
    clearedRows,
    clearedCols,
    linesCleared: clearedRows.length + clearedCols.length,
  };
}

/**
 * Calculates points earned from placing a piece and clearing lines.
 */
export function calculateMovePoints(
  shape: number[][],
  linesCleared: number
): number {
  let pieceCells = 0;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] > 0) pieceCells++;
    }
  }

  let linePoints = 0;
  if (linesCleared === 1) linePoints = 10;
  else if (linesCleared === 2) linePoints = 30;
  else if (linesCleared === 3) linePoints = 60;
  else if (linesCleared === 4) linePoints = 100;
  else if (linesCleared > 4) linePoints = linesCleared * linesCleared * 10;

  return pieceCells + linePoints;
}

// Critical test shapes to evaluate board survivability
const TEST_3X3 = [
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
];
const TEST_5X1 = [[1, 1, 1, 1, 1]];
const TEST_1X5 = [[1], [1], [1], [1], [1]];
const TEST_2X2 = [
  [1, 1],
  [1, 1],
];
const TEST_3X3_L = [
  [1, 0, 0],
  [1, 0, 0],
  [1, 1, 1],
];

/**
 * Counts how many positions a test shape can fit into the grid.
 */
function countPlacements(grid: Grid, testShape: number[][]): number {
  let count = 0;
  const rows = grid.length;
  const cols = grid[0].length;
  const h = testShape.length;
  const w = testShape[0].length;

  for (let r = 0; r <= rows - h; r++) {
    for (let c = 0; c <= cols - w; c++) {
      if (canPlace(grid, testShape, r, c)) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Evaluates board survivability and strategic health:
 * - Empty cells count
 * - Heavy penalty for isolated 1x1 holes
 * - High bonus for ability to fit large pieces (3x3 square, 5x1 lines, 2x2 squares)
 * - Row/Col readiness (rows/cols with 6 or 7 occupied cells ready to clear on next move)
 */
export function evaluateBoardState(grid: Grid): number {
  const rows = grid.length;
  const cols = grid[0].length;

  let emptyCells = 0;
  let isolatedHoles = 0;
  let almostFullLines = 0;

  for (let r = 0; r < rows; r++) {
    let rowFilled = 0;
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) {
        emptyCells++;

        // Check if this empty cell is completely isolated by 4 occupied cells or grid boundaries
        const upBlocked = r === 0 || grid[r - 1][c] > 0;
        const downBlocked = r === rows - 1 || grid[r + 1][c] > 0;
        const leftBlocked = c === 0 || grid[r][c - 1] > 0;
        const rightBlocked = c === cols - 1 || grid[r][c + 1] > 0;

        if (upBlocked && downBlocked && leftBlocked && rightBlocked) {
          isolatedHoles++;
        }
      } else {
        rowFilled++;
      }
    }
    // Rows with 6 or 7 filled (near completion) are advantageous
    if (rowFilled === cols - 1 || rowFilled === cols - 2) {
      almostFullLines++;
    }
  }

  // Column readiness
  for (let c = 0; c < cols; c++) {
    let colFilled = 0;
    for (let r = 0; r < rows; r++) {
      if (grid[r][c] > 0) colFilled++;
    }
    if (colFilled === rows - 1 || colFilled === rows - 2) {
      almostFullLines++;
    }
  }

  // Check critical pieces placement room
  const fits3x3 = countPlacements(grid, TEST_3X3);
  const fits5x1 = countPlacements(grid, TEST_5X1);
  const fits1x5 = countPlacements(grid, TEST_1X5);
  const fits2x2 = countPlacements(grid, TEST_2X2);
  const fits3x3L = countPlacements(grid, TEST_3X3_L);

  let score = 0;
  score += emptyCells * 3;
  score -= isolatedHoles * 30; // Heavy penalty for choking holes
  score += almostFullLines * 5;

  score += Math.min(fits3x3, 4) * 20; // 3x3 square room is vital
  score += Math.min(fits2x2, 8) * 8;
  score += Math.min(fits5x1, 4) * 12;
  score += Math.min(fits1x5, 4) * 12;
  score += Math.min(fits3x3L, 4) * 8;

  return score;
}

interface SearchNode {
  grid: Grid;
  moves: PlacedMove[];
  usedPiecesIndices: number[];
  totalScore: number;
  totalLinesCleared: number;
  currentStreak: number; // Consecutive steps that cleared lines
  stepsWithClears: number; // Total steps with at least 1 line cleared
  evalScore: number;
}

/**
 * Solves Block Blast board using Exhaustive Branch Search with Heuristic Ranking.
 */
export function solveBlockBlast(
  initialGrid: Grid,
  pieces: BlockPiece[],
  options?: {
    strategy?: SolveStrategy;
    beamWidth?: number;
  }
): SolverResult {
  const startTime = performance.now();
  const strategy = options?.strategy || 'keep_combo';
  const beamWidth = options?.beamWidth || 50;

  const validPieces = pieces.filter((p) => p && p.shape && p.shape.length > 0);

  if (validPieces.length === 0) {
    return {
      moves: [],
      isComplete: true,
      placedCount: 0,
      totalPieces: 0,
      totalLinesCleared: 0,
      totalScore: 0,
      survivalRating: 100,
      finalGrid: cloneGrid(initialGrid),
      strategy,
      durationMs: 0,
      message: 'Không có khối nào cần xếp.',
      comboStreakCount: 0,
    };
  }

  const pieceIndices = validPieces.map((_, i) => i);

  // Generate all permutations of piece orders
  function getPermutations<T>(arr: T[]): T[][] {
    if (arr.length <= 1) return [arr];
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
      const perms = getPermutations(remaining);
      for (const p of perms) {
        result.push([current, ...p]);
      }
    }
    return result;
  }

  const permutations = getPermutations(pieceIndices);

  const completedSolutions: SearchNode[] = [];
  const partialSolutions: SearchNode[] = [];

  const rows = initialGrid.length;
  const cols = initialGrid[0].length;

  for (const order of permutations) {
    let layer: SearchNode[] = [
      {
        grid: cloneGrid(initialGrid),
        moves: [],
        usedPiecesIndices: [],
        totalScore: 0,
        totalLinesCleared: 0,
        currentStreak: 0,
        stepsWithClears: 0,
        evalScore: evaluateBoardState(initialGrid),
      },
    ];

    for (let stepIndex = 0; stepIndex < order.length; stepIndex++) {
      const pieceIdx = order[stepIndex];
      const piece = validPieces[pieceIdx];
      const shape = piece.shape;
      const nextLayer: SearchNode[] = [];

      for (const node of layer) {
        let placedAnyForThisNode = false;

        for (let r = 0; r <= rows - shape.length; r++) {
          for (let c = 0; c <= cols - shape[0].length; c++) {
            if (canPlace(node.grid, shape, r, c)) {
              placedAnyForThisNode = true;

              // Place piece
              const placedGrid = placePiece(node.grid, shape, r, c, pieceIdx + 2); // distinct marker value
              const { newGrid, clearedRows, clearedCols, linesCleared } =
                checkAndClearLines(placedGrid);

              const movePoints = calculateMovePoints(shape, linesCleared);
              const totalScore = node.totalScore + movePoints;
              const totalLines = node.totalLinesCleared + linesCleared;

              const stepCleared = linesCleared > 0;
              const currentStreak = stepCleared ? node.currentStreak + 1 : 0;
              const stepsWithClears = node.stepsWithClears + (stepCleared ? 1 : 0);

              const survival = evaluateBoardState(newGrid);

              let combinedEval = 0;
              if (strategy === 'keep_combo') {
                // COMBO & STREAK PRESERVATION WITH ANTI-LOSS SAFETY:
                // 1. Massive rewards for consecutive clears & triple streaks
                const streakReward = currentStreak * 300;
                const clearStepsReward = stepsWithClears * 180;
                const comboPointsReward = totalScore * 1.5;

                // 2. Strict Anti-Loss Safety Constraints:
                // Test if 3x3 square and 5x1 lines can fit in future turns
                const fits3x3 = countPlacements(newGrid, TEST_3X3);
                const fits5x1 = countPlacements(newGrid, TEST_5X1);
                const fits1x5 = countPlacements(newGrid, TEST_1X5);
                const fits2x2 = countPlacements(newGrid, TEST_2X2);

                let safetyBonusOrPenalty = 0;
                if (fits3x3 === 0) safetyBonusOrPenalty -= 150; // Danger of game over on 3x3
                else safetyBonusOrPenalty += 40;

                if (fits5x1 === 0 && fits1x5 === 0) safetyBonusOrPenalty -= 120; // Danger on 5x1 bar
                else safetyBonusOrPenalty += 30;

                if (fits2x2 === 0) safetyBonusOrPenalty -= 80;

                combinedEval =
                  streakReward +
                  clearStepsReward +
                  totalLines * 70 +
                  survival * 1.6 +
                  comboPointsReward +
                  safetyBonusOrPenalty;
              } else if (strategy === 'max_clears') {
                combinedEval = totalLines * 80 + totalScore * 2 + survival * 0.5;
              } else if (strategy === 'max_survival') {
                combinedEval = survival * 2.5 + totalLines * 20 + totalScore;
              } else {
                // balanced
                combinedEval = totalLines * 45 + totalScore * 1.5 + survival * 1.2;
              }

              const move: PlacedMove = {
                step: node.moves.length + 1,
                pieceIndex: pieceIdx,
                pieceId: piece.id,
                pieceShape: shape,
                pieceColor: piece.color,
                r,
                c,
                clearedRows,
                clearedCols,
                linesClearedCount: linesCleared,
                pointsEarned: movePoints,
                gridBefore: node.grid,
                gridAfter: newGrid,
              };

              nextLayer.push({
                grid: newGrid,
                moves: [...node.moves, move],
                usedPiecesIndices: [...node.usedPiecesIndices, pieceIdx],
                totalScore,
                totalLinesCleared: totalLines,
                currentStreak,
                stepsWithClears,
                evalScore: combinedEval,
              });
            }
          }
        }

        // If this node couldn't place the current piece, it becomes a candidate partial solution
        if (!placedAnyForThisNode && node.moves.length > 0) {
          partialSolutions.push(node);
        }
      }

      if (nextLayer.length === 0) {
        break;
      }

      // Prune layer to beam width
      nextLayer.sort((a, b) => b.evalScore - a.evalScore);
      layer = nextLayer.slice(0, beamWidth);

      // If we are at the last piece of this permutation, collect completed solutions
      if (stepIndex === order.length - 1) {
        completedSolutions.push(...layer);
      }
    }
  }

  const durationMs = Math.round((performance.now() - startTime) * 10) / 10;

  if (completedSolutions.length > 0) {
    // Sort all completed solutions by strategy evaluation
    completedSolutions.sort((a, b) => b.evalScore - a.evalScore);
    const best = completedSolutions[0];

    const survivalRating = Math.max(
      10,
      Math.min(100, Math.round(evaluateBoardState(best.grid) / 2))
    );

    return {
      moves: best.moves,
      isComplete: true,
      placedCount: best.moves.length,
      totalPieces: validPieces.length,
      totalLinesCleared: best.totalLinesCleared,
      totalScore: best.totalScore,
      survivalRating,
      finalGrid: best.grid,
      strategy,
      durationMs,
      comboStreakCount: best.stepsWithClears,
      message:
        best.stepsWithClears >= 2
          ? `🔥 SIÊU COMBO ${best.stepsWithClears} BƯỚC LIÊN HOÀN! Xóa ${best.totalLinesCleared} hàng/cột, giữ trọn streak điểm tối đa mà không lo bị thua!`
          : `Tìm thấy phương án tối ưu xếp đủ cả ${validPieces.length} khối! Xóa được ${best.totalLinesCleared} hàng/cột, độ an toàn ${survivalRating}%.`,
    };
  }

  // If impossible to place all pieces, find the best partial solution
  if (partialSolutions.length > 0) {
    // Sort by: most pieces placed first, then evalScore
    partialSolutions.sort((a, b) => {
      if (b.moves.length !== a.moves.length) {
        return b.moves.length - a.moves.length;
      }
      return b.evalScore - a.evalScore;
    });

    const best = partialSolutions[0];
    const survivalRating = Math.max(
      5,
      Math.min(70, Math.round(evaluateBoardState(best.grid) / 3))
    );

    return {
      moves: best.moves,
      isComplete: false,
      placedCount: best.moves.length,
      totalPieces: validPieces.length,
      totalLinesCleared: best.totalLinesCleared,
      totalScore: best.totalScore,
      survivalRating,
      finalGrid: best.grid,
      strategy,
      durationMs,
      comboStreakCount: best.stepsWithClears,
      message: `Cảnh báo: Bàn cờ đang bị hẹp, chỉ có thể xếp tối đa ${best.moves.length}/${validPieces.length} khối. Đây là giải pháp sống sót tốt nhất để cứu ván cờ.`,
    };
  }

  // Zero moves possible
  return {
    moves: [],
    isComplete: false,
    placedCount: 0,
    totalPieces: validPieces.length,
    totalLinesCleared: 0,
    totalScore: 0,
    survivalRating: 0,
    finalGrid: cloneGrid(initialGrid),
    strategy,
    durationMs,
    message: 'Không tìm thấy nước đi hợp lệ nào. Bàn cờ đã hết chỗ cho các khối hiện có!',
  };
}
