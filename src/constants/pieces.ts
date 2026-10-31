import { PresetShape } from '../types/blockblast';

export const BLOCK_COLORS = {
  CYAN: '#38bdf8',
  BLUE: '#4f46e5',
  PURPLE: '#a855f7',
  ORANGE: '#f97316',
  YELLOW: '#eab308',
  GREEN: '#22c55e',
  RED: '#ef4444',
  PINK: '#ec4899',
  TEAL: '#14b8a6',
};

export const COLOR_PALETTE = [
  '#38bdf8', // Cyan
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#f97316', // Orange
  '#eab308', // Amber / Yellow
  '#22c55e', // Emerald / Green
  '#ef4444', // Red
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

export const PRESET_SHAPES: PresetShape[] = [
  // 1. Dots & Singles
  { name: '1x1 Ô Đơn', category: 'dots', shape: [[1]], color: '#38bdf8' },

  // 2. Lines (Straight bars horizontal & vertical)
  { name: '2x1 Ngang', category: 'lines', shape: [[1, 1]], color: '#38bdf8' },
  { name: '1x2 Dọc', category: 'lines', shape: [[1], [1]], color: '#38bdf8' },
  { name: '3x1 Ngang', category: 'lines', shape: [[1, 1, 1]], color: '#38bdf8' },
  { name: '1x3 Dọc', category: 'lines', shape: [[1], [1], [1]], color: '#38bdf8' },
  { name: '4x1 Ngang', category: 'lines', shape: [[1, 1, 1, 1]], color: '#38bdf8' },
  { name: '1x4 Dọc', category: 'lines', shape: [[1], [1], [1], [1]], color: '#38bdf8' },
  { name: '5x1 Ngang', category: 'lines', shape: [[1, 1, 1, 1, 1]], color: '#38bdf8' },
  { name: '1x5 Dọc', category: 'lines', shape: [[1], [1], [1], [1], [1]], color: '#38bdf8' },

  // 3. Squares
  { name: '2x2 Vuông', category: 'squares', shape: [[1, 1], [1, 1]], color: '#6366f1' },
  {
    name: '3x3 Vuông Lớn',
    category: 'squares',
    shape: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    color: '#eab308',
  },

  // 4. Rectangles (3x2, 2x3)
  {
    name: '3x2 Chữ Nhật Ngang',
    category: 'rectangles',
    shape: [
      [1, 1, 1],
      [1, 1, 1],
    ],
    color: '#14b8a6',
  },
  {
    name: '2x3 Chữ Nhật Dọc',
    category: 'rectangles',
    shape: [
      [1, 1],
      [1, 1],
      [1, 1],
    ],
    color: '#14b8a6',
  },

  // 5. 2x2 Small Corners / Angles (All 4 rotations)
  { name: 'Góc 2x2 (Trái Trên)', category: 'l_shapes', shape: [[1, 1], [1, 0]], color: '#f97316' },
  { name: 'Góc 2x2 (Phải Trên)', category: 'l_shapes', shape: [[1, 1], [0, 1]], color: '#f97316' },
  { name: 'Góc 2x2 (Trái Dưới)', category: 'l_shapes', shape: [[1, 0], [1, 1]], color: '#f97316' },
  { name: 'Góc 2x2 (Phải Dưới)', category: 'l_shapes', shape: [[0, 1], [1, 1]], color: '#f97316' },

  // 6. 3x3 Large L-shapes (All 4 rotations)
  {
    name: 'Chữ L 3x3 (Chuẩn)',
    category: 'l_shapes',
    shape: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: '#a855f7',
  },
  {
    name: 'Chữ L 3x3 (Ngược Phải)',
    category: 'l_shapes',
    shape: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#a855f7',
  },
  {
    name: 'Chữ L 3x3 (Lộn ngược Trái)',
    category: 'l_shapes',
    shape: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
    color: '#a855f7',
  },
  {
    name: 'Chữ L 3x3 (Lộn ngược Phải)',
    category: 'l_shapes',
    shape: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    color: '#a855f7',
  },

  // 7. 3x2 Dọc L-shapes (All 4 rotations - Vertical L)
  {
    name: 'Chữ L 3x2 Dọc (Chân Phải Dưới)',
    category: 'l_shapes',
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    color: '#eab308',
  },
  {
    name: 'Chữ L 3x2 Dọc (Chân Trái Dưới)',
    category: 'l_shapes',
    shape: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    color: '#eab308',
  },
  {
    name: 'Chữ L 3x2 Dọc (Chân Phải Trên - Lộn)',
    category: 'l_shapes',
    shape: [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    color: '#eab308',
  },
  {
    name: 'Chữ L 3x2 Dọc (Chân Trái Trên - Lộn)',
    category: 'l_shapes',
    shape: [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
    color: '#eab308',
  },

  // 8. 2x3 Ngang L-shapes (All 4 rotations - Horizontal L)
  {
    name: 'Chữ L 2x3 Ngang (Đầu Trái Dưới)',
    category: 'l_shapes',
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: '#eab308',
  },
  {
    name: 'Chữ L 2x3 Ngang (Đầu Phải Dưới)',
    category: 'l_shapes',
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#eab308',
  },
  {
    name: 'Chữ L 2x3 Ngang (Đầu Trái Trên - Lộn)',
    category: 'l_shapes',
    shape: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    color: '#eab308',
  },
  {
    name: 'Chữ L 2x3 Ngang (Đầu Phải Trên - Lộn)',
    category: 'l_shapes',
    shape: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    color: '#eab308',
  },

  // 9. T shapes (All 4 directions)
  {
    name: 'Chữ T Ngang Hướng Xuống',
    category: 't_shapes',
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: '#22c55e',
  },
  {
    name: 'Chữ T Ngang Hướng Lên',
    category: 't_shapes',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: '#22c55e',
  },
  {
    name: 'Chữ T Dọc Hướng Phải',
    category: 't_shapes',
    shape: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    color: '#22c55e',
  },
  {
    name: 'Chữ T Dọc Hướng Trái',
    category: 't_shapes',
    shape: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    color: '#22c55e',
  },

  // 10. Z & S shapes (All 4 directions)
  {
    name: 'Chữ Z Ngang',
    category: 'z_shapes',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: '#ef4444',
  },
  {
    name: 'Chữ S Ngang',
    category: 'z_shapes',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: '#ef4444',
  },
  {
    name: 'Chữ Z Dọc',
    category: 'z_shapes',
    shape: [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    color: '#ef4444',
  },
  {
    name: 'Chữ S Dọc',
    category: 'z_shapes',
    shape: [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    color: '#ef4444',
  },

  // 11. Special shapes (Plus / Cross & U shapes)
  {
    name: 'Hình Dấu Cộng (Plus)',
    category: 'special',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: '#ec4899',
  },
  {
    name: 'Chữ U 2x3 Ngửa',
    category: 'special',
    shape: [
      [1, 0, 1],
      [1, 1, 1],
    ],
    color: '#ec4899',
  },
  {
    name: 'Chữ U 2x3 Úp',
    category: 'special',
    shape: [
      [1, 1, 1],
      [1, 0, 1],
    ],
    color: '#ec4899',
  },
];

/**
 * Normalizes a shape matrix by trimming empty rows and columns
 */
export function normalizeShape(shape: number[][]): number[][] {
  if (!shape || shape.length === 0) return [[1]];

  let minR = shape.length;
  let maxR = -1;
  let minC = shape[0].length;
  let maxC = -1;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] > 0) {
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }

  if (maxR === -1) {
    return [[1]];
  }

  const result: number[][] = [];
  for (let r = minR; r <= maxR; r++) {
    const row: number[] = [];
    for (let c = minC; c <= maxC; c++) {
      row.push(shape[r][c] > 0 ? 1 : 0);
    }
    result.push(row);
  }

  return result;
}
