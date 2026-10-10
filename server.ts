import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google Gemini AI if API key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health & Status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// Bug generation API using Gemini 3.8 Flash
app.post('/api/bugs/generate', async (req: Request, res: Response) => {
  try {
    const { level = 12, tier = 'common', specificType } = req.body;

    if (!ai) {
      return res.status(200).json({
        success: false,
        source: 'fallback',
        message: 'No GEMINI_API_KEY configured on server; using offline fallback engine.',
      });
    }

    const tierPrompt =
      tier === 'boss'
        ? 'A legendary boss-level catastrophic production bug (e.g., Production Outage Leviathan, Race Condition, or Deadly GIL Deadlock).'
        : tier === 'miniboss'
        ? 'A tough mini-boss bug (e.g., Memory Leak slime with circular references, Unbounded Infinite Loop, or Recursion Depth Exceeded).'
        : 'A common retro programming bug (e.g., IndentationError, SyntaxError missing colon, TypeError string concatenation, KeyError).';

    const prompt = `You are the battle engine for a retro cyberpunk 8-bit RPG game called "Python Quest: Bug Slayer".
Generate a Python programming bug combat encounter appropriate for player level ${level}.
Tier: ${tier}. ${tierPrompt}
${specificType ? `Focus on bug category: ${specificType}.` : ''}

Provide:
1. title: Short retro arcade bug encounter name (e.g., "INDENTATION ERROR! [LVL ${level}]", "SYNTAX GLITCH VIPER", "MEMORY LEAK SLIME")
2. errorType: Python exception name (e.g., IndentationError, SyntaxError, TypeError, KeyError, RecursionError)
3. traceback: A realistic Python terminal traceback string (around 3 to 6 lines, formatted like python interactive or file execution).
4. glitchLine: The exact broken code line that contains the error to be highlighted.
5. options: Exactly 3 multiple-choice fix options.
   - Exactly ONE must be isCorrect: true.
   - The other TWO must be isCorrect: false with plausible common dev mistakes.
   - text: Short button label like "[4 SPACES]", "[TAB]", "[ADD COLON ':']", "[STR() CASTING]" (under 30 characters).
   - reward: xp (number between 50 and 300 depending on tier), gold (number between 5 and 50)
   - explanation: Short explanation of why this fix works or fails.
6. aiHint: A witty, retro AI assistant robot suggestion (e.g. "AI Suggests: 'Remember PEP 8 says 4 spaces per indentation level!'")
7. bugSpriteType: one of ["syntax", "indentation", "memory_leak", "infinite_loop", "boss_leviathan"]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            errorType: { type: Type.STRING },
            traceback: { type: Type.STRING },
            glitchLine: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  isCorrect: { type: Type.BOOLEAN },
                  xp: { type: Type.NUMBER },
                  gold: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                },
                required: ['text', 'isCorrect', 'xp', 'gold', 'explanation'],
              },
            },
            aiHint: { type: Type.STRING },
            bugSpriteType: { type: Type.STRING },
          },
          required: ['title', 'errorType', 'traceback', 'glitchLine', 'options', 'aiHint', 'bugSpriteType'],
        },
      },
    });

    const bugData = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini',
      bug: bugData,
    });
  } catch (error: any) {
    console.error('Gemini generation error:', error);
    return res.status(200).json({
      success: false,
      source: 'fallback',
      error: error?.message || 'Gemini generation failure',
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Python Quest] Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
