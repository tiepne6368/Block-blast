import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies up to 25MB for screenshot uploads
app.use(express.json({ limit: '25mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini-powered Board & Piece Analyzer Endpoint
app.post('/api/analyze-board', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Chưa có dữ liệu ảnh (imageBase64). Vui lòng chọn hoặc tải ảnh lên.',
      });
    }

    // Strip header prefix if present (e.g. data:image/png;base64,)
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        fallbackToClient: true,
        error: 'Chưa cấu hình GEMINI_API_KEY trên server.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const promptText = `
You are an expert Computer Vision system specialized in analyzing mobile screenshots of the puzzle game "Block Blast".
Analyze this Block Blast screenshot carefully and extract the game board and candidate pieces.

Key Rules & Observations:
1. The game board is the central grid where blocks are placed. In Block Blast, it is typically an 8x8 grid (8 rows, 8 columns).
2. For each cell on the board:
   - Output 0 if the cell is EMPTY (dark navy/slate background grid cell).
   - Output 1 if the cell is FILLED / OCCUPIED by a block (colorful block like cyan, blue, purple, orange, yellow, green, red).
3. The candidate pieces are the 1 to 3 block shapes shown at the BOTTOM tray area below the board.
   - For each piece, identify its exact shape as a 2D array of 1s and 0s (trimmed bounding box, no unnecessary outer zero rows/cols).
   - For example:
     - 2x2 square: [[1, 1], [1, 1]]
     - 3x1 horizontal bar: [[1, 1, 1]]
     - 1x3 vertical bar: [[1], [1], [1]]
     - L shape: e.g. [[1, 0], [1, 0], [1, 1]] or [[0, 0, 1], [1, 1, 1]]
     - Single dot: [[1]]
   - Identify the piece's color name or hex code.
4. Detect the player's current score if shown near the top center/left (integer).

Be extremely precise with filled vs empty cells and the exact shapes of the 3 pieces at the bottom.
`;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI request timeout after 4s')), 4000)
    );

    const apiCallPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gridRows: {
              type: Type.INTEGER,
              description: 'Number of rows in the board grid (normally 8)',
            },
            gridCols: {
              type: Type.INTEGER,
              description: 'Number of columns in the board grid (normally 8)',
            },
            grid: {
              type: Type.ARRAY,
              description: '2D matrix representing board rows and cols (0 = empty, 1 = occupied)',
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.INTEGER,
                },
              },
            },
            pieces: {
              type: Type.ARRAY,
              description: 'Array of 1 to 3 candidate pieces in the bottom tray',
              items: {
                type: Type.OBJECT,
                properties: {
                  shape: {
                    type: Type.ARRAY,
                    description: '2D matrix of the piece shape (1 for block, 0 for empty)',
                    items: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.INTEGER,
                      },
                    },
                  },
                  color: {
                    type: Type.STRING,
                    description: 'Hex color or color name of the piece (e.g. #38bdf8, #a855f7)',
                  },
                },
                required: ['shape'],
              },
            },
            detectedScore: {
              type: Type.INTEGER,
              description: 'Detected score number at the top of the screen if visible',
            },
            confidence: {
              type: Type.STRING,
              description: 'Confidence level: high, medium, or low',
            },
          },
          required: ['gridRows', 'gridCols', 'grid', 'pieces'],
        },
      },
    });

    const response: any = await Promise.race([apiCallPromise, timeoutPromise]);
    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    return res.json({
      success: true,
      ...parsed,
    });
  } catch (error: any) {
    console.warn('AI analysis timed out or failed, falling back to client:', error?.message);
    return res.json({
      success: false,
      fallbackToClient: true,
      error: error?.message || 'Quá thời gian phản hồi AI, chuyển sang quét siêu tốc.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
