export type PlayerId = 'player1' | 'player2';

export interface DotData {
  id: number;
  x: number;
  y: number;
  z: number;
  owner: 'neutral' | PlayerId;
  state: 'active' | 'selected' | 'destroyed';
  destructionProgress?: number; // 0 to 1 during animation
}

export interface TetrahedronValidation {
  isValid: boolean;
  volume: number;
  minDistance: number;
  reason?: string;
  capturedDotIds: number[];
}

export type GameMode = 'pvp' | 'vs_ai';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type GamePhase = 'intro_screen' | 'start_screen' | 'playing';
export type ViewMode = 'simple' | 'advanced';

export interface GameStats {
  p1Score: number;
  p2Score: number;
  p1Blinks: number;
  p2Blinks: number;
  p1Wasted: number;
  p2Wasted: number;
  turnsCount: number;
}
