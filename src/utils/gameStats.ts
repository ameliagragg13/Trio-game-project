const GAME_STATS_KEY = 'gameStats';

export interface GameStats {
  memory: number;
  tictactoe: number;
  sudoku: number;
}

export function getGameStats(): GameStats {
  const statsJson = localStorage.getItem(GAME_STATS_KEY);
  if (!statsJson) {
    return { memory: 0, tictactoe: 0, sudoku: 0 };
  }
  try {
    return JSON.parse(statsJson);
  } catch {
    return { memory: 0, tictactoe: 0, sudoku: 0 };
  }
}

export function incrementGameWin(gameName: 'memory' | 'tictactoe' | 'sudoku'): void {
  const stats = getGameStats();
  stats[gameName] = (stats[gameName] || 0) + 1;
  localStorage.setItem(GAME_STATS_KEY, JSON.stringify(stats));
}

export function resetGameStats(): void {
  localStorage.removeItem(GAME_STATS_KEY);
}

