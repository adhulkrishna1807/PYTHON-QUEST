export type BugTier = 'common' | 'miniboss' | 'boss';

export interface BugOption {
  text: string;
  isCorrect: boolean;
  xp: number;
  gold: number;
  explanation: string;
}

export interface BugEncounter {
  id: string;
  title: string;
  tier: BugTier;
  level: number;
  errorType: string;
  traceback: string[];
  glitchLine: string;
  options: BugOption[];
  aiHint: string;
  bugSpriteType: 'syntax' | 'indentation' | 'memory_leak' | 'infinite_loop' | 'boss_leviathan';
}

export interface WorldBug {
  id: string;
  x: number;
  y: number;
  name: string;
  tier: BugTier;
  level: number;
  errorType: string;
  sprite: string;
  encounter?: BugEncounter;
  vx?: number;
  vy?: number;
}

export interface Pedestrian {
  id: string;
  x: number;
  y: number;
  char: string;
  dir: 1 | -1;
  axis: 'x' | 'y';
  minCoord: number;
  maxCoord: number;
  speed: number;
}

export interface Car {
  id: string;
  x: number;
  y: number;
  color: string;
  axis: 'horizontal' | 'vertical';
  dir: 1 | -1;
  speed: number;
  width: number;
  height: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface PlayerStats {
  level: number;
  title: string;
  xp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  gold: number;
  linterGems: number;
  bugsSlain: number;
  bossesDefeated: number;
}

export interface Building {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'arcade' | 'cafe' | 'farm' | 'house';
}
