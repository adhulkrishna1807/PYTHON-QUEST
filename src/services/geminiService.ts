import { BugEncounter, BugTier } from '../types/game';
import { getRandomFallbackBug } from '../data/bugBank';

export interface GenerationStatus {
  isAiEnabled: boolean;
  hasServerKey: boolean;
  lastSource: 'gemini' | 'fallback';
  totalGenerated: number;
}

let statusState: GenerationStatus = {
  isAiEnabled: true,
  hasServerKey: false,
  lastSource: 'fallback',
  totalGenerated: 0,
};

// Check server status on startup
export async function checkServerStatus(): Promise<GenerationStatus> {
  try {
    const res = await fetch('/api/status');
    if (res.ok) {
      const data = await res.json();
      statusState.hasServerKey = Boolean(data.hasGeminiKey);
    }
  } catch (_) {
    statusState.hasServerKey = false;
  }
  return { ...statusState };
}

export function getGenerationStatus(): GenerationStatus {
  return { ...statusState };
}

export function toggleAiEnabled(): boolean {
  statusState.isAiEnabled = !statusState.isAiEnabled;
  return statusState.isAiEnabled;
}

/**
 * Generates or retrieves a bug encounter.
 * Prefers Gemini 3.8 Flash via server endpoint, automatically gracefully falling back
 * to the rich offline bug bank.
 */
export async function fetchBugEncounter(
  level: number,
  tier: BugTier = 'common',
  specificType?: string
): Promise<{ encounter: BugEncounter; source: 'gemini' | 'fallback' }> {
  statusState.totalGenerated++;

  if (!statusState.isAiEnabled) {
    statusState.lastSource = 'fallback';
    return {
      encounter: getRandomFallbackBug(level, tier),
      source: 'fallback',
    };
  }

  try {
    const response = await fetch('/api/bugs/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level, tier, specificType }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.bug) {
        const raw = data.bug;
        const encounter: BugEncounter = {
          id: `bug-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: raw.title || `PYTHON ERROR [LVL ${level}]`,
          tier: tier,
          level: level,
          errorType: raw.errorType || 'SyntaxError',
          traceback: Array.isArray(raw.traceback)
            ? raw.traceback
            : typeof raw.traceback === 'string'
            ? raw.traceback.split('\n')
            : ['Traceback (most recent call last):', '  File "main.py", line 12'],
          glitchLine: raw.glitchLine || '>>> broken_code() # Exception raised!',
          options: (raw.options || []).map((opt: any) => ({
            text: opt.text,
            isCorrect: Boolean(opt.isCorrect),
            xp: Number(opt.xp) || 80,
            gold: Number(opt.gold) || 15,
            explanation: opt.explanation || 'Fix applied to code.',
          })),
          aiHint: raw.aiHint || 'Analyze traceback carefully before executing.',
          bugSpriteType: raw.bugSpriteType || (tier === 'boss' ? 'boss_leviathan' : tier === 'miniboss' ? 'memory_leak' : 'syntax'),
        };

        statusState.lastSource = 'gemini';
        return { encounter, source: 'gemini' };
      }
    }
  } catch (err) {
    console.warn('API encounter fetch failed, utilizing offline fallback engine:', err);
  }

  // Robust fallback
  statusState.lastSource = 'fallback';
  return {
    encounter: getRandomFallbackBug(level, tier),
    source: 'fallback',
  };
}
