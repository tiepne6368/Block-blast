import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canPlace,
  placePiece,
  checkAndClearLines,
  solveBlockBlast,
  createEmptyGrid,
} from './engine';
import { BlockPiece } from '../types/blockblast';

test('canPlace checks boundaries and collisions correctly', () => {
  const grid = createEmptyGrid(8, 8);
  grid[0][0] = 1; // Occupied

  const piece2x2 = [
    [1, 1],
    [1, 1],
  ];

  // Collision with (0,0)
  assert.equal(canPlace(grid, piece2x2, 0, 0), false);

  // Valid placement at (1,1)
  assert.equal(canPlace(grid, piece2x2, 1, 1), true);

  // Out of bounds
  assert.equal(canPlace(grid, piece2x2, 7, 7), false);
  assert.equal(canPlace(grid, piece2x2, 0, 7), false);
  assert.equal(canPlace(grid, piece2x2, -1, 0), false);
});

test('checkAndClearLines clears full rows and columns simultaneously', () => {
  const grid = createEmptyGrid(8, 8);

  // Fill entire row 3 except col 4
  for (let c = 0; c < 8; c++) {
    grid[3][c] = 1;
  }
  // Fill entire col 4
  for (let r = 0; r < 8; r++) {
    grid[r][4] = 1;
  }

  const result = checkAndClearLines(grid);
  assert.equal(result.linesCleared, 2);
  assert.deepEqual(result.clearedRows, [3]);
  assert.deepEqual(result.clearedCols, [4]);

  // Check that row 3 and col 4 are now 0
  for (let c = 0; c < 8; c++) {
    assert.equal(result.newGrid[3][c], 0);
  }
  for (let r = 0; r < 8; r++) {
    assert.equal(result.newGrid[r][4], 0);
  }
});

test('solveBlockBlast finds valid solution for 3 standard pieces', () => {
  const grid = createEmptyGrid(8, 8);

  // Preset 3 pieces:
  // 1: 2x2 square
  // 2: 3x1 line
  // 3: L shape
  const pieces: BlockPiece[] = [
    {
      id: 'p1',
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: '#38bdf8',
    },
    {
      id: 'p2',
      shape: [[1, 1, 1]],
      color: '#a855f7',
    },
    {
      id: 'p3',
      shape: [
        [1, 0],
        [1, 1],
      ],
      color: '#eab308',
    },
  ];

  const solution = solveBlockBlast(grid, pieces, { strategy: 'balanced' });

  assert.equal(solution.isComplete, true);
  assert.equal(solution.moves.length, 3);
  assert.equal(solution.placedCount, 3);

  // Verify each step is strictly valid on the preceding board state
  let currentGrid = grid;
  for (const move of solution.moves) {
    assert.equal(
      canPlace(currentGrid, move.pieceShape, move.r, move.c),
      true,
      `Move at step ${move.step} must be valid`
    );
    const placed = placePiece(currentGrid, move.pieceShape, move.r, move.c);
    const cleared = checkAndClearLines(placed);
    currentGrid = cleared.newGrid;
  }
});

test('solveBlockBlast handles almost full row and triggers clear', () => {
  const grid = createEmptyGrid(8, 8);
  // Row 7 has 7 filled cells, col 7 is empty
  for (let c = 0; c < 7; c++) {
    grid[7][c] = 1;
  }

  // Piece is a 1x1 dot
  const pieces: BlockPiece[] = [
    {
      id: 'dot',
      shape: [[1]],
      color: '#ef4444',
    },
  ];

  const solution = solveBlockBlast(grid, pieces, { strategy: 'max_clears' });
  assert.equal(solution.isComplete, true);
  assert.equal(solution.totalLinesCleared, 1);
  // The dot should be placed at (7, 7) to clear row 7
  assert.equal(solution.moves[0].r, 7);
  assert.equal(solution.moves[0].c, 7);
});

test('solveBlockBlast keep_combo strategy successfully places 3x2 rectangle and reverse L', () => {
  const grid = createEmptyGrid(8, 8);
  const pieces: BlockPiece[] = [
    {
      id: 'rect3x2',
      shape: [
        [1, 1, 1],
        [1, 1, 1],
      ],
      color: '#14b8a6',
    },
    {
      id: 'reverseL',
      shape: [
        [1, 1],
        [0, 1],
        [0, 1],
      ],
      color: '#a855f7',
    },
    {
      id: 'bar4',
      shape: [[1], [1], [1], [1]],
      color: '#38bdf8',
    },
  ];

  const solution = solveBlockBlast(grid, pieces, { strategy: 'keep_combo' });
  assert.equal(solution.isComplete, true);
  assert.equal(solution.placedCount, 3);
  assert.equal(solution.strategy, 'keep_combo');
  assert.ok(solution.survivalRating >= 70, 'Survival rating should be safe');
});
